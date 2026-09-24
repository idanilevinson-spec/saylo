"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Keyboard, RotateCcw } from "lucide-react";
import { speak as browserSpeak } from "@/lib/speech/browserTts";
import SayloAvatar, { type AvatarExpression } from "@/components/SayloAvatar";
import { loadVoicePref, saveVoicePref, NEURAL_VOICE, type VoicePref } from "@/lib/speech/voicePref";
import { NEURAL_SPEECH_RATES } from "@/lib/speech/useNeuralSpeech";
import type { SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";
import { isMicPermissionDeniedError, openIosAppSettings } from "@/lib/speech/micPermission";
import { Capacitor } from "@capacitor/core";

type CallState = "connecting" | "listening" | "thinking" | "speaking" | "paused" | "error";

interface VoiceConversationPanelProps {
  onSend: (text: string) => Promise<string | null>;
  onExit: () => void;
  onEnd: () => void;
  ending: boolean;
  canEnd: boolean;
}

const isNative = Capacitor.isNativePlatform();

const MAX_SILENT_RETRIES = 3;
// Azure speech tokens last 10 minutes; the token route may already have kept
// one for up to 4, so the client keeps it for at most 4 more.
const TOKEN_REUSE_MS = 4 * 60 * 1000;

// Hands-free "phone call" mode for AI conversation practice: loops
// Azure recognizeOnceAsync (listen) -> onSend (Claude turn) -> Azure
// neural TTS (speak) -> back to listening, entirely driven from inside
// this effect so each call cycle owns its own `cancelled` closure —
// resuming after a pause or exiting mid-cycle can't leak a stale loop
// into the next one.
//
// The credentials needed for the NEXT listen (Azure token + SDK import)
// are pre-fetched while the current reply is being spoken, so the mic
// is already live the instant playback ends — otherwise that fetch+
// import gap after "מקשיבים לכם..." appears is enough to clip the very
// start of what the user says.
export default function VoiceConversationPanel({ onSend, onExit, onEnd, ending, canEnd }: VoiceConversationPanelProps) {
  // The call doesn't auto-start: iOS Safari/WKWebView only allows
  // audio.play() when it's traceable to a real, synchronous tap. Every
  // reply plays several async hops after the user's last tap (recognized
  // speech -> network round-trip to Claude -> synthesis), which is exactly
  // what gets silently rejected with NotAllowedError — confirmed via an
  // on-device debug trace (since removed) during development. The fix is
  // the standard one for this restriction: require one explicit tap to begin, use that
  // tap to "bless" a single reusable <audio> element by playing a silent
  // clip on it, then reuse that same already-blessed element for every
  // reply for the rest of the call — WebKit permits repeat programmatic
  // playback on an element once it's been unlocked by a real gesture, with
  // no fresh gesture needed per turn.
  const [started, setStarted] = useState(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const SILENT_CLIP =
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAAABkYXRhAAAAAA==";

  function startCall() {
    const audio = new Audio(SILENT_CLIP);
    audio
      .play()
      .then(() => audio.pause())
      .catch(() => {
        // Even if this particular play() is rejected, the element itself is
        // still the one that received a play() call inside a real tap —
        // reusing it later is what matters, not whether this exact call
        // resolved.
      });
    audioElRef.current = audio;
    setStarted(true);
  }

  const [state, setState] = useState<CallState>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Set only when the error is a denied mic permission — offering "try
  // again" there is pointless, since neither the browser nor the app can
  // re-prompt once denied.
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [restartTick, setRestartTick] = useState(0);
  const [voicePref, setVoicePref] = useState<VoicePref>(() => loadVoicePref());
  const [viseme, setViseme] = useState<number | undefined>(undefined);
  const [rate, setRate] = useState(1);
  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  // Caches the most recent reply so "listen again" can replay it instantly —
  // `url` for the Azure path (kept alive across turns instead of revoked on
  // end, only released when superseded or on unmount) and `text` as the
  // browser-TTS-fallback path's replay source, which never has a blob url.
  const [hasLastReply, setHasLastReply] = useState(false);
  const lastReplyRef = useRef<{ url: string | null; text: string }>({ url: null, text: "" });
  useEffect(() => {
    return () => {
      if (lastReplyRef.current.url) URL.revokeObjectURL(lastReplyRef.current.url);
    };
  }, []);

  const silentTurnsRef = useRef(0);
  const voicePrefRef = useRef<VoicePref>(voicePref);
  // Tracks whichever recognizer is currently listening, so the effect's
  // cleanup can actually close the mic if the component unmounts (or this
  // effect re-runs) mid-listen, instead of leaving it capturing in the
  // background until Azure's own callback eventually fires.
  const activeRecognizerRef = useRef<SpeechRecognizer | null>(null);
  const tokenCacheRef = useRef<{ token: string; region: string; at: number } | null>(null);

  // Azure throws if close() runs twice on the same recognizer (e.g. the
  // effect's cleanup and recognizeOnceAsync's own callback both racing to
  // close it) — swallow that specific race instead of crashing the page.
  function safeClose(recognizer: SpeechRecognizer) {
    try {
      recognizer.close();
    } catch {
      // already disposed — fine to ignore
    }
  }

  function selectVoice(pref: VoicePref) {
    setVoicePref(pref);
    voicePrefRef.current = pref;
    saveVoicePref(pref);
  }

  useEffect(() => {
    let cancelled = false;

    if (!started) return;

    if (ending) {
      // The parent is scoring/closing the conversation — stop the loop
      // and let it take over, don't start another listen cycle.
      window.speechSynthesis?.cancel();
      return () => {
        cancelled = true;
      };
    }

    type Sdk = typeof import("microsoft-cognitiveservices-speech-sdk");
    type Credentials = { token: string; region: string; sdk: Sdk };

    async function loadCredentials(): Promise<Credentials> {
      // The token is valid for ~10 minutes, but every turn used to fetch a new
      // one (twice) — and the one for the reply sat on the critical path
      // between Claude answering and the voice starting. Reuse it, and only
      // ask again once it is old enough to be near expiry.
      const cached = tokenCacheRef.current;
      if (cached && Date.now() - cached.at < TOKEN_REUSE_MS) {
        return { token: cached.token, region: cached.region, sdk: await import("microsoft-cognitiveservices-speech-sdk") };
      }
      const tokenRes = await fetch("/api/speech/token");
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}));
        throw new Error(
          body.error === "premium required"
            ? "שיחה קולית זמינה למנויי פרימיום"
            : body.error === "parental consent required"
              ? "כדי להקליט קול נדרש אישור של הורה או אפוטרופוס"
              : "שירות הקול לא זמין כרגע"
        );
      }
      const { token, region } = await tokenRes.json();
      tokenCacheRef.current = { token, region, at: Date.now() };
      const sdk = await import("microsoft-cognitiveservices-speech-sdk");
      return { token, region, sdk };
    }

    async function listenOnce(preloaded?: Credentials) {
      if (cancelled) return;

      try {
        const { token, region, sdk } = preloaded ?? (await loadCredentials());
        if (cancelled) return;

        const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
        speechConfig.speechRecognitionLanguage = "en-US";
        const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        activeRecognizerRef.current = recognizer;

        // Only now is the mic actually capturing — flip the UI to
        // "listening" right here, not before this async setup ran.
        setState("listening");

        recognizer.recognizeOnceAsync(
          async (result) => {
            safeClose(recognizer);
            if (activeRecognizerRef.current === recognizer) activeRecognizerRef.current = null;
            if (cancelled) return;

            if (result.reason !== sdk.ResultReason.RecognizedSpeech || !result.text.trim()) {
              silentTurnsRef.current += 1;
              if (silentTurnsRef.current >= MAX_SILENT_RETRIES) {
                setState("paused");
                return;
              }
              listenOnce();
              return;
            }

            silentTurnsRef.current = 0;
            setState("thinking");
            const reply = await onSend(result.text.trim());
            if (cancelled) return;

            if (!reply) {
              setErrorMessage("לא הצלחנו לשלוח את ההודעה. נסו שוב.");
              setPermissionDenied(false);
              setState("error");
              return;
            }

            speakReply(reply);
          },
          (err) => {
            safeClose(recognizer);
            if (activeRecognizerRef.current === recognizer) activeRecognizerRef.current = null;
            if (cancelled) return;
            const denied = isMicPermissionDeniedError(err);
            setErrorMessage(denied ? "לא ניתנה גישה למיקרופון, ולכן אי אפשר לדבר עם ה-AI." : "אירעה שגיאה בגישה למיקרופון.");
            setPermissionDenied(denied);
            setState("error");
          }
        );
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : "אירעה שגיאה");
        setPermissionDenied(false);
        setState("error");
      }
    }

    function speakReply(replyText: string) {
      setState("speaking");
      // No live viseme data yet for this turn — the avatar falls back to
      // its decorative loop until the first visemeReceived event (Azure
      // path) sets a real value below, or stays undefined for the whole
      // turn on the browser-TTS fallback path, which has no visemes.
      setViseme(undefined);
      // Prefetch the next listen's credentials while this reply plays,
      // so listenOnce() below can skip straight to opening the mic.
      const nextListenPreload = loadCredentials().catch(() => null);

      const fallbackToBrowser = async () => {
        lastReplyRef.current = { url: null, text: replyText };
        setHasLastReply(true);
        browserSpeak(replyText, rateRef.current, async () => {
          if (cancelled) return;
          const preloaded = await nextListenPreload;
          listenOnce(preloaded ?? undefined);
        });
      };

      loadCredentials()
        .then(({ token, region, sdk }) => {
          if (cancelled) return;
          const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
          speechConfig.speechSynthesisVoiceName = NEURAL_VOICE[voicePrefRef.current];
          speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3;
          // No AudioConfig (null) — deliberately NOT AudioConfig.fromDefaultSpeakerOutput().
          // That API drives Azure's own internal Web Audio playback, created fresh on
          // every turn from inside an async callback (after the network round-trip to
          // Claude) rather than synchronously inside a user tap — which WKWebView's
          // autoplay policy silently swallows: speakTextAsync's success callback still
          // fires normally, so nothing looks wrong, no sound ever plays. Passing null
          // instead makes the SDK return the raw audio bytes in result.audioData without
          // attempting to play them itself; playing that through a real <audio> element
          // below is the same mechanism ReadingTextViewer/useNeuralSpeech already use
          // reliably in this app's WebView shell.
          const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
          // Real lip-sync: Azure fires one of these per syllable, timed to
          // the actual audio — visemeId 0 means silence/mouth-closed,
          // anything else means the mouth is shaping a sound right now.
          // Timing comes from the synthesis engine itself, not from local
          // playback, so this still fires correctly with no AudioConfig.
          synthesizer.visemeReceived = (_sender, e) => {
            if (!cancelled) setViseme(e.visemeId);
          };

          synthesizer.speakTextAsync(
            replyText,
            async (result) => {
              synthesizer.close();
              if (cancelled) return;
              if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted || !result.audioData?.byteLength) {
                fallbackToBrowser();
                return;
              }
              const blob = new Blob([result.audioData], { type: "audio/mpeg" });
              const objectUrl = URL.createObjectURL(blob);
              // Reuse the single <audio> element blessed by the user's tap
              // in startCall() — a fresh `new Audio()` here would be exactly
              // the un-blessed, gesture-less element WebKit rejects.
              const audio = audioElRef.current ?? new Audio();
              audioElRef.current = audio;
              const advance = async () => {
                if (cancelled) return;
                const preloaded = await nextListenPreload;
                listenOnce(preloaded ?? undefined);
              };
              audio.onended = advance;
              audio.onerror = () => {
                // This specific clip is broken — drop it as the cached
                // "replay" candidate too, not just this playback attempt.
                if (lastReplyRef.current.url === objectUrl) lastReplyRef.current = { url: null, text: "" };
                URL.revokeObjectURL(objectUrl);
                if (!cancelled) fallbackToBrowser();
              };
              audio.src = objectUrl;
              audio.playbackRate = rateRef.current;
              audio
                .play()
                .then(() => {
                  // Only cache once playback actually starts — an object URL
                  // that never played is nothing worth replaying. The old
                  // cached clip (if any) is superseded, so it's safe to
                  // release now instead of waiting for unmount.
                  if (lastReplyRef.current.url) URL.revokeObjectURL(lastReplyRef.current.url);
                  lastReplyRef.current = { url: objectUrl, text: replyText };
                  setHasLastReply(true);
                })
                .catch(() => {
                  URL.revokeObjectURL(objectUrl);
                  if (!cancelled) fallbackToBrowser();
                });
            },
            (err) => {
              synthesizer.close();
              console.error("speakTextAsync error", err);
              // Azure TTS failed mid-flight — fall back to the free browser
              // voice rather than breaking the call.
              if (!cancelled) fallbackToBrowser();
            }
          );
        })
        .catch((err) => {
          console.error("loadCredentials for TTS failed", err);
          // Couldn't even get a token for TTS — same fallback.
          if (!cancelled) fallbackToBrowser();
        });
    }

    listenOnce();

    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
      if (activeRecognizerRef.current) safeClose(activeRecognizerRef.current);
      activeRecognizerRef.current = null;
    };
  }, [onSend, restartTick, ending, started]);

  function resume() {
    silentTurnsRef.current = 0;
    setErrorMessage(null);
    setPermissionDenied(false);
    setRestartTick((t) => t + 1);
  }

  // Replays the cached last reply on demand, without a fresh synthesis call.
  // Interrupts an in-progress listen (closing the mic like the effect's own
  // cleanup does) so the replay isn't picked up as the user's next turn, then
  // bumps restartTick — the same mechanism resume() uses — to hand control
  // back to a fresh listen cycle once playback ends.
  function replayLastReply() {
    const last = lastReplyRef.current;
    if (!last.text || ending || state === "speaking" || state === "thinking" || state === "connecting") return;

    if (activeRecognizerRef.current) safeClose(activeRecognizerRef.current);
    activeRecognizerRef.current = null;
    window.speechSynthesis?.cancel();
    silentTurnsRef.current = 0;
    setState("speaking");

    const relisten = () => setRestartTick((t) => t + 1);

    if (last.url && audioElRef.current) {
      const audio = audioElRef.current;
      audio.onended = relisten;
      audio.onerror = relisten;
      audio.src = last.url;
      audio.playbackRate = rate;
      audio.currentTime = 0;
      audio.play().catch(relisten);
    } else {
      browserSpeak(last.text, rate, relisten);
    }
  }

  // "ending" (scoring the call) reuses the "thinking" expression — it's the
  // same "processing" moment, just for the whole conversation instead of
  // one turn. "connecting"/"paused" fall back to "idle" — the orb is
  // always on screen, never swapped out for a generic spinner.
  const avatarExpression: AvatarExpression = ending
    ? "thinking"
    : state === "listening" || state === "thinking" || state === "speaking" || state === "error"
      ? state
      : "idle";

  if (!started) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-7 py-12 px-4 overflow-hidden">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-background-2 border border-card-border">
          <button
            onClick={() => selectVoice("female")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              voicePref === "female" ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground"
            }`}
          >
            קול נשי
          </button>
          <button
            onClick={() => selectVoice("male")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              voicePref === "male" ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground"
            }`}
          >
            קול גברי
          </button>
        </div>

        <SayloAvatar expression="idle" gender={voicePref} size={224} />

        <p className="text-xl sm:text-2xl font-semibold text-center px-4">מוכנים לשיחה?</p>
        <p className="text-sm text-muted text-center px-4 max-w-xs">
          לחצו כדי להתחיל — יש לאשר גישה למיקרופון כשיתבקש.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={startCall}
          className="px-8 py-4 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          התחילו שיחה
        </motion.button>

        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <Keyboard size={13} /> להמשיך בהקלדה בלי לסיים
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-7 py-12 px-4 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 20%, color-mix(in srgb, var(--primary) 10%, transparent) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 50% 90%, color-mix(in srgb, var(--accent) 9%, transparent) 0%, transparent 55%)",
        }}
      />

      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-background-2 border border-card-border">
        <button
          onClick={() => selectVoice("female")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            voicePref === "female" ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground"
          }`}
        >
          קול נשי
        </button>
        <button
          onClick={() => selectVoice("male")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            voicePref === "male" ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground"
          }`}
        >
          קול גברי
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={replayLastReply}
          disabled={!hasLastReply || ending || state === "speaking" || state === "thinking" || state === "connecting"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background-2 border border-card-border text-foreground hover:bg-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw size={13} /> השמיעו שוב
        </button>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-background-2 border border-card-border text-xs">
          {NEURAL_SPEECH_RATES.map((r) => (
            <button
              key={r}
              onClick={() => setRate(r)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                rate === r ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground"
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
        {/* A live-state ring, not a stamp — tinted by call state instead
            of a fixed outline. */}
        <div
          aria-hidden="true"
          className={`absolute inset-[8%] rounded-full border-2 transition-colors duration-500 ${
            state === "listening"
              ? "border-primary/50"
              : state === "speaking"
                ? "border-accent/50"
                : state === "error"
                  ? "border-danger/40"
                  : "border-card-border"
          }`}
        />

        <AnimatePresence>
          {!ending && state === "listening" && (
            <motion.span
              key="ring"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-[8%] rounded-full bg-primary/25"
            />
          )}
        </AnimatePresence>

        <SayloAvatar expression={avatarExpression} gender={voicePref} visemeId={viseme} size={224} />
      </div>

      <p className="text-xl sm:text-2xl font-semibold min-h-8 text-center px-4">
        {ending && "מסכמים את השיחה..."}
        {!ending && state === "connecting" && "מתחברים..."}
        {!ending && state === "listening" && "מקשיבים לכם..."}
        {!ending && state === "thinking" && "חושבים..."}
        {!ending && state === "speaking" && "Saylo עונה..."}
        {!ending && state === "paused" && "עדיין שם? הקישו כדי להמשיך"}
        {!ending && state === "error" && errorMessage}
      </p>

      {!ending && state === "paused" && (
        <button
          onClick={resume}
          className="px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          המשך האזנה
        </button>
      )}

      {!ending && state === "error" && (
        permissionDenied ? (
          isNative && (
            <button
              onClick={openIosAppSettings}
              className="px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
            >
              פתיחת הגדרות
            </button>
          )
        ) : (
          <button
            onClick={resume}
            className="px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
          >
            נסו שוב
          </button>
        )
      )}

      <button
        onClick={onEnd}
        disabled={ending || !canEnd}
        title={!canEnd ? "אמרו משהו קודם כדי לקבל משוב" : undefined}
        className="mt-2 flex items-center gap-1.5 px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        <PhoneOff size={16} /> סיום שיחה וקבלת משוב
      </button>

      <button
        onClick={onExit}
        disabled={ending}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors disabled:opacity-50"
      >
        <Keyboard size={13} /> להמשיך בהקלדה בלי לסיים
      </button>
    </div>
  );
}

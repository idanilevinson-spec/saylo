"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Keyboard } from "lucide-react";
import { speak as browserSpeak } from "@/lib/speech/browserTts";
import SayloAvatar, { type AvatarExpression } from "@/components/SayloAvatar";
import { loadVoicePref, saveVoicePref, NEURAL_VOICE, type VoicePref } from "@/lib/speech/voicePref";
import type { SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";

type CallState = "connecting" | "listening" | "thinking" | "speaking" | "paused" | "error";

interface VoiceConversationPanelProps {
  onSend: (text: string) => Promise<string | null>;
  onExit: () => void;
  onEnd: () => void;
  ending: boolean;
  canEnd: boolean;
}

const MAX_SILENT_RETRIES = 3;

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
  const [state, setState] = useState<CallState>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restartTick, setRestartTick] = useState(0);
  const [voicePref, setVoicePref] = useState<VoicePref>(() => loadVoicePref());
  const [viseme, setViseme] = useState<number | undefined>(undefined);
  // TEMPORARY: on-screen trace for diagnosing silent playback on-device,
  // where there's no way to see the console. Remove once the voice call's
  // audio is confirmed working. Capped so a long call doesn't grow forever.
  const [debugLog, setDebugLog] = useState<string[]>([]);
  function logDebug(line: string) {
    setDebugLog((prev) => [...prev.slice(-11), `${new Date().toISOString().slice(11, 19)} ${line}`]);
  }
  const silentTurnsRef = useRef(0);
  const voicePrefRef = useRef<VoicePref>(voicePref);
  // Tracks whichever recognizer is currently listening, so the effect's
  // cleanup can actually close the mic if the component unmounts (or this
  // effect re-runs) mid-listen, instead of leaving it capturing in the
  // background until Azure's own callback eventually fires.
  const activeRecognizerRef = useRef<SpeechRecognizer | null>(null);

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
      const tokenRes = await fetch("/api/speech/token");
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}));
        throw new Error(
          body.error === "premium required" ? "שיחה קולית זמינה למנויי פרימיום" : "שירות הקול לא זמין כרגע"
        );
      }
      const { token, region } = await tokenRes.json();
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
              setState("error");
              return;
            }

            speakReply(reply);
          },
          (err) => {
            safeClose(recognizer);
            if (activeRecognizerRef.current === recognizer) activeRecognizerRef.current = null;
            if (cancelled) return;
            setErrorMessage(
              String(err).includes("Permission denied") || String(err).includes("NotAllowedError")
                ? "צריך לאשר גישה למיקרופון כדי לדבר עם ה-AI."
                : "אירעה שגיאה בגישה למיקרופון."
            );
            setState("error");
          }
        );
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : "אירעה שגיאה");
        setState("error");
      }
    }

    function speakReply(replyText: string) {
      logDebug(`speakReply start, len=${replyText.length}`);
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
        logDebug("fallbackToBrowser: using window.speechSynthesis");
        browserSpeak(replyText, 1, async () => {
          if (cancelled) return;
          const preloaded = await nextListenPreload;
          listenOnce(preloaded ?? undefined);
        });
      };

      loadCredentials()
        .then(({ token, region, sdk }) => {
          if (cancelled) return;
          logDebug("credentials OK, building SpeechSynthesizer");
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
              logDebug(`speakTextAsync done, reason=${result.reason}, bytes=${result.audioData?.byteLength ?? 0}`);
              if (cancelled) return;
              if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted || !result.audioData?.byteLength) {
                fallbackToBrowser();
                return;
              }
              const blob = new Blob([result.audioData], { type: "audio/mpeg" });
              const objectUrl = URL.createObjectURL(blob);
              const audio = new Audio(objectUrl);
              const advance = async () => {
                logDebug("audio.onended fired");
                URL.revokeObjectURL(objectUrl);
                if (cancelled) return;
                const preloaded = await nextListenPreload;
                listenOnce(preloaded ?? undefined);
              };
              audio.onended = advance;
              audio.onerror = (e) => {
                logDebug(`audio.onerror: ${JSON.stringify(e)}`);
                URL.revokeObjectURL(objectUrl);
                if (!cancelled) fallbackToBrowser();
              };
              audio
                .play()
                .then(() => logDebug("audio.play() resolved"))
                .catch((err) => {
                  logDebug(`audio.play() rejected: ${err?.name ?? err}`);
                  URL.revokeObjectURL(objectUrl);
                  if (!cancelled) fallbackToBrowser();
                });
            },
            (err) => {
              synthesizer.close();
              logDebug(`speakTextAsync error callback: ${err}`);
              // Azure TTS failed mid-flight — fall back to the free browser
              // voice rather than breaking the call.
              if (!cancelled) fallbackToBrowser();
            }
          );
        })
        .catch((err) => {
          logDebug(`loadCredentials failed: ${err}`);
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
  }, [onSend, restartTick, ending]);

  function resume() {
    silentTurnsRef.current = 0;
    setErrorMessage(null);
    setRestartTick((t) => t + 1);
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

      <div className="flex items-center gap-1.5 p-1 rounded-full bg-background-2 border border-card-border">
        <button
          onClick={() => selectVoice("female")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            voicePref === "female" ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground"
          }`}
        >
          קול נשי
        </button>
        <button
          onClick={() => selectVoice("male")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            voicePref === "male" ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground"
          }`}
        >
          קול גברי
        </button>
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

      {!ending && (state === "paused" || state === "error") && (
        <button
          onClick={resume}
          className="px-6 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          {state === "paused" ? "המשך האזנה" : "נסו שוב"}
        </button>
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

      {/* TEMPORARY debug trace — remove once silent playback is fixed. */}
      {debugLog.length > 0 && (
        <div
          dir="ltr"
          className="mt-4 w-full max-w-sm rounded-lg bg-background-2 border border-card-border p-3 text-[10px] font-mono text-muted text-left overflow-x-auto"
        >
          {debugLog.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";
import type {
  SpeechRecognizer,
  SpeechConfig as AzureSpeechConfig,
  PronunciationAssessmentConfig,
} from "microsoft-cognitiveservices-speech-sdk";

type Status = "idle" | "connecting" | "listening" | "scoring" | "error" | "done";

interface ScoreResult {
  accuracy: number;
  fluency: number;
  completeness: number;
  overall: number;
}

type AttemptOutcome =
  | { kind: "success"; score: ScoreResult; recognizedText: string }
  // Azure detected speech-like audio but couldn't transcribe it with any
  // confidence — a known transient miss (a brief pause splitting the
  // phrase awkwardly, a moment of background noise) worth silently
  // retrying once before bothering the learner.
  | { kind: "retryable-no-match" }
  | { kind: "fatal"; message: string };

// Live mic-based pronunciation scoring via Azure AI Speech's Pronunciation
// Assessment, using recognizeOnceAsync — the same single-shot,
// auto-detected-end-of-speech approach VoiceConversationPanel.tsx already
// uses reliably for the AI voice-conversation feature.
//
// Critical timing detail (this was the actual bug behind "doesn't pick up
// what I said" / all-zero scores): the UI must not tell the learner to
// start talking until the recognizer has actually been constructed and
// recognizeOnceAsync has been called. Fetching the Azure token and
// dynamically importing the SDK take real time (network + bundle load) —
// if "listening... speak now" appears before that finishes, the learner
// starts (and often finishes) speaking during that gap, so the recognizer,
// once it actually starts, only hears trailing silence. VoiceConversationPanel.tsx
// already gets this right (see its own comment) — this mirrors it exactly.
//
// The SDK is imported dynamically inside the click handler — it touches
// browser-only APIs (mic, AudioContext), so it must never load during SSR
// of this "use client" component's initial server pass.
export default function PronunciationRecorder({ targetPhrase }: { targetPhrase: string }) {
  const { profile } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  // Guards recognizer callbacks: if the learner dismisses the recorder
  // while a recognition is still in flight, the eventual callback must not
  // resurrect the UI into "done"/"error" after they've closed it.
  const dismissedRef = useRef(false);

  // Azure throws if close() runs twice on the same recognizer (e.g. the
  // learner hits dismiss right as recognizeOnceAsync's own callback is
  // about to close it too) — swallow that specific race instead of
  // crashing the page.
  function safeClose(recognizer: SpeechRecognizer) {
    try {
      recognizer.close();
    } catch {
      // already disposed by a concurrent dismiss() — fine to ignore
    }
  }

  function dismiss() {
    dismissedRef.current = true;
    if (recognizerRef.current) safeClose(recognizerRef.current);
    recognizerRef.current = null;
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  }

  // One full listen-and-score cycle: builds a fresh recognizer (Azure
  // recognizers are single-use), waits for recognizeOnceAsync, and resolves
  // to a typed outcome instead of driving UI state itself — the caller in
  // startRecording decides whether an outcome is worth a silent retry.
  async function attemptRecognition(
    sdk: typeof import("microsoft-cognitiveservices-speech-sdk"),
    speechConfig: AzureSpeechConfig,
    pronunciationConfig: PronunciationAssessmentConfig
  ): Promise<AttemptOutcome> {
    return new Promise((resolve) => {
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationConfig.applyTo(recognizer);
      recognizerRef.current = recognizer;

      // Azure fires this the moment its own voice-activity detector notices
      // the learner has stopped talking — well before the final scored
      // result comes back. Switching the UI here means it stops saying
      // "speak now" once there's nothing left to say, instead of sitting on
      // a now-misleading prompt for that whole processing gap.
      recognizer.speechEndDetected = () => {
        if (!dismissedRef.current) setStatus("scoring");
      };

      // Only now — mic constructed, config applied, about to actually
      // start listening — is it correct to tell the learner to speak.
      setStatus("listening");

      recognizer.recognizeOnceAsync(
        (recognitionResult) => {
          safeClose(recognizer);
          if (recognizerRef.current === recognizer) recognizerRef.current = null;
          if (dismissedRef.current) return;

          if (recognitionResult.reason !== sdk.ResultReason.RecognizedSpeech || !recognitionResult.text.trim()) {
            // Distinguish *why* nothing usable came back — needed to tell
            // "the mic never picked up any audio" apart from "audio came
            // through but wasn't understood", instead of one generic message.
            const noMatchDetails =
              recognitionResult.reason === sdk.ResultReason.NoMatch
                ? sdk.NoMatchDetails.fromResult(recognitionResult)
                : null;
            // console.warn, not console.error — this is an expected,
            // gracefully-handled outcome, not a bug. console.error triggers
            // Next.js's dev-mode error overlay and blocks the whole page.
            console.warn("Pronunciation recognition did not return usable speech", {
              reason: sdk.ResultReason[recognitionResult.reason],
              noMatchReason: noMatchDetails ? sdk.NoMatchReason[noMatchDetails.reason] : null,
              targetPhrase,
            });
            if (noMatchDetails?.reason === sdk.NoMatchReason.InitialSilenceTimeout) {
              resolve({
                kind: "fatal",
                message: "לא נקלט שום קול — ודאו שהמיקרופון הנכון נבחר בדפדפן ושהוא לא מושתק, ונסו לדבר מיד אחרי הלחיצה.",
              });
            } else {
              resolve({ kind: "retryable-no-match" });
            }
            return;
          }

          const assessment = sdk.PronunciationAssessmentResult.fromResult(recognitionResult);
          const score: ScoreResult = {
            accuracy: Math.round(assessment.accuracyScore),
            fluency: Math.round(assessment.fluencyScore),
            completeness: Math.round(assessment.completenessScore),
            overall: Math.round(assessment.pronunciationScore),
          };
          if (Object.values(score).some((v) => !Number.isFinite(v))) {
            console.warn("Pronunciation assessment returned invalid scores", {
              recognizedText: recognitionResult.text,
              targetPhrase,
              score,
            });
            resolve({ kind: "fatal", message: "לא הצלחנו לנתח את ההגייה הפעם — נסו שוב." });
            return;
          }
          // A recognized-but-unrelated utterance (e.g. only the headword
          // said instead of the full target phrase) scores nowhere close to
          // a real attempt — treat as "try again", not a legitimate 0,
          // since a genuine attempt essentially never lands exactly on
          // every metric being 0.
          if (score.overall === 0 && score.accuracy === 0 && score.completeness === 0) {
            console.warn("Pronunciation assessment scored all-zero — likely didn't match target phrase", {
              recognizedText: recognitionResult.text,
              targetPhrase,
            });
            resolve({
              kind: "fatal",
              message: `לא זיהינו את המשפט המלא — נסו לומר בדיוק: "${targetPhrase}"`,
            });
            return;
          }

          resolve({ kind: "success", score, recognizedText: recognitionResult.text });
        },
        (err) => {
          safeClose(recognizer);
          if (recognizerRef.current === recognizer) recognizerRef.current = null;
          if (dismissedRef.current) return;
          resolve({
            kind: "fatal",
            message:
              String(err).includes("Permission denied") || String(err).includes("NotAllowedError")
                ? "צריך לאשר גישה למיקרופון כדי לתרגל הגייה."
                : "אירעה שגיאה בגישה למיקרופון. נסו שוב.",
          });
        }
      );
    });
  }

  async function startRecording() {
    dismissedRef.current = false;
    setStatus("connecting");
    setErrorMessage(null);
    setResult(null);

    try {
      const tokenRes = await fetch("/api/speech/token");
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}));
        throw new Error(body.error === "premium required" ? "תרגול הגייה זמין למנויי פרימיום" : "שירות ההגייה לא זמין כרגע");
      }
      const { token, region } = await tokenRes.json();
      if (dismissedRef.current) return;

      const sdk = await import("microsoft-cognitiveservices-speech-sdk");
      if (dismissedRef.current) return;

      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = "en-US";
      // Required for pronunciation assessment: PronunciationAssessmentResult
      // reads its scores out of the *detailed* recognition JSON. Every
      // Microsoft sample for this feature sets this.
      speechConfig.outputFormat = sdk.OutputFormat.Detailed;
      // Give the service more patience before it decides a phrase is over.
      // A brief natural pause mid-sentence (very normal for a learner
      // reading a target phrase aloud) can otherwise end the phrase early,
      // handing the engine a partial, low-confidence clip it can't
      // transcribe at all. Default segmentation silence is quite short;
      // widening it trades a little latency for real phrases completing.
      speechConfig.setProperty(sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, "2500");
      speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "10000");

      // enableMiscue (last param) makes Azure compare the utterance against
      // the reference text more strictly — if the audio doesn't align
      // reasonably well, it reports NoMatch instead of returning any score.
      // We don't use per-word miscue markers in the UI (only the four
      // aggregate scores below), so there's nothing to lose by turning it
      // off in exchange for the engine returning a result more often.
      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        targetPhrase,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        false
      );

      // Up to one silent retry on a bare "couldn't transcribe" miss — the
      // learner already spoke once; re-prompting immediately (no extra
      // click, no error shown) resolves a real fraction of these without
      // making them feel like anything went wrong.
      let outcome = await attemptRecognition(sdk, speechConfig, pronunciationConfig);
      if (dismissedRef.current) return;
      if (outcome.kind === "retryable-no-match") {
        outcome = await attemptRecognition(sdk, speechConfig, pronunciationConfig);
        if (dismissedRef.current) return;
      }

      if (outcome.kind === "retryable-no-match") {
        setStatus("error");
        setErrorMessage("לא הצלחנו לזהות דיבור — נסו שוב, קרוב יותר למיקרופון ובקול ברור.");
        return;
      }
      if (outcome.kind === "fatal") {
        setStatus("error");
        setErrorMessage(outcome.message);
        return;
      }

      setStatus("scoring");
      setResult(outcome.score);
      setStatus("done");

      if (profile) {
        await supabase.from("pronunciation_attempts").insert({
          profile_id: profile.id,
          target_phrase: targetPhrase,
          provider: "azure",
          score: outcome.score,
        });
      }
    } catch (err) {
      if (dismissedRef.current) return;
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "אירעה שגיאה");
    }
  }

  const showTargetPhrase = status === "idle" || status === "connecting" || status === "listening";

  return (
    <div>
      {showTargetPhrase && (
        <p className="text-xs text-muted mb-1.5">
          אמרו בקול:{" "}
          <EnglishText as="span" className="font-medium text-foreground">
            {targetPhrase}
          </EnglishText>
        </p>
      )}

      {status === "idle" && (
        <button
          onClick={startRecording}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-card-border hover:border-primary/40 hover:bg-background-2 transition-colors"
        >
          <Mic size={14} /> תרגלו הגייה
        </button>
      )}

      {status === "connecting" && (
        <span className="text-sm px-3 py-1.5 rounded-lg text-muted">מתחברים למיקרופון...</span>
      )}

      {status === "listening" && (
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-danger-ink text-danger font-medium"
          >
            <Mic size={14} /> מקשיב... דברו עכשיו
          </motion.div>
          <button
            onClick={dismiss}
            aria-label="בטלו את ההקלטה"
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-background-2 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {status === "scoring" && (
        <span className="text-sm px-3 py-1.5 rounded-lg text-muted">מנתח את ההגייה...</span>
      )}

      {status === "error" && (
        <div className="text-sm flex items-start gap-2">
          <div>
            <p role="alert" className="text-danger">{errorMessage}</p>
            <button onClick={startRecording} className="mt-1 text-primary hover:underline">
              נסו שוב
            </button>
          </div>
          <button
            onClick={dismiss}
            aria-label="סגרו"
            className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-background-2 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {status === "done" && result && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-2">
              <ScorePill label="כללי" value={result.overall} highlight />
              <ScorePill label="דיוק" value={result.accuracy} />
              <ScorePill label="שטף" value={result.fluency} />
              <ScorePill label="שלמות" value={result.completeness} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === "done" && (
        <div className="mt-2 flex items-center gap-3">
          <button onClick={startRecording} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Mic size={14} /> נסו שוב
          </button>
          <button onClick={dismiss} className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
            <X size={14} /> סגרו
          </button>
        </div>
      )}
    </div>
  );
}

function ScorePill({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg p-2 text-center ${
        highlight ? "bg-primary text-primary-ink" : "bg-background-2 border border-card-border"
      }`}
    >
      <p className="font-bold">{value}</p>
      <p className={`text-[10px] ${highlight ? "opacity-90" : "text-muted"}`}>{label}</p>
    </div>
  );
}

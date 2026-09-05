"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";

type Status = "idle" | "listening" | "scoring" | "done" | "error";

interface ScoreResult {
  accuracy: number;
  fluency: number;
  completeness: number;
  overall: number;
}

// Live mic-based pronunciation scoring via Azure AI Speech's Pronunciation
// Assessment. The SDK is imported dynamically inside the click handler —
// it touches browser-only APIs (mic, AudioContext), so it must never load
// during SSR of this "use client" component's initial server pass.
export default function PronunciationRecorder({ targetPhrase }: { targetPhrase: string }) {
  const { profile } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function startRecording() {
    setStatus("listening");
    setErrorMessage(null);
    setResult(null);

    try {
      const tokenRes = await fetch("/api/speech/token");
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}));
        throw new Error(body.error === "premium required" ? "תרגול הגייה זמין למנויי פרימיום" : "שירות ההגייה לא זמין כרגע");
      }
      const { token, region } = await tokenRes.json();

      const sdk = await import("microsoft-cognitiveservices-speech-sdk");
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = "en-US";

      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        targetPhrase,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        true
      );

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationConfig.applyTo(recognizer);

      recognizer.recognizeOnceAsync(
        async (recognitionResult) => {
          recognizer.close();

          if (recognitionResult.reason !== sdk.ResultReason.RecognizedSpeech) {
            setStatus("error");
            setErrorMessage("לא הצלחנו לזהות דיבור — נסו שוב, קרוב יותר למיקרופון.");
            return;
          }

          setStatus("scoring");
          const assessment = sdk.PronunciationAssessmentResult.fromResult(recognitionResult);
          const score: ScoreResult = {
            accuracy: Math.round(assessment.accuracyScore),
            fluency: Math.round(assessment.fluencyScore),
            completeness: Math.round(assessment.completenessScore),
            overall: Math.round(assessment.pronunciationScore),
          };
          setResult(score);
          setStatus("done");

          if (profile) {
            await supabase.from("pronunciation_attempts").insert({
              profile_id: profile.id,
              target_phrase: targetPhrase,
              provider: "azure",
              score,
            });
          }
        },
        (err) => {
          recognizer.close();
          setStatus("error");
          setErrorMessage(
            String(err).includes("Permission denied") || String(err).includes("NotAllowedError")
              ? "צריך לאשר גישה למיקרופון כדי לתרגל הגייה."
              : "אירעה שגיאה בגישה למיקרופון. נסו שוב."
          );
        }
      );
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "אירעה שגיאה");
    }
  }

  return (
    <div>
      {status === "idle" && (
        <button
          onClick={startRecording}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-card-border hover:border-primary/40 hover:bg-background-2 transition-colors"
        >
          <Mic size={14} /> תרגלו הגייה
        </button>
      )}

      {status === "listening" && (
        <motion.button
          disabled
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-danger-ink text-danger font-medium"
        >
          <Mic size={14} /> מקשיב... דברו עכשיו
        </motion.button>
      )}

      {status === "scoring" && (
        <span className="text-sm px-3 py-1.5 rounded-lg text-muted">מנתח את ההגייה...</span>
      )}

      {status === "error" && (
        <div className="text-sm">
          <p role="alert" className="text-danger">{errorMessage}</p>
          <button onClick={startRecording} className="mt-1 text-primary hover:underline">
            נסו שוב
          </button>
        </div>
      )}

      <AnimatePresence>
        {status === "done" && result && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 grid grid-cols-4 gap-2 overflow-hidden"
          >
            <ScorePill label="כללי" value={result.overall} highlight />
            <ScorePill label="דיוק" value={result.accuracy} />
            <ScorePill label="שטף" value={result.fluency} />
            <ScorePill label="שלמות" value={result.completeness} />
          </motion.div>
        )}
      </AnimatePresence>

      {status === "done" && (
        <button onClick={startRecording} className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Mic size={14} /> נסו שוב
        </button>
      )}
    </div>
  );
}

function ScorePill({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl p-2 text-center ${
        highlight ? "bg-primary text-primary-ink" : "bg-background-2"
      }`}
    >
      <p className="font-bold">{value}</p>
      <p className={`text-[10px] ${highlight ? "opacity-90" : "text-muted"}`}>{label}</p>
    </div>
  );
}

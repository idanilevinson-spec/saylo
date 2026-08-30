"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, Volume2, PhoneOff } from "lucide-react";
import { speak, speechSupported } from "@/lib/speech/browserTts";

type CallState = "connecting" | "listening" | "thinking" | "speaking" | "paused" | "error";

interface VoiceConversationPanelProps {
  onSend: (text: string) => Promise<string | null>;
  onExit: () => void;
}

const MAX_SILENT_RETRIES = 3;

// Hands-free "phone call" mode for AI conversation practice: loops
// Azure recognizeOnceAsync (listen) -> onSend (Claude turn) -> browser TTS
// (speak) -> back to listening, entirely driven from inside this effect so
// each call cycle owns its own `cancelled` closure — resuming after a pause
// or exiting mid-cycle can't leak a stale loop into the next one.
export default function VoiceConversationPanel({ onSend, onExit }: VoiceConversationPanelProps) {
  const [state, setState] = useState<CallState>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restartTick, setRestartTick] = useState(0);
  const silentTurnsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function listenOnce() {
      if (cancelled) return;
      setState("listening");

      try {
        const tokenRes = await fetch("/api/speech/token");
        if (!tokenRes.ok) {
          const body = await tokenRes.json().catch(() => ({}));
          throw new Error(
            body.error === "premium required" ? "שיחה קולית זמינה למנויי פרימיום" : "שירות הקול לא זמין כרגע"
          );
        }
        const { token, region } = await tokenRes.json();
        if (cancelled) return;

        const sdk = await import("microsoft-cognitiveservices-speech-sdk");
        if (cancelled) return;

        const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
        speechConfig.speechRecognitionLanguage = "en-US";
        const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(
          async (result) => {
            recognizer.close();
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

            if (!speechSupported()) {
              listenOnce();
              return;
            }

            setState("speaking");
            speak(reply, 1, () => {
              if (!cancelled) listenOnce();
            });
          },
          (err) => {
            recognizer.close();
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

    listenOnce();

    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
    };
  }, [onSend, restartTick]);

  function resume() {
    silentTurnsRef.current = 0;
    setErrorMessage(null);
    setRestartTick((t) => t + 1);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative flex items-center justify-center w-28 h-28">
        <AnimatePresence>
          {state === "listening" && (
            <motion.span
              key="ring"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-primary/30"
            />
          )}
        </AnimatePresence>
        <motion.div
          animate={
            state === "listening"
              ? { scale: [1, 1.05, 1] }
              : state === "speaking"
                ? { scale: [1, 1.03, 1] }
                : { scale: 1 }
          }
          transition={{ duration: 1.1, repeat: state === "listening" || state === "speaking" ? Infinity : 0 }}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 ${
            state === "listening"
              ? "bg-primary/10 border-primary text-primary"
              : state === "speaking"
                ? "bg-accent/10 border-accent text-accent-hover"
                : state === "error"
                  ? "bg-danger-ink border-danger text-danger"
                  : "bg-background-2 border-card-border text-muted"
          }`}
        >
          {state === "thinking" || state === "connecting" ? (
            <Loader2 size={32} className="animate-spin" />
          ) : state === "speaking" ? (
            <Volume2 size={32} />
          ) : (
            <Mic size={32} />
          )}
        </motion.div>
      </div>

      <p className="text-sm font-medium text-muted min-h-5 text-center px-4">
        {state === "connecting" && "מתחברים..."}
        {state === "listening" && "מקשיבים לכם..."}
        {state === "thinking" && "חושבים..."}
        {state === "speaking" && "Saylo עונה..."}
        {state === "paused" && "עדיין שם? הקישו כדי להמשיך"}
        {state === "error" && errorMessage}
      </p>

      {(state === "paused" || state === "error") && (
        <button
          onClick={resume}
          className="px-4 py-2 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          {state === "paused" ? "המשך האזנה" : "נסו שוב"}
        </button>
      )}

      <button
        onClick={onExit}
        className="mt-2 flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border border-card-border text-danger hover:bg-danger-ink transition-colors"
      >
        <PhoneOff size={16} /> חזרה להקלדה
      </button>
    </div>
  );
}

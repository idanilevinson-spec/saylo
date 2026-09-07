"use client";

import { useRef, useState } from "react";
import type { SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";

export type RecognitionStatus = "idle" | "connecting" | "listening" | "processing" | "error" | "done";

// Plain single-shot speech-to-text (no pronunciation assessment) via Azure
// AI Speech, extracted from the proven, hard-won-correct pattern in
// PronunciationRecorder.tsx so a second consumer (Speaking Test) doesn't
// duplicate the same delicate ~150 lines a third time. PronunciationRecorder
// itself is deliberately left untouched, using its own copy of this same
// logic plus PronunciationAssessmentConfig — it's stable, and refactoring a
// working feature purely for DRY isn't worth the regression risk.
//
// Every fix earned the hard way this session is preserved here:
// - "listening" only appears once the recognizer actually exists (the
//   Azure token fetch + SDK import take real time; showing "speak now"
//   before that finishes means the learner talks during the gap and the
//   recognizer only hears trailing silence).
// - speechEndDetected flips the UI out of "listening" the moment Azure's
//   own voice-activity detector notices the learner stopped, instead of
//   sitting on a stale "speak now" prompt during the processing gap.
// - Widened segmentation/initial-silence timeouts (a natural mid-sentence
//   pause otherwise ends the phrase early, handing the engine a partial
//   clip it can't transcribe).
// - One silent auto-retry on a bare "couldn't transcribe" miss.
// - safeClose() guards against the "already disposed" crash when dismiss()
//   races the recognizer's own callback closing it.
export function useSingleShotRecognition() {
  const [status, setStatus] = useState<RecognitionStatus>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const dismissedRef = useRef(false);

  function safeClose(recognizer: SpeechRecognizer) {
    try {
      recognizer.close();
    } catch {
      // already disposed by a concurrent dismiss() — fine to ignore
    }
  }

  function reset() {
    dismissedRef.current = false;
    setStatus("idle");
    setTranscript(null);
    setErrorMessage(null);
  }

  function dismiss() {
    dismissedRef.current = true;
    if (recognizerRef.current) safeClose(recognizerRef.current);
    recognizerRef.current = null;
    setStatus("idle");
    setTranscript(null);
    setErrorMessage(null);
  }

  async function attemptOnce(
    sdk: typeof import("microsoft-cognitiveservices-speech-sdk"),
    speechConfig: import("microsoft-cognitiveservices-speech-sdk").SpeechConfig
  ): Promise<{ kind: "success"; text: string } | { kind: "retryable-no-match" } | { kind: "fatal"; message: string }> {
    return new Promise((resolve) => {
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      recognizer.speechEndDetected = () => {
        if (!dismissedRef.current) setStatus("processing");
      };

      setStatus("listening");

      recognizer.recognizeOnceAsync(
        (recognitionResult) => {
          safeClose(recognizer);
          if (recognizerRef.current === recognizer) recognizerRef.current = null;
          if (dismissedRef.current) return;

          if (recognitionResult.reason !== sdk.ResultReason.RecognizedSpeech || !recognitionResult.text.trim()) {
            const noMatchDetails =
              recognitionResult.reason === sdk.ResultReason.NoMatch
                ? sdk.NoMatchDetails.fromResult(recognitionResult)
                : null;
            console.warn("Speech recognition did not return usable speech", {
              reason: sdk.ResultReason[recognitionResult.reason],
              noMatchReason: noMatchDetails ? sdk.NoMatchReason[noMatchDetails.reason] : null,
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

          resolve({ kind: "success", text: recognitionResult.text });
        },
        (err) => {
          safeClose(recognizer);
          if (recognizerRef.current === recognizer) recognizerRef.current = null;
          if (dismissedRef.current) return;
          resolve({
            kind: "fatal",
            message:
              String(err).includes("Permission denied") || String(err).includes("NotAllowedError")
                ? "צריך לאשר גישה למיקרופון כדי לענות בקול."
                : "אירעה שגיאה בגישה למיקרופון. נסו שוב.",
          });
        }
      );
    });
  }

  async function start() {
    reset();
    setStatus("connecting");

    try {
      const tokenRes = await fetch("/api/speech/token");
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}));
        throw new Error(body.error === "premium required" ? "מבחן הדיבור זמין למנויי פרימיום" : "שירות ההקלטה לא זמין כרגע");
      }
      const { token, region } = await tokenRes.json();
      if (dismissedRef.current) return;

      const sdk = await import("microsoft-cognitiveservices-speech-sdk");
      if (dismissedRef.current) return;

      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = "en-US";
      speechConfig.setProperty(sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, "2500");
      speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "10000");

      let outcome = await attemptOnce(sdk, speechConfig);
      if (dismissedRef.current) return;
      if (outcome.kind === "retryable-no-match") {
        outcome = await attemptOnce(sdk, speechConfig);
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

      setTranscript(outcome.text);
      setStatus("done");
    } catch (err) {
      if (dismissedRef.current) return;
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "אירעה שגיאה");
    }
  }

  return { status, transcript, errorMessage, start, dismiss };
}

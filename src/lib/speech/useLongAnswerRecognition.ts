"use client";

import { useEffect, useRef, useState } from "react";
import type { SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";
import { isMicPermissionDeniedError } from "./micPermission";
import { elapsedSeconds, joinSegments } from "./longAnswer";

// Continuous speech-to-text for answers of a minute or two (the oral Bagrut
// simulation). useSingleShotRecognition stops at the first pause, which is
// right for one sentence and wrong for "talk about your project for one to
// two minutes", so this is a separate hook rather than a change to that
// proven one. Same Azure token route, same consent and premium checks.
//
// The learner presses stop when done; the recording also stops by itself
// at maxSeconds. Nothing is stored: the transcript is returned, the audio
// never leaves the Azure session.

export type LongAnswerStatus = "idle" | "connecting" | "listening" | "finishing" | "done" | "error";

export function useLongAnswerRecognition(maxSeconds: number) {
  const [status, setStatus] = useState<LongAnswerStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const segmentsRef = useRef<string[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const stoppingRef = useRef(false);

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function closeRecognizer() {
    const r = recognizerRef.current;
    recognizerRef.current = null;
    if (!r) return;
    try {
      r.close();
    } catch {
      // already disposed
    }
  }

  function finish() {
    clearTimer();
    closeRecognizer();
    stoppingRef.current = false;
    if (cancelledRef.current) return;
    const text = joinSegments(segmentsRef.current);
    setInterim("");
    setTranscript(text);
    if (!text) {
      setStatus("error");
      setErrorMessage("לא זיהינו דיבור בהקלטה. כדאי לבדוק שהמיקרופון הנכון נבחר ולנסות שוב.");
      return;
    }
    setStatus("done");
  }

  function stop() {
    const r = recognizerRef.current;
    if (!r || stoppingRef.current) return;
    stoppingRef.current = true;
    clearTimer();
    setStatus("finishing");
    // The last phrase arrives after stopping, in "recognized"; finish waits for it.
    r.stopContinuousRecognitionAsync(finish, finish);
  }

  function dismiss() {
    cancelledRef.current = true;
    clearTimer();
    const r = recognizerRef.current;
    if (r) {
      try {
        r.stopContinuousRecognitionAsync(closeRecognizer, closeRecognizer);
      } catch {
        closeRecognizer();
      }
    }
    segmentsRef.current = [];
    stoppingRef.current = false;
    setStatus("idle");
    setTranscript("");
    setInterim("");
    setSeconds(0);
    setErrorMessage(null);
    setPermissionDenied(false);
  }

  async function start() {
    dismiss();
    cancelledRef.current = false;
    setStatus("connecting");
    try {
      const tokenRes = await fetch("/api/speech/token");
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}));
        throw new Error(
          body.error === "premium required"
            ? "ההקלטה זמינה למנויים ובתקופת הניסיון"
            : body.error === "parental consent required"
              ? "כדי להקליט קול נדרש אישור של הורה או אפוטרופוס"
              : "שירות ההקלטה לא זמין כרגע",
        );
      }
      const { token, region } = await tokenRes.json();
      if (cancelledRef.current) return;
      const sdk = await import("microsoft-cognitiveservices-speech-sdk");
      if (cancelledRef.current) return;

      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = "en-US";
      // A thinking pause mid-answer must not split a sentence in two.
      speechConfig.setProperty(sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, "2500");
      const recognizer = new sdk.SpeechRecognizer(speechConfig, sdk.AudioConfig.fromDefaultMicrophoneInput());
      recognizerRef.current = recognizer;
      segmentsRef.current = [];

      recognizer.recognizing = (_s, e) => {
        if (!cancelledRef.current) setInterim(e.result.text);
      };
      recognizer.recognized = (_s, e) => {
        if (cancelledRef.current) return;
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text.trim()) {
          segmentsRef.current.push(e.result.text);
          setTranscript(joinSegments(segmentsRef.current));
        }
        setInterim("");
      };
      recognizer.canceled = (_s, e) => {
        if (cancelledRef.current || e.reason !== sdk.CancellationReason.Error) return;
        clearTimer();
        closeRecognizer();
        const denied = isMicPermissionDeniedError(e.errorDetails);
        setPermissionDenied(denied);
        setStatus("error");
        setErrorMessage(
          denied ? "לא ניתנה גישה למיקרופון, ולכן אי אפשר לענות בקול." : "ההקלטה נקטעה. נסו להקליט שוב.",
        );
      };

      recognizer.startContinuousRecognitionAsync(
        () => {
          if (cancelledRef.current) return;
          // "Speak now" only once the recognizer really listens.
          startedAtRef.current = Date.now();
          setSeconds(0);
          setStatus("listening");
          timerRef.current = setInterval(() => {
            const s = elapsedSeconds(startedAtRef.current, Date.now(), maxSeconds);
            setSeconds(s);
            if (s >= maxSeconds) stop();
          }, 250);
        },
        (err) => {
          closeRecognizer();
          if (cancelledRef.current) return;
          const denied = isMicPermissionDeniedError(err);
          setPermissionDenied(denied);
          setStatus("error");
          setErrorMessage(denied ? "לא ניתנה גישה למיקרופון, ולכן אי אפשר לענות בקול." : "אירעה שגיאה בגישה למיקרופון. נסו שוב.");
        },
      );
    } catch (err) {
      if (cancelledRef.current) return;
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "אירעה שגיאה");
    }
  }

  // Leaving the page mid-answer releases the microphone.
  useEffect(
    () => () => {
      cancelledRef.current = true;
      clearTimer();
      closeRecognizer();
    },
    [],
  );

  return { status, transcript, interim, seconds, errorMessage, permissionDenied, start, stop, dismiss };
}

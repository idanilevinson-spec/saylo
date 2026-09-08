"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadVoicePref, NEURAL_VOICE } from "@/lib/speech/voicePref";

export type NeuralSpeechState = "idle" | "loading" | "playing" | "paused";

export const NEURAL_SPEECH_RATES = [0.75, 1, 1.25, 1.5] as const;

// Neural TTS for an ordered list of text segments (reading paragraphs, or a
// single listening clip) — Azure's neural voice when available, playing one
// segment after another automatically, with per-segment caching so a repeat
// play within the same session doesn't re-synthesize, and a graceful
// fallback to the browser's built-in Web Speech API if Azure is unavailable
// or fails. Extracted from ReadingTextViewer, which was the original (and
// until now, only) place this pattern existed.
export function useNeuralSpeech(segments: string[]) {
  const [state, setState] = useState<NeuralSpeechState>("idle");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [rate, setRateState] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const usingFallbackRef = useRef(false);
  const rateRef = useRef(1);
  // Bumped on every jump/unmount so a slow in-flight synthesis call for a
  // segment the caller already moved away from can't land late and hijack
  // playback out from under whatever's actually active now.
  const requestTokenRef = useRef(0);
  const segmentsRef = useRef(segments);
  // Kept in sync outside render (refs must not be written during render) —
  // callbacks below only ever read this asynchronously, after commit, so a
  // one-render-later update here is never observable as staleness.
  useEffect(() => {
    segmentsRef.current = segments;
  });

  useEffect(() => {
    const cache = audioCacheRef.current;
    return () => {
      requestTokenRef.current += 1;
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  const stop = useCallback(() => {
    requestTokenRef.current += 1;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setState("idle");
    setActiveIndex(null);
  }, []);

  // play() advances to the next segment recursively (on an utterance/audio
  // "ended" event) — routed through this ref rather than a direct closure
  // over the `play` const so the recursive call always reaches the current
  // definition instead of capturing itself mid-declaration.
  const playRef = useRef<(index: number) => void>(() => {});

  const play = useCallback(
    (index: number) => {
      const segs = segmentsRef.current;
      if (index < 0 || index >= segs.length) {
        stop();
        return;
      }
      requestTokenRef.current += 1;
      const myToken = requestTokenRef.current;
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setActiveIndex(index);
      setState("loading");

      const text = segs[index];

      const playViaBrowser = () => {
        if (myToken !== requestTokenRef.current || typeof window === "undefined" || !window.speechSynthesis) {
          if (myToken === requestTokenRef.current) stop();
          return;
        }
        usingFallbackRef.current = true;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = rateRef.current;
        utterance.onstart = () => {
          if (myToken === requestTokenRef.current) setState("playing");
        };
        utterance.onend = () => {
          if (myToken === requestTokenRef.current) playRef.current(index + 1);
        };
        utterance.onerror = () => {
          if (myToken === requestTokenRef.current) stop();
        };
        window.speechSynthesis.speak(utterance);
      };

      if (usingFallbackRef.current) {
        playViaBrowser();
        return;
      }

      function ensureAudioEl(): HTMLAudioElement {
        if (!audioRef.current) audioRef.current = new Audio();
        return audioRef.current;
      }

      const playFromUrl = (url: string) => {
        const audio = ensureAudioEl();
        audio.onended = () => {
          if (myToken === requestTokenRef.current) playRef.current(index + 1);
        };
        audio.src = url;
        audio.playbackRate = rateRef.current;
        audio
          .play()
          .then(() => {
            if (myToken === requestTokenRef.current) setState("playing");
          })
          .catch(() => playViaBrowser());
      };

      const cached = audioCacheRef.current.get(index);
      if (cached) {
        playFromUrl(cached);
        return;
      }

      (async () => {
        try {
          const tokenRes = await fetch("/api/speech/token");
          if (!tokenRes.ok) {
            if (myToken === requestTokenRef.current) playViaBrowser();
            return;
          }
          if (myToken !== requestTokenRef.current) return;
          const { token, region } = await tokenRes.json();
          const sdk = await import("microsoft-cognitiveservices-speech-sdk");
          if (myToken !== requestTokenRef.current) return;

          const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
          speechConfig.speechSynthesisVoiceName = NEURAL_VOICE[loadVoicePref()];
          speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3;
          const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

          synthesizer.speakTextAsync(
            text,
            (result) => {
              synthesizer.close();
              if (myToken !== requestTokenRef.current) return;
              if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted || !result.audioData?.byteLength) {
                playViaBrowser();
                return;
              }
              const blob = new Blob([result.audioData], { type: "audio/mpeg" });
              const objectUrl = URL.createObjectURL(blob);
              audioCacheRef.current.set(index, objectUrl);
              playFromUrl(objectUrl);
            },
            () => {
              synthesizer.close();
              if (myToken === requestTokenRef.current) playViaBrowser();
            }
          );
        } catch {
          playViaBrowser();
        }
      })();
    },
    [stop]
  );

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  const togglePlayPause = useCallback(() => {
    if (state === "idle") {
      play(0);
      return;
    }
    if (state === "playing") {
      if (usingFallbackRef.current) window.speechSynthesis.pause();
      else audioRef.current?.pause();
      setState("paused");
      return;
    }
    if (state === "paused") {
      if (usingFallbackRef.current) window.speechSynthesis.resume();
      else audioRef.current?.play().catch(() => {});
      setState("playing");
    }
  }, [state, play]);

  const setRate = useCallback(
    (newRate: number) => {
      setRateState(newRate);
      rateRef.current = newRate;
      if (!usingFallbackRef.current && audioRef.current) {
        audioRef.current.playbackRate = newRate;
        return;
      }
      // The Web Speech API can't change an utterance's rate once it has
      // started, so the only way to honor the new rate for the fallback
      // voice is to replay the current segment from its start at that rate.
      if (usingFallbackRef.current && activeIndex !== null && state !== "idle") {
        play(activeIndex);
      }
    },
    [activeIndex, state, play]
  );

  return { state, activeIndex, rate, play, togglePlayPause, setRate, stop };
}

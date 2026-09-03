"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Play, Pause, Loader2, X } from "lucide-react";
import { speak, speechSupported } from "@/lib/speech/browserTts";
import { loadVoicePref, NEURAL_VOICE } from "@/lib/speech/voicePref";
import EnglishText from "@/components/EnglishText";
import type { VocabularyLookupEntry } from "@/lib/content/vocabulary";

interface ReadingTextViewerProps {
  bodyEn: string;
  vocabByWord: Record<string, VocabularyLookupEntry>;
}

type PlaybackState = "idle" | "loading" | "playing" | "paused";

const RATES = [0.75, 1, 1.25, 1.5];

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, "");
}

function tokenizeWords(text: string, vocabByWord: Record<string, VocabularyLookupEntry>, onWordClick: (word: string, entry: VocabularyLookupEntry) => void) {
  return text.split(/(\s+)/).map((token, i) => {
    if (/^\s*$/.test(token)) return <span key={i}>{token}</span>;
    const clean = normalizeWord(token);
    const entry = vocabByWord[clean];
    if (!entry) return <span key={i}>{token}</span>;
    return (
      <button
        key={i}
        onClick={() => {
          onWordClick(clean, entry);
          speak(clean);
        }}
        className="underline decoration-dotted decoration-primary/50 hover:bg-primary/10 rounded px-0.5 transition-colors"
      >
        {token}
      </button>
    );
  });
}

// Real (non-robotic) narration, paragraph by paragraph — Azure's neural
// voice when available, since a monotone browser voice can make English
// harder to understand, not easier; falls back to the free browser voice
// only if Azure is unavailable. Splitting per paragraph (rather than one
// clip for the whole passage) is what makes three things possible at
// once: clicking a specific paragraph to (re)play just that one, genuine
// pause/resume at the exact point playback was at, and adjusting speed
// without losing your place — none of which are achievable once several
// paragraphs are baked into a single audio clip.
export default function ReadingTextViewer({ bodyEn, vocabByWord }: ReadingTextViewerProps) {
  // Blank lines between paragraphs come through as \r\n\r\n when the
  // source SQL was saved/pasted with Windows line endings, not just \n\n
  // — matching (\r\n|\n) as one unit before requiring 2+ of them handles
  // both.
  const paragraphs = bodyEn.split(/(?:\r\n|\n){2,}/).filter((p) => p.trim().length > 0);

  const [popover, setPopover] = useState<{ word: string; entry: VocabularyLookupEntry } | null>(null);
  const [playback, setPlayback] = useState<PlaybackState>("idle");
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const [rate, setRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const usingFallbackRef = useRef(false);
  const rateRef = useRef(1);
  // Bumped on every jump/unmount so a slow in-flight synthesis call from a
  // paragraph the user already clicked away from can't land late and hijack
  // playback out from under whatever's actually active now.
  const requestTokenRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    const cache = audioCacheRef.current;
    return () => {
      requestTokenRef.current += 1;
      audio?.pause();
      window.speechSynthesis?.cancel();
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  function stopEverything() {
    requestTokenRef.current += 1;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setPlayback("idle");
    setActiveParagraph(null);
  }

  async function playParagraph(index: number) {
    if (index < 0 || index >= paragraphs.length) {
      stopEverything();
      return;
    }
    requestTokenRef.current += 1;
    const myToken = requestTokenRef.current;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setActiveParagraph(index);
    setPlayback("loading");

    const text = paragraphs[index];

    const playViaBrowser = () => {
      if (myToken !== requestTokenRef.current || !speechSupported()) {
        if (myToken === requestTokenRef.current) stopEverything();
        return;
      }
      usingFallbackRef.current = true;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rateRef.current;
      utterance.onstart = () => {
        if (myToken === requestTokenRef.current) setPlayback("playing");
      };
      utterance.onend = () => {
        if (myToken === requestTokenRef.current) playParagraph(index + 1);
      };
      utterance.onerror = () => {
        if (myToken === requestTokenRef.current) stopEverything();
      };
      window.speechSynthesis.speak(utterance);
    };

    if (usingFallbackRef.current) {
      playViaBrowser();
      return;
    }

    const cached = audioCacheRef.current.get(index);
    if (cached) {
      const audio = audioRef.current;
      if (!audio) {
        playViaBrowser();
        return;
      }
      audio.src = cached;
      audio.playbackRate = rateRef.current;
      try {
        await audio.play();
        if (myToken === requestTokenRef.current) setPlayback("playing");
      } catch {
        playViaBrowser();
      }
      return;
    }

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
          const audio = audioRef.current;
          if (!audio) {
            playViaBrowser();
            return;
          }
          audio.src = objectUrl;
          audio.playbackRate = rateRef.current;
          audio
            .play()
            .then(() => {
              if (myToken === requestTokenRef.current) setPlayback("playing");
            })
            .catch(() => playViaBrowser());
        },
        () => {
          synthesizer.close();
          if (myToken === requestTokenRef.current) playViaBrowser();
        }
      );
    } catch {
      playViaBrowser();
    }
  }

  function togglePlayPause() {
    if (playback === "idle") {
      playParagraph(0);
      return;
    }
    if (playback === "playing") {
      if (usingFallbackRef.current) window.speechSynthesis.pause();
      else audioRef.current?.pause();
      setPlayback("paused");
      return;
    }
    if (playback === "paused") {
      if (usingFallbackRef.current) window.speechSynthesis.resume();
      else audioRef.current?.play().catch(() => {});
      setPlayback("playing");
    }
  }

  function handleRateChange(newRate: number) {
    setRate(newRate);
    rateRef.current = newRate;
    if (!usingFallbackRef.current && audioRef.current) {
      audioRef.current.playbackRate = newRate;
      return;
    }
    // The Web Speech API can't change an utterance's rate once it has
    // started, so the only way to honor the new rate for the fallback
    // voice is to replay the current paragraph from its start at that rate.
    if (usingFallbackRef.current && activeParagraph !== null && playback !== "idle") {
      playParagraph(activeParagraph);
    }
  }

  return (
    <div>
      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => {
          if (activeParagraph !== null) playParagraph(activeParagraph + 1);
        }}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={togglePlayPause}
          disabled={playback === "loading"}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
        >
          {playback === "loading" && <Loader2 size={15} className="animate-spin" />}
          {playback === "playing" && <Pause size={13} />}
          {playback === "paused" && <Play size={13} />}
          {playback === "idle" && <Volume2 size={15} />}
          {playback === "loading"
            ? "טוען הקראה..."
            : playback === "playing"
              ? "השהו"
              : playback === "paused"
                ? "המשיכו"
                : "הקריאו לי את הטקסט"}
        </button>

        <div className="flex items-center gap-1 text-xs">
          {RATES.map((r) => (
            <button
              key={r}
              onClick={() => handleRateChange(r)}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                rate === r ? "bg-primary text-primary-ink" : "text-muted hover:bg-background-2"
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>

      <div dir="ltr" className="font-content text-lg leading-loose text-left space-y-4">
        {paragraphs.map((paragraph, pIdx) => (
          <p
            key={pIdx}
            className={`rounded-lg transition-colors ${activeParagraph === pIdx ? "bg-primary/5" : ""}`}
          >
            <button
              onClick={() => playParagraph(pIdx)}
              aria-label={`הקראת פסקה ${pIdx + 1}`}
              title="הקראה מכאן"
              className="inline-flex items-center justify-center w-6 h-6 mr-1.5 align-middle rounded-full text-muted hover:text-primary hover:bg-primary/10 transition-colors"
            >
              {activeParagraph === pIdx && playback === "loading" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Play size={11} />
              )}
            </button>
            {tokenizeWords(paragraph, vocabByWord, (word, entry) => setPopover({ word, entry }))}
          </p>
        ))}
      </div>

      {popover && (
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <EnglishText as="span" className="font-bold text-lg">
                {popover.word}
              </EnglishText>
              {popover.entry.ipa && (
                <EnglishText as="span" className="text-sm text-muted">
                  {popover.entry.ipa}
                </EnglishText>
              )}
              <button
                onClick={() => speak(popover.word)}
                aria-label={`השמעת הגייה של ${popover.word}`}
                className="text-primary text-sm"
              >
                <Volume2 size={14} />
              </button>
            </div>
            <p className="mt-1">{popover.entry.translation_he}</p>
          </div>
          <button onClick={() => setPopover(null)} aria-label="סגירה" className="text-muted hover:text-foreground">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

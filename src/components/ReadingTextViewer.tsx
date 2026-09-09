"use client";

import { useState } from "react";
import { Volume2, Play, Pause, Loader2, X } from "lucide-react";
import { speak } from "@/lib/speech/browserTts";
import { useNeuralSpeech, NEURAL_SPEECH_RATES } from "@/lib/speech/useNeuralSpeech";
import EnglishText from "@/components/EnglishText";
import type { VocabularyLookupEntry } from "@/lib/content/vocabulary";

interface ReadingTextViewerProps {
  bodyEn: string;
  vocabByWord: Record<string, VocabularyLookupEntry>;
}

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
  const { state: playback, activeIndex: activeParagraph, rate, play, togglePlayPause, setRate: handleRateChange } =
    useNeuralSpeech(paragraphs);

  return (
    <div>
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
          {NEURAL_SPEECH_RATES.map((r) => (
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
              onClick={() => play(pIdx)}
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
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start justify-between gap-4">
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
          <button
            onClick={() => setPopover(null)}
            aria-label="סגירה"
            className="p-1.5 -m-1.5 rounded-lg shrink-0 text-muted hover:text-foreground hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { speak } from "@/lib/speech/browserTts";
import EnglishText from "@/components/EnglishText";
import type { VocabularyLookupEntry } from "@/lib/content/vocabulary";

interface ReadingTextViewerProps {
  bodyEn: string;
  vocabByWord: Record<string, VocabularyLookupEntry>;
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, "");
}

export default function ReadingTextViewer({ bodyEn, vocabByWord }: ReadingTextViewerProps) {
  const [popover, setPopover] = useState<{ word: string; entry: VocabularyLookupEntry } | null>(null);

  // Split on whitespace while keeping the whitespace tokens themselves, so
  // spacing is preserved exactly when re-joined for display.
  const tokens = bodyEn.split(/(\s+)/);

  return (
    <div>
      <div dir="ltr" className="font-content text-lg leading-loose text-left">
        {tokens.map((token, i) => {
          if (/^\s*$/.test(token)) return <span key={i}>{token}</span>;
          const clean = normalizeWord(token);
          const entry = vocabByWord[clean];
          if (!entry) return <span key={i}>{token}</span>;
          return (
            <button
              key={i}
              onClick={() => {
                setPopover({ word: clean, entry });
                speak(clean);
              }}
              className="underline decoration-dotted decoration-primary/50 hover:bg-primary/10 rounded px-0.5 transition-colors"
            >
              {token}
            </button>
          );
        })}
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
              <button onClick={() => speak(popover.word)} className="text-primary text-sm">
                🔊
              </button>
            </div>
            <p className="mt-1">{popover.entry.translation_he}</p>
          </div>
          <button onClick={() => setPopover(null)} className="text-muted hover:text-foreground">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

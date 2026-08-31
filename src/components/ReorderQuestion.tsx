"use client";

import { useMemo, useState } from "react";
import EnglishText from "@/components/EnglishText";
import type { ReorderContent, ReorderResponse } from "@/types/exercises";

interface ReorderQuestionProps {
  content: Record<string, unknown>;
  disabled: boolean;
  onSubmit: (response: ReorderResponse) => void;
}

function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ReorderQuestion({ content, disabled, onSubmit }: ReorderQuestionProps) {
  const c = content as unknown as ReorderContent;
  const shuffledIndices = useMemo(() => shuffleIndices(c.tokens.length), [c]);
  const [picked, setPicked] = useState<number[]>([]);

  function pick(tokenIndex: number) {
    if (disabled || picked.includes(tokenIndex)) return;
    setPicked((prev) => [...prev, tokenIndex]);
  }

  function unpick(position: number) {
    if (disabled) return;
    setPicked((prev) => prev.filter((_, i) => i !== position));
  }

  return (
    <div>
      <p className="font-medium text-lg mb-4">סדרו את המשפט בסדר הנכון — בנק המילים למטה</p>

      <div
        dir="ltr"
        className="min-h-14 flex flex-wrap gap-2 p-3 rounded-xl border border-card-border bg-background-2"
      >
        {picked.length === 0 && <span className="text-sm text-muted self-center">לחצו על מילים מהבנק למטה</span>}
        {picked.map((tokenIndex, i) => (
          <button
            key={i}
            disabled={disabled}
            onClick={() => unpick(i)}
            aria-label={`הסירו את המילה ${c.tokens[tokenIndex]} מהמשפט`}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-ink text-sm hover:bg-primary-hover transition-colors disabled:hover:bg-primary"
          >
            <EnglishText>{c.tokens[tokenIndex]}</EnglishText>
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted">בנק מילים:</p>
      <div dir="ltr" className="mt-1 flex flex-wrap gap-2">
        {shuffledIndices
          .filter((i) => !picked.includes(i))
          .map((tokenIndex) => (
            <button
              key={tokenIndex}
              disabled={disabled}
              onClick={() => pick(tokenIndex)}
              aria-label={`הוסיפו את המילה ${c.tokens[tokenIndex]} למשפט`}
              className="px-3 py-1.5 rounded-lg border border-card-border hover:border-primary/40 text-sm transition-colors"
            >
              <EnglishText>{c.tokens[tokenIndex]}</EnglishText>
            </button>
          ))}
      </div>

      {!disabled && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setPicked([])}
            disabled={picked.length === 0}
            className="px-4 py-2.5 rounded-xl border border-card-border font-medium disabled:opacity-40 hover:bg-background-2 transition-colors"
          >
            איפוס
          </button>
          <button
            onClick={() => picked.length === c.tokens.length && onSubmit({ order: picked })}
            disabled={picked.length !== c.tokens.length}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
          >
            בדיקה
          </button>
        </div>
      )}
    </div>
  );
}

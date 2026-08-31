"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import type { MatchContent, MatchResponse } from "@/types/exercises";

interface MatchQuestionProps {
  content: Record<string, unknown>;
  disabled: boolean;
  onSubmit: (response: MatchResponse) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchQuestion({ content, disabled, onSubmit }: MatchQuestionProps) {
  const c = content as unknown as MatchContent;
  const rightShuffled = useMemo(() => shuffle(c.pairs.map((p) => p.right)), [c]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<{ left: string; right: string }[]>([]);

  function pickRight(right: string) {
    if (!selectedLeft || disabled) return;
    setMatched((prev) => [...prev, { left: selectedLeft, right }]);
    setSelectedLeft(null);
  }

  const matchedLeftSet = new Set(matched.map((m) => m.left));
  const matchedRightSet = new Set(matched.map((m) => m.right));
  const allMatched = matched.length === c.pairs.length;

  return (
    <div>
      <p className="font-medium text-lg mb-4">התאימו בין המילה לתרגום</p>
      <p role="status" className="sr-only">
        {selectedLeft
          ? `נבחר: ${selectedLeft} — עכשיו בחרו את התרגום שלה`
          : allMatched
            ? "כל הזוגות הותאמו"
            : "בחרו מילה כדי להתחיל להתאים"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {c.pairs.map((p) => (
            <button
              key={p.left}
              disabled={disabled || matchedLeftSet.has(p.left)}
              onClick={() => setSelectedLeft(p.left)}
              aria-pressed={selectedLeft === p.left}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                matchedLeftSet.has(p.left)
                  ? "border-card-border bg-background-2 opacity-60"
                  : selectedLeft === p.left
                    ? "border-primary bg-primary/5"
                    : "border-card-border hover:border-primary/40"
              }`}
            >
              <EnglishText>{p.left}</EnglishText>
              {matchedLeftSet.has(p.left) && <Check size={14} className="text-muted shrink-0" />}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightShuffled.map((right) => (
            <button
              key={right}
              disabled={disabled || matchedRightSet.has(right) || !selectedLeft}
              onClick={() => pickRight(right)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                matchedRightSet.has(right)
                  ? "border-card-border bg-background-2 opacity-60"
                  : "border-card-border hover:border-primary/40 disabled:opacity-40"
              }`}
            >
              {right}
              {matchedRightSet.has(right) && <Check size={14} className="text-muted shrink-0" />}
            </button>
          ))}
        </div>
      </div>
      {!disabled && (
        <button
          onClick={() => allMatched && onSubmit({ pairs: matched })}
          disabled={!allMatched}
          className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          בדיקה
        </button>
      )}
    </div>
  );
}

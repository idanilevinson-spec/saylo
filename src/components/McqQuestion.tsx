"use client";

import { useState } from "react";
import EnglishText from "@/components/EnglishText";
import type { McqContent, McqResponse } from "@/types/exercises";

interface McqQuestionProps {
  content: Record<string, unknown>;
  disabled: boolean;
  onSubmit: (response: McqResponse) => void;
}

export default function McqQuestion({ content, disabled, onSubmit }: McqQuestionProps) {
  const c = content as unknown as McqContent;
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div>
      <p className="font-medium text-lg">{c.prompt}</p>
      <div className="mt-4 space-y-2">
        {c.options.map((option, i) => (
          <button
            key={i}
            disabled={disabled}
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
            className={`w-full text-right px-4 py-3 rounded-xl border transition-colors ${
              selected === i ? "border-primary bg-primary/5" : "border-card-border hover:border-primary/40"
            } disabled:opacity-70`}
          >
            <EnglishText>{option}</EnglishText>
          </button>
        ))}
      </div>
      {!disabled && (
        <button
          onClick={() => selected !== null && onSubmit({ selectedIndex: selected })}
          disabled={selected === null}
          className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
        >
          בדיקה
        </button>
      )}
    </div>
  );
}

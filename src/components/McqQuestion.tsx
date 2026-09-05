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
        {c.options.map((option, i) => {
          const isCorrectOption = i === c.correctIndex;
          const isSelected = selected === i;
          let stateClass = "border-card-border hover:border-primary/40";
          if (disabled && isCorrectOption) stateClass = "border-success bg-success/10";
          else if (disabled && isSelected && !isCorrectOption) stateClass = "border-danger bg-danger/10";
          else if (isSelected) stateClass = "border-primary bg-primary/5";
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
              className={`w-full text-right px-4 py-3 rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-default ${stateClass}`}
            >
              <EnglishText>{option}</EnglishText>
            </button>
          );
        })}
      </div>
      {!disabled && (
        <button
          onClick={() => selected !== null && onSubmit({ selectedIndex: selected })}
          disabled={selected === null}
          className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          בדיקה
        </button>
      )}
    </div>
  );
}

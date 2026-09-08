"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { shuffle } from "@/lib/utils/shuffle";
import type { McqContent, McqResponse } from "@/types/exercises";

interface McqQuestionProps {
  content: Record<string, unknown>;
  disabled: boolean;
  onSubmit: (response: McqResponse) => void;
}

export default function McqQuestion({ content, disabled, onSubmit }: McqQuestionProps) {
  const c = content as unknown as McqContent;
  const [selectedDisplayIndex, setSelectedDisplayIndex] = useState<number | null>(null);
  // Shuffled once per question — every consumer remounts this component
  // (via a `key` tied to the question) when moving to a new question, so
  // this runs fresh each time — meaning the correct answer isn't always
  // shown in the same on-screen position across repeated attempts.
  const [displayOrder] = useState(() => shuffle(c.options.map((_, i) => i)));

  return (
    <div>
      <p className="font-medium text-lg">{c.prompt}</p>
      <div className="mt-4 space-y-2">
        {displayOrder.map((originalIndex, displayIndex) => {
          const option = c.options[originalIndex];
          const isCorrectOption = originalIndex === c.correctIndex;
          const isSelected = selectedDisplayIndex === displayIndex;
          let stateClass = "border-card-border hover:border-primary/40";
          if (disabled && isCorrectOption) stateClass = "border-success bg-success/10";
          else if (disabled && isSelected && !isCorrectOption) stateClass = "border-danger bg-danger/10";
          else if (isSelected) stateClass = "border-primary bg-primary/5";
          return (
            <button
              key={originalIndex}
              disabled={disabled}
              onClick={() => setSelectedDisplayIndex(displayIndex)}
              aria-pressed={isSelected}
              className={`w-full flex items-center justify-between gap-2 text-right px-4 py-3 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-default ${stateClass}`}
            >
              <EnglishText>{option}</EnglishText>
              {disabled && isCorrectOption && <CheckCircle2 size={18} className="text-success shrink-0" />}
              {disabled && isSelected && !isCorrectOption && <XCircle size={18} className="text-danger shrink-0" />}
            </button>
          );
        })}
      </div>
      {!disabled && (
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() =>
              selectedDisplayIndex !== null && onSubmit({ selectedIndex: displayOrder[selectedDisplayIndex] })
            }
            disabled={selectedDisplayIndex === null}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            בדיקה
          </button>
          <button
            onClick={() => onSubmit({ selectedIndex: -1 })}
            className="px-4 py-2.5 rounded-lg border border-card-border text-muted font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            לא יודע/ת · דלגו
          </button>
        </div>
      )}
    </div>
  );
}

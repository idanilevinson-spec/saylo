"use client";

import { useEffect, useState } from "react";
import { shuffle } from "@/lib/utils/shuffle";
import { ChoiceGrid, PromptText } from "@/components/games/GameKit";
import type { McqContent, McqResponse } from "@/types/exercises";

interface McqQuestionProps {
  content: Record<string, unknown>;
  disabled: boolean;
  onSubmit: (response: McqResponse) => void;
}

// Practice and reading-test MCQs: pick an answer (tap, or keys 1–4), then
// check it (button or Enter). Same answer buttons as the games, so the
// whole app answers questions one way.
export default function McqQuestion({ content, disabled, onSubmit }: McqQuestionProps) {
  const c = content as unknown as McqContent;
  const [selectedDisplayIndex, setSelectedDisplayIndex] = useState<number | null>(null);
  // Shuffled once per question — every consumer remounts this component
  // (via a `key` tied to the question) when moving to a new question, so
  // the correct answer isn't always in the same on-screen position.
  const [displayOrder] = useState(() => shuffle(c.options.map((_, i) => i)));
  const options = displayOrder.map((i) => c.options[i]);
  const correctDisplayIndex = displayOrder.indexOf(c.correctIndex);
  // Options are English unless they're written in Hebrew (a few prompts ask
  // the reverse direction).
  const englishOptions = !options.some((o) => /[֐-׿]/.test(o));

  function check() {
    if (selectedDisplayIndex === null || disabled) return;
    onSubmit({ selectedIndex: displayOrder[selectedDisplayIndex] });
  }

  useEffect(() => {
    if (disabled || selectedDisplayIndex === null) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      // Enter checks — also when focus is on the answer just tapped (it
      // stays on that button); any other focused button keeps Enter as its
      // own click.
      const onAnswer = !!target?.closest('[aria-label="תשובות"]');
      if (e.key === "Enter" && (target?.tagName !== "BUTTON" || onAnswer)) {
        e.preventDefault();
        check();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // check() only reads state that is in the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, selectedDisplayIndex]);

  return (
    <div>
      <PromptText text={c.prompt} className="text-xl sm:text-2xl font-bold leading-snug" />
      <div className="mt-5">
        <ChoiceGrid
          options={options}
          correctIndex={correctDisplayIndex}
          selected={selectedDisplayIndex}
          locked={disabled}
          onChoose={setSelectedDisplayIndex}
          english={englishOptions}
        />
      </div>
      {!disabled && (
        <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => onSubmit({ selectedIndex: -1 })}
            className="game-press min-h-12 px-4 rounded-lg border border-card-border text-muted font-medium hover:bg-background-2 hover:text-foreground transition-[background-color,color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            לא יודעים? דלגו
          </button>
          <button
            type="button"
            onClick={check}
            disabled={selectedDisplayIndex === null}
            className="game-press flex-1 min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-[background-color,opacity,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            בדיקה
          </button>
        </div>
      )}
    </div>
  );
}

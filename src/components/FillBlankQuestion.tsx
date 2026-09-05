"use client";

import { useState } from "react";
import { Lightbulb, Keyboard, RotateCcw } from "lucide-react";
import type { FillBlankContent, FillBlankResponse } from "@/types/exercises";

interface FillBlankQuestionProps {
  content: Record<string, unknown>;
  disabled: boolean;
  onSubmit: (response: FillBlankResponse) => void;
}

function shuffledIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function FillBlankQuestion({ content, disabled, onSubmit }: FillBlankQuestionProps) {
  const c = content as unknown as FillBlankContent;
  const [before, after] = c.sentence.split("___");
  const words = c.correctAnswer.trim().split(/\s+/);

  // A word bank turns "spell the right grammar out of nowhere" into "put
  // these pieces in the right order" — the actual skill being tested for
  // things like inversions, without the added burden of correct spelling.
  // A single-word answer gets nothing out of a one-tile "bank", so it just
  // keeps the plain input.
  const useWordBank = words.length > 1;
  const [bankOrder] = useState(() => shuffledIndices(words.length));
  const [picked, setPicked] = useState<number[]>([]);
  const [typedMode, setTypedMode] = useState(!useWordBank);
  const [text, setText] = useState("");

  function toggleWord(i: number) {
    if (disabled) return;
    setPicked((prev) => (prev.includes(i) ? prev.filter((p) => p !== i) : [...prev, i]));
  }

  const builtAnswer = picked.map((i) => words[i]).join(" ");
  const canSubmitBank = picked.length === words.length;

  return (
    <div>
      <p className="font-medium text-lg mb-3">השלימו את החלק החסר במשפט</p>
      <p dir="ltr" className="font-content text-lg leading-relaxed text-left">
        {before}
        {typedMode ? (
          <input
            type="text"
            dir="ltr"
            aria-label={`השלימו את החלק החסר במשפט: ${c.sentence}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            className="mx-1 w-32 px-2 py-1 border-b-2 border-primary bg-transparent text-center font-content focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70"
          />
        ) : (
          <span
            dir="ltr"
            className="mx-1 inline-block min-w-32 px-2 py-1 border-b-2 border-primary text-center font-content"
          >
            {builtAnswer || " "}
          </span>
        )}
        {after}
      </p>
      {c.hint && (
        <p className="mt-2 text-sm text-muted flex items-center gap-1.5">
          <Lightbulb size={14} /> {c.hint}
        </p>
      )}

      {!typedMode && (
        <div className="mt-4">
          <p className="text-xs text-muted mb-2">הקישו על המילים לפי הסדר הנכון</p>
          <div dir="ltr" className="flex flex-wrap gap-2">
            {bankOrder.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleWord(i)}
                disabled={disabled}
                aria-pressed={picked.includes(i)}
                className={`px-3.5 py-2 rounded-lg border font-content text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-default ${
                  picked.includes(i)
                    ? "border-card-border bg-background-2 text-muted opacity-50"
                    : "border-primary/40 bg-primary/5 hover:bg-primary/10"
                }`}
              >
                {words[i]}
              </button>
            ))}
          </div>
          {!disabled && picked.length > 0 && (
            <button
              type="button"
              onClick={() => setPicked([])}
              className="mt-3 flex items-center gap-1 text-xs text-muted hover:text-foreground"
            >
              <RotateCcw size={12} /> איפוס
            </button>
          )}
        </div>
      )}

      {!disabled && useWordBank && (
        <button
          type="button"
          onClick={() => {
            setTypedMode((v) => !v);
            setPicked([]);
            setText("");
          }}
          className="mt-4 flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Keyboard size={13} /> {typedMode ? "עברו לבחירה מבנק מילים" : "מעדיפים להקליד בעצמכם?"}
        </button>
      )}

      {!disabled && (
        <button
          onClick={() => {
            if (typedMode) {
              if (text.trim()) onSubmit({ text });
            } else if (canSubmitBank) {
              onSubmit({ text: builtAnswer });
            }
          }}
          disabled={typedMode ? !text.trim() : !canSubmitBank}
          className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          בדיקה
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import type { FillBlankContent, FillBlankResponse } from "@/types/exercises";

interface FillBlankQuestionProps {
  content: Record<string, unknown>;
  disabled: boolean;
  onSubmit: (response: FillBlankResponse) => void;
}

export default function FillBlankQuestion({ content, disabled, onSubmit }: FillBlankQuestionProps) {
  const c = content as unknown as FillBlankContent;
  const [text, setText] = useState("");
  const [before, after] = c.sentence.split("___");

  return (
    <div>
      <p dir="ltr" className="font-content text-lg leading-relaxed text-left">
        {before}
        <input
          type="text"
          dir="ltr"
          aria-label={`השלימו את החלק החסר במשפט: ${c.sentence}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          className="mx-1 w-32 px-2 py-1 border-b-2 border-primary bg-transparent text-center font-content focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70"
        />
        {after}
      </p>
      {c.hint && (
        <p className="mt-2 text-sm text-muted flex items-center gap-1.5">
          <Lightbulb size={14} /> {c.hint}
        </p>
      )}
      {!disabled && (
        <button
          onClick={() => text.trim() && onSubmit({ text })}
          disabled={!text.trim()}
          className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          בדיקה
        </button>
      )}
    </div>
  );
}

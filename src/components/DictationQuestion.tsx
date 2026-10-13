"use client";

import { ENGLISH_WORD_INPUT } from "@/lib/utils/inputProps";
import { useState } from "react";
import SentenceAudioButtons from "@/components/SentenceAudioButtons";
import type { DictationContent, DictationResponse } from "@/types/exercises";

interface DictationQuestionProps {
  content: Record<string, unknown>;
  disabled: boolean;
  onSubmit: (response: DictationResponse) => void;
}

export default function DictationQuestion({ content, disabled, onSubmit }: DictationQuestionProps) {
  const c = content as unknown as DictationContent;
  const [text, setText] = useState("");

  return (
    <div>
      <p className="font-medium text-lg mb-4">הקשיבו וכתבו את מה ששמעתם</p>
      <SentenceAudioButtons key={c.audioText} text={c.audioText} />
      <input
        type="text"
        {...ENGLISH_WORD_INPUT}
        aria-label="מה ששמעתם"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder="הקלידו כאן..."
        className="mt-4 w-full px-4 py-2.5 rounded-lg border border-card-border bg-card font-content focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70"
      />
      {!disabled && (
        <button
          onClick={() => text.trim() && onSubmit({ text })}
          disabled={!text.trim()}
          className="mt-6 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-[color,background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:scale-[0.98]"
        >
          בדיקה
        </button>
      )}
    </div>
  );
}

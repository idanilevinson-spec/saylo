"use client";

import { useState } from "react";
import { Volume2, Turtle } from "lucide-react";
import { speak } from "@/lib/speech/browserTts";
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
      <div className="flex gap-2">
        <button
          onClick={() => speak(c.audioText, 1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-card-border hover:border-primary/40 transition-colors"
        >
          <Volume2 size={16} /> השמעה
        </button>
        <button
          onClick={() => speak(c.audioText, 0.6)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-card-border hover:border-primary/40 transition-colors"
        >
          <Turtle size={16} /> לאט
        </button>
      </div>
      <input
        type="text"
        dir="ltr"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder="הקלידו כאן..."
        className="mt-4 w-full px-4 py-2.5 rounded-xl border border-card-border bg-card font-content focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70"
      />
      {!disabled && (
        <button
          onClick={() => text.trim() && onSubmit({ text })}
          disabled={!text.trim()}
          className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
        >
          בדיקה
        </button>
      )}
    </div>
  );
}

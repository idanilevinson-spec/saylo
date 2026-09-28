"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, PartyPopper } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { playCorrectSound, playIncorrectSound, playCompleteSound } from "@/lib/sound/effects";
import type { PatternDefinition } from "@/lib/patterns/patternDefinitions";
import type { PatternDrill } from "@/lib/patterns/drills";

interface PatternDrillRunnerProps {
  definition: PatternDefinition;
  drill: PatternDrill;
}

// A standalone, ungraded drill: it deliberately does NOT go through
// ExercisePlayer/recordAttempt — those write to exercise_attempts and award
// XP against real curriculum content (exercises table rows with a skill_area
// and cefr_level), and this content isn't that. It's a few minutes of
// self-contained repetition on one pattern, scored only in memory.
export default function PatternDrillRunner({ definition, drill }: PatternDrillRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const item = drill.items[index];
  const isLast = index === drill.items.length - 1;
  const done = index >= drill.items.length;

  function choose(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    const isCorrect = optionIndex === item.correctOptionIndex;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  }

  function next() {
    if (isLast) playCompleteSound();
    setIndex((i) => i + 1);
    setSelected(null);
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <IconCircle />
        <h1 className="mt-4 text-2xl font-bold">כל הכבוד!</h1>
        <p className="mt-2 text-muted">
          {correctCount} מתוך {drill.items.length} תשובות נכונות בתרגול על &quot;{definition.labelHe}&quot;.
        </p>
        <Link
          href="/patterns"
          className="mt-6 inline-block px-5 py-2.5 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          חזרה לדפוסים שלי
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <p className="text-sm text-muted">
        תרגול: {definition.labelHe} · {index + 1} מתוך {drill.items.length}
      </p>

      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4 rounded-lg border border-card-border p-6"
      >
        <EnglishText as="p" className="text-lg font-medium">
          {item.promptWithBlank}
        </EnglishText>

        <div className="mt-5 flex flex-col gap-2">
          {item.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrectOption = i === item.correctOptionIndex;
            const showState = selected !== null && (isSelected || isCorrectOption);

            return (
              <button
                key={option}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-start transition-colors ${
                  showState && isCorrectOption
                    ? "border-success bg-success-ink text-success"
                    : showState && isSelected
                      ? "border-danger bg-danger-ink text-danger"
                      : "border-card-border hover:bg-background-2"
                } ${selected !== null ? "cursor-default" : ""}`}
              >
                <EnglishText as="span">{option}</EnglishText>
                {showState && isCorrectOption && <CheckCircle2 size={18} />}
                {showState && isSelected && !isCorrectOption && <XCircle size={18} />}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button
            onClick={next}
            className="mt-5 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
          >
            {isLast ? "סיום" : "הבא"}
          </button>
        )}
      </motion.div>
    </div>
  );
}

function IconCircle() {
  return (
    <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-primary/10 text-primary">
      <PartyPopper size={28} />
    </div>
  );
}

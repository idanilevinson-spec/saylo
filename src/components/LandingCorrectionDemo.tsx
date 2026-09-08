"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import EnglishText from "@/components/EnglishText";

// The one signature moment of the hero: not a screenshot of the product,
// but the product's actual mechanism playing out live. Reuses the same
// clip-path wipe the headline reveals with, so the "typing" read is
// consistent with the rest of the world rather than a new gimmick.
//
// Each piece that needs to appear/disappear is keyed on `index` and
// rendered with an entrance-only animation (no AnimatePresence exit) —
// AnimatePresence's exit here reliably got stuck mid-transition, leaving
// stale text on screen; a fresh key-forced remount per example is the
// same trick the English line already uses, and it never desyncs.
interface CorrectionExample {
  level: string;
  prefix: string;
  wrong: string;
  correct: string;
  suffix: string;
  he: string;
}

const EXAMPLES: CorrectionExample[] = [
  {
    level: "B1",
    prefix: "I ",
    wrong: "have went",
    correct: "have gone",
    suffix: " to the store yesterday.",
    he: '"went" לא מתחבר ל-have. הצורה הנכונה: gone.',
  },
  {
    level: "A2",
    prefix: "She ",
    wrong: "don't",
    correct: "doesn't",
    suffix: " like coffee in the morning.",
    he: "אחרי he, she, it משתמשים ב-doesn't, לא don't.",
  },
  {
    level: "B1",
    prefix: "I ",
    wrong: "am agree",
    correct: "agree",
    suffix: " with your plan.",
    he: '"agree" הוא כבר פועל. אין צורך ב-am לפניו.',
  },
  {
    level: "A2",
    prefix: "He is ",
    wrong: "more taller",
    correct: "taller",
    suffix: " than his brother.",
    he: "כש-taller כבר משווה, לא מוסיפים לפניו more.",
  },
];

type Phase = "typing" | "holding" | "striking" | "correcting" | "translating" | "reading" | "leaving";

const DURATIONS: Record<Phase, number> = {
  typing: 950,
  holding: 550,
  striking: 450,
  correcting: 500,
  translating: 400,
  reading: 2400,
  leaving: 350,
};

const PHASE_ORDER: Phase[] = ["typing", "holding", "striking", "correcting", "translating", "reading", "leaving"];

export default function LandingCorrectionDemo() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const currentPhaseIndex = PHASE_ORDER.indexOf(phase);
    timeoutRef.current = setTimeout(() => {
      const nextPhaseIndex = currentPhaseIndex + 1;
      if (nextPhaseIndex < PHASE_ORDER.length) {
        setPhase(PHASE_ORDER[nextPhaseIndex]);
      } else {
        setIndex((i) => (i + 1) % EXAMPLES.length);
        setPhase("typing");
      }
    }, DURATIONS[phase]);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, reduceMotion]);

  const example = EXAMPLES[index];
  // Reduced motion: show one example fully resolved, no cycling.
  const shownPhase: Phase = reduceMotion ? "reading" : phase;
  const showCorrection = shownPhase === "correcting" || shownPhase === "translating" || shownPhase === "reading";
  const showStrike = shownPhase !== "typing" && shownPhase !== "holding";
  const showHebrew = shownPhase === "translating" || shownPhase === "reading";

  return (
    <div
      className="relative mt-6 lg:mt-0 bg-background rounded-lg shadow-2xl px-5 py-5 sm:px-7 sm:py-6"
      aria-live="off"
    >
      {/* Color-coded edge matching the accent/Hebrew "channel," pairing
          with the headline plate's primary edge. */}
      <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1.5 rounded-s-lg bg-accent" />

      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-xs font-bold text-accent-hover">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-accent" />
          מורה AI מתקן עכשיו
        </span>
        <motion.span
          key={`level-${index}`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xs font-bold tracking-wide text-muted"
        >
          {example.level}
        </motion.span>
      </div>

      <div className="caption-stack min-h-[4.5rem] sm:min-h-[3.5rem]">
        <motion.div
          key={`en-${index}`}
          initial={reduceMotion ? false : { clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="caption-track-en"
        >
          <EnglishText as="p" className="text-lg leading-relaxed text-foreground">
            {example.prefix}
            <span className="relative inline-block">
              <span className={showStrike ? "text-muted" : undefined}>{example.wrong}</span>
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ scaleX: showStrike ? 1 : 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-x-0 top-1/2 h-[2px] bg-danger origin-left"
              />
            </span>
            {showCorrection && (
              <motion.span
                key={`correct-${index}`}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-primary font-semibold"
              >
                {" "}
                {example.correct}
              </motion.span>
            )}
            {example.suffix}
          </EnglishText>
        </motion.div>
        {showHebrew && (
          <motion.p
            key={`he-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="caption-track-he text-sm leading-relaxed text-accent-hover"
          >
            {example.he}
          </motion.p>
        )}
      </div>
    </div>
  );
}

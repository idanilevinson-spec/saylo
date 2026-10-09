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
  // What lands in the mistakes notebook — the short name of the rule.
  rule: string;
}

const EXAMPLES: CorrectionExample[] = [
  {
    level: "B1",
    prefix: "She has ",
    wrong: "went",
    correct: "gone",
    suffix: " to bed already.",
    he: 'אחרי has באה הצורה השלישית: gone, לא went.',
    rule: "has + gone",
  },
  {
    level: "A2",
    prefix: "She ",
    wrong: "don't",
    correct: "doesn't",
    suffix: " like coffee in the morning.",
    he: "אחרי he, she, it משתמשים ב-doesn't, לא don't.",
    rule: "she doesn't",
  },
  {
    level: "B1",
    prefix: "I ",
    wrong: "am agree",
    correct: "agree",
    suffix: " with your plan.",
    he: '"agree" הוא כבר פועל. אין צורך ב-am לפניו.',
    rule: "agree בלי am",
  },
  {
    level: "A2",
    prefix: "He is ",
    wrong: "more taller",
    correct: "taller",
    suffix: " than his brother.",
    he: "כש-taller כבר משווה, לא מוסיפים לפניו more.",
    rule: "taller בלי more",
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
  // The two lines before this one, already corrected, fading upward — the
  // demo reads as a conversation in progress, not a single flashcard.
  const history = reduceMotion ? [] : [2, 1].map((back) => EXAMPLES[(index - back + EXAMPLES.length) % EXAMPLES.length]);
  // What the teacher has noted so far in this loop.
  const noted = EXAMPLES.slice(0, showHebrew ? index + 1 : index);

  return (
    <div
      className="relative mt-6 lg:mt-0 bg-card rounded-lg shadow-2xl px-5 py-5 sm:px-7 sm:py-6"
      aria-live="off"
    >
      {/* The plate's edge, matching the headline card's — one uniform
          blue throughout, no second "channel" color. */}
      <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1.5 rounded-s-lg bg-primary" />

      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-xs font-bold text-primary-hover">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-primary" />
          הדגמה: כך המורה מתקן
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

      <ul aria-hidden="true" className="mb-3 space-y-1.5">
        {history.map((h, i) => (
          <li key={`${index}-${i}`} className={i === 0 ? "opacity-30" : "opacity-55"}>
            <EnglishText as="p" className="text-sm leading-relaxed text-foreground">
              {h.prefix}
              <span className="text-muted line-through decoration-danger/70">{h.wrong}</span> <span className="font-semibold text-primary">{h.correct}</span>
              {h.suffix}
            </EnglishText>
          </li>
        ))}
      </ul>

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
            className="caption-track-he text-sm leading-relaxed text-primary-hover"
          >
            {example.he}
          </motion.p>
        )}
            </div>

      <div className="mt-4 border-t border-card-border pt-3">
        <p className="text-xs font-bold text-muted">נשמר במחברת הטעויות</p>
        <ul className="mt-2 flex min-h-7 flex-wrap gap-1.5">
          {noted.map((e) => (
            <motion.li
              key={e.rule}
              initial={reduceMotion ? false : { opacity: 0, transform: "scale(0.9)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              dir="auto"
              className="rounded-md bg-primary/12 px-2 py-1 text-xs font-bold text-primary"
            >
              {e.rule}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

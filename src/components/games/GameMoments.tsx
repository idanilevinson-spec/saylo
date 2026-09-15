"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, type LucideIcon } from "lucide-react";

// Three "juicy" moments shared identically (down to the exact animation
// numbers) across every vocabulary game and VocabTest — extracted after
// the same markup was hand-copied into 10 files during the games' design
// pass. Any future tweak to how these look now happens once, here.

// The live score/streak badge shown during play, with a spring "pop" that
// replays on every value change via the `key={value}` remount trick.
export function GameScorePill({ value, icon: Icon }: { value: number; icon: LucideIcon }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.3 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", bounce: 0.6, duration: 0.4 }}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent-hover font-bold text-base"
    >
      <Icon size={16} className="fill-current" /> {value}
    </motion.span>
  );
}

// The correct/wrong feedback line shown right after answering. `centered`
// matches the surrounding card's own text alignment — the original 10
// copies split between centered and RTL start-aligned depending on
// whether the card around them was itself text-center. `role="status"`
// is applied unconditionally: a few of the original copies had it and a
// few didn't, which was an inconsistency, not an intentional choice.
export function GameFeedback({
  correct,
  centered,
  children,
}: {
  correct: boolean;
  centered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.p
      role="status"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}
      className={`mt-4 flex items-center gap-1.5 text-lg font-bold ${centered ? "justify-center " : ""}${
        correct ? "text-success" : "text-danger"
      }`}
    >
      {correct ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      {children}
    </motion.p>
  );
}

// The big bounced number on a game's finished screen.
export function GameCompletionScore({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.5, delay: 0.15 }}
      className="mt-4 text-5xl font-black text-accent-hover"
    >
      {children}
    </motion.p>
  );
}

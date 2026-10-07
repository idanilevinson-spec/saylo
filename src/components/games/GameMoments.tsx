"use client";

import { motion } from "framer-motion";

// The finished-screen score shared by every game's results. The rest of the
// shared game UI (top bar, answers, word card, clock) lives in GameKit.tsx.

// The big bounced number on a game's finished screen.
export function GameCompletionScore({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.5, delay: 0.15 }}
      className="mt-3 chyron text-7xl sm:text-8xl text-primary tabular-nums"
    >
      {children}
    </motion.p>
  );
}

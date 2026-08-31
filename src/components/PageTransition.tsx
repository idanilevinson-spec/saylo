"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Deliberately animates only the entering page (no exit crossfade) - an
// AnimatePresence exit animation on every App Router navigation means
// holding the outgoing route in the tree with position:absolute, which
// fights this app's page-level layout assumptions for no real payoff.
// A key on pathname is enough to make navigation itself feel like a
// transition instead of a hard cut.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

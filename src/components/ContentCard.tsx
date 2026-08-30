"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ContentCardProps {
  href?: string;
  index?: number;
  className?: string;
  children: React.ReactNode;
}

// Used for grid/list items across content pages (vocabulary, grammar,
// reading, listening, writing, idioms, learn) — staggered entrance on
// mount plus hover/tap feedback, matching the treatment the marketing
// page and dashboard already have.
export default function ContentCard({ href, index = 0, className = "", children }: ContentCardProps) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      whileHover={href ? { y: -4 } : undefined}
      whileTap={href ? { scale: 0.98 } : undefined}
      className={`h-full bg-card border border-card-border rounded-2xl p-5 ${
        href ? "hover:border-primary/40 hover:shadow-md transition-[box-shadow,border-color]" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  ) : (
    card
  );
}

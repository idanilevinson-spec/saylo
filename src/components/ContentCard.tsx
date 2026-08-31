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
// page and dashboard already have. The gradient top edge (invisible at
// rest, revealed on hover) is this component's one signature touch —
// it's the cheapest way to keep dozens of otherwise-plain cards from
// reading as a generic template grid, without coupling this generic
// wrapper to any particular content type's data.
export default function ContentCard({ href, index = 0, className = "", children }: ContentCardProps) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      whileHover={href ? { y: -5 } : undefined}
      whileTap={href ? { scale: 0.98 } : undefined}
      className={`group relative h-full overflow-hidden bg-card border border-card-border rounded-2xl p-5 ${
        href
          ? "hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-[box-shadow,border-color]"
          : ""
      } ${className}`}
    >
      {href && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] origin-right scale-x-0 bg-gradient-to-l from-primary to-accent transition-transform duration-300 group-hover:scale-x-100"
        />
      )}
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

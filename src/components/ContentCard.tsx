"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ContentCardProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
}

// Used for grid/list items across content pages (vocabulary, grammar,
// reading, listening, writing, idioms, learn) — hover/tap feedback only.
// No entrance on mount: these are navigation screens a learner passes
// through many times a day, so the content is simply there. The gradient top edge (invisible at
// rest, revealed on hover) is this component's one signature touch —
// it's the cheapest way to keep dozens of otherwise-plain cards from
// reading as a generic template grid, without coupling this generic
// wrapper to any particular content type's data.
export default function ContentCard({ href, className = "", children }: ContentCardProps) {
  const card = (
    <motion.div
      whileHover={href ? { y: -5 } : undefined}
      whileTap={href ? { scale: 0.98 } : undefined}
      className={`group relative h-full overflow-hidden bg-card border border-card-border rounded-lg p-5 ${
        href
          ? "hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-[box-shadow,border-color]"
          : ""
      } ${className}`}
    >
      {href && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] origin-right scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
        />
      )}
      {children}
    </motion.div>
  );

  return href ? (
    <Link
      href={href}
      className="block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      {card}
    </Link>
  ) : (
    card
  );
}

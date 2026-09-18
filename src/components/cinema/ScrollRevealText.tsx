"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useMotionReduced } from "@/lib/a11y/useMotionReduced";

interface LetterProps {
  char: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}

function Letter({ char, progress, start, end }: LetterProps) {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

// A paragraph whose characters brighten one by one as it scrolls through
// the viewport. Plain inline spans (never inline-blocks) so mixed Hebrew /
// English runs keep their correct bidi order. The real text sits in an
// sr-only copy — a screen reader shouldn't be spelling it letter by letter
// — and everything is fully lit when motion is reduced.
export default function ScrollRevealText({ text, className = "" }: ScrollRevealTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });
  const reduced = useMotionReduced();
  const chars = Array.from(text);

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((char, i) => {
          if (reduced) return <span key={i}>{char}</span>;
          // Scaled to 0.9 so the very last characters finish fully lit
          // instead of stalling around 70% opacity when progress caps at 1.
          const charProgress = (i / chars.length) * 0.9;
          return <Letter key={i} char={char} progress={scrollYProgress} start={charProgress - 0.1} end={charProgress + 0.05} />;
        })}
      </span>
    </p>
  );
}

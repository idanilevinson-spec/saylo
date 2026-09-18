"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useInView } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export interface PullUpSegment {
  text: string;
  className?: string;
  // Each segment is laid out as its own run, so a Latin phrase inside a
  // Hebrew heading keeps its own left-to-right word order.
  dir?: "ltr" | "rtl";
  lang?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: PullUpSegment[];
  className?: string;
  style?: CSSProperties;
}

// Same pull-up as WordsPullUp, but every segment carries its own styling —
// used for headings that mix a normal weight with an italic serif accent.
export default function WordsPullUpMultiStyle({ segments, className = "", style }: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={`flex flex-wrap justify-center ${className}`} style={style}>
      {segments.map((segment, si) => {
        const wordsBefore = segments.slice(0, si).reduce((n, s) => n + s.text.split(" ").length, 0);
        return (
          <span key={si} dir={segment.dir} lang={segment.lang} className="inline-flex flex-wrap justify-center">
            {segment.text.split(" ").map((word, wi) => (
              <motion.span
                key={`${word}-${wi}`}
                initial={{ y: 20, opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.6, ease: EASE, delay: (wordsBefore + wi) * 0.08 }}
                className={`inline-block me-[0.25em] ${segment.className ?? ""}`}
              >
                {word}
              </motion.span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

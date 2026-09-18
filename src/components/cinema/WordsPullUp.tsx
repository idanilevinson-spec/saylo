"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useInView } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface WordsPullUpProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  // Adds a superscript asterisk after the last character of the last word.
  showAsterisk?: boolean;
}

// Each word slides up into place, staggered, once, when it scrolls into view.
export default function WordsPullUp({ text, className = "", style, showAsterisk = false }: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={`${word}-${i}`}
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
            className={`inline-block ${isLast ? "" : "me-[0.25em]"}`}
          >
            {showAsterisk && isLast ? (
              <>
                {word.slice(0, -1)}
                <span className="relative inline-block">
                  {word.slice(-1)}
                  <span aria-hidden="true" className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">
                    *
                  </span>
                </span>
              </>
            ) : (
              word
            )}
          </motion.span>
        );
      })}
    </span>
  );
}

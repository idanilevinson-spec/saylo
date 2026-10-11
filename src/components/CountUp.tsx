"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { animate, useReducedMotionConfig } from "framer-motion";

// A number that rolls from what it showed a moment ago to its new value, so
// a change reads as a change rather than a swap. Adapted from React Bits'
// CountUp (reactbits.dev, MIT + Commons Clause) with three departures:
// the real value is in the server HTML (search engines and no-JS visitors
// see the number, not an empty span); it animates only on a change, from
// the previous value, never from zero on page load; and it honours the
// site's own "stop animations" switch through MotionConfig, not just the
// operating system's setting.
export default function CountUp({ value, className, duration = 0.45 }: { value: number; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  // React renders the first value once and never touches the text again;
  // from then on the effect owns it, so the two never fight over the node.
  const [initial] = useState(value);
  const reduced = useReducedMotionConfig();

  // Layout effect: start from the old number before the browser paints,
  // so the new one never flashes for a frame first.
  useLayoutEffect(() => {
    const el = ref.current;
    const from = shown.current;
    if (!el || from === value) return;
    if (reduced) {
      shown.current = value;
      el.textContent = String(value);
      return;
    }
    const controls = animate(from, value, {
      duration,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => {
        shown.current = Math.round(v);
        el.textContent = String(shown.current);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {initial}
    </span>
  );
}

"use client";

import { useEffect } from "react";

// Feeds the pointer's position to whichever .lit-hover plate it is over,
// as --mx/--my, so the plate's hand-held light (globals.css) follows it.
// Mouse only: a finger has no hover. One listener for the whole page,
// at most one style write per frame.
export default function PointerLight() {
  useEffect(() => {
    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const plate = (e.target as Element | null)?.closest?.(".lit-hover") as HTMLElement | null;
      if (!plate) return;
      const r = plate.getBoundingClientRect();
      plate.style.setProperty("--mx", `${e.clientX - r.left}px`);
      plate.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}

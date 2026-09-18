"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  // The accessibility widget's "stop animations" toggle sets this attribute
  // on <html> — it isn't visible to matchMedia, so watch it directly.
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-a11y-motion"] });
  return () => {
    mq.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

function getSnapshot() {
  return (
    window.matchMedia(QUERY).matches || document.documentElement.getAttribute("data-a11y-motion") === "reduced"
  );
}

// True when the visitor asked for less motion, either through the OS or the
// on-page accessibility toolbar. For things CSS/MotionConfig can't stop on
// their own: an autoplaying <video>, per-character scroll effects.
export function useMotionReduced(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

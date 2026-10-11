"use client";

import { useSyncExternalStore } from "react";

// Motion is reduced when either the OS asks for it or the learner turned
// on "stop animations" in the site's own accessibility widget (which sets
// data-a11y-motion on <html>). framer-motion already honours both through
// MotionConfig; GSAP and Lenis know nothing about the widget, so anything
// driven by them must ask here instead of reading the media query alone.
const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches || document.documentElement.getAttribute("data-a11y-motion") === "reduced";
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-a11y-motion"] });
  return () => {
    mq.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

// Live: flips the moment the learner toggles the widget, no reload.
// The server snapshot is "reduced" so nothing animates before hydration.
export function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => true);
}

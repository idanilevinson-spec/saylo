"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import AccessibilityWidget, { DEFAULT_A11Y_PREFS, type A11yPrefs } from "@/components/AccessibilityWidget";

export const A11Y_STORAGE_KEY = "saylo-a11y-prefs";

function readStoredPrefs(): A11yPrefs {
  if (typeof window === "undefined") return DEFAULT_A11Y_PREFS;
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (raw) return { ...DEFAULT_A11Y_PREFS, ...JSON.parse(raw) };
  } catch {
    // localStorage unavailable (private mode, etc.) — fall back to defaults.
  }
  return DEFAULT_A11Y_PREFS;
}

function applyPrefsToDocument(prefs: A11yPrefs) {
  const html = document.documentElement;
  const set = (name: string, value: string | null) => {
    if (value === null) html.removeAttribute(name);
    else html.setAttribute(name, value);
  };
  set("data-a11y-font-scale", prefs.fontScale !== 100 ? String(prefs.fontScale) : null);
  set("data-a11y-contrast", prefs.highContrast ? "high" : null);
  set("data-a11y-grayscale", prefs.grayscale ? "true" : null);
  set("data-a11y-underline-links", prefs.underlineLinks ? "true" : null);
  set("data-a11y-reading-spacing", prefs.readingSpacing ? "true" : null);
  set("data-a11y-motion", prefs.stopAnimations ? "reduced" : null);
}

export default function AccessibilityProvider({ children }: { children: ReactNode }) {
  // Lazy initializer, not an effect: this runs once during the client's own
  // first render, so there's nothing to "cascade" — it reads the same
  // localStorage value the before-paint script in layout.tsx already
  // applied to the DOM, before React ever draws the (closed-by-default)
  // widget panel that would otherwise show a stale value for one frame.
  const [prefs, setPrefs] = useState<A11yPrefs>(readStoredPrefs);

  // A genuine effect: syncing React state out to an external system
  // (the DOM attributes CSS reads, and localStorage) — not deriving state.
  useEffect(() => {
    applyPrefsToDocument(prefs);
    try {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore write failures — the preference just won't persist.
    }
  }, [prefs]);

  return (
    <MotionConfig reducedMotion={prefs.stopAnimations ? "always" : "user"}>
      {children}
      <AccessibilityWidget prefs={prefs} setPrefs={setPrefs} />
    </MotionConfig>
  );
}

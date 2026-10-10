"use client";

import { useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";
import { ChevronLeft, Smartphone } from "lucide-react";

import { APP_STORE_URL } from "@/lib/site/links";

export { APP_STORE_URL };

// iPhones, and iPads (which report themselves as a Mac but have touch).
// In development, ?iphone-preview shows it on any device, so the layout can
// be checked without an iPhone.
export function isAppleMobileWeb(): boolean {
  if (Capacitor.isNativePlatform()) return false; // already in the app
  if (process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).has("iphone-preview")) {
    return true;
  }
  const ua = navigator.userAgent;
  if (/iPhone|iPod|iPad/.test(ua)) return true;
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

const subscribe = () => () => {};

// Shown only to visitors on an iPhone/iPad browser — including Instagram's
// in-app browser, where ad clicks land — so they can choose between
// signing up right here and installing the app. Everyone else (Android,
// desktop, the app itself) sees nothing. Server render and first paint
// show nothing too, so there's no hydration mismatch.
//
// A quiet secondary line, not a third full-size button: signing up on the
// site stays the one primary action, and the app is the alternative.
export default function AppStoreButton({ className = "" }: { className?: string }) {
  const show = useSyncExternalStore(subscribe, isAppleMobileWeb, () => false);
  if (!show) return null;

  return (
    <p className={`flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted ${className}`}>
      <Smartphone size={16} aria-hidden="true" className="shrink-0" />
      <span>יש לכם iPhone?</span>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 font-bold text-primary-hover underline-offset-4 hover:underline focus-visible:underline"
      >
        הורידו את האפליקציה
        <ChevronLeft size={16} aria-hidden="true" />
      </a>
    </p>
  );
}

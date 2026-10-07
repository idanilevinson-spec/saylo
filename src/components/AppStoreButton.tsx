"use client";

import { useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";
import { Smartphone } from "lucide-react";

// Saylo's page on the Israeli App Store — the app is only listed there.
export const APP_STORE_URL = "https://apps.apple.com/il/app/id6809848231";

// iPhones, and iPads (which report themselves as a Mac but have touch).
export function isAppleMobileWeb(): boolean {
  if (Capacitor.isNativePlatform()) return false; // already in the app
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
export default function AppStoreButton({ className = "" }: { className?: string }) {
  const show = useSyncExternalStore(subscribe, isAppleMobileWeb, () => false);
  if (!show) return null;

  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg border border-card-border text-foreground font-medium text-lg hover:bg-background-2 transition-colors ${className}`}
    >
      <Smartphone size={18} aria-hidden="true" />
      הורידו את האפליקציה ל-iPhone
    </a>
  );
}

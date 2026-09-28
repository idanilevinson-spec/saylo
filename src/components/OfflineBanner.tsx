"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

// The iOS app's WKWebView loads saylolearn.com over the real network (see
// capacitor.config.ts) — there's no offline bundle, so a genuine
// connectivity drop previously meant a silently stuck or half-loaded page
// with no explanation. This can't restore functionality without an offline
// cache (a separate, much larger project), but it at least tells the
// learner what's happening instead of leaving them guessing whether the
// app or their connection is the problem.
function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

// Assume online for the server-rendered/first-paint snapshot — the server
// has no way to know the visitor's network state, and guessing "offline"
// would flash the banner on every normal load until hydration catches up.
function getServerSnapshot(): boolean {
  return true;
}

export default function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (online) return null;

  return (
    <div
      role="status"
      className="bg-danger-ink text-danger text-sm text-center py-2 px-4 flex items-center justify-center gap-1.5 border-b border-danger/20"
    >
      <WifiOff size={14} className="shrink-0" />
      אין חיבור לאינטרנט כרגע. חלק מהתוכן עלול לא להיטען עד שהחיבור יחזור.
    </div>
  );
}

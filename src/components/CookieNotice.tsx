"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "saylo-cookie-notice-ack";

const listeners = new Set<() => void>();
let acknowledgedThisSession = false;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot() {
  if (acknowledgedThisSession) return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Storage blocked: nothing can be remembered, so don't nag on every page.
    return true;
  }
}

function getServerSnapshot() {
  return true;
}

function acknowledge() {
  acknowledgedThisSession = true;
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Ignore write failures — the notice just reappears next visit.
  }
  listeners.forEach((l) => l());
}

// Informational, not a consent gate: the site only uses storage that is
// strictly necessary (login session, theme, accessibility preferences) and
// no analytics or advertising cookies. If a tracker is ever added, this
// must become a real opt-in that blocks it until accepted.
export default function CookieNotice() {
  const acknowledged = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (acknowledged) return null;

  return (
    <div
      role="region"
      aria-label="הודעה על עוגיות"
      className="fixed inset-x-3 z-[55] bg-card border border-card-border rounded-lg shadow-2xl p-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:inset-x-auto sm:start-4 sm:bottom-4 sm:max-w-md"
    >
      <p className="text-sm leading-relaxed">
        האתר משתמש רק בעוגיות ובאחסון מקומי הכרחיים: כדי לשמור אתכם מחוברים ולזכור את ההעדפות שבחרתם. אין אצלנו
        עוגיות פרסום או מעקב.{" "}
        <Link href="/privacy#cookies" className="text-primary hover:underline">
          פרטים נוספים
        </Link>
      </p>
      <button
        type="button"
        onClick={acknowledge}
        className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-ink text-sm font-bold hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        הבנתי
      </button>
    </div>
  );
}

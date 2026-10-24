"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";

// Asks once, on the dashboard, whether to turn email reminders on. They
// are opt-in (migration 030), and the one switch for them sat deep in the
// profile, so almost nobody had them: a learner who stepped away never
// heard from us again. Turning them on here is the same switch as the
// profile's, explained in full; "not now" hides the card on this device.

const DISMISS_KEY = "saylo:reminder-optin-dismissed";
const subscribeNever = () => () => {};

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export default function ReminderOptIn() {
  const { profile, refreshProfile } = useAuth();
  // localStorage is browser-only: the server pass renders nothing.
  const storedDismissed = useSyncExternalStore(subscribeNever, readDismissed, () => true);
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justEnabled, setJustEnabled] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!profile || storedDismissed || dismissed) return null;
  if (profile.email_reminders_enabled && !justEnabled) return null;

  async function enable() {
    if (!profile || saving) return;
    setSaving(true);
    setFailed(false);
    const { error } = await supabase.from("profiles").update({ email_reminders_enabled: true }).eq("id", profile.id);
    if (error) {
      setFailed(true);
      setSaving(false);
      return;
    }
    setJustEnabled(true);
    setSaving(false);
    await refreshProfile();
  }

  function notNow() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Blocked storage: hidden for this visit only.
    }
    setDismissed(true);
  }

  if (justEnabled) {
    return (
      <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-success/35 bg-success/[0.06] px-4 py-3 text-sm">
        <CheckCircle2 size={17} aria-hidden="true" className="shrink-0 text-success-hover" />
        <span>
          התזכורות במייל הופעלו. אפשר לכבות אותן בכל רגע ב
          <Link href="/profile" className="font-bold text-primary-hover underline underline-offset-2">
            הגדרות הפרופיל
          </Link>
          .
        </span>
      </p>
    );
  }

  return (
    <section aria-labelledby="reminder-optin-title" className="lit-plate mt-4 rounded-lg border border-card-border bg-card p-5 sm:flex sm:items-center sm:gap-5">
      <span className="hidden sm:inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-hover">
        <Bell size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="reminder-optin-title" className="font-bold">
          תזכורת במייל כשצריך
        </h2>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          מייל קצר ביום שהרצף שלכם בסכנה, ומייל כשלא נכנסתם כמה ימים, עם הצעד הבא במסלול. אפשר לכבות בכל רגע.
        </p>
        {failed && (
          <p role="alert" className="mt-1 text-sm text-danger-hover">
            לא הצלחנו לשמור. נסו שוב.
          </p>
        )}
      </div>
      <div className="mt-4 sm:mt-0 flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={enable}
          disabled={saving}
          className="game-press inline-flex items-center justify-center min-h-11 px-4 rounded-lg bg-primary text-primary-ink text-sm font-bold hover:bg-primary-hover transition-[background-color,transform] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {saving ? "שומרים..." : "להפעיל תזכורות"}
        </button>
        <button
          type="button"
          onClick={notNow}
          className="inline-flex items-center min-h-11 px-2 text-sm text-muted hover:text-foreground rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
        >
          לא עכשיו
        </button>
      </div>
    </section>
  );
}

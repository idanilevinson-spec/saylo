"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { AI_CONSENT_FIELD, hasAiConsent } from "@/lib/ai/consent";

// True once the signed-in learner has agreed to share their practice content
// with the AI providers. Features that call an AI service on their own (not
// behind a visible gate) check this before making the request.
export function useAiConsent(): boolean {
  const { session } = useAuth();
  return hasAiConsent(session?.user);
}

interface AiConsentGateProps {
  children: ReactNode;
  // Smaller card for a spot inside a page rather than a whole page.
  compact?: boolean;
  // Where "not now" goes; defaults to the dashboard. Pass null for a spot
  // inside a page that keeps working without the feature (no button shown).
  declineHref?: string | null;
}

// Shows what is sent to whom, asks once, and only then renders the feature.
// The server enforces the same rule, so this is the explanation, not the lock.
export default function AiConsentGate({ children, compact = false, declineHref = "/dashboard" }: AiConsentGateProps) {
  const { loading } = useAuth();
  const consented = useAiConsent();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }
  if (consented) return <>{children}</>;

  async function agree() {
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { [AI_CONSENT_FIELD]: new Date().toISOString() },
    });
    if (updateError) {
      setError("לא הצלחנו לשמור את ההסכמה. נסו שוב.");
      setSaving(false);
    }
    // On success the session updates and this gate renders its children.
  }

  return (
    <div className={compact ? "my-4" : "max-w-lg mx-auto px-4 py-12"}>
      <section
        aria-labelledby="ai-consent-title"
        className="relative bg-card border border-card-border rounded-lg p-6 sm:p-7 text-start"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-primary" />
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={22} className="text-primary shrink-0" aria-hidden="true" />
          <h2 id="ai-consent-title" className="text-lg font-bold">
            לפני ששולחים למורה ה-AI
          </h2>
        </div>

        <p className="mt-3 text-sm leading-relaxed">
          כדי שמורה ה-AI יענה ויבדוק את מה שכתבתם או אמרתם, Saylo שולחת חלק מהמידע לספקים חיצוניים:
        </p>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
          <li>
            <strong>Anthropic</strong> (מודל ה-AI): ההודעות שכתבתם או אמרתם בשיחה, טקסטים שהגשתם לבדיקה, ונתוני
            למידה כמו נושאי דקדוק שבהם טעיתם.
          </li>
          <li>
            <strong>Microsoft Azure Speech</strong>: הקול שלכם, בזמן אמת, לצורך תמלול והערכת הגייה. ההקלטה עצמה לא
            נשמרת אצלנו.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          לא שולחים להם את האימייל או את הכינוי שלכם. אל תכתבו או תגידו מידע רגיש או מזהה. התשובות נוצרות אוטומטית
          ועלולות להיות שגויות. פרטים מלאים ב
          <Link href="/privacy" className="text-primary underline underline-offset-2">
            מדיניות הפרטיות
          </Link>
          .
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={agree}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {saving ? "שומרים..." : "מאשרים שיתוף והמשך"}
          </button>
          {declineHref !== null && (
            <Link
              href={declineHref}
              className="flex-1 text-center px-4 py-3 rounded-lg border border-card-border bg-background font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              לא עכשיו
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

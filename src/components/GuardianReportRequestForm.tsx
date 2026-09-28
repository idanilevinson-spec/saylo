"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { EMAIL_INPUT } from "@/lib/utils/inputProps";
import { CONTACT_EMAIL } from "@/lib/legal/siteInfo";
import type { GuardianReportConsentStatus } from "@/types/database";

type LocalStatus = GuardianReportConsentStatus | "none";

// Embedded in the profile page (docs/specs/guardian-ongoing-report.md §3.2:
// "גלוי לקטין" — the minor sees and controls this, it never runs silently).
// Only rendered for a minor whose voice-feature consent is already granted
// — this consent is a separate, later step, not a bootstrap off that one.
export default function GuardianReportRequestForm() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<LocalStatus | null>(null);
  const [guardianEmail, setGuardianEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || profile.age_band === "adult" || profile.parental_consent_status !== "granted") return;
    supabase
      .from("guardian_report_consents")
      .select("status, guardian_email")
      .eq("minor_profile_id", profile.id)
      .maybeSingle()
      .then(({ data }) => {
        setStatus((data?.status as GuardianReportConsentStatus | undefined) ?? "none");
        setGuardianEmail(data?.guardian_email ?? null);
      });
  }, [profile]);

  async function submit() {
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/guardian-report/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guardianEmail: email }),
      });
      if (res.status === 429) {
        setError("נשלחה בקשה לאחרונה. אפשר לנסות שוב בעוד כמה דקות.");
        return;
      }
      if (res.status === 400) {
        setError("לא ניתן לשלוח בקשה כרגע.");
        return;
      }
      if (res.status === 502) {
        setError(`לא הצלחנו לשלוח מייל לכתובת הזו. בדקו אותה ונסו שוב, או כתבו לנו ל-${CONTACT_EMAIL}.`);
        return;
      }
      if (!res.ok) throw new Error("request failed");
      setStatus("pending");
      setGuardianEmail(email.trim());
      setResending(false);
    } catch {
      setError("אירעה שגיאה. נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  async function revoke() {
    if (submitting) return;
    setSubmitting(true);
    await fetch("/api/guardian-report/revoke", { method: "POST" });
    setStatus("none");
    setGuardianEmail(null);
    setSubmitting(false);
  }

  // Not eligible, or still loading the current status.
  if (!profile || profile.age_band === "adult" || profile.parental_consent_status !== "granted" || status === null) {
    return null;
  }

  if (status === "granted") {
    return (
      <div className="bg-card border border-card-border rounded-lg p-6 space-y-2">
        <h2 className="font-bold text-sm text-muted">דוח פעילות להורה</h2>
        <p className="text-sm">
          ההורה או האפוטרופוס שלכם ({guardianEmail}) מקבל/ת מדי פעם סיכום פעילות קצר במייל.
        </p>
        <button onClick={revoke} disabled={submitting} className="text-sm text-danger hover:underline disabled:opacity-50">
          {submitting ? "מעדכן..." : "הפסקת שליחת הדוח"}
        </button>
      </div>
    );
  }

  if (status === "pending" && !resending) {
    return (
      <div className="bg-card border border-card-border rounded-lg p-6 space-y-2">
        <h2 className="font-bold text-sm text-muted">דוח פעילות להורה</h2>
        <p className="text-sm">
          שלחנו בקשת אישור אל <span dir="ltr" className="font-content">{guardianEmail}</span>. ממתינים לתשובה.
        </p>
        <button onClick={() => setResending(true)} className="text-sm text-primary hover:underline">
          שליחה שוב או לכתובת אחרת
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-lg p-6 space-y-3">
      <h2 className="font-bold text-sm text-muted">דוח פעילות להורה</h2>
      <p className="text-sm text-muted">
        {status === "denied"
          ? "הבקשה הקודמת לא אושרה. אפשר לנסות שוב עם כתובת אחרת."
          : "רוצים שההורה או האפוטרופוס שלכם יקבל מדי פעם סיכום קצר של הפעילות שלכם (לא תוכן שיחות)? הזינו את האימייל שלו/ה."}
      </p>
      <input
        {...EMAIL_INPUT}
        autoComplete="off"
        aria-label="אימייל ההורה או האפוטרופוס לדוח פעילות"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="parent@example.com"
        className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button
        onClick={submit}
        disabled={!email.trim() || submitting}
        className="px-4 py-2 rounded-lg bg-primary text-primary-ink text-sm font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
      >
        {submitting ? "שולח..." : "שליחת בקשה"}
      </button>
    </div>
  );
}

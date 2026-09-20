"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import type { ParentalConsentStatus } from "@/types/database";
import { EMAIL_INPUT } from "@/lib/utils/inputProps";

interface ConsentRequestFormProps {
  status: ParentalConsentStatus;
}

export default function ConsentRequestForm({ status }: ConsentRequestFormProps) {
  const { profile, refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Where the last request went, read back from the pending request so the
  // notice survives a reload.
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Only set when the email could not be sent, so the request is never lost.
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "pending" || !profile) return;
    supabase
      .from("guardian_links")
      .select("guardian_email")
      .eq("minor_profile_id", profile.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.guardian_email) setSentTo(data.guardian_email);
      });
  }, [status, profile]);

  async function handleSubmit() {
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/consent/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guardianEmail: email }),
      });
      if (res.status === 429) {
        setError("שלחתם יותר מדי בקשות היום. נסו שוב מחר.");
        return;
      }
      if (res.status === 400) {
        setError("כתובת המייל לא נראית תקינה.");
        return;
      }
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { emailSent: boolean; consentToken: string | null };
      if (data.emailSent) {
        setSentTo(email.trim());
        setFallbackLink(null);
      } else if (data.consentToken) {
        setFallbackLink(`${window.location.origin}/consent/${data.consentToken}`);
      }
      setResending(false);
      await refreshProfile();
    } catch {
      setError("אירעה שגיאה. נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  if (fallbackLink) {
    return (
      <div className="bg-card border border-card-border rounded-lg p-6 text-center">
        <p className="font-bold">ממתינים לאישור ההורה</p>
        <p className="mt-2 text-sm text-muted">
          לא הצלחנו לשלוח מייל להורה. שלחו את הקישור הזה להורה או לאפוטרופוס שלכם כדי שיאשרו, בוואטסאפ, במייל או בכל דרך אחרת:
        </p>
        <div dir="ltr" className="mt-3 p-3 rounded-lg bg-background-2 text-sm break-all font-content">
          {fallbackLink}
        </div>
      </div>
    );
  }

  if ((status === "pending" || sentTo) && !resending) {
    return (
      <div className="bg-card border border-card-border rounded-lg p-6 text-center">
        <p className="font-bold">ממתינים לאישור ההורה</p>
        <p className="mt-2 text-sm text-muted">
          {sentTo ? (
            <>
              שלחנו מייל עם קישור לאישור אל{" "}
              <span dir="ltr" className="font-content text-foreground">
                {sentTo}
              </span>
              .{" "}
            </>
          ) : (
            "שלחנו מייל עם קישור לאישור להורה. "
          )}
          ברגע שההורה יאשר, אפשר לחזור לכאן ולרענן את הדף. אם המייל לא הגיע, כדאי לבדוק בספאם.
        </p>
        <button onClick={() => setResending(true)} className="mt-4 text-sm text-primary hover:underline">
          שליחה שוב או לכתובת אחרת
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <p className="font-bold">נדרש אישור הורה</p>
      <p className="mt-2 text-sm text-muted">
        {status === "denied"
          ? "הבקשה הקודמת לא אושרה. אפשר לנסות שוב עם כתובת מייל אחרת."
          : "כדי להקליט קול ולתרגל שיחה עם ה-AI, אנחנו צריכים אישור מהורה או אפוטרופוס. הזינו את האימייל שלהם ונשלח להם קישור לאישור."}
      </p>
      <input
        {...EMAIL_INPUT}
        autoComplete="off"
        aria-label="אימייל ההורה או האפוטרופוס"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="parent@example.com"
        className="mt-4 w-full px-4 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!email.trim() || submitting}
        className="mt-4 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
      >
        {submitting ? "שולח..." : "שליחת בקשה"}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import type { ParentalConsentStatus } from "@/types/database";

interface ConsentRequestFormProps {
  status: ParentalConsentStatus;
}

export default function ConsentRequestForm({ status }: ConsentRequestFormProps) {
  const { profile, refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "pending" || !profile) return;
    supabase
      .from("guardian_links")
      .select("consent_token")
      .eq("minor_profile_id", profile.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.consent_token) setLink(`${window.location.origin}/consent/${data.consent_token}`);
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
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setLink(`${window.location.origin}/consent/${data.consentToken}`);
      await refreshProfile();
    } catch {
      setError("אירעה שגיאה. נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  if (link) {
    return (
      <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
        <p className="font-bold">{status === "pending" ? "ממתינים לאישור ההורה" : "הבקשה נשלחה!"}</p>
        <p className="mt-2 text-sm text-muted">
          שלחו את הקישור הזה להורה או לאפוטרופוס שלכם כדי שיאשרו (עדיין אין לנו שליחת מייל אוטומטית, אז צריך להעביר את זה ידנית — בוואטסאפ, מייל, איך שנוח):
        </p>
        <div dir="ltr" className="mt-3 p-3 rounded-lg bg-background-2 text-sm break-all font-content">
          {link}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <p className="font-bold">נדרש אישור הורה</p>
      <p className="mt-2 text-sm text-muted">
        {status === "denied"
          ? "הבקשה הקודמת לא אושרה. אפשר לנסות שוב עם כתובת מייל אחרת."
          : "כדי לתרגל שיחה עם ה-AI, אנחנו צריכים אישור מהורה או אפוטרופוס. הזינו את האימייל שלהם ונכין עבורכם קישור לשליחה."}
      </p>
      <input
        type="email"
        dir="ltr"
        aria-label="אימייל ההורה או האפוטרופוס"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="parent@example.com"
        className="mt-4 w-full px-4 py-2.5 rounded-xl border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!email.trim() || submitting}
        className="mt-4 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
      >
        {submitting ? "שולח..." : "שליחת בקשה"}
      </button>
    </div>
  );
}

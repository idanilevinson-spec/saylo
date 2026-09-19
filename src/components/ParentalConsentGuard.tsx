"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import ConsentRequestForm from "@/components/ConsentRequestForm";
import { useAuth } from "@/context/AuthProvider";
import { requiresParentalConsent } from "@/lib/auth/consentGate";

// Full-page gate: a minor without a guardian's granted consent sees the
// consent request instead of anything that records their voice or talks to
// the AI teacher.
export default function ParentalConsentGuard({ title, children }: { title: string; children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (requiresParentalConsent(profile)) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
        <ConsentRequestForm status={profile.parental_consent_status} />
      </div>
    );
  }

  return <>{children}</>;
}

// Inline version for a control that sits inside a list (the pronunciation
// recorder), where a whole consent card would be too heavy.
export function ParentalConsentNotice() {
  return (
    <p className="text-xs text-muted leading-relaxed">
      כדי להקליט קול נדרש אישור של הורה או אפוטרופוס.{" "}
      <Link href="/speaking" className="text-primary hover:underline">
        לבקשת אישור
      </Link>
    </p>
  );
}

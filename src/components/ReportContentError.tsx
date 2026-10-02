"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";

// Reports go straight into the existing admin moderation queue
// (content_reports, migration 007) — the same table and the same "דיווחים
// פתוחים" list an admin already reviews for flagged conversations, now also
// fed by learners themselves (migration 036 opened target_type = 'exercise'
// to them). No separate admin screen needed.
//
// targetType started as a union of one on purpose — widen it (and the DB
// policy in migration 036/040/041) together, one content type at a time,
// rather than opening every content type before the reporting flow has been
// used for real. Now also covers the reading/listening/grammar content
// pages themselves (the passage/clip/topic, not their exercises).
export type ReportableContentType = "exercise" | "reading_text" | "listening_clip" | "grammar_topic";

interface ReportContentErrorProps {
  targetType: ReportableContentType;
  targetId: string;
  className?: string;
}

const MAX_REASON_LENGTH = 500;

export default function ReportContentError({ targetType, targetId, className = "" }: ReportContentErrorProps) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;

  if (submitted) {
    return <p className={`text-xs text-muted ${className}`}>תודה, נבדוק את זה.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors ${className}`}
      >
        <Flag size={12} />
        יש כאן טעות?
      </button>
    );
  }

  async function submit() {
    const trimmed = reason.trim();
    if (!trimmed || !profile) return;
    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("content_reports").insert({
      reporter_profile_id: profile.id,
      target_type: targetType,
      target_id: targetId,
      reason: trimmed,
    });
    setSubmitting(false);
    if (insertError) {
      setError("אירעה שגיאה. נסו שוב.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className={`text-xs ${className}`}>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LENGTH))}
        placeholder="מה לא בסדר כאן?"
        rows={2}
        autoFocus
        className="w-full px-2.5 py-1.5 rounded-lg border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {error && (
        <p role="alert" className="mt-1 text-danger">
          {error}
        </p>
      )}
      <div className="mt-1.5 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!reason.trim() || submitting}
          className="text-primary hover:underline disabled:opacity-40 disabled:hover:no-underline"
        >
          {submitting ? "שולח..." : "שליחת דיווח"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setReason("");
            setError(null);
          }}
          className="text-muted hover:underline"
        >
          ביטול
        </button>
      </div>
    </div>
  );
}

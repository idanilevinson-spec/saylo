"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";

interface GuardianReportDecisionProps {
  token: string;
  initialStatus: string;
}

// Unlike ConsentDecision (the voice-feature flow, which only ever moves
// pending -> granted/denied and stops), this one also handles a guardian
// unsubscribing later from an already-granted report — see
// revoke_guardian_report_consent (migration 037).
export default function GuardianReportDecision({ token, initialStatus }: GuardianReportDecisionProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function decide(approve: boolean) {
    if (loading) return;
    setLoading(true);
    const { data } = await supabase.rpc("resolve_guardian_report_consent", { p_token: token, p_approve: approve });
    if (data) setStatus(approve ? "granted" : "denied");
    setLoading(false);
  }

  async function unsubscribe() {
    if (loading) return;
    setLoading(true);
    const { data } = await supabase.rpc("revoke_guardian_report_consent", { p_token: token });
    if (data) setStatus("revoked");
    setLoading(false);
  }

  if (status === "granted") {
    return (
      <div className="mt-6 text-center p-4 rounded-lg bg-background-2">
        <p className="text-success font-bold flex items-center justify-center gap-1.5">
          <CheckCircle2 size={16} /> האישור ניתן. תודה!
        </p>
        <p className="mt-2 text-sm text-muted">הדוח הבא יישלח אליכם בהתאם לתדירות הקבועה באתר.</p>
        <button
          onClick={unsubscribe}
          disabled={loading}
          className="mt-3 text-sm text-muted hover:text-danger hover:underline disabled:opacity-50"
        >
          {loading ? "מעדכן..." : "הפסקת קבלת הדוח"}
        </button>
      </div>
    );
  }

  if (status === "denied" || status === "revoked") {
    return (
      <div className="mt-6 text-center p-4 rounded-lg bg-background-2">
        <p className="text-danger font-bold">
          {status === "denied" ? "הבקשה נדחתה." : "הפסקתם לקבל את הדוח."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex gap-3">
      <button
        onClick={() => decide(true)}
        disabled={loading}
        className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        מאשר/ת
      </button>
      <button
        onClick={() => decide(false)}
        disabled={loading}
        className="flex-1 px-4 py-3 rounded-lg border border-card-border font-medium hover:bg-background-2 transition-colors disabled:opacity-50"
      >
        לא מאשר/ת
      </button>
    </div>
  );
}

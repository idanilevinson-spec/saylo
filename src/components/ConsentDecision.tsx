"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";

interface ConsentDecisionProps {
  token: string;
  initialStatus: string;
}

export default function ConsentDecision({ token, initialStatus }: ConsentDecisionProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function decide(approve: boolean) {
    if (loading) return;
    setLoading(true);
    const { data } = await supabase.rpc("resolve_guardian_consent", { p_token: token, p_approve: approve });
    if (data) setStatus(approve ? "granted" : "denied");
    setLoading(false);
  }

  if (status !== "pending") {
    return (
      <div className="mt-6 text-center p-4 rounded-xl bg-background-2">
        {status === "granted" && (
          <p className="text-success font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 size={16} /> האישור ניתן. תודה!
          </p>
        )}
        {status === "denied" && <p className="text-danger font-bold">הבקשה נדחתה.</p>}
      </div>
    );
  }

  return (
    <div className="mt-6 flex gap-3">
      <button
        onClick={() => decide(true)}
        disabled={loading}
        className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        מאשר/ת
      </button>
      <button
        onClick={() => decide(false)}
        disabled={loading}
        className="flex-1 px-4 py-3 rounded-xl border border-card-border font-medium hover:bg-background-2 transition-colors disabled:opacity-50"
      >
        לא מאשר/ת
      </button>
    </div>
  );
}

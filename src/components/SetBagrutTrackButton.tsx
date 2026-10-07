"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import type { BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";

// Marks this track as the learner's own (profiles.bagrut_units — the same
// answer the placement test asks for), so /bagrut highlights it.
export default function SetBagrutTrackButton({ units, current }: { units: BagrutStudyUnits; current: BagrutStudyUnits | null }) {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [mine, setMine] = useState(current === units);

  if (mine) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-hover">
        <Check size={15} aria-hidden="true" /> המסלול שלכם
      </span>
    );
  }

  async function choose() {
    if (!profile || saving) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ bagrut_units: units }).eq("id", profile.id);
    setSaving(false);
    if (error) return;
    setMine(true);
    await refreshProfile();
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={choose}
      disabled={saving}
      className="game-press inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-lg border border-card-border text-sm font-medium hover:border-primary/50 transition-[border-color,transform] duration-150 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      {saving ? "שומר…" : `זה המסלול שלי (${units} יח״ל)`}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { modulesForUnits, type BagrutModuleCode, type BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import type { BagrutUnitProgress } from "@/types/database";

interface BagrutTrackPanelProps {
  // Practice sets available per module — computed on the server from
  // getPublishableSampleUnits so this component never imports the content.
  unitCounts: Record<BagrutModuleCode, number>;
}

const TRACKS: BagrutStudyUnits[] = [3, 4, 5];

// The learner's own track at the top of /bagrut: which study-unit level
// they're preparing for (the same answer the placement test asks for), and
// how many practice sets of each of that track's modules they've finished.
export default function BagrutTrackPanel({ unitCounts }: BagrutTrackPanelProps) {
  const { profile, refreshProfile } = useAuth();
  const [progress, setProgress] = useState<BagrutUnitProgress[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("bagrut_unit_progress")
      .select("*")
      .eq("profile_id", profile.id)
      .then(({ data }) => setProgress((data ?? []) as BagrutUnitProgress[]));
  }, [profile]);

  if (!profile) return null;
  const track = profile.bagrut_units;

  async function chooseTrack(units: BagrutStudyUnits | null) {
    if (!profile || saving) return;
    setSaving(true);
    await supabase.from("profiles").update({ bagrut_units: units }).eq("id", profile.id);
    await refreshProfile();
    setSaving(false);
  }

  return (
    <section aria-labelledby="bagrut-track-title" className="mt-8 bg-card border border-card-border rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="bagrut-track-title" className="font-bold flex items-center gap-2">
          <GraduationCap size={18} aria-hidden="true" className="text-primary" />
          {track ? `המסלול שלכם: ${track} יח״ל` : "לאיזה מסלול אתם מתכוננים?"}
        </h2>
        <div role="group" aria-label="בחירת מסלול" className="flex gap-1 bg-background-2 rounded-lg p-1">
          {TRACKS.map((units) => (
            <button
              key={units}
              type="button"
              aria-pressed={track === units}
              disabled={saving}
              onClick={() => chooseTrack(track === units ? null : units)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium tabular-nums transition-colors ${
                track === units ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground"
              }`}
            >
              {units} יח״ל
            </button>
          ))}
        </div>
      </div>

      {track ? (
        <ul className="mt-4 grid sm:grid-cols-3 gap-2">
          {modulesForUnits(track).map((code) => {
            const total = unitCounts[code] ?? 0;
            const done = progress.filter((p) => p.module_code === code);
            const best = done.length ? Math.max(...done.map((p) => p.best_percent)) : null;
            const complete = total > 0 && done.length >= total;
            return (
              <li key={code}>
                <Link
                  href={`/bagrut/${code}`}
                  className="block rounded-lg border border-card-border p-3 hover:border-primary/40 transition-colors"
                >
                  <span className="flex items-center justify-between">
                    <span className="font-bold">מודול {code}</span>
                    {complete && <CheckCircle2 size={16} aria-label="הושלם" className="text-success" />}
                  </span>
                  <span className="mt-2 block h-1.5 rounded-full bg-background-2 overflow-hidden" aria-hidden="true">
                    <span className="block h-full bg-primary" style={{ width: `${total ? (Math.min(done.length, total) / total) * 100 : 0}%` }} />
                  </span>
                  <span className="mt-1.5 block text-xs text-muted tabular-nums">
                    {Math.min(done.length, total)} מתוך {total} ערכות
                    {best !== null ? ` · הכי טוב ${best}%` : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted leading-relaxed">
          בחירת מסלול מציגה כאן את המודולים שלכם ואת ההתקדמות בהם. אפשר לשנות אותה בכל רגע.{" "}
          <Link href="/placement" className="text-primary hover:underline">
            מבחן הרמה
          </Link>{" "}
          כולל גם קטע קריאה בפורמט הבגרות של המסלול שבוחרים.
        </p>
      )}
    </section>
  );
}

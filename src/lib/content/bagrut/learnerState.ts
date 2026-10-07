import "server-only";
import { createClient } from "@/lib/supabase/serverClient";
import type { BagrutStudyUnits } from "./moduleFormats";
import type { BagrutUnitProgress } from "@/types/database";

// The signed-in learner's Bagrut state for the server-rendered learning
// area: which track they chose (profiles.bagrut_units, set in the
// placement test or on /bagrut) and their best score per practice set.
// Both degrade to "nothing yet" if the columns/table aren't there.
export async function getBagrutLearnerState(): Promise<{ track: BagrutStudyUnits | null; progress: BagrutUnitProgress[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { track: null, progress: [] };

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase.from("profiles").select("bagrut_units").eq("id", user.id).maybeSingle(),
    supabase.from("bagrut_unit_progress").select("*").eq("profile_id", user.id),
  ]);
  const units = profile?.bagrut_units;
  return {
    track: units === 3 || units === 4 || units === 5 ? units : null,
    progress: (progress ?? []) as BagrutUnitProgress[],
  };
}

export function bestScore(progress: BagrutUnitProgress[], moduleCode: string, unitSlug: string): number | null {
  const row = progress.find((p) => p.module_code === moduleCode && p.unit_slug === unitSlug);
  return row ? row.best_percent : null;
}

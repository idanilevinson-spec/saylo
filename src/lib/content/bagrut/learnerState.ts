import "server-only";
import { createClient } from "@/lib/supabase/serverClient";
import type { BagrutStudyUnits } from "./moduleFormats";
import type { BagrutExamKind, BagrutUnitProgress } from "@/types/database";
import { israelDate, weekStart } from "@/lib/bagrut/examPlan";
import { ORAL_GRADE_FEATURE } from "@/lib/bagrut/oralAllowance";

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

// The exam date and this week's activity for the plan on /bagrut
// (src/lib/bagrut/examPlan.ts). available = false until migration 056 has
// run, and the page then shows no exam card at all.
export interface BagrutExamState {
  available: boolean;
  date: string | null;
  kind: BagrutExamKind | null;
  oralGradesThisWeek: number;
  conversationsThisWeek: number;
}

const EXAM_KINDS: readonly string[] = ["A", "B", "C", "D", "E", "F", "G", "oral"];

export async function getBagrutExamState(): Promise<BagrutExamState> {
  const none: BagrutExamState = { available: false, date: null, kind: null, oralGradesThisWeek: 0, conversationsThisWeek: 0 };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return none;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("bagrut_exam_date, bagrut_exam_kind")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !profile) return none;
  const date = typeof profile.bagrut_exam_date === "string" ? profile.bagrut_exam_date : null;
  const kind = EXAM_KINDS.includes(profile.bagrut_exam_kind) ? (profile.bagrut_exam_kind as BagrutExamKind) : null;
  if (!date || !kind) return { ...none, available: true };

  // Rows since this week's Sunday in Israel; fetched with a day of margin
  // and then filtered by the Israeli calendar date.
  const start = weekStart(israelDate(new Date()));
  const since = new Date(Date.now() - 8 * 86_400_000).toISOString();
  const thisWeek = (rows: { created_at: string }[] | null) =>
    (rows ?? []).filter((r) => israelDate(new Date(r.created_at)) >= start).length;
  const [{ data: oral }, { data: conversations }] = await Promise.all([
    supabase
      .from("ai_usage_log")
      .select("created_at")
      .eq("profile_id", user.id)
      .eq("feature", ORAL_GRADE_FEATURE)
      .gte("created_at", since),
    supabase.from("conversations").select("created_at").eq("profile_id", user.id).gte("created_at", since),
  ]);
  return { available: true, date, kind, oralGradesThisWeek: thisWeek(oral), conversationsThisWeek: thisWeek(conversations) };
}

export function bestScore(progress: BagrutUnitProgress[], moduleCode: string, unitSlug: string): number | null {
  const row = progress.find((p) => p.module_code === moduleCode && p.unit_slug === unitSlug);
  return row ? row.best_percent : null;
}

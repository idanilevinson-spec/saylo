import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as browserSupabase } from "@/lib/supabase/browserClient";
import { cefrLevelFromPercent } from "./cefrScoring";
import type { SkillArea } from "@/types/database";

const ROLLING_WINDOW = 20;

// Keeps skill_levels live instead of a one-time placement-test snapshot:
// recomputed from the most recent attempts every time the learner
// practices, so "what should I work on" reflects current performance,
// not just the result of a single test taken once.
export async function refreshSkillLevelFromAttempts(profileId: string, skill: SkillArea): Promise<void> {
  const { data: attempts } = await browserSupabase
    .from("exercise_attempts")
    .select("is_correct, exercises!inner(skill_area)")
    .eq("profile_id", profileId)
    .eq("exercises.skill_area", skill)
    .order("created_at", { ascending: false })
    .limit(ROLLING_WINDOW);

  if (!attempts || attempts.length === 0) return;

  const correct = attempts.filter((a) => a.is_correct).length;
  const percentCorrect = Math.round((correct / attempts.length) * 100);
  const cefrLevel = cefrLevelFromPercent(percentCorrect);

  await browserSupabase
    .from("skill_levels")
    .upsert({ profile_id: profileId, skill, cefr_level: cefrLevel, updated_at: new Date().toISOString() }, { onConflict: "profile_id,skill" });
}

// Server-side variant for routes that already computed a 0-100 score
// directly (writing coach, conversation scoring) instead of deriving it
// from a window of exercise_attempts.
export async function setSkillLevelFromScore(
  supabase: SupabaseClient,
  profileId: string,
  skill: SkillArea,
  percentCorrect: number
): Promise<void> {
  const cefrLevel = cefrLevelFromPercent(Math.max(0, Math.min(100, percentCorrect)));
  await supabase
    .from("skill_levels")
    .upsert({ profile_id: profileId, skill, cefr_level: cefrLevel, updated_at: new Date().toISOString() }, { onConflict: "profile_id,skill" });
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as browserSupabase } from "@/lib/supabase/browserClient";
import { CEFR_ORDER, capLevelToContentDifficulty, cefrLevelFromPercent } from "./cefrScoring";
import type { CefrLevel, SkillArea } from "@/types/database";

const ROLLING_WINDOW = 20;

// Keeps skill_levels live instead of a one-time placement-test snapshot:
// recomputed from the most recent attempts every time the learner
// practices, so "what should I work on" reflects current performance,
// not just the result of a single test taken once.
export async function refreshSkillLevelFromAttempts(profileId: string, skill: SkillArea): Promise<void> {
  const { data: attempts } = await browserSupabase
    .from("exercise_attempts")
    .select("is_correct, exercises!inner(skill_area, cefr_level)")
    .eq("profile_id", profileId)
    .eq("exercises.skill_area", skill)
    .order("created_at", { ascending: false })
    .limit(ROLLING_WINDOW);

  if (!attempts || attempts.length === 0) return;

  const correct = attempts.filter((a) => a.is_correct).length;
  const percentCorrect = Math.round((correct / attempts.length) * 100);
  const rawLevel = cefrLevelFromPercent(percentCorrect);

  const hardestAttempted = attempts.reduce<CefrLevel>((max, a) => {
    const level = (a.exercises as unknown as { cefr_level: CefrLevel }).cefr_level;
    return CEFR_ORDER.indexOf(level) > CEFR_ORDER.indexOf(max) ? level : max;
  }, "A1");
  const cefrLevel = capLevelToContentDifficulty(rawLevel, hardestAttempted);

  await browserSupabase
    .from("skill_levels")
    .upsert({ profile_id: profileId, skill, cefr_level: cefrLevel, updated_at: new Date().toISOString() }, { onConflict: "profile_id,skill" });
}

// Server-side variant for routes that already computed a 0-100 score
// directly (writing coach, reading response, conversation scoring) instead
// of deriving it from a window of exercise_attempts. contentLevel is the
// CEFR level of the specific text/prompt being graded, when there is one —
// conversations are open-ended with no fixed difficulty, so speaking scores
// pass none and are left uncapped.
export async function setSkillLevelFromScore(
  supabase: SupabaseClient,
  profileId: string,
  skill: SkillArea,
  percentCorrect: number,
  contentLevel?: CefrLevel | null
): Promise<void> {
  const rawLevel = cefrLevelFromPercent(Math.max(0, Math.min(100, percentCorrect)));
  const cefrLevel = contentLevel ? capLevelToContentDifficulty(rawLevel, contentLevel) : rawLevel;
  await supabase
    .from("skill_levels")
    .upsert({ profile_id: profileId, skill, cefr_level: cefrLevel, updated_at: new Date().toISOString() }, { onConflict: "profile_id,skill" });
}

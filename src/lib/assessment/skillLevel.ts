import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as browserSupabase } from "@/lib/supabase/browserClient";
import { levelFromAttempts, levelFromScore } from "./skillLevelPolicy";
import type { CefrLevel, SkillArea } from "@/types/database";

const ROLLING_WINDOW = 20;

async function currentLevel(client: SupabaseClient, profileId: string, skill: SkillArea) {
  const { data } = await client
    .from("skill_levels")
    .select("cefr_level, updated_at")
    .eq("profile_id", profileId)
    .eq("skill", skill)
    .maybeSingle();
  return data as { cefr_level: CefrLevel; updated_at: string } | null;
}

// Keeps skill_levels live instead of a one-time placement-test snapshot:
// re-evaluated after every practice answer, from the answers given since
// the level last changed, with the rules in skillLevelPolicy.ts (enough
// answers first, one step at a time, relative to the content's level).
export async function refreshSkillLevelFromAttempts(profileId: string, skill: SkillArea): Promise<void> {
  const current = await currentLevel(browserSupabase, profileId, skill);
  let query = browserSupabase
    .from("exercise_attempts")
    .select("is_correct, exercises!inner(skill_area, cefr_level)")
    .eq("profile_id", profileId)
    .eq("exercises.skill_area", skill);
  if (current?.updated_at) query = query.gt("created_at", current.updated_at);
  const { data: attempts } = await query.order("created_at", { ascending: false }).limit(ROLLING_WINDOW);
  if (!attempts?.length) return;

  const next = levelFromAttempts(
    current?.cefr_level ?? null,
    attempts.map((a) => ({
      isCorrect: a.is_correct,
      contentLevel: (a.exercises as unknown as { cefr_level: CefrLevel }).cefr_level,
    })),
  );
  if (!next) return;
  await browserSupabase
    .from("skill_levels")
    .upsert({ profile_id: profileId, skill, cefr_level: next, updated_at: new Date().toISOString() }, { onConflict: "profile_id,skill" });
}

// Server-side variant for routes that score one piece of work 0-100
// (writing coach, reading response, conversation scoring). contentLevel is
// the CEFR level of the text/prompt graded, when there is one;
// conversations have none.
export async function setSkillLevelFromScore(
  supabase: SupabaseClient,
  profileId: string,
  skill: SkillArea,
  percentCorrect: number,
  contentLevel?: CefrLevel | null
): Promise<void> {
  const current = await currentLevel(supabase, profileId, skill);
  const next = levelFromScore(current?.cefr_level ?? null, percentCorrect, contentLevel);
  if (!next) return;
  await supabase
    .from("skill_levels")
    .upsert({ profile_id: profileId, skill, cefr_level: next, updated_at: new Date().toISOString() }, { onConflict: "profile_id,skill" });
}

import "server-only";
import { createClient } from "@/lib/supabase/serverClient";
import { overallLevel } from "./levelOrder";
import type { CefrLevel, SkillArea } from "@/types/database";

export interface LearnerLevels {
  // Null until a placement test is taken; then see overallLevel().
  overall: CefrLevel | null;
  // Live per-skill levels (skill_levels), kept current by practice.
  bySkill: Partial<Record<SkillArea, CefrLevel>>;
  signedIn: boolean;
}

// The signed-in learner's levels, for server-rendered content pages that
// put "at your level" first. A skill without its own level falls back to
// the overall placement result via levelFor().
export async function getLearnerLevels(): Promise<LearnerLevels> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { overall: null, bySkill: {}, signedIn: false };

  const [{ data: placement }, { data: skills }] = await Promise.all([
    supabase
      .from("placement_tests")
      .select("result_cefr_overall")
      .eq("profile_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("skill_levels").select("skill, cefr_level").eq("profile_id", user.id),
  ]);

  const bySkill: Partial<Record<SkillArea, CefrLevel>> = {};
  for (const s of skills ?? []) bySkill[s.skill as SkillArea] = s.cefr_level as CefrLevel;
  return { overall: overallLevel((placement?.result_cefr_overall as CefrLevel | null) ?? null, bySkill), bySkill, signedIn: true };
}

export function levelFor(levels: LearnerLevels, skill: SkillArea): CefrLevel | null {
  return levels.bySkill[skill] ?? levels.overall;
}

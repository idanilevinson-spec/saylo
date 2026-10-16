import { supabase } from "@/lib/supabase/browserClient";
import type { CefrLevel } from "@/types/database";

// The learner's current vocabulary level, or null before placement. Games
// use it to pick new words at that level (see newWordsAtLevel) instead of
// handing a C2 learner "hello" and "wake up".
export async function learnerVocabLevel(profileId: string): Promise<CefrLevel | null> {
  const { data } = await supabase
    .from("skill_levels")
    .select("cefr_level")
    .eq("profile_id", profileId)
    .eq("skill", "vocabulary")
    .maybeSingle();
  return (data?.cefr_level as CefrLevel | undefined) ?? null;
}

import { supabase } from "@/lib/supabase/browserClient";
import { regenerateHearts, loseHeart } from "./hearts";
import type { Hearts } from "@/types/database";

const DEFAULT_MAX_HEARTS = 5;

async function getOrCreateHeartsRow(profileId: string): Promise<Hearts> {
  const { data: existing } = await supabase.from("hearts").select("*").eq("profile_id", profileId).maybeSingle();
  if (existing) return existing;

  const fresh: Hearts = {
    profile_id: profileId,
    current_hearts: DEFAULT_MAX_HEARTS,
    max_hearts: DEFAULT_MAX_HEARTS,
    last_regen_at: new Date().toISOString(),
  };
  await supabase.from("hearts").insert(fresh);
  return fresh;
}

export async function getCurrentHearts(profileId: string): Promise<{ current: number; max: number }> {
  const row = await getOrCreateHeartsRow(profileId);
  const now = new Date();
  const regenerated = regenerateHearts(
    { current: row.current_hearts, max: row.max_hearts, lastRegenAt: new Date(row.last_regen_at) },
    now
  );

  if (regenerated.current !== row.current_hearts) {
    await supabase
      .from("hearts")
      .update({ current_hearts: regenerated.current, last_regen_at: regenerated.lastRegenAt.toISOString() })
      .eq("profile_id", profileId);
  }

  return { current: regenerated.current, max: regenerated.max };
}

export async function spendHeartOnMistake(profileId: string): Promise<{ current: number; max: number }> {
  const row = await getOrCreateHeartsRow(profileId);
  const now = new Date();
  const regenerated = regenerateHearts(
    { current: row.current_hearts, max: row.max_hearts, lastRegenAt: new Date(row.last_regen_at) },
    now
  );
  const afterLoss = loseHeart(regenerated, now);

  await supabase
    .from("hearts")
    .update({ current_hearts: afterLoss.current, last_regen_at: afterLoss.lastRegenAt.toISOString() })
    .eq("profile_id", profileId);

  return { current: afterLoss.current, max: afterLoss.max };
}

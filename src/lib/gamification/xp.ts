import { supabase } from "@/lib/supabase/browserClient";

// Level N requires progressively more XP than the last (triangular-ish
// curve) so leveling up feels meaningful without needing a big lookup table.
export function levelForXp(totalXp: number): number {
  let level = 1;
  let threshold = 0;
  let step = 100;
  while (totalXp >= threshold + step) {
    threshold += step;
    step += 50;
    level += 1;
  }
  return level;
}

export async function awardXp(
  profileId: string,
  source: string,
  amount: number
): Promise<{ totalXp: number; level: number }> {
  await supabase.from("xp_events").insert({ profile_id: profileId, source, amount });

  const { data: existing } = await supabase
    .from("user_xp")
    .select("total_xp")
    .eq("profile_id", profileId)
    .maybeSingle();

  const totalXp = (existing?.total_xp ?? 0) + amount;
  const level = levelForXp(totalXp);

  await supabase.from("user_xp").upsert({
    profile_id: profileId,
    total_xp: totalXp,
    current_level: level,
    updated_at: new Date().toISOString(),
  });

  return { totalXp, level };
}

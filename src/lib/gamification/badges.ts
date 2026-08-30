import { supabase } from "@/lib/supabase/browserClient";
import type { Badge } from "@/types/database";

interface BadgeContext {
  totalXp: number;
  currentStreak: number;
  correctAttemptsCount: number;
}

interface BadgeCriteria {
  type: "streak" | "xp" | "correct_attempts";
  value: number;
}

export async function checkAndAwardBadges(profileId: string, ctx: BadgeContext): Promise<Badge[]> {
  const [{ data: badges }, { data: earned }] = await Promise.all([
    supabase.from("badges").select("*"),
    supabase.from("user_badges").select("badge_id").eq("profile_id", profileId),
  ]);
  if (!badges) return [];

  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id));
  const newlyEarned: Badge[] = [];

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue;
    if (meetsCriteria(badge.criteria as unknown as BadgeCriteria, ctx)) {
      await supabase.from("user_badges").insert({ profile_id: profileId, badge_id: badge.id });
      newlyEarned.push(badge);
    }
  }

  return newlyEarned;
}

function meetsCriteria(criteria: BadgeCriteria, ctx: BadgeContext): boolean {
  switch (criteria.type) {
    case "streak":
      return ctx.currentStreak >= criteria.value;
    case "xp":
      return ctx.totalXp >= criteria.value;
    case "correct_attempts":
      return ctx.correctAttemptsCount >= criteria.value;
    default:
      return false;
  }
}

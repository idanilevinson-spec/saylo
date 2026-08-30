import { supabase } from "@/lib/supabase/browserClient";
import type { Streak } from "@/types/database";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

// Advances the streak at most once per calendar day — call this on every
// completed exercise; it's a no-op if today is already recorded.
export async function touchStreak(profileId: string): Promise<Streak> {
  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  const today = todayStr();

  if (!existing?.last_active_date) {
    const streak: Streak = {
      profile_id: profileId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
      last_reminder_sent_at: null,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("streaks").upsert(streak);
    return streak;
  }

  if (existing.last_active_date === today) {
    return existing;
  }

  const gap = daysBetween(existing.last_active_date, today);
  const currentStreak = gap === 1 ? existing.current_streak + 1 : 1;
  const longestStreak = Math.max(existing.longest_streak, currentStreak);

  const updated: Streak = {
    profile_id: profileId,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_active_date: today,
    last_reminder_sent_at: existing.last_reminder_sent_at,
    updated_at: new Date().toISOString(),
  };
  await supabase.from("streaks").upsert(updated);
  return updated;
}

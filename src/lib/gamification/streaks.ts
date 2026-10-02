import { supabase } from "@/lib/supabase/browserClient";
import type { Streak } from "@/types/database";

// A freeze protects the streak across exactly ONE missed day: come back the
// day after next (gap === 2) with a freeze in hand, and the streak
// continues instead of resetting. This is evaluated lazily, the next time
// the learner actually opens the app and answers something — there's no
// background job that "spends" a freeze automatically at midnight the way
// Duolingo's does, so a freeze only ever helps once the learner is back,
// not while they're still away.
import { MAX_FREEZES, FREEZE_EARN_INTERVAL_DAYS } from "./streakRules";
export { MAX_FREEZES, FREEZE_EARN_INTERVAL_DAYS };

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export interface StreakUpdateResult {
  streak: Streak;
  freezeUsed: boolean;
  freezeEarned: boolean;
}

// Pure — no I/O — so the streak/freeze math is fully unit-testable without
// touching Supabase. `existing` is null the very first time a learner
// completes anything.
export function computeNextStreak(
  existing: Streak | null,
  profileId: string,
  today: string
): StreakUpdateResult {
  if (!existing?.last_active_date) {
    return {
      streak: {
        profile_id: profileId,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
        last_reminder_sent_at: existing?.last_reminder_sent_at ?? null,
        freeze_count: existing?.freeze_count ?? 0,
        last_freeze_award_streak: existing?.last_freeze_award_streak ?? 0,
        updated_at: new Date().toISOString(),
      },
      freezeUsed: false,
      freezeEarned: false,
    };
  }

  if (existing.last_active_date === today) {
    return { streak: existing, freezeUsed: false, freezeEarned: false };
  }

  const gap = daysBetween(existing.last_active_date, today);

  let currentStreak: number;
  let freezeCount = existing.freeze_count;
  let freezeUsed = false;
  // A broken streak forgets how far past the last freeze award it was —
  // otherwise a learner who breaks a 30-day streak wouldn't earn another
  // freeze until day 37, instead of the normal 7 days into their new one.
  let freezeBaseline = existing.last_freeze_award_streak;

  if (gap === 1) {
    currentStreak = existing.current_streak + 1;
  } else if (gap === 2 && existing.freeze_count > 0) {
    currentStreak = existing.current_streak + 1;
    freezeCount -= 1;
    freezeUsed = true;
  } else {
    currentStreak = 1;
    freezeBaseline = 0;
  }

  let freezeEarned = false;
  if (currentStreak - freezeBaseline >= FREEZE_EARN_INTERVAL_DAYS && freezeCount < MAX_FREEZES) {
    freezeCount += 1;
    freezeBaseline = currentStreak;
    freezeEarned = true;
  }

  const longestStreak = Math.max(existing.longest_streak, currentStreak);

  return {
    streak: {
      profile_id: profileId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: today,
      last_reminder_sent_at: existing.last_reminder_sent_at,
      freeze_count: freezeCount,
      last_freeze_award_streak: freezeBaseline,
      updated_at: new Date().toISOString(),
    },
    freezeUsed,
    freezeEarned,
  };
}

// Advances the streak at most once per calendar day — call this on every
// completed exercise; it's a no-op if today is already recorded.
export async function touchStreak(profileId: string): Promise<Streak> {
  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  const { streak } = computeNextStreak(existing, profileId, todayStr());
  // computeNextStreak returns the very same object back (not a copy) when
  // today was already recorded — that's the no-op signal, so nothing new
  // needs writing.
  if (streak !== existing) {
    await supabase.from("streaks").upsert(streak);
  }
  return streak;
}

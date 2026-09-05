import { supabase } from "@/lib/supabase/browserClient";
import { awardXp } from "@/lib/gamification/xp";
import { touchStreak } from "@/lib/gamification/streaks";
import { checkAndAwardBadges } from "@/lib/gamification/badges";
import { isUserPremium } from "@/lib/subscriptions/subscriptionService";
import { spendHeartOnMistake } from "@/lib/subscriptions/heartsService";
import type { Badge } from "@/types/database";

export interface IdiomAnswerResult {
  isCorrect: boolean;
  xpAwarded: number;
  currentStreak: number;
  newBadges: Badge[];
  heartsRemaining: number | null;
}

const XP_CORRECT = 10;
const XP_ATTEMPT = 2;

// Same XP/streak/badge/heart bookkeeping as recordGameAnswer, minus the SRS
// update — idioms and phrasal verbs live in their own table, not
// vocabulary_items, so there's no SRS queue for them to advance.
export async function recordIdiomAnswer(profileId: string, isCorrect: boolean): Promise<IdiomAnswerResult> {
  const xpAmount = isCorrect ? XP_CORRECT : XP_ATTEMPT;
  const [{ totalXp }, streak, { count }] = await Promise.all([
    awardXp(profileId, isCorrect ? "idiom_correct" : "idiom_attempt", xpAmount),
    touchStreak(profileId),
    supabase
      .from("exercise_attempts")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("is_correct", true),
  ]);

  const newBadges = await checkAndAwardBadges(profileId, {
    totalXp,
    currentStreak: streak.current_streak,
    correctAttemptsCount: count ?? 0,
  });

  let heartsRemaining: number | null = null;
  if (!isCorrect && !(await isUserPremium(profileId))) {
    const hearts = await spendHeartOnMistake(profileId);
    heartsRemaining = hearts.current;
  }

  return {
    isCorrect,
    xpAwarded: xpAmount,
    currentStreak: streak.current_streak,
    newBadges,
    heartsRemaining,
  };
}

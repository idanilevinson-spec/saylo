import { supabase } from "@/lib/supabase/browserClient";
import { updateSrsForVocabularyItem } from "@/lib/srs/queue";
import { awardXp } from "@/lib/gamification/xp";
import { touchStreak } from "@/lib/gamification/streaks";
import { checkAndAwardBadges } from "@/lib/gamification/badges";
import { isUserPremium } from "@/lib/subscriptions/subscriptionService";
import { spendHeartOnMistake } from "@/lib/subscriptions/heartsService";
import type { Badge } from "@/types/database";

export interface GameAnswerResult {
  isCorrect: boolean;
  xpAwarded: number;
  currentStreak: number;
  newBadges: Badge[];
  heartsRemaining: number | null;
}

const XP_CORRECT = 10;
const XP_ATTEMPT = 2;

// Same XP/streak/badge/heart/SRS side-effects as recordAttempt
// (src/lib/exercises/recordAttempt.ts), for the arcade's dynamically
// generated questions (spelling, etc.) that have no backing row in
// exercises/exercise_attempts to grade against. Deliberately does not
// touch skill_levels - that stays driven by real exercise practice,
// not arcade play, so a good arcade streak can't inflate a level the
// learner hasn't actually demonstrated in graded exercises.
export async function recordGameAnswer(
  profileId: string,
  vocabularyItemId: string,
  isCorrect: boolean,
  xpSource: string
): Promise<GameAnswerResult> {
  await updateSrsForVocabularyItem(profileId, vocabularyItemId, isCorrect);

  const xpAmount = isCorrect ? XP_CORRECT : XP_ATTEMPT;
  const [{ totalXp }, streak, { count }] = await Promise.all([
    awardXp(profileId, xpSource, xpAmount),
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

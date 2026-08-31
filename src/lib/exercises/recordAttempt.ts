import { supabase } from "@/lib/supabase/browserClient";
import { gradeExercise } from "./grade";
import { updateSrsForVocabularyItem } from "@/lib/srs/queue";
import { awardXp } from "@/lib/gamification/xp";
import { touchStreak } from "@/lib/gamification/streaks";
import { checkAndAwardBadges } from "@/lib/gamification/badges";
import { isUserPremium } from "@/lib/subscriptions/subscriptionService";
import { spendHeartOnMistake } from "@/lib/subscriptions/heartsService";
import { refreshSkillLevelFromAttempts } from "@/lib/assessment/skillLevel";
import type { Exercise, Badge } from "@/types/database";

export interface AttemptResult {
  isCorrect: boolean;
  xpAwarded: number;
  totalXp: number;
  level: number;
  currentStreak: number;
  newBadges: Badge[];
  heartsRemaining: number | null;
}

const XP_CORRECT = 10;
const XP_ATTEMPT = 2;

export async function recordAttempt(
  profileId: string,
  exercise: Exercise,
  response: Record<string, unknown>
): Promise<AttemptResult> {
  const isCorrect = gradeExercise(exercise.type, exercise.content, response);

  await supabase.from("exercise_attempts").insert({
    profile_id: profileId,
    exercise_id: exercise.id,
    response,
    is_correct: isCorrect,
  });

  if (exercise.type === "mcq" && exercise.vocabulary_item_id) {
    await updateSrsForVocabularyItem(profileId, exercise.vocabulary_item_id, isCorrect);
  }

  // Fire-and-forget: keeps skill_levels current without slowing down the
  // exercise feedback the learner is waiting on.
  void refreshSkillLevelFromAttempts(profileId, exercise.skill_area);

  const xpAmount = isCorrect ? XP_CORRECT : XP_ATTEMPT;
  const [{ totalXp, level }, streak, { count }] = await Promise.all([
    awardXp(profileId, isCorrect ? "exercise_correct" : "exercise_attempt", xpAmount),
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
    totalXp,
    level,
    currentStreak: streak.current_streak,
    newBadges,
    heartsRemaining,
  };
}

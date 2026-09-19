import { updateSrsForVocabularyItem } from "@/lib/srs/queue";
import { runSerially, settleAnswer, XP_ATTEMPT, XP_CORRECT } from "@/lib/gamification/answerTail";
import type { Badge } from "@/types/database";

export interface GameAnswerResult {
  isCorrect: boolean;
  xpAwarded: number;
  currentStreak: number;
  newBadges: Badge[];
  heartsRemaining: number | null;
  repetitions: number;
}

// Same XP/streak/badge/heart/SRS side-effects as recordAttempt
// (src/lib/exercises/recordAttempt.ts), for the arcade's dynamically
// generated questions (spelling, etc.) that have no backing row in
// exercises/exercise_attempts to grade against. Deliberately does not
// touch skill_levels - that stays driven by real exercise practice,
// not arcade play, so a good arcade streak can't inflate a level the
// learner hasn't actually demonstrated in graded exercises.
export function recordGameAnswer(
  profileId: string,
  vocabularyItemId: string,
  isCorrect: boolean,
  xpSource: string
): Promise<GameAnswerResult> {
  return runSerially(async () => {
    const [srsResult, tail] = await Promise.all([
      updateSrsForVocabularyItem(profileId, vocabularyItemId, isCorrect),
      settleAnswer(profileId, { isCorrect, xpSource }),
    ]);

    return {
      isCorrect,
      xpAwarded: isCorrect ? XP_CORRECT : XP_ATTEMPT,
      currentStreak: tail.currentStreak,
      newBadges: tail.newBadges,
      heartsRemaining: tail.heartsRemaining,
      repetitions: srsResult.repetitions,
    };
  });
}

import { runSerially, settleAnswer, XP_ATTEMPT, XP_CORRECT } from "@/lib/gamification/answerTail";
import type { Badge } from "@/types/database";

export interface IdiomAnswerResult {
  isCorrect: boolean;
  xpAwarded: number;
  currentStreak: number;
  newBadges: Badge[];
  heartsRemaining: number | null;
}

// Same XP/streak/badge/heart bookkeeping as recordGameAnswer, minus the SRS
// update — idioms and phrasal verbs live in their own table, not
// vocabulary_items, so there's no SRS queue for them to advance.
export function recordIdiomAnswer(profileId: string, isCorrect: boolean): Promise<IdiomAnswerResult> {
  return runSerially(async () => {
    const tail = await settleAnswer(profileId, {
      isCorrect,
      xpSource: isCorrect ? "idiom_correct" : "idiom_attempt",
    });

    return {
      isCorrect,
      xpAwarded: isCorrect ? XP_CORRECT : XP_ATTEMPT,
      currentStreak: tail.currentStreak,
      newBadges: tail.newBadges,
      heartsRemaining: tail.heartsRemaining,
    };
  });
}

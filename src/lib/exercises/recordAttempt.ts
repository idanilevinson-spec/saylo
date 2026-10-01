import { supabase } from "@/lib/supabase/browserClient";
import { gradeExercise } from "./grade";
import { updateSrsForVocabularyItem } from "@/lib/srs/queue";
import { touchMistakeReviewItem } from "@/lib/mistakes/mistakeReview";
import { runSerially, settleAnswer, XP_ATTEMPT, XP_CORRECT } from "@/lib/gamification/answerTail";
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

export interface AttemptStart {
  // Known the instant the learner answers: grading is a pure local check.
  isCorrect: boolean;
  xpAwarded: number;
  // Everything that needs the network (attempt row, SRS, XP, streak, badges,
  // hearts). Screens should show the verdict from the fields above right away
  // and fill in the rest from this when it settles — never make the learner
  // wait on it to see whether they were right.
  done: Promise<AttemptResult>;
}

export function startAttempt(
  profileId: string,
  exercise: Exercise,
  response: Record<string, unknown>
): AttemptStart {
  const isCorrect = gradeExercise(exercise.type, exercise.content, response);
  const xpAwarded = isCorrect ? XP_CORRECT : XP_ATTEMPT;

  const done = runSerially(async (): Promise<AttemptResult> => {
    const attemptWritten = Promise.resolve(
      supabase.from("exercise_attempts").insert({
        profile_id: profileId,
        exercise_id: exercise.id,
        response,
        is_correct: isCorrect,
      })
    );

    // Keeps skill_levels current; reads the attempts, so it waits for the
    // insert, and nothing downstream waits for it.
    void attemptWritten
      .then(() => refreshSkillLevelFromAttempts(profileId, exercise.skill_area))
      .catch(() => undefined);

    const srsUpdate =
      exercise.type === "mcq" && exercise.vocabulary_item_id
        ? updateSrsForVocabularyItem(profileId, exercise.vocabulary_item_id, isCorrect)
        : Promise.resolve(null);

    // Unlike vocabulary SRS above, this covers every exercise type on a
    // grammar topic (not just mcq), and only ever starts tracking a topic
    // once it's actually been gotten wrong — see mistakeReview.ts.
    const mistakeUpdate = exercise.grammar_topic_id
      ? touchMistakeReviewItem(profileId, "grammar_topic", exercise.grammar_topic_id, isCorrect)
      : Promise.resolve();

    const [tail] = await Promise.all([
      settleAnswer(profileId, {
        isCorrect,
        xpSource: isCorrect ? "exercise_correct" : "exercise_attempt",
        attemptWritten,
      }),
      srsUpdate,
      mistakeUpdate,
      attemptWritten,
    ]);

    return { isCorrect, ...tail };
  });

  return { isCorrect, xpAwarded, done };
}

// For callers that genuinely need the full result before continuing.
export function recordAttempt(
  profileId: string,
  exercise: Exercise,
  response: Record<string, unknown>
): Promise<AttemptResult> {
  return startAttempt(profileId, exercise, response).done;
}

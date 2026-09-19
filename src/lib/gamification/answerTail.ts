import { supabase } from "@/lib/supabase/browserClient";
import { awardXp } from "@/lib/gamification/xp";
import { touchStreak } from "@/lib/gamification/streaks";
import { checkAndAwardBadges } from "@/lib/gamification/badges";
import { isUserPremium } from "@/lib/subscriptions/subscriptionService";
import { spendHeartOnMistake } from "@/lib/subscriptions/heartsService";
import type { Badge } from "@/types/database";

export const XP_CORRECT = 10;
export const XP_ATTEMPT = 2;

// Answer bookkeeping (XP, streak, hearts, SRS) is a read-modify-write on a
// handful of rows. Screens now show the verdict before this finishes, so the
// next answer can arrive while the previous one is still saving — two
// overlapping read-modify-writes would silently lose XP. Running every
// answer's bookkeeping through one queue keeps them strictly in order.
let queueTail: Promise<unknown> = Promise.resolve();

export function runSerially<T>(task: () => Promise<T>): Promise<T> {
  const run = queueTail.then(task, task);
  queueTail = run.catch(() => undefined);
  return run;
}

export interface AnswerTailResult {
  xpAwarded: number;
  totalXp: number;
  level: number;
  currentStreak: number;
  newBadges: Badge[];
  heartsRemaining: number | null;
}

interface SettleOptions {
  isCorrect: boolean;
  xpSource: string;
  // Resolves once this answer's own attempt row is written (only exercises
  // have one). The correct-answer count feeds the "N correct answers" badges,
  // so it must be read after that insert lands, not alongside it.
  attemptWritten?: Promise<unknown>;
}

// The XP / streak / badge / heart side-effects shared by every kind of
// answered question. Everything that doesn't depend on another step runs in
// one round trip instead of a chain of them.
export async function settleAnswer(profileId: string, options: SettleOptions): Promise<AnswerTailResult> {
  const { isCorrect, xpSource, attemptWritten } = options;
  const xpAwarded = isCorrect ? XP_CORRECT : XP_ATTEMPT;

  const correctCountPromise = Promise.resolve(attemptWritten).then(async () => {
    const { count } = await supabase
      .from("exercise_attempts")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("is_correct", true);
    return count ?? 0;
  });

  // Only a wrong answer can cost a heart, and only for non-premium users.
  const isPremiumPromise = isCorrect ? Promise.resolve(true) : isUserPremium(profileId);

  const [{ totalXp, level }, streak, correctAttemptsCount, premium] = await Promise.all([
    awardXp(profileId, xpSource, xpAwarded),
    touchStreak(profileId),
    correctCountPromise,
    isPremiumPromise,
  ]);

  const [newBadges, hearts] = await Promise.all([
    checkAndAwardBadges(profileId, {
      totalXp,
      currentStreak: streak.current_streak,
      correctAttemptsCount,
    }),
    !isCorrect && !premium ? spendHeartOnMistake(profileId) : Promise.resolve(null),
  ]);

  return {
    xpAwarded,
    totalXp,
    level,
    currentStreak: streak.current_streak,
    newBadges,
    heartsRemaining: hearts ? hearts.current : null,
  };
}

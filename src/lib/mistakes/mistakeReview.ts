import { supabase } from "@/lib/supabase/browserClient";
import { sm2, SM2_INITIAL_STATE, nextDueDate } from "@/lib/srs/sm2";
import type { MistakeItemType } from "@/types/database";

export interface MistakeReviewState {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
}

interface ExistingMistakeState {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}

// Pure — no I/O — so this is fully unit-testable, same pattern as
// computeNextStreak. Unlike vocabulary SRS (where every answer, right or
// wrong, updates the schedule), a topic only ENTERS this queue via a wrong
// answer: a correct answer on a topic that was never gotten wrong isn't a
// "mistake" to track, so it's a no-op (returns null) rather than starting a
// row. Once a row exists, both right and wrong answers keep advancing it —
// a run of correct answers is what graduates a topic out of the queue.
export function computeNextMistakeReviewState(
  existing: ExistingMistakeState | null,
  correct: boolean,
  now: Date = new Date()
): MistakeReviewState | null {
  if (!existing && correct) return null;

  const state = existing
    ? { easeFactor: existing.ease_factor, intervalDays: existing.interval_days, repetitions: existing.repetitions }
    : SM2_INITIAL_STATE;
  const next = sm2(state, correct);

  return {
    ease_factor: next.easeFactor,
    interval_days: next.intervalDays,
    repetitions: next.repetitions,
    due_at: nextDueDate(next.intervalDays, now).toISOString(),
  };
}

// Call this on every answered exercise that has a trackable item — see
// recordAttempt.ts. A no-op (no read, no write) whenever
// computeNextMistakeReviewState says there's nothing to start tracking yet.
export async function touchMistakeReviewItem(
  profileId: string,
  itemType: MistakeItemType,
  itemRef: string,
  correct: boolean
): Promise<void> {
  const { data: existing } = await supabase
    .from("mistake_review_items")
    .select("ease_factor, interval_days, repetitions")
    .eq("profile_id", profileId)
    .eq("item_type", itemType)
    .eq("item_ref", itemRef)
    .maybeSingle();

  const next = computeNextMistakeReviewState(existing, correct);
  if (!next) return;

  await supabase.from("mistake_review_items").upsert(
    {
      profile_id: profileId,
      item_type: itemType,
      item_ref: itemRef,
      ...next,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,item_type,item_ref" }
  );
}

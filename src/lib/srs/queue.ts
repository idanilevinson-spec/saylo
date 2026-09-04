import { supabase } from "@/lib/supabase/browserClient";
import { shuffle } from "@/lib/utils/shuffle";
import { sm2, SM2_INITIAL_STATE, nextDueDate } from "./sm2";
import type { Exercise } from "@/types/database";

export interface SrsUpdateResult {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
}

export async function updateSrsForVocabularyItem(
  profileId: string,
  vocabularyItemId: string,
  correct: boolean
): Promise<SrsUpdateResult> {
  const { data: existing } = await supabase
    .from("srs_items")
    .select("*")
    .eq("profile_id", profileId)
    .eq("vocabulary_item_id", vocabularyItemId)
    .maybeSingle();

  const state = existing
    ? { easeFactor: existing.ease_factor, intervalDays: existing.interval_days, repetitions: existing.repetitions }
    : SM2_INITIAL_STATE;

  const next = sm2(state, correct);
  const dueAt = nextDueDate(next.intervalDays).toISOString();

  const { data: upserted } = await supabase
    .from("srs_items")
    .upsert(
      {
        profile_id: profileId,
        vocabulary_item_id: vocabularyItemId,
        ease_factor: next.easeFactor,
        interval_days: next.intervalDays,
        repetitions: next.repetitions,
        due_at: dueAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,vocabulary_item_id" }
    )
    .select()
    .single();

  if (upserted) {
    await supabase.from("srs_review_log").insert({ srs_item_id: upserted.id, grade: correct ? 5 : 2 });
  }

  return next;
}

export interface DueReviewItem {
  vocabularyItemId: string;
  headword: string;
  translationHe: string;
  exercise: Exercise;
}

// Today's review queue: SRS-due words first, topped up with never-reviewed
// words up to `limit` — matches the spec's "N due + M new" daily review.
export async function getDailyReview(profileId: string, limit = 20): Promise<DueReviewItem[]> {
  const nowIso = new Date().toISOString();

  // The three lookups below only ever depend on profileId/status, never
  // on each other's results, so they can all fire in one round trip
  // instead of three sequential ones — this fetch reruns on every
  // "play again" click, so the latency compounds directly into how long
  // that click feels.
  const [{ data: dueSrs }, { data: allSrs }, { data: candidates }] = await Promise.all([
    supabase
      .from("srs_items")
      .select("vocabulary_item_id")
      .eq("profile_id", profileId)
      .lte("due_at", nowIso)
      .order("due_at")
      .limit(limit),
    supabase.from("srs_items").select("vocabulary_item_id").eq("profile_id", profileId),
    supabase.from("vocabulary_items").select("id").eq("status", "published").order("sort_order").limit(200),
  ]);

  const dueIds = (dueSrs ?? []).map((d) => d.vocabulary_item_id);
  const remaining = limit - dueIds.length;

  let newIds: string[] = [];
  if (remaining > 0) {
    const knownIds = new Set((allSrs ?? []).map((s) => s.vocabulary_item_id));
    newIds = (candidates ?? []).map((c) => c.id).filter((id) => !knownIds.has(id)).slice(0, remaining);
  }

  const allIds = [...dueIds, ...newIds];
  if (allIds.length === 0) return [];

  const [{ data: items }, { data: exercises }] = await Promise.all([
    supabase.from("vocabulary_items").select("id, headword, translation_he").in("id", allIds),
    supabase
      .from("exercises")
      .select("*")
      .eq("type", "mcq")
      .eq("status", "published")
      .in("vocabulary_item_id", allIds),
  ]);

  const exerciseByItem = new Map((exercises ?? []).map((e) => [e.vocabulary_item_id as string, e]));

  const resolved = (items ?? [])
    .map((item): DueReviewItem | null => {
      const exercise = exerciseByItem.get(item.id);
      if (!exercise) return null;
      return {
        vocabularyItemId: item.id,
        headword: item.headword,
        translationHe: item.translation_he,
        exercise,
      };
    })
    .filter((x): x is DueReviewItem => x !== null);

  // Due items come back ordered by due_at and new items by sort_order —
  // without shuffling, replaying a game in the same sitting would show
  // the same words in the same sequence every time.
  return shuffle(resolved);
}

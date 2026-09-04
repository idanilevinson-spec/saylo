import { supabase } from "@/lib/supabase/browserClient";
import { shuffle } from "@/lib/utils/shuffle";

// Mastery is derived entirely from srs_items.repetitions (SM-2, see
// src/lib/srs/sm2.ts) rather than a new parallel field — it already
// increments on a correct answer and resets to 0 on a wrong one, which
// is exactly the escalate/de-escalate behavior Learn Mode needs.
export type MasteryTier = "new" | "learning" | "familiar" | "mastered";

export function masteryTier(repetitions: number): MasteryTier {
  if (repetitions === 0) return "new";
  if (repetitions === 1) return "learning";
  if (repetitions <= 3) return "familiar";
  return "mastered";
}

// New/weak words stay at recognition (multiple choice); once a word has
// survived two spaced intervals (1 day, then 6 days) it graduates to
// production (typed recall) — a real step up in difficulty, not just a
// different UI for the same task.
export function questionTypeForTier(tier: MasteryTier): "mcq" | "recall" {
  return tier === "new" || tier === "learning" ? "mcq" : "recall";
}

export interface LearnItem {
  vocabularyItemId: string;
  headword: string;
  translationHe: string;
  repetitions: number;
}

export interface McqLearnQuestion {
  type: "mcq";
  item: LearnItem;
  options: string[];
  correctIndex: number;
}

export interface RecallLearnQuestion {
  type: "recall";
  item: LearnItem;
}

export type LearnQuestion = McqLearnQuestion | RecallLearnQuestion;

export function buildLearnQuestion(item: LearnItem, pool: LearnItem[]): LearnQuestion {
  const tier = masteryTier(item.repetitions);
  if (questionTypeForTier(tier) === "recall") {
    return { type: "recall", item };
  }
  const distractors = shuffle(pool.filter((p) => p.vocabularyItemId !== item.vocabularyItemId))
    .slice(0, 3)
    .map((p) => p.headword);
  const options = shuffle([item.headword, ...distractors]);
  return { type: "mcq", item, options, correctIndex: options.indexOf(item.headword) };
}

// Same "SRS-due first, then never-reviewed" prioritization as
// getDailyReview (src/lib/srs/queue.ts), optionally scoped to one topic —
// but without getDailyReview's requirement that a word already have a
// backing MCQ exercises row, since Learn Mode generates its own
// questions client-side and every published word is eligible.
export async function getLearnPool(profileId: string, topicId?: string, limit = 12): Promise<LearnItem[]> {
  let itemsQuery = supabase.from("vocabulary_items").select("id, headword, translation_he").eq("status", "published");
  if (topicId) itemsQuery = itemsQuery.eq("topic_id", topicId);
  const { data: candidates } = await itemsQuery.order("sort_order").limit(500);
  const pool = candidates ?? [];
  if (pool.length === 0) return [];

  const poolIds = pool.map((p) => p.id);

  const { data: srsRows } = await supabase
    .from("srs_items")
    .select("vocabulary_item_id, repetitions, due_at")
    .eq("profile_id", profileId)
    .in("vocabulary_item_id", poolIds);

  const srsByItem = new Map((srsRows ?? []).map((r) => [r.vocabulary_item_id, r]));
  const nowIso = new Date().toISOString();

  const due = pool.filter((p) => {
    const srs = srsByItem.get(p.id);
    return srs && srs.due_at <= nowIso;
  });
  const neverReviewed = pool.filter((p) => !srsByItem.has(p.id));

  const dueIds = new Set(due.map((p) => p.id));
  const selected = [...due, ...shuffle(neverReviewed.filter((p) => !dueIds.has(p.id)))].slice(0, limit);

  return shuffle(
    selected.map((item) => ({
      vocabularyItemId: item.id,
      headword: item.headword,
      translationHe: item.translation_he,
      repetitions: srsByItem.get(item.id)?.repetitions ?? 0,
    }))
  );
}

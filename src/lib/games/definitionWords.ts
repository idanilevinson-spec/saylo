import { supabase } from "@/lib/supabase/browserClient";
import { fetchAll } from "@/lib/supabase/fetchAll";
import { shuffle } from "@/lib/utils/shuffle";

export interface DefinitionGameItem {
  vocabularyItemId: string;
  headword: string;
  translationHe: string;
  definitionEn: string;
  exampleEn: string | null;
  ipa: string | null;
  partOfSpeech: string | null;
  options: string[];
  correctIndex: number;
}

// Same "SRS-due first, then new" prioritization as getDailyReview
// (src/lib/srs/queue.ts), scoped to words that actually have a
// definition_en - the definition game can only ever be as big as the
// authored-definitions batch, which starts with the original A1 core
// vocabulary (see seed 018) and grows from there.
export async function getDefinitionGameWords(profileId: string, limit = 10): Promise<DefinitionGameItem[]> {
  const { data: defined } = await supabase
    .from("vocabulary_items")
    .select("id, headword, translation_he, definition_en, example_en, ipa, part_of_speech")
    .not("definition_en", "is", null)
    .eq("status", "published");

  const pool = defined ?? [];
  if (pool.length < 4) return []; // not enough words to build 4-option MCQs

  const poolIds = new Set(pool.map((p) => p.id));

  // Both queries only depend on profileId, not on each other, so they
  // run together instead of one-after-the-other — this fetch reruns on
  // every "play again" click.
  // One read of this learner's review rows, filtered here. The due list
  // used to pass every pool id to .in(): that goes into the request URL and
  // fails past about 400 ids, which the pool (every defined word) exceeds.
  const { data: allSrs } = await fetchAll((from, to) =>
    supabase
      .from("srs_items")
      .select("vocabulary_item_id, due_at")
      .eq("profile_id", profileId)
      .order("vocabulary_item_id")
      .range(from, to),
  );
  const nowIso = new Date().toISOString();
  const dueIds = allSrs
    .filter((s) => poolIds.has(s.vocabulary_item_id) && s.due_at <= nowIso)
    .sort((a, b) => a.due_at.localeCompare(b.due_at))
    .slice(0, limit)
    .map((d) => d.vocabulary_item_id);
  const remaining = limit - dueIds.length;

  let extraIds: string[] = [];
  if (remaining > 0) {
    const knownIds = new Set((allSrs ?? []).map((s) => s.vocabulary_item_id));
    extraIds = shuffle(pool.map((p) => p.id).filter((id) => !knownIds.has(id) && !dueIds.includes(id))).slice(0, remaining);
  }

  // Shuffled so due items (always listed due_at-ascending) don't show up
  // in the same order every time this game is replayed in one sitting.
  const selectedIds = shuffle([...dueIds, ...extraIds]).slice(0, limit);
  const byId = new Map(pool.map((p) => [p.id, p]));

  return selectedIds
    .map((id) => byId.get(id))
    .filter((item): item is NonNullable<typeof item> => !!item)
    .map((item): DefinitionGameItem => {
      const distractorPool = pool.filter((p) => p.id !== item.id);
      const distractors = shuffle(distractorPool).slice(0, 3).map((p) => p.headword);
      const correctIndex = Math.floor(Math.random() * 4);
      const options: string[] = [];
      let di = 0;
      for (let i = 0; i < 4; i++) {
        options.push(i === correctIndex ? item.headword : distractors[di++]);
      }
      return {
        vocabularyItemId: item.id,
        headword: item.headword,
        translationHe: item.translation_he,
        definitionEn: item.definition_en as string,
        exampleEn: item.example_en ?? null,
        ipa: item.ipa ?? null,
        partOfSpeech: item.part_of_speech ?? null,
        options,
        correctIndex,
      };
    });
}

import { supabase } from "@/lib/supabase/browserClient";

export interface DefinitionGameItem {
  vocabularyItemId: string;
  headword: string;
  translationHe: string;
  definitionEn: string;
  options: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Same "SRS-due first, then new" prioritization as getDailyReview
// (src/lib/srs/queue.ts), scoped to words that actually have a
// definition_en - the definition game can only ever be as big as the
// authored-definitions batch, which starts with the original A1 core
// vocabulary (see seed 018) and grows from there.
export async function getDefinitionGameWords(profileId: string, limit = 10): Promise<DefinitionGameItem[]> {
  const { data: defined } = await supabase
    .from("vocabulary_items")
    .select("id, headword, translation_he, definition_en")
    .not("definition_en", "is", null)
    .eq("status", "published");

  const pool = defined ?? [];
  if (pool.length < 4) return []; // not enough words to build 4-option MCQs

  const poolIds = new Set(pool.map((p) => p.id));

  const { data: dueSrs } = await supabase
    .from("srs_items")
    .select("vocabulary_item_id")
    .eq("profile_id", profileId)
    .in("vocabulary_item_id", [...poolIds])
    .lte("due_at", new Date().toISOString())
    .order("due_at")
    .limit(limit);

  const dueIds = (dueSrs ?? []).map((d) => d.vocabulary_item_id);
  const remaining = limit - dueIds.length;

  let extraIds: string[] = [];
  if (remaining > 0) {
    const { data: allSrs } = await supabase.from("srs_items").select("vocabulary_item_id").eq("profile_id", profileId);
    const knownIds = new Set((allSrs ?? []).map((s) => s.vocabulary_item_id));
    extraIds = shuffle(pool.map((p) => p.id).filter((id) => !knownIds.has(id) && !dueIds.includes(id))).slice(0, remaining);
  }

  const selectedIds = [...dueIds, ...extraIds].slice(0, limit);
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
        options,
        correctIndex,
      };
    });
}

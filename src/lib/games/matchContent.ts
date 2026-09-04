import { supabase } from "@/lib/supabase/browserClient";
import { getDailyReview } from "@/lib/srs/queue";
import { shuffle } from "@/lib/utils/shuffle";

export type MatchRoundType = "translation" | "opposites" | "sentences";

export interface MatchPair {
  id: string;
  /** Always English — shown in the right-hand ("source") column. */
  source: string;
  /** What it pairs with — Hebrew translation, English opposite, or a
   *  blanked example sentence, depending on round type. */
  target: string;
}

// Same word source as Speed Round / Spelling Challenge (SRS-due first,
// topped up with new words) — a word only shows up here if it also has
// a backing MCQ exercise, same constraint those games already accept.
async function getTranslationPairs(profileId: string, count: number): Promise<MatchPair[]> {
  const items = await getDailyReview(profileId, count);
  return items.slice(0, count).map((i) => ({ id: i.vocabularyItemId, source: i.headword, target: i.translationHe }));
}

async function getOppositePairs(count: number): Promise<MatchPair[]> {
  const { data } = await supabase
    .from("vocabulary_antonym_pairs")
    .select("id, word_en, opposite_en")
    .eq("status", "published");
  return shuffle(data ?? [])
    .slice(0, count)
    .map((p) => ({ id: p.id, source: p.word_en, target: p.opposite_en }));
}

function blankWord(sentence: string, word: string): string {
  const re = new RegExp(`\\b${word}\\b`, "i");
  return sentence.replace(re, "____");
}

async function getSentencePairs(count: number): Promise<MatchPair[]> {
  const { data } = await supabase
    .from("vocabulary_items")
    .select("id, headword, example_en")
    .eq("status", "published");
  // Long sentences don't fit the two-column card layout well, so this
  // round sticks to ones short enough to read as a single line.
  const pool = (data ?? []).filter((p) => p.example_en.length <= 70);
  return shuffle(pool)
    .slice(0, count)
    .map((p) => ({ id: p.id, source: p.headword, target: blankWord(p.example_en, p.headword) }));
}

export async function getMatchPairs(
  type: MatchRoundType,
  profileId: string,
  count: number
): Promise<MatchPair[]> {
  if (type === "translation") return getTranslationPairs(profileId, count);
  if (type === "opposites") return getOppositePairs(count);
  return getSentencePairs(count);
}

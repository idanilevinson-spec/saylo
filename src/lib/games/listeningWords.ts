import { getDailyReview, type DueReviewItem } from "@/lib/srs/queue";
import { shuffle } from "@/lib/utils/shuffle";

// "Listen and choose": the word is only heard, never shown, until the
// answer. Two kinds of question alternate, so one round trains both
// sides of listening:
//   meaning  — hear it, pick the Hebrew translation
//   spelling — hear it, pick how it's written among look-alike words
export type ListeningMode = "meaning" | "spelling";

export interface ListeningItem {
  vocabularyItemId: string;
  headword: string;
  translationHe: string;
  exampleEn: string | null;
  ipa: string | null;
  partOfSpeech: string | null;
  mode: ListeningMode;
  options: string[];
  correctIndex: number;
}

type WordLike = Pick<DueReviewItem, "vocabularyItemId" | "headword" | "translationHe">;

// How alike two written words look: a shared first letter and a close
// length make a spelling distractor that actually needs listening, not
// one you can rule out at a glance.
function lookAlikeScore(a: string, b: string): number {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  let score = 0;
  if (x[0] === y[0]) score += 2;
  if (x.slice(-2) === y.slice(-2)) score += 1;
  score -= Math.abs(x.length - y.length) * 0.5;
  return score;
}

export function buildListeningItems<T extends WordLike & Partial<DueReviewItem>>(
  words: T[],
  pool: WordLike[],
  random: () => number = Math.random,
): ListeningItem[] {
  return words.map((word, i) => {
    const mode: ListeningMode = i % 2 === 0 ? "meaning" : "spelling";
    const others = pool.filter((p) => p.vocabularyItemId !== word.vocabularyItemId);
    let distractors: string[];
    if (mode === "meaning") {
      const seen = new Set([word.translationHe]);
      distractors = [];
      for (const p of shuffle(others)) {
        if (seen.has(p.translationHe)) continue;
        seen.add(p.translationHe);
        distractors.push(p.translationHe);
        if (distractors.length === 3) break;
      }
    } else {
      const seen = new Set([word.headword.toLowerCase()]);
      distractors = [];
      // Best look-alikes first; ties broken randomly so a replay differs.
      const ranked = others
        .map((p) => ({ w: p.headword, s: lookAlikeScore(word.headword, p.headword) + random() * 0.9 }))
        .sort((a, b) => b.s - a.s);
      for (const { w } of ranked) {
        if (seen.has(w.toLowerCase())) continue;
        seen.add(w.toLowerCase());
        distractors.push(w);
        if (distractors.length === 3) break;
      }
    }
    const correct = mode === "meaning" ? word.translationHe : word.headword;
    const correctIndex = Math.floor(random() * (distractors.length + 1));
    const options = [...distractors];
    options.splice(correctIndex, 0, correct);
    return {
      vocabularyItemId: word.vocabularyItemId,
      headword: word.headword,
      translationHe: word.translationHe,
      exampleEn: word.exampleEn ?? null,
      ipa: word.ipa ?? null,
      partOfSpeech: word.partOfSpeech ?? null,
      mode,
      options,
      correctIndex,
    };
  });
}

// The words due for review (then new ones), as getDailyReview picks them;
// the wider queue doubles as the distractor pool.
export async function getListeningGameWords(profileId: string, roundSize = 10): Promise<ListeningItem[]> {
  const queue = await getDailyReview(profileId, Math.max(roundSize * 3, 30));
  if (queue.length < 4) return [];
  return buildListeningItems(queue.slice(0, roundSize), queue);
}

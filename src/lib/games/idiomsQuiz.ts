import type { CefrLevel, IdiomPhrasalVerb } from "@/types/database";
import { shuffle } from "@/lib/utils/shuffle";
import { CEFR_ORDER } from "@/lib/assessment/cefrScoring";

export interface IdiomQuizQuestion {
  id: string;
  promptHe: string;
  exampleEn: string;
  options: string[];
  correctIndex: number;
}

// How far an idiom's level is from the learner's: their level and the one
// below count as 0, then the further away the larger.
function distanceFrom(level: CefrLevel | null) {
  if (!level) return () => 0;
  const at = CEFR_ORDER.indexOf(level);
  return (item: IdiomPhrasalVerb) => {
    const d = CEFR_ORDER.indexOf(item.cefr_level) - at;
    return d === 0 || d === -1 ? 0 : Math.abs(d) + 1;
  };
}

// Questions come from the learner's level and the one below first (a C2
// learner was being asked "in the long run", B1, next to A2 options), and
// the nearest levels fill in if those run out. Distractors are drawn from
// other entries of the same type (phrasal verbs mixed only with phrasal
// verbs, idioms only with idioms), also nearest in level, so every option
// is plausible instead of obviously out of place.
export function buildIdiomsQuiz(all: IdiomPhrasalVerb[], length: number, level: CefrLevel | null = null): IdiomQuizQuestion[] {
  const distance = distanceFrom(level);
  const byLevel = (items: IdiomPhrasalVerb[]) =>
    shuffle(items)
      .map((item, i) => ({ item, i }))
      .sort((a, b) => distance(a.item) - distance(b.item) || a.i - b.i)
      .map(({ item }) => item);

  const pool = byLevel(all).slice(0, Math.min(length, all.length));

  return shuffle(pool).map((item) => {
    const sameType = all.filter((x) => x.type === item.type && x.id !== item.id);
    const distractors = byLevel(sameType)
      .slice(0, 3)
      .map((x) => x.phrase);
    const options = shuffle([item.phrase, ...distractors]);

    return {
      id: item.id,
      promptHe: item.meaning_he,
      exampleEn: item.example_en,
      options,
      correctIndex: options.indexOf(item.phrase),
    };
  });
}

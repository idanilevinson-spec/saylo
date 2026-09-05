import type { IdiomPhrasalVerb } from "@/types/database";
import { shuffle } from "@/lib/utils/shuffle";

export interface IdiomQuizQuestion {
  id: string;
  promptHe: string;
  exampleEn: string;
  options: string[];
  correctIndex: number;
}

// Distractors are drawn from other entries of the same type (phrasal verbs
// mixed only with phrasal verbs, idioms only with idioms) so every option
// is at least plausible instead of obviously out of place.
export function buildIdiomsQuiz(all: IdiomPhrasalVerb[], length: number): IdiomQuizQuestion[] {
  const pool = shuffle(all).slice(0, Math.min(length, all.length));

  return pool.map((item) => {
    const sameType = all.filter((x) => x.type === item.type && x.id !== item.id);
    const distractors = shuffle(sameType)
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

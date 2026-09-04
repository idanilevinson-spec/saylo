import { shuffle } from "@/lib/utils/shuffle";

export interface VocabularyItemLite {
  id: string;
  headword: string;
  translation_he: string;
}

export type TestStep =
  | { type: "mcq"; vocabularyItemId: string; promptHe: string; options: string[]; correctIndex: number }
  | { type: "recall"; vocabularyItemId: string; translationHe: string; correctAnswer: string }
  | { type: "truefalse"; vocabularyItemId: string; headword: string; shownTranslationHe: string; isActuallyCorrect: boolean };

const MCQ_COUNT = 6;
const RECALL_COUNT = 3;
const TRUEFALSE_COUNT = 3;

// A single bundled practice test mixing three question types in one
// sitting, generated client-side straight from vocabulary_items — the
// same "no pre-authored exercises row needed" approach as Learn Mode and
// the existing arcade games (Definition, Match). Deliberately excludes a
// drag-matching step (unlike Quizlet's Test): reimplementing Match's
// pointer-drag interaction inside a linear, review-at-the-end flow would
// add real complexity for something the true/false format already
// covers pedagogically (recognizing a correct vs. incorrect pairing).
export function buildVocabTest(items: VocabularyItemLite[], length = MCQ_COUNT + RECALL_COUNT + TRUEFALSE_COUNT): TestStep[] {
  const pool = shuffle(items);
  const scale = length / (MCQ_COUNT + RECALL_COUNT + TRUEFALSE_COUNT);
  const mcqCount = Math.min(pool.length, Math.max(1, Math.round(MCQ_COUNT * scale)));
  const recallCount = Math.min(pool.length - mcqCount, Math.max(1, Math.round(RECALL_COUNT * scale)));
  const remaining = pool.length - mcqCount - recallCount;
  const truefalseCount = Math.max(0, Math.min(remaining, TRUEFALSE_COUNT));

  let cursor = 0;
  const mcqItems = pool.slice(cursor, cursor + mcqCount);
  cursor += mcqCount;
  const recallItems = pool.slice(cursor, cursor + recallCount);
  cursor += recallCount;
  const truefalseItems = pool.slice(cursor, cursor + truefalseCount);

  const steps: TestStep[] = [];

  for (const item of mcqItems) {
    const distractors = shuffle(pool.filter((p) => p.id !== item.id))
      .slice(0, 3)
      .map((p) => p.headword);
    const options = shuffle([item.headword, ...distractors]);
    steps.push({
      type: "mcq",
      vocabularyItemId: item.id,
      promptHe: item.translation_he,
      options,
      correctIndex: options.indexOf(item.headword),
    });
  }

  for (const item of recallItems) {
    steps.push({
      type: "recall",
      vocabularyItemId: item.id,
      translationHe: item.translation_he,
      correctAnswer: item.headword,
    });
  }

  for (const item of truefalseItems) {
    const isActuallyCorrect = Math.random() < 0.5;
    const shownTranslationHe = isActuallyCorrect
      ? item.translation_he
      : (shuffle(pool.filter((p) => p.id !== item.id))[0]?.translation_he ?? item.translation_he);
    steps.push({
      type: "truefalse",
      vocabularyItemId: item.id,
      headword: item.headword,
      shownTranslationHe,
      isActuallyCorrect,
    });
  }

  return shuffle(steps);
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function gradeTestStep(step: TestStep, response: unknown): boolean {
  if (step.type === "mcq") {
    return typeof response === "number" && response === step.correctIndex;
  }
  if (step.type === "recall") {
    return typeof response === "string" && normalize(response) === normalize(step.correctAnswer);
  }
  return typeof response === "boolean" && response === step.isActuallyCorrect;
}

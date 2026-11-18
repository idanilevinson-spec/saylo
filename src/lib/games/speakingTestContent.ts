import { normalizeWordAnswer } from "./answerNormalize";
import { shuffle } from "@/lib/utils/shuffle";
import type { VocabularyItemLite } from "@/lib/games/testContent";

export interface OpenSpeakingQuestion {
  questionEn: string;
  modelAnswerEn: string;
}

export type SpeakingTestStep =
  | { type: "vocab"; vocabularyItemId: string; promptHe: string; expectedAnswer: string }
  | { type: "open"; questionEn: string; modelAnswerEn: string };

const VOCAB_COUNT = 7;
const OPEN_COUNT = 3;

// Every question answered by speaking into the mic — mixes vocabulary
// recall (say the English word for a shown Hebrew word) with open-ended
// spoken answers (AI-graded), same "bundled test" spirit as
// buildVocabTest but every step is voice-driven instead of click/type.
// Each open question carries its own model answer (there's no single
// "correct" answer to an open question, so this is what a skip reveals
// instead — see SpeakingTest.tsx's skipStep()).
export function buildSpeakingTest(
  items: VocabularyItemLite[],
  openQuestions: OpenSpeakingQuestion[]
): SpeakingTestStep[] {
  const vocabCount = Math.min(items.length, VOCAB_COUNT);
  const vocabItems = shuffle(items).slice(0, vocabCount);
  const openCount = Math.min(openQuestions.length, OPEN_COUNT);
  const openItems = shuffle(openQuestions).slice(0, openCount);

  const steps: SpeakingTestStep[] = [
    ...vocabItems.map(
      (item): SpeakingTestStep => ({
        type: "vocab",
        vocabularyItemId: item.id,
        promptHe: item.translation_he,
        expectedAnswer: item.headword,
      })
    ),
    ...openItems.map(
      ({ questionEn, modelAnswerEn }): SpeakingTestStep => ({ type: "open", questionEn, modelAnswerEn })
    ),
  ];

  return shuffle(steps);
}

// Speech recognition writes spoken numbers as digits ("eleven" -> "11",
// "first" -> "1st"), so a learner who says the number word right would be
// marked wrong. Spoken answers only: a typed "11" stays wrong.
const NUMBER_WORDS: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six",
  "7": "seven", "8": "eight", "9": "nine", "10": "ten", "11": "eleven", "12": "twelve",
  "13": "thirteen", "14": "fourteen", "15": "fifteen", "16": "sixteen", "17": "seventeen",
  "18": "eighteen", "19": "nineteen", "20": "twenty", "30": "thirty", "40": "forty",
  "50": "fifty", "60": "sixty", "70": "seventy", "80": "eighty", "90": "ninety",
  "100": "hundred", "1000": "thousand", "1,000": "thousand", "1st": "first", "2nd": "second", "3rd": "third",
};

// Same normalization as testContent.ts's recall grading — a transcribed
// spoken answer gets the identical exact-match treatment as a typed one,
// plus number digits read back as words.
export function normalizeSpokenWord(text: string): string {
  const normalized = normalizeWordAnswer(text).replace(/^(a|one) (hundred|thousand)$/, "$2");
  return NUMBER_WORDS[normalized] ?? normalized;
}

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

// Same normalization as testContent.ts's recall grading — a transcribed
// spoken answer gets the identical exact-match treatment as a typed one.
export function normalizeSpokenWord(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

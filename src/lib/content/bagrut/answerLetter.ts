// Model answers for multiple choice start with "תשובה נכונה: B.", but the
// options carry no letters and are shown in a shuffled order, so the letter
// would point at nothing (or at the wrong option). The right option is
// already marked in green; only the explanation after the letter is kept.
export function withoutAnswerLetter(modelAnswerHe: string): string {
  return modelAnswerHe.replace(/^תשובה נכונה:\s*[A-D]\.?\s*/, "").trim();
}

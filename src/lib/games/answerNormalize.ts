// One normalization for every typed or spoken word answer (spelling recall,
// the vocabulary test, the speaking test). Exact match stays the rule; this
// only removes differences that aren't the learner's mistake:
//  - the iPhone keyboard types a curly apostrophe (you’re), the word list
//    has a straight one (you're);
//  - speech recognition ends a phrase with "." or "?" ("How are you?");
//  - capitals and repeated spaces.
const APOSTROPHES = /[‘’ʼ`´]/g;
const TRAILING_PUNCTUATION = /[\s.?!,;:]+$/;

export function normalizeWordAnswer(text: string): string {
  return text
    .replace(APOSTROPHES, "'")
    .trim()
    .toLowerCase()
    .replace(TRAILING_PUNCTUATION, "")
    .replace(/\s+/g, " ");
}

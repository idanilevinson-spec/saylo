// A learner tapped a word in the teacher's message. The meaning that
// matters is the one in *this* sentence ("run a business" is not "run a
// race"), so the model sees the sentence, not just the word.

export interface WordLookupResult {
  word: string;
  headword: string;
  translationHe: string;
  partOfSpeech: string | null;
  vocabularyItemId: string | null;
  inMyWords: boolean;
}

export interface WordMeaning {
  lemma: string;
  he: string;
  pos: string | null;
}

export function buildWordLookupPrompt(word: string, sentence: string): string {
  return `An English learner whose first language is Hebrew tapped the word "${word}" in this sentence:
"${sentence}"
Give its base dictionary form and what it means in this sentence, in Hebrew: 1-4 words, the way a good Hebrew-English dictionary would put it. If it is part of a phrasal verb or a fixed expression in this sentence (for example "look forward to", "give up"), give the meaning of the whole expression and use the expression as the base form.
Hebrew: plain dictionary wording, no long dash (—). When a Hebrew adjective must show gender, give the masculine form, as dictionaries do.
Reply with raw JSON only, no markdown: {"lemma":"...","he":"...","pos":"noun | verb | adjective | adverb | phrase | other"}`;
}

const POS = new Set(["noun", "verb", "adjective", "adverb", "phrase", "other"]);

export function cleanWordMeaning(parsed: Partial<Record<keyof WordMeaning, unknown>> | null): WordMeaning | null {
  if (!parsed || typeof parsed.lemma !== "string" || typeof parsed.he !== "string") return null;
  const lemma = parsed.lemma.trim().toLowerCase();
  const he = parsed.he.replace(/\s*—\s*/g, ", ").trim();
  if (!/^[a-z][a-z' -]{0,59}$/.test(lemma) || !he || he.length > 80) return null;
  const pos = typeof parsed.pos === "string" && POS.has(parsed.pos) ? parsed.pos : null;
  return { lemma, he, pos };
}

// What counts as a tappable English word.
export const LOOKUP_WORD = /^[A-Za-z][A-Za-z'’-]{0,39}$/;

// The form to try against the catalog before asking the model: lower case,
// curly apostrophe straightened, a possessive 's dropped ("teacher's").
export function normalizeTappedWord(word: string): string {
  return word.toLowerCase().replace(/’/g, "'").replace(/'s$/, "");
}

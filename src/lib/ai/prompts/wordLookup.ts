// A learner tapped a word in the teacher's message. The meaning that
// matters is the one in *this* sentence ("run a business" is not "run a
// race"), so the model sees the sentence, not just the word. The same
// answer carries what a new word needs to join the review pool: its level
// and three wrong options for its review question.

export interface WordLookupResult {
  word: string;
  headword: string;
  translationHe: string;
  partOfSpeech: string | null;
  vocabularyItemId: string | null;
  inMyWords: boolean;
}

export type CefrGuess = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface WordMeaning {
  lemma: string;
  he: string;
  pos: string | null;
  level: CefrGuess;
  // Three English words for the multiple-choice review, or [] when the
  // model's were unusable (the word is then explained but not stored).
  distractors: string[];
}

export function buildWordLookupPrompt(word: string, sentence: string): string {
  return `An English learner whose first language is Hebrew tapped the word "${word}" in this sentence:
"${sentence}"
Give its base dictionary form and what it means in this sentence, in Hebrew: 1-4 words, the way a good Hebrew-English dictionary would put it. If it is part of a phrasal verb or a fixed expression in this sentence (for example "look forward to", "give up"), give the meaning of the whole expression and use the expression as the base form. If it is a person's or place's name, use pos "name".
Hebrew: plain dictionary wording, no long dash (—). When a Hebrew adjective must show gender, give the masculine form, as dictionaries do.
Also give its CEFR level (A1-C2) and three "distractors": real English words or expressions of the same part of speech and a similar level, each clearly different in meaning from it, for a multiple-choice question "which English word means <the Hebrew>?".
Reply with raw JSON only, no markdown: {"lemma":"...","he":"...","pos":"noun | verb | adjective | adverb | phrase | name | other","level":"B1","distractors":["...","...","..."]}`;
}

const POS = new Set(["noun", "verb", "adjective", "adverb", "phrase", "name", "other"]);
const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const ENGLISH_ENTRY = /^[a-z][a-z' -]{0,59}$/;

export function cleanWordMeaning(parsed: Partial<Record<keyof WordMeaning, unknown>> | null): WordMeaning | null {
  if (!parsed || typeof parsed.lemma !== "string" || typeof parsed.he !== "string") return null;
  const lemma = parsed.lemma.trim().toLowerCase();
  const he = parsed.he.replace(/\s*—\s*/g, ", ").trim();
  if (!ENGLISH_ENTRY.test(lemma) || !he || he.length > 80) return null;
  const pos = typeof parsed.pos === "string" && POS.has(parsed.pos) ? parsed.pos : null;
  const level = typeof parsed.level === "string" && LEVELS.has(parsed.level) ? (parsed.level as CefrGuess) : "B1";
  const raw = Array.isArray(parsed.distractors) ? parsed.distractors : [];
  const distractors = [
    ...new Set(raw.filter((d): d is string => typeof d === "string").map((d) => d.trim().toLowerCase())),
  ].filter((d) => ENGLISH_ENTRY.test(d) && d !== lemma);
  return { lemma, he, pos, level, distractors: distractors.length >= 3 ? distractors.slice(0, 3) : [] };
}

// A word worth keeping for reviews: a real word or expression (not a
// name, not "the") with a usable review question.
export function isStorableMeaning(m: WordMeaning): boolean {
  return m.pos !== null && m.pos !== "name" && m.pos !== "other" && m.distractors.length === 3;
}

// What counts as a tappable English word.
export const LOOKUP_WORD = /^[A-Za-z][A-Za-z'’-]{0,39}$/;

// The form to try against the catalog before asking the model: lower case,
// curly apostrophe straightened, a possessive 's dropped ("teacher's").
export function normalizeTappedWord(word: string): string {
  return word.toLowerCase().replace(/’/g, "'").replace(/'s$/, "");
}

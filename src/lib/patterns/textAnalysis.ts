// Deterministic detectors for the two spelling patterns that don't need AI
// judgment — a rule catches them at least as reliably and for free. See
// docs/specs/hebrew-pattern-coach.md §4 and patternDefinitions.ts.

export function countWords(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

// A missing capital at the very start of the text, after ./!/? followed by a
// space, or a standalone lowercase "i" (the word, not a letter inside a
// longer word). Capped like every other pattern count (see
// validateAiPatterns.ts) by the caller.
export function detectCapitalizationIssues(text: string): number {
  let count = 0;

  const trimmed = text.trimStart();
  if (trimmed.length > 0 && /[a-z]/.test(trimmed[0])) count++;

  count += [...text.matchAll(/[.!?]\s+[a-z]/g)].length;

  const standaloneI = text.match(/\bi\b/g);
  if (standaloneI) count += standaloneI.length;

  return count;
}

// Common contractions written without their apostrophe. Word-boundary,
// case-insensitive matches only — this deliberately doesn't try to catch
// "its" vs "it's" (a genuinely ambiguous case even for a fluent writer)
// since a false positive there would be worse than missing it.
const MISSING_APOSTROPHE_WORDS = [
  "dont",
  "cant",
  "wont",
  "isnt",
  "arent",
  "doesnt",
  "didnt",
  "wasnt",
  "werent",
  "hasnt",
  "havent",
  "hadnt",
  "shouldnt",
  "wouldnt",
  "couldnt",
  "im",
  "youre",
  "theyre",
  "weve",
  "ive",
  "youve",
  "theyve",
  "whats",
  "thats",
  "lets",
];

const MISSING_APOSTROPHE_PATTERN = new RegExp(`\\b(${MISSING_APOSTROPHE_WORDS.join("|")})\\b`, "gi");

export function detectApostropheIssues(text: string): number {
  const matches = text.match(MISSING_APOSTROPHE_PATTERN);
  return matches ? matches.length : 0;
}

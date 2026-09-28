import { OTHER_PATTERN_CODE, aiDetectablePatternsFor, type PatternSource } from "./patternDefinitions";

// What the model is asked to return per detected mistake — see the prompt
// builders in lib/ai/prompts. "quote" is the exact student wording the model
// says shows the mistake; it is checked against the real source text below
// and never stored (see docs/specs/hebrew-pattern-coach.md §8).
export interface RawAiPattern {
  code?: unknown;
  quote?: unknown;
}

export interface ValidatedPattern {
  code: string;
  occurrences: number;
}

const MAX_OCCURRENCES_PER_PATTERN = 20;

// Cheap defense against a model that invents a mistake: the quote it names
// has to actually be a substring of what the student wrote (case-insensitive,
// whitespace-collapsed so trivial re-wrapping doesn't fail the check). A
// pattern whose quote doesn't check out is dropped entirely, not merely
// down-weighted — a fabricated example is worse than a missed one, since it
// would tell the learner they wrote something they didn't.
export function validateAiPatterns(
  raw: unknown,
  sourceText: string,
  source: PatternSource
): ValidatedPattern[] {
  if (!Array.isArray(raw)) return [];

  const allowedCodes = new Set(aiDetectablePatternsFor(source).map((p) => p.code));
  const haystack = normalize(sourceText);

  const counts = new Map<string, number>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { code, quote } = item as RawAiPattern;
    if (typeof code !== "string" || typeof quote !== "string") continue;
    if (!allowedCodes.has(code) && code !== OTHER_PATTERN_CODE) continue;
    if (!quote.trim()) continue;
    if (!haystack.includes(normalize(quote))) continue;

    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  return [...counts.entries()].map(([code, occurrences]) => ({
    code,
    occurrences: Math.min(occurrences, MAX_OCCURRENCES_PER_PATTERN),
  }));
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

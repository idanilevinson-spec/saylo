import type { CefrLevel } from "@/types/database";

export const CEFR_ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Deterministic, not AI-derived — the placement test's level result must be
// reproducible and auditable, not left to a model's judgment call. AI is
// used only to narrate the result, never to decide it.
export function cefrLevelFromPercent(percentCorrect: number): CefrLevel {
  if (percentCorrect < 35) return "A1";
  if (percentCorrect < 50) return "A2";
  if (percentCorrect < 65) return "B1";
  if (percentCorrect < 80) return "B2";
  if (percentCorrect < 92) return "C1";
  return "C2";
}

// This percent->level curve is calibrated for the placement test, whose
// questions are deliberately spread across every CEFR level so a raw score
// is meaningful on its own. Ongoing practice isn't spread that way — a
// learner drilling only A1 vocabulary and acing it would otherwise come out
// "C2" in that skill. Acing content proves ability up to that content's own
// level, never beyond it, so the raw result is capped at the hardest
// difficulty actually attempted.
export function capLevelToContentDifficulty(rawLevel: CefrLevel, hardestContentLevel: CefrLevel): CefrLevel {
  return CEFR_ORDER.indexOf(rawLevel) <= CEFR_ORDER.indexOf(hardestContentLevel) ? rawLevel : hardestContentLevel;
}

// The placement test has the same number of questions at every level (six
// each, A1 to C2), all multiple choice with four options. Someone who
// knows everything up to level k and guesses above it is expected to score
// (k + 0.25 × (6 − k)) / 6, so the cut-offs sit halfway between those
// expected scores. Without the guessing allowance a B2 learner, who guesses
// about a quarter of the twelve C questions right, would come out C1.
// Ongoing practice keeps cefrLevelFromPercent above: its content isn't
// spread across levels, and its result is capped by what was attempted.
export function placementLevelFromPercent(percentCorrect: number): CefrLevel {
  if (percentCorrect < 44) return "A1";
  if (percentCorrect < 56) return "A2";
  if (percentCorrect < 69) return "B1";
  if (percentCorrect < 81) return "B2";
  if (percentCorrect < 94) return "C1";
  return "C2";
}

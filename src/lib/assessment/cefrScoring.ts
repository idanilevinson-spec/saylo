import type { CefrLevel } from "@/types/database";

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

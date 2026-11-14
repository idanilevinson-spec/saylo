import type { CriterionKey } from "./oralRules";
import type { OralSetFeedback } from "./oralSets";

// Takes the fixer's rewritten notes for the keys that had problems; anything
// missing or empty keeps the original (which stripProblemSentences then
// trims). Scores, lists and everything else are never touched here.
export function mergeFixedNotes(feedback: OralSetFeedback, fixed: unknown, keys: CriterionKey[]): OralSetFeedback {
  const notes = (fixed && typeof fixed === "object" ? (fixed as { notesHe?: unknown }).notesHe : null) as Record<string, unknown> | null;
  if (!notes || typeof notes !== "object") return feedback;
  const notesHe = { ...feedback.notesHe };
  for (const k of keys) {
    const v = notes[k];
    if (typeof v === "string" && v.trim()) notesHe[k] = v.trim().slice(0, 400);
  }
  return { ...feedback, notesHe };
}

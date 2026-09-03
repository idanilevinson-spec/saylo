import type { CefrLevel } from "@/types/database";

export interface McqResultSummary {
  prompt: string;
  correct: boolean;
}

export interface OpenResultSummary {
  score: number;
  feedbackHe: string;
}

// A holistic wrap-up after a full reading exam (7 MCQs + 3 open
// questions), distinct from each open question's own per-answer
// feedback — this looks across the whole attempt (which comprehension
// questions were missed, how the open answers scored overall) and names
// one strength plus one concrete thing to work on next time, the way a
// teacher would after handing back a graded test rather than grading
// each answer in isolation.
export function buildReadingExamSummaryPrompt(
  mcqResults: McqResultSummary[],
  openResults: OpenResultSummary[],
  readerLevel: CefrLevel | null
): string {
  const mcqCorrect = mcqResults.filter((r) => r.correct).length;
  const mcqLines = mcqResults
    .map((r, i) => `${i + 1}. "${r.prompt}" — ${r.correct ? "correct" : "incorrect"}`)
    .join("\n");
  const avgOpenScore =
    openResults.length > 0 ? Math.round(openResults.reduce((sum, r) => sum + r.score, 0) / openResults.length) : 0;
  const openLines = openResults
    .map((r, i) => `${i + 1}. Score ${r.score}/100 — feedback already given: "${r.feedbackHe}"`)
    .join("\n");
  const levelNote = readerLevel
    ? `The reader's tested English level is ${readerLevel} (CEFR) — calibrate expectations to that level.`
    : "The reader's level is not yet known.";

  return `You are an encouraging English reading-comprehension coach for a Hebrew-speaking learner, writing a short wrap-up after they finished a full timed reading exam (${mcqResults.length} multiple-choice questions plus ${openResults.length} open-ended questions). ${levelNote}

Multiple-choice results (${mcqCorrect}/${mcqResults.length} correct):
${mcqLines || "(none answered)"}

Open-ended question results (average ${avgOpenScore}/100):
${openLines || "(none answered)"}
Do not repeat any of the individual feedback above verbatim — synthesize a holistic view across all of it instead.

Write a short (2-4 sentences), warm, encouraging summary IN HEBREW of the student's overall performance on this exam. Name one specific strength and one specific, actionable thing to focus on next time (e.g. a type of question they missed, or reading for detail vs. main idea). Do not just restate the scores. Respond with ONLY valid JSON, no markdown code fences, in exactly this shape:
{"summaryHe": "<2-4 sentences in Hebrew>"}`;
}

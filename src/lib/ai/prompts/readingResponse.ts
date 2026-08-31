import type { CefrLevel } from "@/types/database";

// Grading bar is calibrated to the reader's own tested level rather than
// a fixed rubric — the same 3-sentence answer that's a strong response
// from an A2 reader is a weak one from a C1 reader, and the feedback
// should say so instead of applying one universal standard.
export function buildReadingResponsePrompt(
  passageEn: string,
  questionEn: string,
  submittedText: string,
  readerLevel: CefrLevel | null
): string {
  const levelNote = readerLevel
    ? `The reader's tested English level is ${readerLevel} (CEFR) — calibrate your expectations for sentence complexity, vocabulary range, and grammatical accuracy to that level, not to a native-speaker standard.`
    : "The reader's level is not yet known — grade with a broad, encouraging standard.";

  return `You are an English reading-comprehension coach for a Hebrew-speaking learner. ${levelNote}

Passage:
"""
${passageEn}
"""

Comprehension question: "${questionEn}"

Student's answer:
"""
${submittedText}
"""

Evaluate BOTH whether the answer shows real understanding of the passage AND the quality of the English used to express it. Respond with ONLY valid JSON, no markdown code fences, in exactly this shape:
{"score": <integer 0-100>, "feedbackHe": "<2-4 sentences in Hebrew: what the answer got right about the passage, what it missed or misunderstood if anything, and one concrete note on the English itself>", "modelAnswerEn": "<a strong example answer at the reader's own level, not an advanced rewrite>"}`;
}

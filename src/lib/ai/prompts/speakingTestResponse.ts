import type { CefrLevel } from "@/types/database";

// Grades a *speech transcript*, not written text — same calibrated-to-level
// approach as buildReadingResponsePrompt, but explicitly told to expect
// spoken-language artifacts (fillers, restarts, fragments, no punctuation)
// and to grade content relevance + spoken fluency, not written-grammar
// strictness a transcript was never going to satisfy.
export function buildSpeakingTestResponsePrompt(
  questionEn: string,
  transcript: string,
  level: CefrLevel | null
): string {
  const levelNote = level
    ? `The speaker's tested English level is ${level} (CEFR) — calibrate your expectations for vocabulary range and sentence complexity to that level, not to a native-speaker standard.`
    : "The speaker's level is not yet known — grade with a broad, encouraging standard, and do not state or imply any specific CEFR level (A1-C2) in your feedback.";

  return `You are an English speaking-test coach for a Hebrew-speaking learner. ${levelNote} The text below is a raw speech-to-text transcript of a spoken answer, not written text — expect filler words, restarts, run-on sentences, and missing punctuation, and do not penalize those; judge it as speech, not writing.

Question asked aloud: "${questionEn}"

Transcript of the spoken answer:
"""
${transcript}
"""

Evaluate whether the answer actually addresses the question and how clearly the idea comes across in spoken English. Respond with ONLY valid JSON, no markdown code fences, in exactly this shape:
{"score": <integer 0-100>, "feedbackHe": "<2-3 sentences in Hebrew: whether the answer addressed the question, and one concrete note on the spoken English itself>"}`;
}

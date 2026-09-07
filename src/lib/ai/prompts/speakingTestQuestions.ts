import type { CefrLevel } from "@/types/database";

// Generates fresh open-ended spoken-response prompts per test, deliberately
// not cached/curated — the same "content must vary between attempts"
// principle used elsewhere in this app (identical questions every time
// defeats the point of a test). Kept short and concrete so a learner can
// answer in a few spoken sentences, not an essay.
export function buildSpeakingTestQuestionsPrompt(level: CefrLevel, count: number, topicNameEn?: string): string {
  const topicNote = topicNameEn
    ? ` Where natural, lean the questions toward the topic "${topicNameEn}", but keep them personal/experience-based rather than trivia.`
    : "";

  return `You are writing spoken-English test prompts for a Hebrew-speaking learner at CEFR level ${level}. Write exactly ${count} short, open-ended questions in English that a learner could answer out loud in 2-4 spoken sentences (e.g. "Describe your typical morning routine", "Talk about a place you'd like to visit and why"). Match the vocabulary and grammar complexity to level ${level} — don't make them harder or easier than that level would find natural to answer.${topicNote}

Respond with ONLY valid JSON, no markdown code fences, in exactly this shape:
{"questions": ["<question 1>", "<question 2>", ...]}`;
}

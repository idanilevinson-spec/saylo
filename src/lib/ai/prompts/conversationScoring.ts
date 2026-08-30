export interface TranscriptTurn {
  role: "user" | "assistant";
  content: string;
}

export function buildConversationScoringPrompt(transcript: TranscriptTurn[]): string {
  const formatted = transcript
    .map((t) => `${t.role === "user" ? "Student" : "AI"}: ${t.content}`)
    .join("\n");

  return `You are an English teacher reviewing a practice conversation between a Hebrew-speaking student and an AI conversation partner. Evaluate ONLY the student's turns.

Transcript:
"""
${formatted}
"""

Respond with ONLY valid JSON, no markdown code fences, in exactly this shape:
{
  "fluencyScore": <integer 0-100>,
  "grammarScore": <integer 0-100>,
  "vocabularyScore": <integer 0-100>,
  "overallScore": <integer 0-100>,
  "grammarMistakes": ["<short description of a real mistake found, in Hebrew>", ...],
  "overusedWords": ["<word or phrase the student repeated too much>", ...],
  "suggestedVocabulary": ["<English word/phrase the student could have used instead>", ...],
  "generalSuggestionsHe": "<2-3 sentences in Hebrew with encouraging, specific advice for next time>"
}

If there isn't enough student text to judge something, use an empty array or a reasonable middle score rather than inventing detail. Base every item strictly on what the student actually wrote.`;
}

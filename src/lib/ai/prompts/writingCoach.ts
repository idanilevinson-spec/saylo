export function buildWritingCoachPrompt(promptEn: string, submittedText: string): string {
  return `You are an English writing coach for a Hebrew-speaking learner. The student responded to this prompt: "${promptEn}"

Student's text:
"""
${submittedText}
"""

Analyze grammar, vocabulary, clarity, and tone. Respond with ONLY valid JSON, no markdown code fences, in exactly this shape:
{"overallScore": <integer 0-100>, "feedbackHe": "<2-4 sentences in Hebrew explaining the main issues and what was done well>", "improvedVersion": "<a corrected, natural-sounding English version of the student's text, keeping their original ideas>"}`;
}

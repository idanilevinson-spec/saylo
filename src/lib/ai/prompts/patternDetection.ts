import { aiDetectablePatternsFor, OTHER_PATTERN_CODE, type PatternSource } from "@/lib/patterns/patternDefinitions";

// Shared by the writing-coach and conversation-scoring prompts: asks the
// model to tag which of the closed Hebrew-transfer patterns it noticed,
// quoting the learner's own words each time. The quote is re-checked against
// the real source text server-side (validateAiPatterns.ts) before anything
// is trusted, so a fabricated quote is caught and dropped rather than acted
// on — this instruction is about getting good matches, not the safety net
// itself.
export function buildPatternDetectionInstructions(source: PatternSource, studentLabel: string): string {
  const patternList = aiDetectablePatternsFor(source)
    .map((p) => `- ${p.code}: e.g. "${p.exampleWrong}" instead of "${p.exampleRight}"`)
    .join("\n");

  return `Separately, tag any of these specific Hebrew-to-English transfer mistakes the ${studentLabel} actually made — this is a closed list, only use these exact codes:
${patternList}

Add a "patterns" field: an array of {"code": "<one of the codes above, or \"${OTHER_PATTERN_CODE}\" for a real mistake that doesn't fit any of them>", "quote": "<the exact words the ${studentLabel} wrote or said, copied verbatim, that show this mistake>"}. Add one entry per occurrence — if the same mistake happens twice, include it twice with each quote. Never invent a quote or paraphrase it: it must be copied exactly from the ${studentLabel}'s own words, character for character. If you're not confident it's a real instance, leave it out. An empty array is fine and expected when nothing matches.`;
}

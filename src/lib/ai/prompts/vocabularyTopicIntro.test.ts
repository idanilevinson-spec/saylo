import { describe, expect, it } from "vitest";
import { buildVocabularyTopicIntroPrompt } from "./vocabularyTopicIntro";

// The note is written without the words' IPA, so a sound claim can only be
// a guess: one told learners "schedule" starts with "sh" beside /ˈskedʒuːl/.
describe("vocabulary topic intro prompt", () => {
  it("keeps the note off pronunciation", () => {
    const prompt = buildVocabularyTopicIntroPrompt({
      nameHe: "עבודה ומשרד",
      nameEn: "Work and office",
      cefrLevel: "A2",
      sampleWords: [{ headword: "schedule", translationHe: "לוח זמנים" }],
    });
    expect(prompt).toContain("אל תכתוב על הגייה");
  });
});

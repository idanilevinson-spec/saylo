import { describe, expect, it } from "vitest";
import { HEBREW_GENDER_NEUTRAL_NOTE } from "./hebrewStyle";
import { buildConversationScoringPrompt } from "./conversationScoring";
import { buildConversationSystemPrompt } from "./conversationPartner";
import { buildPlacementSummaryPrompt } from "./placementSummary";
import { buildReadingExamSummaryPrompt } from "./readingExamSummary";
import { buildReadingResponsePrompt } from "./readingResponse";
import { buildSpeakingTestResponsePrompt } from "./speakingTestResponse";
import { buildTeacherSuggestionPrompt } from "./teacherSuggestion";
import { buildVocabularyTopicIntroPrompt } from "./vocabularyTopicIntro";
import { buildWritingCoachPrompt } from "./writingCoach";

// Every prompt whose reply is Hebrew shown to a learner must carry the
// gender-neutral rule — a missing note is how a female-form "שימי לב" reached
// male learners.
describe("Hebrew gender-neutral note", () => {
  const prompts: Record<string, string> = {
    conversationScoring: buildConversationScoringPrompt([{ role: "user", content: "I have went home" }]),
    conversationPartner: buildConversationSystemPrompt(null),
    conversationPartnerScenario: buildConversationSystemPrompt("You are a waiter.", "B1", false),
    placementSummary: buildPlacementSummaryPrompt([{ skill: "grammar", percentCorrect: 60, cefrLevel: "B1" }], "B1"),
    readingExamSummary: buildReadingExamSummaryPrompt([], [], "B1"),
    readingResponse: buildReadingResponsePrompt("Passage", "Question?", "Answer", "B1"),
    speakingTestResponse: buildSpeakingTestResponsePrompt("Question?", "transcript", "B1"),
    teacherSuggestion: buildTeacherSuggestionPrompt({ weakGrammarTopics: [], wordsToReview: 3, currentStreak: 2 }),
    vocabularyTopicIntro: buildVocabularyTopicIntroPrompt({
      nameHe: "בגדים",
      nameEn: "Clothes",
      cefrLevel: "A1",
      sampleWords: [{ headword: "shirt", translationHe: "חולצה" }],
    }),
    writingCoach: buildWritingCoachPrompt("Describe your day", "I woke up."),
  };

  for (const [name, prompt] of Object.entries(prompts)) {
    it(`${name} includes the rule`, () => {
      expect(prompt).toContain(HEBREW_GENDER_NEUTRAL_NOTE);
    });
  }
});

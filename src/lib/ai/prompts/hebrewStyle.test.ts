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
import { buildBagrutWritingCheckPrompt } from "./bagrutWritingCheck";
import { SUPPORT_SYSTEM_PROMPT } from "@/lib/support/systemPrompt";
import { buildBillingSystemPrompt } from "@/lib/billing/systemPrompt";

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
    bagrutWritingCheckC: buildBagrutWritingCheckPrompt({ rubric: "C", taskEn: "Describe a place.", wordRange: [70, 90], text: "I like the park.", words: 4 }),
    bagrutWritingCheckG: buildBagrutWritingCheckPrompt({ rubric: "G", taskEn: "Do you agree?", wordRange: [120, 140], text: "I agree.", words: 2 }),
    supportAssistant: SUPPORT_SYSTEM_PROMPT,
    billingAgent: buildBillingSystemPrompt("2026-10-06", true),
  };

  for (const [name, prompt] of Object.entries(prompts)) {
    it(`${name} includes the rule`, () => {
      expect(prompt).toContain(HEBREW_GENDER_NEUTRAL_NOTE);
    });
    // "חם ומעודד" is what produced "אתם עומדים להיכנס לעולם מרתק... בהצלחה".
    it(`${name} doesn't ask for a cheerleading voice in Hebrew`, () => {
      expect(prompt).not.toMatch(/חם ומעודד|סיכום מעודד|warm, encouraging summary IN HEBREW/);
    });
  }
});

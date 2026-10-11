import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/speech/browserTts", () => ({ speak: vi.fn() }));
vi.mock("@/lib/speech/useNeuralSpeech", () => ({
  NEURAL_SPEECH_RATES: [1],
  useNeuralSpeech: () => ({ play: vi.fn(), pause: vi.fn(), status: "idle", activeIndex: null, rate: 1, setRate: vi.fn() }),
}));

import ReadingTextViewer from "./ReadingTextViewer";
import type { VocabularyLookupEntry } from "@/lib/content/vocabulary";

const entry = (cefr_level: VocabularyLookupEntry["cefr_level"]) =>
  ({ translation_he: "x", cefr_level }) as unknown as VocabularyLookupEntry;

describe("ReadingTextViewer word marks", () => {
  const html = renderToStaticMarkup(
    <ReadingTextViewer
      bodyEn="It increases consumer welfare, says the employee."
      vocabByWord={{ welfare: entry("C1"), employee: entry("A2") }}
      textLevel="C2"
    />,
  );

  it("marks a word at the text's level, without the punctuation after it", () => {
    expect(html).toMatch(/<button[^>]*>welfare<\/button>,/);
  });

  it("doesn't mark a word far below the text's level", () => {
    expect(html).not.toMatch(/<button[^>]*>employee/);
    expect(html).toContain("employee.");
  });
});

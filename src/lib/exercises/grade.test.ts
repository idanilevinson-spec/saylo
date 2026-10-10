import { describe, it, expect } from "vitest";
import { gradeExercise } from "./grade";
import type {
  McqContent,
  FillBlankContent,
  MatchContent,
  ReorderContent,
  DictationContent,
} from "@/types/exercises";

describe("gradeExercise — mcq", () => {
  const content: McqContent = { prompt: "Pick one", options: ["a", "b", "c"], correctIndex: 1 };

  it("marks the correct index as correct", () => {
    expect(gradeExercise("mcq", content, { selectedIndex: 1 })).toBe(true);
  });

  it("marks any other index as incorrect", () => {
    expect(gradeExercise("mcq", content, { selectedIndex: 0 })).toBe(false);
  });
});

describe("gradeExercise — fill_blank", () => {
  const content: FillBlankContent = { sentence: "I ___ happy", correctAnswer: "am" };

  it("marks an exact match as correct", () => {
    expect(gradeExercise("fill_blank", content, { text: "am" })).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(gradeExercise("fill_blank", content, { text: "AM" })).toBe(true);
  });

  it("ignores leading/trailing whitespace and collapses inner whitespace", () => {
    expect(gradeExercise("fill_blank", content, { text: "  am  " })).toBe(true);
  });

  it("marks a wrong answer as incorrect", () => {
    expect(gradeExercise("fill_blank", content, { text: "is" })).toBe(false);
  });
});

describe("gradeExercise — match", () => {
  const content: MatchContent = {
    pairs: [
      { left: "cat", right: "חתול" },
      { left: "dog", right: "כלב" },
    ],
  };

  it("marks all pairs matched, regardless of order, as correct", () => {
    const response = {
      pairs: [
        { left: "dog", right: "כלב" },
        { left: "cat", right: "חתול" },
      ],
    };
    expect(gradeExercise("match", content, response)).toBe(true);
  });

  it("marks a wrong pairing as incorrect", () => {
    const response = {
      pairs: [
        { left: "cat", right: "כלב" },
        { left: "dog", right: "חתול" },
      ],
    };
    expect(gradeExercise("match", content, response)).toBe(false);
  });

  it("marks a response with a missing pair as incorrect", () => {
    const response = { pairs: [{ left: "cat", right: "חתול" }] };
    expect(gradeExercise("match", content, response)).toBe(false);
  });
});

describe("gradeExercise — reorder", () => {
  const content: ReorderContent = { tokens: ["I", "am", "happy"], correctOrder: [0, 1, 2] };

  it("marks the correct order as correct", () => {
    expect(gradeExercise("reorder", content, { order: [0, 1, 2] })).toBe(true);
  });

  it("marks a wrong order as incorrect", () => {
    expect(gradeExercise("reorder", content, { order: [1, 0, 2] })).toBe(false);
  });

  it("marks a response of the wrong length as incorrect", () => {
    expect(gradeExercise("reorder", content, { order: [0, 1] })).toBe(false);
  });
});

describe("gradeExercise — dictation", () => {
  const content: DictationContent = { audioText: "I am happy.", correctAnswer: "I am happy" };

  it("marks an exact (case-insensitive) match as correct", () => {
    expect(gradeExercise("dictation", content, { text: "i am happy" })).toBe(true);
  });

  it("marks a wrong transcription as incorrect", () => {
    expect(gradeExercise("dictation", content, { text: "I am sad" })).toBe(false);
  });
});

describe("gradeExercise: how answers are typed", () => {
  const fill = (correctAnswer: string, text: string) =>
    gradeExercise("fill_blank", { sentence: "x ___ y", correctAnswer } as FillBlankContent, { text });

  it("accepts the iPhone keyboard's curly apostrophe", () => {
    expect(fill("isn't", "isn’t")).toBe(true);
    expect(fill("can't", "can’t")).toBe(true);
  });

  it("treats short and long forms as the same answer", () => {
    expect(fill("isn't", "is not")).toBe(true);
    expect(fill("won't", "will not")).toBe(true);
    expect(fill("can't", "cannot")).toBe(true);
    expect(fill("There is", "There's")).toBe(true);
    expect(fill("I'm", "I am")).toBe(true);
    expect(fill("have lost", "'ve lost")).toBe(true);
  });

  it("still tells different answers apart", () => {
    expect(fill("isn't", "is")).toBe(false);
    expect(fill("won't", "want")).toBe(false);
    expect(fill("Noa's", "Noa")).toBe(false);
    expect(fill("parents'", "parent's")).toBe(false);
  });

  it("ignores punctuation in a dictation, but not the words", () => {
    const content: DictationContent = { audioText: "Can I have a coffee, please?", correctAnswer: "Can I have a coffee, please?" };
    expect(gradeExercise("dictation", content, { text: "can i have a coffee please" })).toBe(true);
    expect(gradeExercise("dictation", content, { text: "Can I have a tea, please?" })).toBe(false);
  });
});

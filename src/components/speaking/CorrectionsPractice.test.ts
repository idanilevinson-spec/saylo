import { describe, expect, it } from "vitest";
import { isCorrectRewrite } from "./CorrectionsPractice";

const fix = { original: "I go to the beach... we eat ice cream", better: "I went to the beach... we ate ice cream", why: "" };

describe("isCorrectRewrite", () => {
  it("accepts the corrected sentence typed without the teacher's '...'", () => {
    expect(isCorrectRewrite("I went to the beach, we ate ice cream", fix)).toBe(true);
    expect(isCorrectRewrite("i went to the beach we ate ice cream.", fix)).toBe(true);
  });

  it("rejects the original mistake", () => {
    expect(isCorrectRewrite("I go to the beach we eat ice cream", fix)).toBe(false);
  });

  it("treats short and long forms the same", () => {
    expect(isCorrectRewrite("I do not agree", { original: "I am not agree", better: "I don't agree", why: "" })).toBe(true);
  });
});

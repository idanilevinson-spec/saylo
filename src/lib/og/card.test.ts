import { describe, expect, it, vi } from "vitest";

vi.mock("next/og", () => ({ ImageResponse: class {} }));

import { visualWord } from "./card";

describe("visualWord", () => {
  it("mirrors Hebrew so a left-to-right renderer shows it correctly", () => {
    expect(visualWord("שלום")).toBe("םולש");
  });
  it("keeps Latin and digit runs in their own order", () => {
    expect(visualWord("ב-10")).toBe("10-ב");
    expect(visualWord("B1")).toBe("B1");
    expect(visualWord("saylolearn.com")).toBe("saylolearn.com");
  });
  it("puts trailing punctuation on the visual left", () => {
    expect(visualWord("רמה,")).toBe(",המר");
  });
});

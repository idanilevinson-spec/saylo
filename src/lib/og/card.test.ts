import { describe, expect, it, vi } from "vitest";

vi.mock("next/og", () => ({ ImageResponse: class {} }));

import { bidiItems } from "./card";

// bidiItems returns the chunks in logical order; the card lays them out
// right to left. Each chunk is what a left-to-right renderer must draw.
describe("bidiItems", () => {
  it("mirrors Hebrew words", () => {
    expect(bidiItems("לומדים אנגלית")).toEqual(["םידמול", "תילגנא"]);
  });

  it("keeps a multi-word English run in order, as one chunk", () => {
    expect(bidiItems("Wish and If only: הסבר")).toEqual([":Wish and If only", "רבסה"]);
  });

  it("glues a Hebrew prefix to the English after it", () => {
    expect(bidiItems("wish ו-if only")).toEqual(["wish", "if only-ו"]);
  });

  it("keeps digits in order inside Hebrew", () => {
    expect(bidiItems("ב-10 דקות")).toEqual(["10-ב", "תוקד"]);
    expect(bidiItems("3, 4 ו-5 יח״ל")).toEqual([",3", "4", "5-ו", "ל״חי"]);
  });

  it("puts trailing punctuation on the visual left", () => {
    expect(bidiItems("מבחן רמה,")).toEqual(["ןחבמ", ",המר"]);
  });

  it("leaves English-only text alone", () => {
    expect(bidiItems("saylolearn.com")).toEqual(["saylolearn.com"]);
    expect(bidiItems("B1")).toEqual(["B1"]);
  });
});

describe("bidiItems: English-only text", () => {
  it("splits into words in reading order", () => {
    expect(bidiItems("there is / there are")).toEqual(["there", "is", "/", "there", "are"]);
  });
});

describe("bidiItems: English with separators", () => {
  it("keeps \"A / B\" together inside Hebrew text", () => {
    expect(bidiItems("There is / There are: הסבר")).toEqual([":There is / There are", "רבסה"]);
  });
});

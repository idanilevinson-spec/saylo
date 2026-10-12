import { describe, expect, it } from "vitest";
import { BAGRUT_SAMPLE_UNITS } from "@/lib/content/bagrut/sampleUnits";
import { PATTERN_DEFINITIONS } from "@/lib/patterns/patternDefinitions";
import { SUPPORT_KNOWLEDGE_BASE } from "@/lib/support/knowledgeBase";

// Site-wide style rule: Hebrew text never uses the long dash. English
// passages may (it is normal English punctuation), so only strings that
// contain Hebrew are checked.
function hebrewStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    if (/[֐-׿]/.test(value)) out.push(value);
  } else if (Array.isArray(value)) value.forEach((v) => hebrewStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => hebrewStrings(v, out));
  return out;
}

describe("no long dash in Hebrew content", () => {
  it.each([
    ["Bagrut sample units", BAGRUT_SAMPLE_UNITS],
    ["pattern definitions", PATTERN_DEFINITIONS],
    ["support knowledge base", SUPPORT_KNOWLEDGE_BASE],
  ])("%s", (_name, content) => {
    expect(hebrewStrings(content).filter((s) => s.includes("—"))).toEqual([]);
  });
});

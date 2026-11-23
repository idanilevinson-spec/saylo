import { describe, expect, it } from "vitest";
import { parseWritingFeedback, verifyWritingFeedback } from "./writingFeedback";

const TEXT = "Last year I have went to a small library in my town. The library is very old and the peoples there are nice.";

const reply = (over: Record<string, unknown> = {}) => ({
  points: { content: 7, vocabulary: 5, language: 5, mechanics: 2 },
  notesHe: { content: "הרעיון ברור.", vocabulary: "המילים פשוטות.", language: "יש טעויות בזמנים.", mechanics: "האיות טוב." },
  zero: false,
  fixes: [{ wrote: "I have went", better: "I went", whyHe: "פעולה שהסתיימה בעבר." }],
  improved: "Last year I went to a small library in my town.",
  ...over,
});

describe("parseWritingFeedback", () => {
  it("accepts a well-formed reply", () => {
    const f = parseWritingFeedback(reply())!;
    expect(f.scores).toEqual({ content: 7, vocabulary: 5, language: 5, mechanics: 2 });
    expect(f.fixes).toHaveLength(1);
    expect(f.zero).toBe(false);
  });

  it("rejects a reply with a missing score, note or improved text", () => {
    expect(parseWritingFeedback(null)).toBeNull();
    expect(parseWritingFeedback("text")).toBeNull();
    expect(parseWritingFeedback(reply({ points: { content: 7 } }))).toBeNull();
    expect(parseWritingFeedback(reply({ points: { content: "7", vocabulary: 5, language: 5, mechanics: 2 } }))).toBeNull();
    expect(parseWritingFeedback(reply({ notesHe: { content: "", vocabulary: "א", language: "ב", mechanics: "ג" } }))).toBeNull();
    expect(parseWritingFeedback(reply({ improved: "  " }))).toBeNull();
  });

  it("drops malformed and pointless corrections, keeps at most five", () => {
    const fixes = [
      { wrote: "peoples", better: "peoples", whyHe: "אותו דבר" },
      { wrote: "peoples", better: "", whyHe: "ריק" },
      { wrote: "tired and sick", better: "Tired and sick,", whyHe: "רק פסיק" },
      "not an object",
      ...Array.from({ length: 8 }, (_, i) => ({ wrote: `w${i}`, better: `b${i}`, whyHe: "סיבה" })),
    ];
    expect(parseWritingFeedback(reply({ fixes }))!.fixes).toHaveLength(5);
    expect(parseWritingFeedback(reply({ fixes: "none" }))!.fixes).toEqual([]);
  });

  it("only a literal true marks the text as zero", () => {
    expect(parseWritingFeedback(reply({ zero: "true" }))!.zero).toBe(false);
    expect(parseWritingFeedback(reply({ zero: true }))!.zero).toBe(true);
  });

  it("keeps paragraph breaks in the improved text", () => {
    expect(parseWritingFeedback(reply({ improved: "One.\n\n\n\nTwo." }))!.improved).toBe("One.\n\nTwo.");
  });
});

describe("verifyWritingFeedback", () => {
  it("shows a correction only when its words are in the learner's text", () => {
    const f = parseWritingFeedback(
      reply({
        fixes: [
          { wrote: "i have went", better: "I went", whyHe: "עבר פשוט." },
          { wrote: "the peoples", better: "the people", whyHe: "בלי s." },
          { wrote: "more better", better: "better", whyHe: "לא נכתב בכלל." },
        ],
      }),
    )!;
    expect(verifyWritingFeedback(f, TEXT).fixes.map((x) => x.wrote)).toEqual(["i have went", "the peoples"]);
  });

  it("cuts a sentence that quotes words the learner did not write", () => {
    const f = parseWritingFeedback(
      reply({
        notesHe: { content: "כתבתם 'small library' וזה ברור. כתבתם גם 'huge museum' וזה מבלבל.", vocabulary: "א.", language: "ב.", mechanics: "ג." },
      }),
    )!;
    expect(verifyWritingFeedback(f, TEXT).notesHe.content).toBe("כתבתם 'small library' וזה ברור.");
  });

  it("cuts a sentence with English outside a quote, and never leaves a note empty", () => {
    const f = parseWritingFeedback(
      reply({ notesHe: { content: "א.", vocabulary: "כדאי להשתמש ב-however.", language: "ב.", mechanics: "ג." } }),
    )!;
    const out = verifyWritingFeedback(f, TEXT);
    expect(out.notesHe.vocabulary).not.toMatch(/[A-Za-z]/);
    expect(out.notesHe.vocabulary.length).toBeGreaterThan(10);
    expect(out.notesHe.content).toBe("א.");
  });
});

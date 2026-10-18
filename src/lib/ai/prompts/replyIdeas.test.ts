import { describe, expect, it } from "vitest";
import { buildReplyIdeasPrompt, cleanReplyIdeas } from "./replyIdeas";

describe("cleanReplyIdeas", () => {
  it("keeps three ideas and swaps the long dash", () => {
    const ideas = cleanReplyIdeas({
      ideas: [
        { en: "Yes, I do.", he: "כן." },
        { en: "Sometimes, when I have time.", he: "לפעמים." },
        { en: "Not really — I'm more of a homebody.", he: "לא ממש." },
      ],
    });
    expect(ideas).toHaveLength(3);
    expect(ideas[2].en).toBe("Not really, I'm more of a homebody.");
  });

  it("drops broken or non-English items and never returns more than three", () => {
    const raw = {
      ideas: [{ en: "שלום", he: "x" }, { en: 5, he: "x" }, { en: "A", he: "a" }, { en: "B", he: "b" }, { en: "C", he: "c" }, { en: "D", he: "d" }],
    };
    expect(cleanReplyIdeas(raw).map((i) => i.en)).toEqual(["A", "B", "C"]);
  });

  it("returns nothing for junk", () => {
    expect(cleanReplyIdeas(null)).toEqual([]);
    expect(cleanReplyIdeas({ ideas: "x" })).toEqual([]);
  });
});

describe("buildReplyIdeasPrompt", () => {
  it("keeps beginners to easy words and marks gender with a slash in the Hebrew", () => {
    expect(buildReplyIdeasPrompt("A2")).toMatch(/A1-A2 words only/);
    expect(buildReplyIdeasPrompt("B2")).not.toMatch(/A1-A2 words only/);
    expect(buildReplyIdeasPrompt(null)).toContain("אני עייף/ה");
  });
});

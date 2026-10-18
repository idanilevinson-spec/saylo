import { describe, expect, it } from "vitest";
import { activeChunkAt, buildSlowSsml, splitIntoChunks } from "./slowChunks";

describe("splitIntoChunks", () => {
  it("keeps short sentences whole", () => {
    expect(splitIntoChunks("Nice to meet you, Dana. What do you do?")).toEqual(["Nice to meet you, Dana.", "What do you do?"]);
  });

  it("cuts long sentences at commas without leaving tiny pieces", () => {
    const chunks = splitIntoChunks(
      "Crowded beaches in Tel Aviv in summer, I can picture that completely, and honestly, it sounds like a lot of fun.",
    );
    expect(chunks).toEqual([
      "Crowded beaches in Tel Aviv in summer,",
      "I can picture that completely, and honestly,",
      "it sounds like a lot of fun.",
    ]);
    expect(chunks.every((c) => c.split(" ").length >= 3)).toBe(true);
    expect(chunks.join(" ")).toBe(
      "Crowded beaches in Tel Aviv in summer, I can picture that completely, and honestly, it sounds like a lot of fun.",
    );
  });

  it("leaves a long sentence without commas as one piece", () => {
    expect(splitIntoChunks("What made you want to make that move from banking to marketing?")).toHaveLength(1);
  });

  it("handles extra whitespace and line breaks", () => {
    expect(splitIntoChunks("  Sure.\n\nWhat else?  ")).toEqual(["Sure.", "What else?"]);
  });
});

describe("buildSlowSsml", () => {
  it("marks each piece, pauses after it, slows down, and escapes the text", () => {
    const ssml = buildSlowSsml(["Tom & Jerry <3", "Next."], "en-US-AvaMultilingualNeural");
    expect(ssml).toContain('<voice name="en-US-AvaMultilingualNeural">');
    expect(ssml).toContain('<prosody rate="-25%">');
    expect(ssml).toContain('<bookmark mark="0"/>Tom &amp; Jerry &lt;3<break time="700ms"/>');
    expect(ssml).toContain('<bookmark mark="1"/>Next.');
  });
});

describe("activeChunkAt", () => {
  it("finds the piece playing at a moment", () => {
    const starts = [0, 1.8, 3.9];
    expect(activeChunkAt(starts, 0.2)).toBe(0);
    expect(activeChunkAt(starts, 2)).toBe(1);
    expect(activeChunkAt(starts, 10)).toBe(2);
  });
});

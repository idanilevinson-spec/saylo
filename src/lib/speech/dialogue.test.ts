import { describe, expect, it } from "vitest";
import { dialogueSsml, parseDialogue, spokenText } from "./dialogue";

describe("parseDialogue", () => {
  it("reads A:/B: lines as turns", () => {
    expect(parseDialogue("A: Hi there.\nB: Hello!\r\nA: How are you?")).toEqual([
      { speaker: "A", text: "Hi there." },
      { speaker: "B", text: "Hello!" },
      { speaker: "A", text: "How are you?" },
    ]);
  });

  it("treats anything else as one monologue", () => {
    expect(parseDialogue("Welcome back. Here is the weather.")).toEqual([
      { speaker: null, text: "Welcome back. Here is the weather." },
    ]);
    // A line without a speaker means it isn't a dialogue after all.
    expect(parseDialogue("A: Hi.\nSomething else.")[0].speaker).toBeNull();
  });
});

describe("spokenText", () => {
  it("drops the speaker labels", () => {
    expect(spokenText("A: Hi there.\nB: Hello!")).toBe("Hi there. Hello!");
  });
});

describe("dialogueSsml", () => {
  it("gives each speaker a voice and escapes the text", () => {
    const ssml = dialogueSsml(parseDialogue("A: Tom & Maya's <plan>\nB: Fine."));
    expect(ssml).toContain('<voice name="en-US-JennyNeural">Tom &amp; Maya&apos;s &lt;plan&gt;');
    expect(ssml).toContain('<voice name="en-US-GuyNeural">Fine.');
    expect(ssml.startsWith("<speak")).toBe(true);
  });
});

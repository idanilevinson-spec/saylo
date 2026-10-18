import { describe, expect, it } from "vitest";
import { CONVERSATION_OPENER_CUE, withOpenerCue } from "./conversationOpener";

describe("withOpenerCue", () => {
  it("puts the opening cue before a conversation the teacher started", () => {
    const history = [
      { role: "assistant", content: "Hi! How was your weekend?" },
      { role: "user", content: "Good" },
    ];
    const out = withOpenerCue(history);
    expect(out[0]).toEqual({ role: "user", content: CONVERSATION_OPENER_CUE(false) });
    expect(out.slice(1)).toEqual(history);
  });

  it("leaves a conversation the learner started alone", () => {
    const history = [{ role: "user", content: "Hello" }];
    expect(withOpenerCue(history)).toBe(history);
    expect(withOpenerCue([])).toEqual([]);
  });
});

describe("CONVERSATION_OPENER_CUE", () => {
  it("asks for a shorter opener on a call and never for a correction", () => {
    expect(CONVERSATION_OPENER_CUE(true)).toMatch(/1-2 short spoken sentences/);
    expect(CONVERSATION_OPENER_CUE(false)).toMatch(/Do not correct anything/);
  });
});

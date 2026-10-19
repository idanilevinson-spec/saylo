import { describe, expect, it } from "vitest";
import { MAX_MESSAGES_SENT, historyForModel } from "./conversationHistory";
import { CONVERSATION_OPENER_CUE } from "./prompts/conversationOpener";

const turns = (n: number, firstRole: "user" | "assistant" = "user") =>
  Array.from({ length: n }, (_, i) => ({
    role: (i % 2 === 0) === (firstRole === "user") ? "user" : "assistant",
    content: `m${i}`,
  }));

describe("historyForModel", () => {
  it("sends a short conversation whole, with the opener cue when the teacher spoke first", () => {
    expect(historyForModel(turns(5))).toHaveLength(5);
    const opened = historyForModel(turns(5, "assistant"));
    expect(opened[0]).toEqual({ role: "user", content: CONVERSATION_OPENER_CUE(false) });
    expect(opened).toHaveLength(6);
  });

  it("sends only the recent part of a long one, starting on a learner turn", () => {
    const long = turns(101, "assistant");
    const sent = historyForModel(long);
    expect(sent.length).toBeLessThanOrEqual(MAX_MESSAGES_SENT);
    expect(sent[0].role).toBe("user");
    expect(sent[sent.length - 1]).toEqual(long[long.length - 1]);
  });
});

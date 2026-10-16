import { describe, expect, it } from "vitest";
import { splitConversationReply } from "./conversationFix";
import { buildConversationSystemPrompt } from "./prompts/conversationPartner";

describe("splitConversationReply", () => {
  it("takes the FIX line off the reply and parses it", () => {
    const raw = `Oh nice, a beach day! By the way, it's "I went", not "I go", because it was yesterday. Who did you go with?
FIX:{"original":"Yesterday I go to the beach","better":"Yesterday I went to the beach","why":"זה קרה אתמול, אז צריך עבר"}`;
    const { reply, fix } = splitConversationReply(raw);
    expect(reply).toBe(`Oh nice, a beach day! By the way, it's "I went", not "I go", because it was yesterday. Who did you go with?`);
    expect(fix).toEqual({ original: "Yesterday I go to the beach", better: "Yesterday I went to the beach", why: "זה קרה אתמול, אז צריך עבר" });
  });

  it("leaves a reply without a correction untouched", () => {
    expect(splitConversationReply("What did you have for breakfast?")).toEqual({ reply: "What did you have for breakfast?", fix: null });
  });

  it("drops a malformed FIX line instead of reading it aloud", () => {
    const { reply, fix } = splitConversationReply("Sounds good.\nFIX: {not json");
    expect(reply).toBe("Sounds good.");
    expect(fix).toBeNull();
  });

  it("drops a 'fix' that changes nothing", () => {
    const { fix } = splitConversationReply('Fine.\nFIX:{"original":"I wake up","better":"I wake up","why":""}');
    expect(fix).toBeNull();
  });
});

describe("conversation prompt", () => {
  it("lets the teacher use Hebrew as a bridge instead of English only", () => {
    const prompt = buildConversationSystemPrompt(null, "A2");
    expect(prompt).not.toMatch(/Speak only in English/);
    expect(prompt).toMatch(/native Hebrew speaker/);
    expect(prompt).toMatch(/FIX:/);
  });

  it("asks for short spoken replies on a voice call", () => {
    expect(buildConversationSystemPrompt("You are a waiter.", "B1", false)).toMatch(/live voice call/);
  });

  it("keeps a beginner's Hebrew glosses but not an advanced learner's", () => {
    expect(buildConversationSystemPrompt(null, "A1")).toMatch(/short Hebrew gloss is welcome/);
    expect(buildConversationSystemPrompt(null, "C1")).toMatch(/keep your own replies in English/);
  });
});

describe("reply tidying", () => {
  it("drops markdown bold and the long dash", () => {
    expect(splitConversationReply("קבלה זה **receipt**.").reply).toBe("קבלה זה receipt.");
    expect(splitConversationReply("That's a solid routine — coffee helps.").reply).toBe("That's a solid routine, coffee helps.");
  });
});

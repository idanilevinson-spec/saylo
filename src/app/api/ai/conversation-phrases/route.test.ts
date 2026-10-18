import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, from, isPaidServer, findLearnerWord, saveLearnerWord, upsert } = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  isPaidServer: vi.fn(),
  findLearnerWord: vi.fn(),
  saveLearnerWord: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { getUser }, from }),
}));
vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPaidServer }));
vi.mock("@/lib/vocabulary/learnerWords", () => ({ findLearnerWord, saveLearnerWord }));

import { POST } from "./route";

const request = (body: object = { conversationId: "c1" }) =>
  new Request("http://localhost/api/ai/conversation-phrases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const phrase = (lemma: string) => ({
  lemma,
  he: "x",
  pos: "phrase",
  level: "B1",
  distractors: ["a b", "c d", "e f"],
  example: `I ${lemma}.`,
});

let ownsConversation = true;
let phrases: ReturnType<typeof phrase>[] = [];
const curated: Record<string, string> = { "make a decision": "cur1" };

beforeEach(() => {
  vi.resetAllMocks();
  ownsConversation = true;
  phrases = [phrase("make a decision"), phrase("look forward to"), phrase("brand new")];
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  isPaidServer.mockResolvedValue(true);
  findLearnerWord.mockImplementation(async (w: string) => (w === "look forward to" ? "lw1" : null));
  saveLearnerWord.mockImplementation(async (_p: unknown, _s: string, id: string) => id);
  upsert.mockResolvedValue({ error: null });
  from.mockImplementation((table: string) => {
    let headword = "";
    const chain = {
      select: () => chain,
      eq: () => chain,
      limit: () => chain,
      ilike: (_c: string, v: string) => {
        headword = v;
        return chain;
      },
      upsert,
      maybeSingle: async () => {
        if (table === "conversations") return { data: ownsConversation ? { id: "c1" } : null };
        if (table === "conversation_scores") return { data: { feedback: { usefulPhrases: phrases } } };
        if (table === "vocabulary_items") return { data: curated[headword] ? { id: curated[headword] } : null };
        return { data: null };
      },
    };
    return chain;
  });
});

describe("POST /api/ai/conversation-phrases", () => {
  it("only works on the learner's own conversation", async () => {
    ownsConversation = false;
    expect((await POST(request())).status).toBe(404);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("is for paying learners only", async () => {
    isPaidServer.mockResolvedValue(false);
    expect((await POST(request())).status).toBe(403);
  });

  it("uses the catalog, then words learners added, then stores what's new, and adds them all to reviews", async () => {
    const body = await (await POST(request())).json();
    expect(body.added.map((a: { headword: string }) => a.headword)).toEqual(["make a decision", "look forward to", "brand new"]);
    expect(body.added[0].vocabularyItemId).toBe("cur1");
    expect(body.added[1].vocabularyItemId).toBe("lw1");
    expect(saveLearnerWord).toHaveBeenCalledTimes(1);
    expect(saveLearnerWord.mock.calls[0][0]).toMatchObject({ lemma: "brand new" });
    const rows = upsert.mock.calls[0][0] as { profile_id: string; vocabulary_item_id: string }[];
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.profile_id === "user-1")).toBe(true);
    expect(upsert.mock.calls[0][1]).toMatchObject({ ignoreDuplicates: true });
  });

  it("does nothing for a summary without phrases", async () => {
    phrases = [];
    expect(await (await POST(request())).json()).toEqual({ added: [] });
    expect(upsert).not.toHaveBeenCalled();
  });
});

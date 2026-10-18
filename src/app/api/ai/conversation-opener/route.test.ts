import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, from, isPaidServer, create, extractText, insert } = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  isPaidServer: vi.fn(),
  create: vi.fn(),
  extractText: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (fn: () => unknown) => void fn(),
}));
vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { getUser }, from }),
}));
vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPaidServer }));
vi.mock("@/lib/ai/claudeClient", () => ({ anthropic: { messages: { create } }, CLAUDE_MODEL: "test-model", extractText }));
vi.mock("@/lib/ai/usageLog", () => ({ logAiUsage: vi.fn() }));
vi.mock("@/lib/ai/learnerMemory", () => ({ getLearnerMemory: vi.fn(async () => null) }));

import { POST } from "./route";

const request = () =>
  new Request("http://localhost/api/ai/conversation-opener", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId: "c1" }),
  });

let conversation: { id: string; status: string; conversation_scenarios: null } | null;
// Message counts the route sees, in order (before writing, then right before inserting).
let counts: number[];

beforeEach(() => {
  vi.resetAllMocks();
  conversation = { id: "c1", status: "active", conversation_scenarios: null };
  counts = [0, 0];
  getUser.mockResolvedValue({ data: { user: { id: "user-1", user_metadata: { ai_consent_at: "2026-09-21T09:00:00.000Z" } } } });
  isPaidServer.mockResolvedValue(true);
  create.mockResolvedValue({ usage: { input_tokens: 1, output_tokens: 1 } });
  extractText.mockReturnValue("Hi! Last time we talked about the beach. Did you go again?");
  insert.mockResolvedValue({ error: null });
  from.mockImplementation((table: string) => {
    let countQuery = false;
    const chain = {
      select: (_c: string, opts?: { head?: boolean }) => {
        countQuery = !!opts?.head;
        return chain;
      },
      eq: () => (countQuery && table === "conversation_messages" ? Promise.resolve({ count: counts.shift() ?? 0 }) : chain),
      order: () => chain,
      limit: () => chain,
      insert,
      maybeSingle: async () => {
        if (table === "profiles") return { data: { age_band: "adult", parental_consent_status: "not_required" } };
        if (table === "conversations") return { data: conversation };
        return { data: null };
      },
    };
    return chain;
  });
});

describe("POST /api/ai/conversation-opener", () => {
  it("is for paying learners only", async () => {
    isPaidServer.mockResolvedValue(false);
    expect((await POST(request())).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("opens an empty conversation and stores the line as the teacher's", async () => {
    expect(await (await POST(request())).json()).toEqual({ opener: "Hi! Last time we talked about the beach. Did you go again?" });
    expect(insert).toHaveBeenCalledWith({
      conversation_id: "c1",
      role: "assistant",
      content: "Hi! Last time we talked about the beach. Did you go again?",
    });
  });

  it("never writes into a conversation that already has messages", async () => {
    counts = [2];
    expect(await (await POST(request())).json()).toEqual({ opener: null });
    expect(create).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("drops the opener if the learner typed while it was being written", async () => {
    counts = [0, 1];
    expect(await (await POST(request())).json()).toEqual({ opener: null });
    expect(insert).not.toHaveBeenCalled();
  });

  it("does nothing for an ended conversation", async () => {
    conversation = { id: "c1", status: "completed", conversation_scenarios: null };
    expect(await (await POST(request())).json()).toEqual({ opener: null });
    expect(create).not.toHaveBeenCalled();
  });

  it("strips a stray correction line", async () => {
    extractText.mockReturnValue('Hello! How are you today?\nFIX:{"original":"a","better":"b","why":"c"}');
    expect(await (await POST(request())).json()).toEqual({ opener: "Hello! How are you today?" });
  });
});

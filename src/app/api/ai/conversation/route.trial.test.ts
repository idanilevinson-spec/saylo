import { beforeEach, describe, expect, it, vi } from "vitest";

// The trial taste of the teacher, enforced by the conversation route: the
// first two conversations, twelve learner messages each.
const { getUser, from, isPaidServer, trialIds, create } = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  isPaidServer: vi.fn(),
  trialIds: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({ createClient: async () => ({ auth: { getUser }, from }) }));
vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPaidServer }));
vi.mock("@/lib/subscriptions/teacherTrial", async (orig) => ({
  ...(await orig<typeof import("@/lib/subscriptions/teacherTrial")>()),
  trialTeacherConversationIds: trialIds,
}));
vi.mock("@/lib/ai/claudeClient", () => ({ anthropic: { messages: { create, stream: create } }, CLAUDE_MODEL: "m", extractText: () => "Hi" }));
vi.mock("@/lib/ai/usageLog", () => ({ logAiUsage: vi.fn() }));
vi.mock("@/lib/ai/learnerMemory", () => ({ getLearnerMemory: vi.fn(async () => null) }));

import { POST } from "./route";

let priorMessages: { role: string; content: string }[] = [];

const request = (conversationId: string) =>
  new Request("http://localhost/api/ai/conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, message: "hello" }),
  });

beforeEach(() => {
  vi.resetAllMocks();
  priorMessages = [];
  getUser.mockResolvedValue({ data: { user: { id: "u1", user_metadata: { ai_consent_at: "2026-09-21T09:00:00.000Z" } } } });
  isPaidServer.mockResolvedValue(false);
  create.mockResolvedValue({ content: [], usage: { input_tokens: 1, output_tokens: 1 } });
  from.mockImplementation((table: string) => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      gte: () => Promise.resolve({ count: 0 }),
      limit: () => chain,
      order: () => (table === "conversation_messages" ? Promise.resolve({ data: priorMessages }) : chain),
      insert: () => Promise.resolve({ error: null }),
      maybeSingle: async () => {
        if (table === "profiles") return { data: { age_band: "adult", parental_consent_status: "not_required" } };
        if (table === "conversations") return { data: { id: "c1", status: "active", conversation_scenarios: null } };
        return { data: null };
      },
    };
    return chain;
  });
});

describe("POST /api/ai/conversation during the free trial", () => {
  it("is closed to a learner with no active trial", async () => {
    trialIds.mockResolvedValue(null);
    const res = await POST(request("c1"));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "premium required" });
  });

  it("refuses a third conversation", async () => {
    trialIds.mockResolvedValue(["c1", "c2"]);
    const res = await POST(request("c3"));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "trial teacher limit" });
    expect(create).not.toHaveBeenCalled();
  });

  it("refuses the thirteenth message of a trial conversation", async () => {
    trialIds.mockResolvedValue(["c1"]);
    priorMessages = Array.from({ length: 24 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "x" }));
    const res = await POST(request("c1"));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "trial teacher limit" });
    expect(create).not.toHaveBeenCalled();
  });

  it("answers within the taste", async () => {
    trialIds.mockResolvedValue(["c1"]);
    priorMessages = [{ role: "assistant", content: "Hi!" }];
    const res = await POST(request("c1"));
    expect(res.status).toBe(200);
    expect(create).toHaveBeenCalledTimes(1);
  });
});

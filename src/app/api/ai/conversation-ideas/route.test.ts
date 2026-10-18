import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, maybeSingle, limit, from, isPaidServer, create, extractText } = vi.hoisted(() => ({
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  limit: vi.fn(),
  from: vi.fn(),
  isPaidServer: vi.fn(),
  create: vi.fn(),
  extractText: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { getUser }, from }),
}));
vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPaidServer }));
vi.mock("@/lib/ai/claudeClient", () => ({
  anthropic: { messages: { create } },
  CLAUDE_MODEL: "test-model",
  extractText,
  parseJsonResponse: (raw: string) => JSON.parse(raw),
}));
vi.mock("@/lib/ai/usageLog", () => ({ logAiUsage: vi.fn() }));

import { POST } from "./route";

const request = () =>
  new Request("http://localhost/api/ai/conversation-ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId: "c1" }),
  });

interface Chain {
  select: () => Chain;
  eq: () => Chain;
  order: () => Chain;
  limit: typeof limit;
  maybeSingle: typeof maybeSingle;
}

beforeEach(() => {
  vi.resetAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "user-1", user_metadata: { ai_consent_at: "2026-09-21T09:00:00.000Z" } } } });
  isPaidServer.mockResolvedValue(true);
  const chain: Chain = { select: () => chain, eq: () => chain, order: () => chain, limit, maybeSingle };
  // Messages end with .limit(8); the placement lookup continues to .maybeSingle().
  limit.mockImplementation(() => Object.assign(Promise.resolve({ data: messages }), chain));
  from.mockImplementation(() => chain);
  create.mockResolvedValue({ usage: { input_tokens: 1, output_tokens: 1 } });
  extractText.mockReturnValue(JSON.stringify({ ideas: [{ en: "Yes, I do.", he: "כן." }] }));
});

let messages: { role: string; content: string }[] = [];
const adult = { data: { age_band: "adult", parental_consent_status: "not_required" } };
const activeConversation = { data: { id: "c1", status: "active", conversation_scenarios: null } };

describe("POST /api/ai/conversation-ideas", () => {
  it("is for paying learners only", async () => {
    isPaidServer.mockResolvedValue(false);
    maybeSingle.mockResolvedValue(adult);
    expect((await POST(request())).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("refuses an ended conversation", async () => {
    maybeSingle.mockResolvedValueOnce(adult).mockResolvedValueOnce({ data: { id: "c1", status: "completed" } });
    const res = await POST(request());
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("has nothing to suggest right after the learner spoke", async () => {
    messages = [{ role: "user", content: "hi" }];
    maybeSingle.mockResolvedValueOnce(adult).mockResolvedValueOnce(activeConversation).mockResolvedValue({ data: null });
    expect(await (await POST(request())).json()).toEqual({ ideas: [] });
    expect(create).not.toHaveBeenCalled();
  });

  it("suggests answers to the teacher's last line, and openers for an empty conversation", async () => {
    for (const m of [[{ role: "assistant", content: "How are you?" }], []]) {
      messages = m;
      maybeSingle.mockResolvedValueOnce(adult).mockResolvedValueOnce(activeConversation).mockResolvedValue({ data: null });
      expect(await (await POST(request())).json()).toEqual({ ideas: [{ en: "Yes, I do.", he: "כן." }] });
    }
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1][0].messages[0].content).toMatch(/learner speaks first/);
  });
});

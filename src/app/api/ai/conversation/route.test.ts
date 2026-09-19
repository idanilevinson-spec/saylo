import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, maybeSingle, from, isPaidServer } = vi.hoisted(() => ({
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
  isPaidServer: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({ auth: { getUser }, from }),
}));
vi.mock("@/lib/subscriptions/requirePremium", () => ({ isPaidServer }));
vi.mock("@/lib/ai/claudeClient", () => ({ anthropic: {}, CLAUDE_MODEL: "test-model", extractText: vi.fn() }));
vi.mock("@/lib/ai/prompts/conversationPartner", () => ({ buildConversationSystemPrompt: vi.fn() }));
vi.mock("@/lib/ai/usageLog", () => ({ logAiUsage: vi.fn() }));

import { POST } from "./route";

function request() {
  return new Request("http://localhost/api/ai/conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId: "c1", message: "hello" }),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  isPaidServer.mockResolvedValue(true);
  const chain: Chain = { select: () => chain, eq: () => chain, maybeSingle };
  from.mockImplementation(() => chain);
});

interface Chain {
  select: () => Chain;
  eq: () => Chain;
  maybeSingle: typeof maybeSingle;
}

describe("POST /api/ai/conversation consent gate", () => {
  it("refuses a minor whose guardian has not granted consent, before touching any conversation", async () => {
    maybeSingle.mockResolvedValue({ data: { age_band: "child", parental_consent_status: "pending" } });
    const res = await POST(request());
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "parental consent required" });
    expect(from).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith("profiles");
  });

  it("refuses a signed-in user who has no profile row yet", async () => {
    maybeSingle.mockResolvedValue({ data: null });
    expect((await POST(request())).status).toBe(403);
  });

  it("lets an adult through the gate (reaches the conversation lookup)", async () => {
    maybeSingle
      .mockResolvedValueOnce({ data: { age_band: "adult", parental_consent_status: "not_required" } })
      .mockResolvedValueOnce({ data: null });
    const res = await POST(request());
    expect(from).toHaveBeenCalledWith("conversations");
    expect(res.status).toBe(404);
  });
});

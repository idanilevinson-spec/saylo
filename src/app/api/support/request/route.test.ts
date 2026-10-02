import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, consume, conversationLookup, insertRequest, sendEmail } = vi.hoisted(() => ({
  getUser: vi.fn(),
  consume: vi.fn(),
  conversationLookup: vi.fn(),
  insertRequest: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/serverClient", () => ({ createClient: async () => ({ auth: { getUser } }) }));
vi.mock("@/lib/support/rateLimit", () => ({
  consumeRateLimit: consume,
  SUPPORT_LIMITS: { requestsPerIp: 5, requestsPerProfile: 5 },
}));
vi.mock("@/lib/support/identity", () => ({
  clientIp: () => "1.2.3.4",
  supportHash: (kind: string, value: string) => `${kind}:${value}`,
  ownerKey: (profileId: string | null, token: string) => (profileId ? `p:${profileId}` : `v:${token}`),
  VISITOR_TOKEN_PATTERN: /^[A-Za-z0-9_-]{20,64}$/,
}));
vi.mock("@/lib/supabase/adminClient", () => ({
  supabaseAdmin: {
    from: (table: string) =>
      table === "support_conversations"
        ? {
            select: () => ({
              eq: (_c: string, id: string) => ({ eq: (_o: string, owner: string) => ({ maybeSingle: () => conversationLookup(id, owner) }) }),
            }),
          }
        : { insert: (row: unknown) => ({ select: () => ({ single: () => insertRequest(row) }) }) },
  },
}));
vi.mock("@/lib/notifications/resend", () => ({ sendSupportRequestNotification: sendEmail }));

import { POST } from "./route";

const TOKEN = "visitor_token_abcdefghijklmnop";
const valid = {
  visitorToken: TOKEN,
  name: "דנה",
  email: "dana@example.com",
  preferredChannel: "email",
  topic: "billing",
  message: "חויבתי פעמיים",
  consent: true,
};

function request(body: unknown) {
  return new Request("https://saylolearn.com/api/support/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  getUser.mockResolvedValue({ data: { user: null } });
  consume.mockResolvedValue(true);
  conversationLookup.mockResolvedValue({ data: null });
  insertRequest.mockResolvedValue({ data: { id: "abcdef12-0000-0000-0000-000000000000" }, error: null });
  sendEmail.mockResolvedValue(true);
});

describe("POST /api/support/request", () => {
  it("stores the request, emails the team and returns a short reference", async () => {
    const res = await POST(request(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ reference: "ABCDEF12" });
    expect(insertRequest).toHaveBeenCalledWith(
      expect.objectContaining({ name: "דנה", email: "dana@example.com", phone: null, topic: "billing" })
    );
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("requires consent and a usable contact for the chosen channel", async () => {
    expect((await POST(request({ ...valid, consent: false }))).status).toBe(400);
    expect((await POST(request({ ...valid, preferredChannel: "whatsapp" }))).status).toBe(400);
    expect((await POST(request({ ...valid, email: "not-an-email" }))).status).toBe(400);
    expect((await POST(request({ ...valid, preferredChannel: "phone", phone: "123" }))).status).toBe(400);
    expect(insertRequest).not.toHaveBeenCalled();
  });

  it("normalizes an Israeli phone number", async () => {
    await POST(request({ ...valid, preferredChannel: "whatsapp", phone: "050-123-4567" }));
    expect(insertRequest).toHaveBeenCalledWith(expect.objectContaining({ phone: "+972501234567" }));
  });

  it("pretends to succeed for bots that fill the hidden field, and stores nothing", async () => {
    const res = await POST(request({ ...valid, website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(insertRequest).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("refuses once the daily limit is reached", async () => {
    consume.mockResolvedValue(false);
    expect((await POST(request(valid))).status).toBe(429);
    expect(insertRequest).not.toHaveBeenCalled();
  });

  it("attaches a chat only when this browser owns it", async () => {
    const conversationId = "11111111-1111-4111-8111-111111111111";
    await POST(request({ ...valid, conversationId }));
    expect(conversationLookup).toHaveBeenCalledWith(conversationId, `v:${TOKEN}`);
    expect(insertRequest).toHaveBeenCalledWith(expect.objectContaining({ conversation_id: null }));
  });

  it("still succeeds when the notification email fails — the request is saved", async () => {
    sendEmail.mockResolvedValue(false);
    expect((await POST(request(valid))).status).toBe(200);
  });
});

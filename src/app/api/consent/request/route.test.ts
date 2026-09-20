import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, profileSingle, recentCount, insertSingle, updateEq, sendEmail } = vi.hoisted(() => ({
  getUser: vi.fn(),
  profileSingle: vi.fn(),
  recentCount: vi.fn(),
  insertSingle: vi.fn(),
  updateEq: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: (table: string) =>
      table === "profiles"
        ? {
            select: () => ({ eq: () => ({ maybeSingle: profileSingle }) }),
            update: () => ({ eq: updateEq }),
          }
        : {
            select: () => ({ eq: () => ({ gte: recentCount }) }),
            insert: () => ({ select: () => ({ single: insertSingle }) }),
          },
  }),
}));

vi.mock("@/lib/notifications/resend", () => ({ sendGuardianConsentEmail: sendEmail }));

import { POST } from "./route";

function request(body?: unknown) {
  return new Request("https://saylolearn.com/api/consent/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "kid-1" } } });
  profileSingle.mockResolvedValue({
    data: { display_name: "נועם", age_band: "child", parental_consent_status: "not_required" },
  });
  recentCount.mockResolvedValue({ count: 0 });
  insertSingle.mockResolvedValue({ data: { consent_token: "tok-123" }, error: null });
  updateEq.mockResolvedValue({ error: null });
  sendEmail.mockResolvedValue(true);
});

describe("POST /api/consent/request", () => {
  it("rejects a request with no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(request({ guardianEmail: "p@example.com" }))).status).toBe(401);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a missing or malformed email before sending anything", async () => {
    expect((await POST(request({}))).status).toBe(400);
    expect((await POST(request({ guardianEmail: "not-an-email" }))).status).toBe(400);
    expect((await POST(request({ guardianEmail: 42 }))).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does not send mail on behalf of an adult account", async () => {
    profileSingle.mockResolvedValue({
      data: { display_name: "דנה", age_band: "adult", parental_consent_status: "not_required" },
    });
    expect((await POST(request({ guardianEmail: "p@example.com" }))).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("stops at three requests in 24 hours", async () => {
    recentCount.mockResolvedValue({ count: 3 });
    expect((await POST(request({ guardianEmail: "p@example.com" }))).status).toBe(429);
    expect(insertSingle).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("emails the guardian the consent link and does not hand the token back", async () => {
    const res = await POST(request({ guardianEmail: " p@example.com " }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ emailSent: true, consentToken: null });
    expect(sendEmail).toHaveBeenCalledExactlyOnceWith(
      "p@example.com",
      "נועם",
      "https://saylolearn.com/consent/tok-123"
    );
  });

  it("falls back to returning the link when the email cannot be sent", async () => {
    sendEmail.mockResolvedValue(false);
    const res = await POST(request({ guardianEmail: "p@example.com" }));
    expect(await res.json()).toEqual({ emailSent: false, consentToken: "tok-123" });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, profileMaybeSingle, existingMaybeSingle, insertSingle, deleteEq, sendEmail } = vi.hoisted(() => ({
  getUser: vi.fn(),
  profileMaybeSingle: vi.fn(),
  existingMaybeSingle: vi.fn(),
  insertSingle: vi.fn(),
  deleteEq: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: profileMaybeSingle }) }) }),
  }),
}));

vi.mock("@/lib/supabase/adminClient", () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: existingMaybeSingle }) }),
      upsert: () => ({ select: () => ({ single: insertSingle }) }),
      delete: () => ({ eq: deleteEq }),
    }),
  },
}));

vi.mock("@/lib/notifications/resend", () => ({ sendGuardianReportConsentEmail: sendEmail }));

import { POST } from "./route";

function request(body?: unknown) {
  return new Request("https://saylolearn.com/api/guardian-report/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "kid-1" } } });
  profileMaybeSingle.mockResolvedValue({
    data: { display_name: "נועם", age_band: "child", parental_consent_status: "granted" },
  });
  existingMaybeSingle.mockResolvedValue({ data: null });
  insertSingle.mockResolvedValue({ data: { id: "consent-1", consent_token: "tok-abc" }, error: null });
  sendEmail.mockResolvedValue(true);
});

describe("POST /api/guardian-report/request", () => {
  it("rejects a request with no signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(request({ guardianEmail: "p@example.com" }))).status).toBe(401);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a missing or malformed email", async () => {
    expect((await POST(request({}))).status).toBe(400);
    expect((await POST(request({ guardianEmail: "not-an-email" }))).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("refuses an adult account", async () => {
    profileMaybeSingle.mockResolvedValue({
      data: { display_name: "דנה", age_band: "adult", parental_consent_status: "granted" },
    });
    expect((await POST(request({ guardianEmail: "p@example.com" }))).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("refuses a minor whose voice-feature consent isn't granted yet", async () => {
    profileMaybeSingle.mockResolvedValue({
      data: { display_name: "נועם", age_band: "child", parental_consent_status: "pending" },
    });
    expect((await POST(request({ guardianEmail: "p@example.com" }))).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("refuses a re-request inside the cooldown window", async () => {
    existingMaybeSingle.mockResolvedValue({ data: { id: "consent-1", created_at: new Date().toISOString() } });
    expect((await POST(request({ guardianEmail: "p@example.com" }))).status).toBe(429);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("allows a re-request once the cooldown has passed", async () => {
    existingMaybeSingle.mockResolvedValue({
      data: { id: "consent-1", created_at: new Date(Date.now() - 10 * 60_000).toISOString() },
    });
    const res = await POST(request({ guardianEmail: "p@example.com" }));
    expect(res.status).toBe(200);
  });

  it("emails the guardian and never returns the token", async () => {
    const res = await POST(request({ guardianEmail: " p@example.com " }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ emailSent: true });
    expect(JSON.stringify(body)).not.toContain("tok-abc");
    expect(sendEmail).toHaveBeenCalledExactlyOnceWith(
      "p@example.com",
      "נועם",
      "https://saylolearn.com/guardian-report/tok-abc"
    );
  });

  it("fails closed and drops the request when the email cannot be sent", async () => {
    sendEmail.mockResolvedValue(false);
    const res = await POST(request({ guardianEmail: "p@example.com" }));
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("tok-abc");
    expect(deleteEq).toHaveBeenCalledExactlyOnceWith("id", "consent-1");
  });
});

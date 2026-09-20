import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, profileSingle, recentCount, insertSingle, deleteCalls, profileUpdates, sendEmail } = vi.hoisted(() => ({
  getUser: vi.fn(),
  profileSingle: vi.fn(),
  recentCount: vi.fn(),
  insertSingle: vi.fn(),
  deleteCalls: vi.fn(),
  profileUpdates: vi.fn(),
  sendEmail: vi.fn(),
}));

// The signed-in user's client can only read their own profile; every write
// goes through the service-role client below.
vi.mock("@/lib/supabase/serverClient", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: profileSingle }) }) }),
  }),
}));

// A thenable chain that records the filters a delete was built with.
function deleteChain(filters: unknown[][] = []) {
  const chain = {
    eq: (...args: unknown[]) => deleteChain([...filters, ["eq", ...args]]),
    neq: (...args: unknown[]) => deleteChain([...filters, ["neq", ...args]]),
    then: (resolve: (value: unknown) => void) => {
      deleteCalls(filters);
      resolve({ error: null });
    },
  };
  return chain;
}

vi.mock("@/lib/supabase/adminClient", () => ({
  supabaseAdmin: {
    from: (table: string) =>
      table === "profiles"
        ? { update: (values: unknown) => ({ eq: async () => profileUpdates(values) }) }
        : {
            select: () => ({ eq: () => ({ gte: recentCount }) }),
            insert: () => ({ select: () => ({ single: insertSingle }) }),
            delete: () => deleteChain(),
          },
  },
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
  insertSingle.mockResolvedValue({ data: { id: "link-1", consent_token: "tok-123" }, error: null });
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

  it("emails the guardian, never returns the token, and marks the request pending", async () => {
    const res = await POST(request({ guardianEmail: " p@example.com " }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ emailSent: true });
    expect(JSON.stringify(body)).not.toContain("tok-123");
    expect(sendEmail).toHaveBeenCalledExactlyOnceWith(
      "p@example.com",
      "נועם",
      "https://saylolearn.com/consent/tok-123"
    );
    expect(profileUpdates).toHaveBeenCalledExactlyOnceWith({ parental_consent_status: "pending" });
  });

  it("invalidates the minor's earlier pending links once the new one is sent", async () => {
    await POST(request({ guardianEmail: "p@example.com" }));
    expect(deleteCalls).toHaveBeenCalledExactlyOnceWith([
      ["eq", "minor_profile_id", "kid-1"],
      ["eq", "status", "pending"],
      ["neq", "id", "link-1"],
    ]);
  });

  it("fails closed when the email cannot be sent: no token, request dropped, status unchanged", async () => {
    sendEmail.mockResolvedValue(false);
    const res = await POST(request({ guardianEmail: "p@example.com" }));
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("tok-123");
    expect(deleteCalls).toHaveBeenCalledExactlyOnceWith([["eq", "id", "link-1"]]);
    expect(profileUpdates).not.toHaveBeenCalled();
  });
});

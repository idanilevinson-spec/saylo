import { beforeEach, describe, expect, it, vi } from "vitest";

const { isValidPayplusCallback, from, upsert, update, eqPlan, eqProfile, eqBilling, maybeSingle } = vi.hoisted(() => ({
  isValidPayplusCallback: vi.fn(),
  from: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
  eqPlan: vi.fn(),
  eqProfile: vi.fn(),
  eqBilling: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/subscriptions/payplusClient", () => ({ isValidPayplusCallback }));

vi.mock("@/lib/supabase/adminClient", () => ({
  supabaseAdmin: { from },
}));

import { POST } from "./route";

function request(rawBody: string, hash: string | null = "valid-hash") {
  const headers = new Headers();
  if (hash !== null) headers.set("hash", hash);
  return new Request("http://localhost/api/webhooks/payplus", { method: "POST", headers, body: rawBody });
}

beforeEach(() => {
  vi.resetAllMocks();
  isValidPayplusCallback.mockReturnValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});

  // subscription_plans select chain: .select().eq().maybeSingle()
  // subscriptions upsert: .upsert()
  // subscriptions update chain: .update().eq().eq()
  from.mockImplementation((table: string) => {
    if (table === "subscription_plans") {
      return { select: () => ({ eq: eqPlan.mockReturnValue({ maybeSingle }) }) };
    }
    return {
      upsert,
      update: update.mockReturnValue({ eq: eqProfile.mockReturnValue({ eq: eqBilling }) }),
    };
  });
  maybeSingle.mockResolvedValue({ data: { months: 1 } });
  upsert.mockResolvedValue({ error: null });
  eqBilling.mockResolvedValue({ error: null });
});

describe("POST /api/webhooks/payplus", () => {
  it("rejects a request with an invalid signature", async () => {
    isValidPayplusCallback.mockReturnValue(false);
    const res = await POST(request("{}"));
    expect(res.status).toBe(401);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects a body with no more_info", async () => {
    const res = await POST(request(JSON.stringify({ status_code: "000" })));
    expect(res.status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects unparseable more_info", async () => {
    const res = await POST(request(JSON.stringify({ status_code: "000", more_info: "{not json" })));
    expect(res.status).toBe(400);
  });

  it("activates the subscription and stores the card token on a successful charge", async () => {
    const body = JSON.stringify({
      status_code: "000",
      more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }),
      data: { token: "tok-1", customer_uid: "cust-1" },
    });

    const res = await POST(request(body));

    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        profile_id: "profile-1",
        plan_id: "plan-1",
        status: "active",
        billing_provider: "payplus",
        payplus_token: "tok-1",
        payplus_customer_uid: "cust-1",
        cancel_at_period_end: false,
      })
    );
  });

  it("logs an error but still activates when no token comes back on a successful charge", async () => {
    const body = JSON.stringify({
      status_code: "000",
      more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }),
    });

    const res = await POST(request(body));

    expect(res.status).toBe(200);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("no card token captured"), "profile-1");
    expect(upsert).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ payplus_token: null, payplus_customer_uid: null })
    );
  });

  it("marks the subscription past_due on a failed charge, scoped to payplus rows", async () => {
    const body = JSON.stringify({
      status_code: "999",
      more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }),
    });

    const res = await POST(request(body));

    expect(res.status).toBe(200);
    expect(upsert).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: "past_due" }));
    expect(eqProfile).toHaveBeenCalledWith("profile_id", "profile-1");
    expect(eqBilling).toHaveBeenCalledWith("billing_provider", "payplus");
  });

  it("reports a write failure on the success path as a 500 so PayPlus retries", async () => {
    upsert.mockResolvedValue({ error: { message: "db down" } });
    const body = JSON.stringify({
      status_code: "000",
      more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }),
    });

    const res = await POST(request(body));
    expect(res.status).toBe(500);
  });
});

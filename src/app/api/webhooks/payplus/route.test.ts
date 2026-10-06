import { beforeEach, describe, expect, it, vi } from "vitest";

const { recordPaymentAndIssueReceipt } = vi.hoisted(() => ({ recordPaymentAndIssueReceipt: vi.fn() }));

vi.mock("@/lib/billing/receipts", () => ({
  recordPaymentAndIssueReceipt,
  planDescription: (code: string) => `מנוי Saylo — ${code}`,
}));

vi.mock("@/lib/billing/customer", () => ({
  customerForProfile: async () => ({ name: "Dana", email: "dana@example.com" }),
}));

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
  maybeSingle.mockResolvedValue({ data: { months: 1, price_ils: 59, code: "monthly" } });
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
    const res = await POST(request(JSON.stringify({ transaction: { status_code: "000" } })));
    expect(res.status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects unparseable more_info", async () => {
    const res = await POST(request(JSON.stringify({ transaction: { status_code: "000", more_info: "{not json" } })));
    expect(res.status).toBe(400);
  });

  // Shaped after a real logged callback (2026-10-06) — PayPlus nests
  // status_code/more_info under `transaction`, not top-level like the docs'
  // generic example implied. A flat-shaped body here would pass even if that
  // regressed, since optional chaining on a missing `transaction` silently
  // yields undefined instead of throwing.
  it("activates the subscription and stores the card token on a successful charge", async () => {
    const body = JSON.stringify({
      transaction: { status_code: "000", more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }) },
      data: { customer_uid: "cust-1", card_information: { token: "tok-1" } },
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

  it("records the payment for a receipt, keyed on the PayPlus transaction", async () => {
    const body = JSON.stringify({
      transaction: {
        uid: "txn-9",
        status_code: "000",
        more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }),
      },
      data: { customer_uid: "cust-1", card_information: { token: "tok-1" } },
    });

    await POST(request(body));

    expect(recordPaymentAndIssueReceipt).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        paymentRef: "payplus:txn-9",
        source: "checkout",
        profileId: "profile-1",
        amountIls: 59,
        customerEmail: "dana@example.com",
      })
    );
  });

  it("issues no receipt for a failed charge", async () => {
    const body = JSON.stringify({
      transaction: { status_code: "999", more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }) },
    });
    await POST(request(body));
    expect(recordPaymentAndIssueReceipt).not.toHaveBeenCalled();
  });

  it("logs an error but still activates when no token comes back on a successful charge", async () => {
    const body = JSON.stringify({
      transaction: { status_code: "000", more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }) },
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
      transaction: { status_code: "999", more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }) },
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
      transaction: { status_code: "000", more_info: JSON.stringify({ profile_id: "profile-1", plan_id: "plan-1" }) },
    });

    const res = await POST(request(body));
    expect(res.status).toBe(500);
  });
});

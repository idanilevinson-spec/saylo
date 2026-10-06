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

  it("rejects a body with no profile id", async () => {
    const res = await POST(request(JSON.stringify({ transaction: { status_code: "000" } })));
    expect(res.status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });

  // Regression test for a real production incident (2026-10-06): a combined
  // `more_info: '{"profile_id":"...","plan_id":"..."}'` JSON string is
  // 102+ characters (two UUIDs), but PayPlus silently truncates `more_info`
  // at 100 — every real charge's JSON came back cut off and unparseable,
  // so every webhook 400'd and PayPlus retried the same broken callback
  // every 5 minutes forever. Each id now travels in its own short
  // more_info_N field instead, comfortably under that limit.
  it("reads profile_id/plan_id from more_info_1/more_info_2, not a combined JSON string", async () => {
    const body = JSON.stringify({
      transaction: {
        status_code: "000",
        more_info_1: "63e1ed84-d590-484e-8bff-895938da4920",
        more_info_2: "715b7460-5224-4cff-9858-d7bd388553a7",
      },
      data: { customer_uid: "cust-1", card_information: { token: "tok-1" } },
    });

    const res = await POST(request(body));

    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        profile_id: "63e1ed84-d590-484e-8bff-895938da4920",
        plan_id: "715b7460-5224-4cff-9858-d7bd388553a7",
      })
    );
  });

  // Shaped after a real logged callback (2026-10-06) — PayPlus nests
  // status_code/more_info_N under `transaction`, not top-level like the
  // docs' generic example implied. A flat-shaped body here would pass even
  // if that regressed, since optional chaining on a missing `transaction`
  // silently yields undefined instead of throwing.
  it("activates the subscription and stores the card token on a successful charge", async () => {
    const body = JSON.stringify({
      transaction: { status_code: "000", more_info_1: "profile-1", more_info_2: "plan-1" },
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
      transaction: { uid: "txn-9", status_code: "000", more_info_1: "profile-1", more_info_2: "plan-1" },
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
      transaction: { status_code: "999", more_info_1: "profile-1", more_info_2: "plan-1" },
    });
    await POST(request(body));
    expect(recordPaymentAndIssueReceipt).not.toHaveBeenCalled();
  });

  it("logs an error but still activates when no token comes back on a successful charge", async () => {
    const body = JSON.stringify({
      transaction: { status_code: "000", more_info_1: "profile-1", more_info_2: "plan-1" },
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
      transaction: { status_code: "999", more_info_1: "profile-1", more_info_2: "plan-1" },
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
      transaction: { status_code: "000", more_info_1: "profile-1", more_info_2: "plan-1" },
    });

    const res = await POST(request(body));
    expect(res.status).toBe(500);
  });
});

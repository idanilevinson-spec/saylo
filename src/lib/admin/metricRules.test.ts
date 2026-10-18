import { describe, expect, it } from "vitest";
import { countActiveLearners, subscriptionLabel, summarizeRevenue, type AdminSubscriptionRow } from "./metricRules";

const now = new Date("2026-10-18T12:00:00Z");
const monthly = { code: "monthly", price_ils: 59, months: 1 };
const annual = { code: "annual", price_ils: 449, months: 12 };

function sub(overrides: Partial<AdminSubscriptionRow>): AdminSubscriptionRow {
  return {
    profile_id: "p1",
    status: "active",
    trial_ends_at: null,
    current_period_end: "2026-11-06T00:00:00Z",
    plan: monthly,
    ...overrides,
  };
}

describe("subscriptionLabel", () => {
  it("keeps a current paid subscription active", () => {
    expect(subscriptionLabel(sub({}), now)).toBe("active");
  });

  it("shows an active row whose period ended as expired", () => {
    expect(subscriptionLabel(sub({ current_period_end: "2026-09-29T00:00:00Z" }), now)).toBe("expired");
  });

  it("separates a running trial from one that ended", () => {
    expect(subscriptionLabel(sub({ status: "trialing", trial_ends_at: "2026-10-20T00:00:00Z" }), now)).toBe("trialing");
    expect(subscriptionLabel(sub({ status: "trialing", trial_ends_at: "2026-10-11T00:00:00Z" }), now)).toBe("trial_ended");
    expect(subscriptionLabel(sub({ status: "trialing", trial_ends_at: null }), now)).toBe("trial_ended");
  });

  it("passes other statuses through", () => {
    expect(subscriptionLabel(sub({ status: "past_due" }), now)).toBe("past_due");
  });
});

describe("summarizeRevenue", () => {
  it("counts only paying, in-period, non-test subscriptions", () => {
    const summary = summarizeRevenue(
      [
        sub({ profile_id: "paying" }),
        sub({ profile_id: "lapsed", current_period_end: "2026-09-29T00:00:00Z" }),
        sub({ profile_id: "tester", plan: null, current_period_end: "2027-09-20T00:00:00Z" }),
        sub({ profile_id: "trial", status: "trialing", trial_ends_at: "2026-10-20T00:00:00Z" }),
        sub({ profile_id: "yearly", plan: annual, current_period_end: "2027-01-01T00:00:00Z" }),
      ],
      new Set(["tester"]),
      now,
    );
    expect(summary.payingCount).toBe(2);
    expect(summary.mrr).toBe(Math.round(59 + 449 / 12));
    expect(summary.plans.map((p) => p.code)).toEqual(["monthly", "annual"]);
  });

  it("counts a paying row without a known plan, but adds no revenue for it", () => {
    const summary = summarizeRevenue([sub({ plan: null })], new Set(), now);
    expect(summary.payingCount).toBe(1);
    expect(summary.unpricedCount).toBe(1);
    expect(summary.mrr).toBe(0);
  });
});

describe("countActiveLearners", () => {
  it("counts each learner once across sources and skips test accounts", () => {
    expect(countActiveLearners([["a", "b"], ["b", "c"], ["tester"]], new Set(["tester"]))).toBe(3);
  });
});

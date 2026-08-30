import { describe, it, expect } from "vitest";
import { isPremiumActive } from "./entitlements";

describe("isPremiumActive", () => {
  const now = new Date("2026-06-15T12:00:00Z");

  it("is active during an unexpired trial", () => {
    const sub = { status: "trialing" as const, trial_ends_at: "2026-06-16T12:00:00Z", current_period_end: null };
    expect(isPremiumActive(sub, now)).toBe(true);
  });

  it("is not active once the trial has expired", () => {
    const sub = { status: "trialing" as const, trial_ends_at: "2026-06-14T12:00:00Z", current_period_end: null };
    expect(isPremiumActive(sub, now)).toBe(false);
  });

  it("is active while an active paid subscription's period hasn't ended", () => {
    const sub = { status: "active" as const, trial_ends_at: null, current_period_end: "2026-07-01T00:00:00Z" };
    expect(isPremiumActive(sub, now)).toBe(true);
  });

  it("is not active once an active subscription's period has ended", () => {
    const sub = { status: "active" as const, trial_ends_at: null, current_period_end: "2026-06-01T00:00:00Z" };
    expect(isPremiumActive(sub, now)).toBe(false);
  });

  it("is not active for a canceled subscription even with a future period end", () => {
    const sub = { status: "canceled" as const, trial_ends_at: null, current_period_end: "2026-07-01T00:00:00Z" };
    expect(isPremiumActive(sub, now)).toBe(false);
  });

  it("is not active for expired or past_due status", () => {
    expect(isPremiumActive({ status: "expired", trial_ends_at: null, current_period_end: null }, now)).toBe(false);
    expect(isPremiumActive({ status: "past_due", trial_ends_at: null, current_period_end: null }, now)).toBe(false);
  });
});

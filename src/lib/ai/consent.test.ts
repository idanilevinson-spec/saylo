import { describe, expect, it } from "vitest";
import { hasAiConsent } from "./consent";

describe("hasAiConsent", () => {
  it("is true once a consent time is recorded on the account", () => {
    expect(hasAiConsent({ user_metadata: { ai_consent_at: "2026-09-21T09:00:00.000Z" } })).toBe(true);
  });

  it("is false with no metadata, an empty value, or no user at all", () => {
    expect(hasAiConsent({ user_metadata: {} })).toBe(false);
    expect(hasAiConsent({ user_metadata: null })).toBe(false);
    expect(hasAiConsent({ user_metadata: { ai_consent_at: "" } })).toBe(false);
    expect(hasAiConsent(null)).toBe(false);
    expect(hasAiConsent(undefined)).toBe(false);
  });

  it("does not treat a non-string value as consent", () => {
    expect(hasAiConsent({ user_metadata: { ai_consent_at: true } })).toBe(false);
  });
});

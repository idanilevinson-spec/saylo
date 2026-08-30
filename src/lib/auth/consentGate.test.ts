import { describe, it, expect } from "vitest";
import { requiresParentalConsent } from "./consentGate";
import type { Profile, AgeBand, ParentalConsentStatus } from "@/types/database";

function makeProfile(age_band: AgeBand, parental_consent_status: ParentalConsentStatus): Profile {
  return {
    id: "test-id",
    display_name: "Test User",
    age: age_band === "child" ? 10 : age_band === "teen" ? 15 : 25,
    age_band,
    native_language: "he",
    parental_consent_status,
    is_admin: false,
    email_reminders_enabled: true,
    push_reminders_enabled: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("requiresParentalConsent", () => {
  it("never requires consent for adults, regardless of consent status", () => {
    expect(requiresParentalConsent(makeProfile("adult", "not_required"))).toBe(false);
    expect(requiresParentalConsent(makeProfile("adult", "pending"))).toBe(false);
    expect(requiresParentalConsent(makeProfile("adult", "denied"))).toBe(false);
  });

  it("requires consent for a child who hasn't been granted it", () => {
    expect(requiresParentalConsent(makeProfile("child", "not_required"))).toBe(true);
    expect(requiresParentalConsent(makeProfile("child", "pending"))).toBe(true);
    expect(requiresParentalConsent(makeProfile("child", "denied"))).toBe(true);
  });

  it("requires consent for a teen who hasn't been granted it", () => {
    expect(requiresParentalConsent(makeProfile("teen", "pending"))).toBe(true);
  });

  it("does not require consent once it has been granted", () => {
    expect(requiresParentalConsent(makeProfile("child", "granted"))).toBe(false);
    expect(requiresParentalConsent(makeProfile("teen", "granted"))).toBe(false);
  });
});

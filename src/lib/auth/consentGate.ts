import type { Profile } from "@/types/database";

// Anything that records a minor's voice or has them talk to the AI teacher
// needs a parent's or guardian's consent first. The UI gates (speaking pages,
// pronunciation recorder, speaking test) are convenience; the real boundary
// is server-side, see consentServer.ts.
export function requiresParentalConsent(profile: Pick<Profile, "age_band" | "parental_consent_status">): boolean {
  return profile.age_band !== "adult" && profile.parental_consent_status !== "granted";
}

import type { Profile } from "@/types/database";

// Speaking practice is chat-based today (no mic yet), but this gate is
// established now — ahead of the mic/pronunciation features landing in a
// later phase — so it's already tested and in place before recording a
// minor's voice becomes possible.
export function requiresParentalConsent(profile: Profile): boolean {
  return profile.age_band !== "adult" && profile.parental_consent_status !== "granted";
}

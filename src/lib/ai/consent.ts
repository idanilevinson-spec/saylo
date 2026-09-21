// Sharing what a learner writes or says with a third-party AI provider needs
// their explicit permission first (App Store Review Guideline 5.1.2(i)).
//
// The permission is stored on the account itself, in the auth user's
// metadata, as the ISO time it was given. That needs no database migration,
// follows the learner to every device, and is readable on the server from the
// user object every AI route already fetches.
export const AI_CONSENT_FIELD = "ai_consent_at";

interface UserWithMetadata {
  user_metadata?: Record<string, unknown> | null;
}

export function hasAiConsent(user: UserWithMetadata | null | undefined): boolean {
  const value = user?.user_metadata?.[AI_CONSENT_FIELD];
  return typeof value === "string" && value.length > 0;
}

export const AI_CONSENT_REQUIRED_ERROR = "ai consent required";

import { TERMS_VERSION } from "@/lib/legal/siteInfo";

export const TERMS_REQUIRED_MESSAGE = "כדי להמשיך יש לאשר את תנאי השימוש ואת מדיניות הפרטיות";

// Stored on the auth user so we can show which version someone accepted, and when.
export function termsConsentMetadata() {
  return { terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION };
}

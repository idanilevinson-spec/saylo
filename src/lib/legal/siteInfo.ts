// Single source for the facts every legal page repeats. An optional field set
// to null is simply not shown; pages never display a placeholder.

export const LEGAL_UPDATED = "18.9.2026";

// Bump when the terms or privacy policy change in substance. Saved next to
// each email sign-up so we can show which version someone accepted.
export const TERMS_VERSION = "2026-09-18";

export const CONTACT_EMAIL = "saylo20037@gmail.com";

export const BUSINESS_NAME = "לוינסון עידן";
export const BUSINESS_TYPE = "עוסק פטור";
export const BUSINESS_ID: string | null = "214191074";
export const BUSINESS_ADDRESS: string | null = "ארתור רובינשטיין 6, תל אביב-יפו";
export const BUSINESS_PHONE: string | null = "054-976-2426";
export const BUSINESS_PHONE_TEL = "+972549762426";

export const BUSINESS_REGISTRATION = BUSINESS_ID ? `${BUSINESS_TYPE} מס׳ ${BUSINESS_ID}` : null;

// The business owner is also the accessibility coordinator.
export const ACCESSIBILITY_COORDINATOR_NAME: string | null = BUSINESS_NAME;
export const ACCESSIBILITY_COORDINATOR_PHONE: string | null = BUSINESS_PHONE;

// Fair-use ceilings enforced in the database (supabase/migrations 010, 011).
export const DAILY_CONVERSATION_LIMIT = 5;
export const DAILY_WRITING_LIMIT = 15;

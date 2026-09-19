// Single source for the facts the legal pages repeat. A field set to null is
// simply not shown; pages never display a placeholder.
//
// Only what the law requires is published. A distance seller must disclose
// name, ID/business number and address before a sale (Consumer Protection Law
// s.14C); the email is the channel for cancellations and requests. No phone
// number is published anywhere: neither of those rules requires one.

export const LEGAL_UPDATED = "18.9.2026";

// Bump when the terms or privacy policy change in substance. Saved next to
// each email sign-up so we can show which version someone accepted.
export const TERMS_VERSION = "2026-09-18";

export const CONTACT_EMAIL = "saylo20037@gmail.com";

export const BUSINESS_NAME = "לוינסון עידן";
export const BUSINESS_TYPE = "עוסק פטור";
export const BUSINESS_ID: string | null = "214191074";
export const BUSINESS_ADDRESS: string | null = "ארתור רובינשטיין 6, תל אביב-יפו";

export const BUSINESS_REGISTRATION = BUSINESS_ID ? `${BUSINESS_TYPE} מס׳ ${BUSINESS_ID}` : null;

// Fair-use ceilings enforced in the database (supabase/migrations 010, 011).
export const DAILY_CONVERSATION_LIMIT = 5;
export const DAILY_WRITING_LIMIT = 15;

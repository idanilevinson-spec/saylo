// Pure constants, kept apart from streaks.ts (which imports the browser
// Supabase client) so server code — like the support assistant's knowledge
// base — can state the rules without pulling that client in.
export const MAX_FREEZES = 2;
export const FREEZE_EARN_INTERVAL_DAYS = 7;

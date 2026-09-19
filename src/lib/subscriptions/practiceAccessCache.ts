// What the hearts gate last learned about whether this learner may practise.
//
// HeartsGate used to hold every exercise page behind a "loading…" screen
// until one to three round trips (subscription, hearts) finished — on every
// single question, because each question is its own page. Remembering the
// last answer lets the next question render immediately; the gate still
// re-checks in the background and blocks the moment the answer changes, so
// this only ever removes a wait for someone who was already allowed in.
const FRESH_FOR_MS = 10 * 60 * 1000;

type Access = "ok" | "blocked";

let remembered: { profileId: string; access: Access; at: number } | null = null;

export function rememberPracticeAccess(profileId: string, access: Access): void {
  remembered = { profileId, access, at: Date.now() };
}

// Only a recent "ok" is ever trusted to skip the loading screen; anything
// else (blocked, unknown, another user, stale) makes the gate check first.
export function recentlyAllowedToPractise(profileId: string): boolean {
  return !!remembered && remembered.profileId === profileId && remembered.access === "ok" && Date.now() - remembered.at < FRESH_FOR_MS;
}

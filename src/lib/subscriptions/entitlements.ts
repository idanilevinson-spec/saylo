import type { SubscriptionStatus } from "@/types/database";

export interface EntitlementCheckInput {
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
}

// Gates Writing Coach and AI Teacher suggestions — the AI-cost features —
// plus lifts the hearts limit on regular exercises. Includes the 3-day trial.
export function isPremiumActive(sub: EntitlementCheckInput, now = new Date()): boolean {
  if (sub.status === "trialing") {
    return !!sub.trial_ends_at && new Date(sub.trial_ends_at) > now;
  }
  if (sub.status === "active") {
    return !sub.current_period_end || new Date(sub.current_period_end) > now;
  }
  return false;
}

// A stricter gate for the AI Teacher chat/voice conversation specifically —
// per-message live conversation is the single most expensive AI feature in
// the app (an ongoing back-and-forth, not a one-shot grading call), so
// unlike everything else isPremiumActive covers, it's deliberately excluded
// from the free trial: only a genuinely paid, active subscription qualifies.
export function isPaidActive(sub: EntitlementCheckInput, now = new Date()): boolean {
  if (sub.status !== "active") return false;
  return !sub.current_period_end || new Date(sub.current_period_end) > now;
}

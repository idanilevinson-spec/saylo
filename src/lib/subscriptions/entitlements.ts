import type { SubscriptionStatus } from "@/types/database";

export interface EntitlementCheckInput {
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
}

// Gates Speaking, Writing Coach, and AI Teacher suggestions — the AI-cost
// features — plus lifts the hearts limit on regular exercises.
export function isPremiumActive(sub: EntitlementCheckInput, now = new Date()): boolean {
  if (sub.status === "trialing") {
    return !!sub.trial_ends_at && new Date(sub.trial_ends_at) > now;
  }
  if (sub.status === "active") {
    return !sub.current_period_end || new Date(sub.current_period_end) > now;
  }
  return false;
}

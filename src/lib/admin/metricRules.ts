import { isPaidActive } from "@/lib/subscriptions/entitlements";
import type { SubscriptionStatus } from "@/types/database";

// The rules the admin dashboard counts by. Kept pure so the overview,
// analytics and users screens agree, and so they can be tested without a
// database.

export interface AdminSubscriptionRow {
  profile_id: string;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  plan: { code: string; price_ils: number; months: number } | null;
}

// What the admin screens show for a subscription. The stored status only
// changes when a webhook or cron writes it, so a row can still say
// "active" or "trialing" long after its period or trial ran out — the
// dates decide, exactly as they do for the learner's own access.
export type AdminSubscriptionLabel = SubscriptionStatus | "trial_ended";

export function subscriptionLabel(
  sub: Pick<AdminSubscriptionRow, "status" | "trial_ends_at" | "current_period_end">,
  now = new Date(),
): AdminSubscriptionLabel {
  if (sub.status === "trialing") {
    return sub.trial_ends_at && new Date(sub.trial_ends_at) > now ? "trialing" : "trial_ended";
  }
  if (sub.status === "active") return isPaidActive(sub, now) ? "active" : "expired";
  return sub.status;
}

export interface PlanRevenue {
  code: string;
  count: number;
  mrr: number;
}

export interface RevenueSummary {
  payingCount: number;
  // Paying rows whose plan couldn't be resolved (e.g. an Apple product id
  // missing from subscription_plans) — counted as paying, but no price.
  unpricedCount: number;
  mrr: number;
  plans: PlanRevenue[];
}

export function summarizeRevenue(
  subs: AdminSubscriptionRow[],
  testAccountIds: ReadonlySet<string>,
  now = new Date(),
): RevenueSummary {
  const plans = new Map<string, PlanRevenue>();
  let payingCount = 0;
  let unpricedCount = 0;
  let mrr = 0;

  for (const sub of subs) {
    if (testAccountIds.has(sub.profile_id) || !isPaidActive(sub, now)) continue;
    payingCount += 1;
    if (!sub.plan || !sub.plan.months) {
      unpricedCount += 1;
      continue;
    }
    const monthly = Number(sub.plan.price_ils) / sub.plan.months;
    mrr += monthly;
    const row = plans.get(sub.plan.code) ?? { code: sub.plan.code, count: 0, mrr: 0 };
    row.count += 1;
    row.mrr += monthly;
    plans.set(sub.plan.code, row);
  }

  return {
    payingCount,
    unpricedCount,
    mrr: Math.round(mrr),
    plans: [...plans.values()].sort((a, b) => b.mrr - a.mrr),
  };
}

// A learner is active if they did anything at all in the window — an
// exercise, a game, a reading answer, a conversation, an AI call, or
// anything that earned XP. Each source passes the profile ids it saw.
export function countActiveLearners(
  sources: Iterable<Iterable<string>>,
  testAccountIds: ReadonlySet<string>,
): number {
  const ids = new Set<string>();
  for (const source of sources) {
    for (const id of source) if (!testAccountIds.has(id)) ids.add(id);
  }
  return ids.size;
}

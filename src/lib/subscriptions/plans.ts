// Display data for the pricing page — codes/prices here must match
// supabase/seed/007_subscription_plans.sql (which carries the real Stripe
// price IDs created from this same data). These are the placeholder prices
// from the initial spec ("slightly below market average"), meant to be
// reviewed before the site goes live.
export const TRIAL_DAYS = 3;

export interface PricingPlan {
  code: string;
  months: number;
  totalPrice: number;
  label: string;
  badge?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  { code: "monthly", months: 1, totalPrice: 59, label: "חודשי" },
  { code: "bimonthly", months: 2, totalPrice: 109, label: "חודשיים" },
  { code: "quarterly", months: 3, totalPrice: 149, label: "3 חודשים" },
  { code: "biannual", months: 6, totalPrice: 269, label: "חצי שנה", badge: "פופולרי" },
  { code: "annual", months: 12, totalPrice: 449, label: "שנתי", badge: "הכי משתלם" },
];

export function monthlyEquivalent(plan: PricingPlan): number {
  return Math.round(plan.totalPrice / plan.months);
}

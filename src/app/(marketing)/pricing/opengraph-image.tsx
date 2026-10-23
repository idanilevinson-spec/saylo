import { shareCard, OG_SIZE } from "@/lib/og/card";
import { PRICING_PLANS, TRIAL_DAYS, monthlyEquivalent } from "@/lib/subscriptions/plans";

const ANNUAL = PRICING_PLANS.find((p) => p.months === 12)!;

export const alt = "מסלולים ומחירים ב-Saylo";
export const size = OG_SIZE;
export const contentType = "image/png";

// Prices come from the plans, like the page's description, so a shared
// link never shows an old price.
export default function Image() {
  return shareCard({
    title: "מסלולים ומחירים",
    subtitle: `${TRIAL_DAYS} ימי ניסיון בחינם, בלי כרטיס אשראי. מנוי שנתי בכ-₪${monthlyEquivalent(ANNUAL)} לחודש`,
  });
}

import type { Metadata } from "next";
import PricingCards from "@/components/PricingCards";
import SiteFooter from "@/components/SiteFooter";
import { pageOpenGraph } from "@/lib/og/meta";
import { PRICING_PLANS, TRIAL_DAYS, monthlyEquivalent } from "@/lib/subscriptions/plans";

const ANNUAL = PRICING_PLANS.find((p) => p.months === 12)!;
// Built from the plans themselves, so the search snippet can't drift
// from the prices on the page.
const DESCRIPTION = `מנוי ל-Saylo מ-₪${PRICING_PLANS[0].totalPrice} לחודש, או ₪${ANNUAL.totalPrice} לשנה (כ-₪${monthlyEquivalent(ANNUAL)} לחודש). ${TRIAL_DAYS} ימי ניסיון בחינם, ואפשר לבטל את החידוש בכל עת.`;

export const metadata: Metadata = {
  title: "מסלולים ומחירים | Saylo",
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: pageOpenGraph("מסלולים ומחירים", DESCRIPTION, "/pricing"),
};

export default function PricingPage() {
  return (
    <>
      <section className="px-4 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">מסלולים ומחירים</h1>
        <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
          3 ימים ראשונים על הבית, בלי כרטיס אשראי. שיחה עם מורה ה-AI זמינה במנוי בתשלום.
        </p>
      </section>
      <PricingCards />
      <SiteFooter />
    </>
  );
}

import Link from "next/link";
import EnglishText from "@/components/EnglishText";
import { PRICING_PLANS, monthlyEquivalent } from "@/lib/subscriptions/plans";

const bestValue = PRICING_PLANS[PRICING_PLANS.length - 1];

export default function LandingPricingTeaser() {
  return (
    <section className="px-4 py-20 sm:py-24 bg-background-2">
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-[1fr_auto] md:items-end border-t-2 border-foreground pt-8">
        <div>
          <h2 className="text-3xl sm:text-5xl font-black leading-[1.1]">3 ימים חינם, בלי התחייבות</h2>
          <p className="mt-4 max-w-xl text-lg text-muted leading-relaxed">
            אחר כך מ-<EnglishText as="span" className="font-bold text-foreground">₪{monthlyEquivalent(bestValue)}</EnglishText>{" "}
            לחודש במסלול השנתי (<EnglishText as="span">₪{bestValue.totalPrice}</EnglishText> בתשלום אחד), או חודש אחרי חודש.
            בלי כרטיס אשראי בניסיון, וביטול בכל עת.
          </p>
        </div>
        <Link
          href="/pricing"
          className="game-press inline-flex items-center justify-center px-8 py-3.5 rounded-md bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors"
        >
          לכל המסלולים
        </Link>
      </div>
    </section>
  );
}

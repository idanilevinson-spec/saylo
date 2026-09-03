import type { Metadata } from "next";
import PricingCards from "@/components/PricingCards";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "מסלולים ומחירים — Saylo",
};

export default function PricingPage() {
  return (
    <>
      <section className="px-4 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">מסלולים ומחירים</h1>
        <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
          3 ימים ראשונים על הבית, בלי כרטיס אשראי.
        </p>
      </section>
      <PricingCards />
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import LandingHero from "@/components/LandingHero";
import LandingTrustStrip from "@/components/LandingTrustStrip";
import LandingProductTour from "@/components/LandingProductTour";
import LandingSteps from "@/components/LandingSteps";
import LandingFeatures from "@/components/LandingFeatures";
import LandingLevels from "@/components/LandingLevels";
import LandingPricingTeaser from "@/components/LandingPricingTeaser";
import LandingFinalCta from "@/components/LandingFinalCta";
import SiteFooter from "@/components/SiteFooter";
import AccountDeletedNotice from "@/components/AccountDeletedNotice";
import { getLevelCatalog } from "@/lib/content/levelCatalog";

export const metadata: Metadata = {
  title: "Saylo — לומדים אנגלית בקצב שלכם",
};

export default async function HomePage() {
  const catalog = await getLevelCatalog();
  return (
    <>
      <Suspense fallback={null}>
        <AccountDeletedNotice />
      </Suspense>
      <LandingHero />
      <LandingTrustStrip />
      <LandingProductTour />
      <LandingSteps />
      <LandingFeatures />
      <LandingLevels catalog={catalog} />
      <LandingPricingTeaser />
      <LandingFinalCta />
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import LandingHero from "@/components/LandingHero";
import LandingSteps from "@/components/LandingSteps";
import LandingFeatures from "@/components/LandingFeatures";
import LandingLevels from "@/components/LandingLevels";
import LandingPricingTeaser from "@/components/LandingPricingTeaser";
import LandingFinalCta from "@/components/LandingFinalCta";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Saylo — לומדים אנגלית בקצב שלכם",
};

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <LandingSteps />
      <LandingFeatures />
      <LandingLevels />
      <LandingPricingTeaser />
      <LandingFinalCta />
      <SiteFooter />
    </>
  );
}

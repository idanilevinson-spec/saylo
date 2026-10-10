import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/site/breadcrumbs";
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
import { APP_STORE_URL, INSTAGRAM_URL } from "@/lib/site/links";
import { CONTACT_EMAIL } from "@/lib/legal/siteInfo";

export const metadata: Metadata = {
  title: "Saylo — לומדים אנגלית בקצב שלכם",
};

// Who we are, for search engines: the organization, the site, and the
// iPhone app. Facts only (no ratings or review counts we don't have).
const SITE = "https://www.saylolearn.com";
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "Saylo",
      url: SITE,
      logo: `${SITE}/logo-mark.png`,
      email: CONTACT_EMAIL,
      sameAs: [APP_STORE_URL, INSTAGRAM_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "Saylo",
      url: SITE,
      inLanguage: "he",
      publisher: { "@id": `${SITE}/#org` },
    },
    {
      "@type": "MobileApplication",
      name: "Saylo",
      operatingSystem: "iOS",
      applicationCategory: "EducationalApplication",
      inLanguage: ["he", "en"],
      installUrl: APP_STORE_URL,
      publisher: { "@id": `${SITE}/#org` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "ILS" },
    },
  ],
};

export default async function HomePage() {
  const catalog = await getLevelCatalog();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(JSON_LD) }} />
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

import type { Metadata } from "next";
import CinemaHero from "@/components/cinema/CinemaHero";
import CinemaAbout from "@/components/cinema/CinemaAbout";
import CinemaFeatures from "@/components/cinema/CinemaFeatures";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Saylo — לומדים אנגלית בקצב שלכם",
};

// Experiment: the whole page lives inside .theme-cinema, which re-points the
// design tokens (background, card, foreground, primary…) to the dark cream
// palette — so the shared footer follows along without being touched.
export default function HomePage() {
  return (
    <div className="theme-cinema">
      <CinemaHero />
      <CinemaAbout />
      <CinemaFeatures />
      <SiteFooter />
    </div>
  );
}

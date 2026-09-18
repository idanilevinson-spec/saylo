import type { Metadata, Viewport } from "next";
import { Rubik, Plus_Jakarta_Sans, Anton, Almarai, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import Navbar from "@/components/Navbar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PageTransition from "@/components/PageTransition";
import AccessibilityProvider from "@/components/AccessibilityProvider";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// The chyron voice: one earned, oversized-impact display face for the
// marketing page's broadcast headlines only. Never used for body copy,
// exercise content, or dense Operate surfaces.
const chyron = Anton({
  variable: "--font-chyron",
  subsets: ["latin"],
  weight: "400",
});

// The cinematic landing page's two faces. Almarai ships Arabic + Latin but
// no Hebrew, so Hebrew glyphs fall through to Rubik (see .theme-cinema in
// globals.css); Instrument Serif italic is Latin-only, which is why the
// italic accent line on that page is the English tagline, not Hebrew.
const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.saylolearn.com"),
  title: "Saylo",
  description: "לומדים אנגלית בקצב שלכם — מבחן רמה, מסלול אישי ומורה AI שמכיר את החולשות שלכם",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Saylo",
  },
  openGraph: {
    title: "Saylo",
    description: "לומדים אנגלית בקצב שלכם — מבחן רמה, מסלול אישי ומורה AI שמכיר את החולשות שלכם",
    url: "https://www.saylolearn.com",
    siteName: "Saylo",
    locale: "he_IL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4d9eff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before first paint to set data-theme from the stored theme,
// avoiding a flash of the wrong theme (React only sees the DOM after
// hydration). Dark is the deliberate first-visit default — the "On Air"
// world reads best there — not a system-preference guess; a stored
// explicit choice (from the toggle) always wins over it.
const noFlashThemeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t="dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;

// Same no-flash principle as the theme script above: apply any saved
// accessibility preferences straight to <html> before first paint, so a
// returning visitor who turned on high contrast or a larger text size
// never sees a flash of the unadjusted page.
const noFlashA11yScript = `(function(){try{var raw=localStorage.getItem("saylo-a11y-prefs");if(!raw)return;var p=JSON.parse(raw);var html=document.documentElement;if(p.fontScale&&p.fontScale!==100)html.setAttribute("data-a11y-font-scale",String(p.fontScale));if(p.highContrast)html.setAttribute("data-a11y-contrast","high");if(p.grayscale)html.setAttribute("data-a11y-grayscale","true");if(p.underlineLinks)html.setAttribute("data-a11y-underline-links","true");if(p.readingSpacing)html.setAttribute("data-a11y-reading-spacing","true");if(p.stopAnimations)html.setAttribute("data-a11y-motion","reduced")}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} ${jakarta.variable} ${chyron.variable} ${almarai.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="no-flash-theme" strategy="beforeInteractive">
          {noFlashThemeScript}
        </Script>
        <Script id="no-flash-a11y" strategy="beforeInteractive">
          {noFlashA11yScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-ink focus:font-medium"
        >
          דלגו לתוכן הראשי
        </a>
        <ServiceWorkerRegister />
        <AccessibilityProvider>
          <AuthProvider>
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
              <PageTransition>{children}</PageTransition>
            </main>
          </AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}

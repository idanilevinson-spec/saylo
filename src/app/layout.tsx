import type { Metadata, Viewport } from "next";
import { Rubik, Plus_Jakarta_Sans, Anton, Literata } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import Navbar from "@/components/Navbar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AppUpdateWatcher from "@/components/AppUpdateWatcher";
import OfflineBanner from "@/components/OfflineBanner";
import PageTransition from "@/components/PageTransition";
import AccessibilityProvider from "@/components/AccessibilityProvider";
import CookieNotice from "@/components/CookieNotice";
import AppIntro from "@/components/AppIntro";
import { appIntroScript } from "@/lib/intro/appIntroScript";
import SupportChat from "@/components/support/SupportChatLazy";
import SiteAnalytics from "@/components/SiteAnalytics";
import PointerLight from "@/components/PointerLight";

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

// The book face for reading texts set as a story (PrintedPage "story"): a
// serif drawn for long reading on screens. Not preloaded on every page; it
// loads where a story page uses it.
const book = Literata({
  variable: "--font-book",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.saylolearn.com"),
  title: "Saylo",
  description: "לומדים אנגלית בקצב שלכם: מבחן רמה, מסלול אישי ומורה AI שמכיר את החולשות שלכם",
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
    description: "לומדים אנגלית בקצב שלכם: מבחן רמה, מסלול אישי ומורה AI שמכיר את החולשות שלכם",
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
// The cookie notice is server-rendered so a first visit sees it on first
// paint (rendering it only after hydration made it the page's LCP, at about
// five seconds on a phone). Anyone who already dismissed it, or whose
// storage is blocked, gets it hidden here before paint.
const noFlashCookieScript = `(function(){var h=document.documentElement;try{if(localStorage.getItem("saylo-cookie-notice-ack")==="1")h.setAttribute("data-cookie-ack","")}catch(e){h.setAttribute("data-cookie-ack","")}})();`;

const noFlashA11yScript = `(function(){try{var raw=localStorage.getItem("saylo-a11y-prefs");if(!raw)return;var p=JSON.parse(raw);var html=document.documentElement;if(p.fontScale&&p.fontScale!==100)html.setAttribute("data-a11y-font-scale",String(p.fontScale));if(p.highContrast)html.setAttribute("data-a11y-contrast","high");if(p.grayscale)html.setAttribute("data-a11y-grayscale","true");if(p.underlineLinks)html.setAttribute("data-a11y-underline-links","true");if(p.readingSpacing)html.setAttribute("data-a11y-reading-spacing","true");if(p.stopAnimations)html.setAttribute("data-a11y-motion","reduced")}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} ${jakarta.variable} ${chyron.variable} ${book.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="no-flash-theme" strategy="beforeInteractive">
          {noFlashThemeScript}
        </Script>
        <Script id="no-flash-a11y" strategy="beforeInteractive">
          {noFlashA11yScript}
        </Script>
        <Script id="no-flash-cookie" strategy="beforeInteractive">
          {noFlashCookieScript}
        </Script>
        {/* A plain inline script, not next/script: beforeInteractive scripts
            run from Next's bootstrap, after first paint, which would show the
            page for a beat before the intro covers it. */}
        <script id="app-intro" dangerouslySetInnerHTML={{ __html: appIntroScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AppIntro />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-ink focus:font-medium"
        >
          דלגו לתוכן הראשי
        </a>
        <ServiceWorkerRegister />
        <AppUpdateWatcher />
        <OfflineBanner />
        <AccessibilityProvider>
          <AuthProvider>
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1 pb-20 sm:pb-28 focus:outline-none">
              <PageTransition>{children}</PageTransition>
            </main>
            <SupportChat />
            <PointerLight />
          </AuthProvider>
          <CookieNotice />
        </AccessibilityProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}

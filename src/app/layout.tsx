import type { Metadata, Viewport } from "next";
import { Rubik, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import Navbar from "@/components/Navbar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PageTransition from "@/components/PageTransition";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
};

export const viewport: Viewport = {
  themeColor: "#0066d6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before first paint to set data-theme from the stored/preferred theme,
// avoiding a flash of the wrong theme (React only sees the DOM after hydration).
const noFlashThemeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} ${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="no-flash-theme" strategy="beforeInteractive">
          {noFlashThemeScript}
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
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
              <PageTransition>{children}</PageTransition>
            </main>
          </AuthProvider>
        </MotionConfig>
      </body>
    </html>
  );
}

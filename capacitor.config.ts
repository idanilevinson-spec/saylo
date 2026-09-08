import type { CapacitorConfig } from "@capacitor/cli";

// Remote-URL mode: the native shell's WKWebView loads the live Vercel
// deployment directly rather than a static-exported bundle. Saylo has SSR
// pages, API routes, and cookie-based Supabase auth that don't survive a
// static export — this way every deploy to saylolearn.com is instantly
// live in the app too, with no separate build/sync step for web changes.
const config: CapacitorConfig = {
  appId: "com.saylolearn.app",
  appName: "Saylo",
  webDir: "public",
  server: {
    url: "https://saylolearn.com",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;

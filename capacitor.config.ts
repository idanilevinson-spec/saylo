import type { CapacitorConfig } from "@capacitor/cli";

// Remote-URL mode: the native shell's WKWebView loads the live Vercel
// deployment directly rather than a static-exported bundle. Saylo has SSR
// pages, API routes, and cookie-based Supabase auth that don't survive a
// static export — this way every deploy to saylolearn.com is instantly
// live in the app too, with no separate build/sync step for web changes.
//
// Must be the "www" host, not the bare domain: saylolearn.com itself
// 308-redirects to www.saylolearn.com (confirmed via curl), and Capacitor's
// WebView only treats navigation as "inside the app" when the hostname
// matches this config exactly — a redirect to a different hostname gets
// treated as an external link and handed off to the system browser
// instead of loading in the WebView. That's what a black screen turning
// into Safari on every single launch actually was — not a load failure.
const config: CapacitorConfig = {
  appId: "com.saylolearn.app",
  appName: "Saylo",
  webDir: "public",
  server: {
    url: "https://www.saylolearn.com",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;

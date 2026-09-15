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
    // Without this, any navigation to a host other than www.saylolearn.com
    // gets treated as an external link and handed off to the system
    // browser — same mechanism as the "always opens Safari" bug above, but
    // this time hit deliberately: signInWithOAuth({ provider: "apple" |
    // "google" }) genuinely has to navigate to the provider's own domain
    // and then to Supabase's callback domain before landing back on
    // saylolearn.com. Without these allowlisted, that hand-off to Safari
    // has no way back into the app (no Universal Links configured), so the
    // user completes sign-in in Safari and the native app never sees the
    // session. Allowlisting keeps the whole round trip inside the app's
    // own WebView instead.
    allowNavigation: ["appleid.apple.com", "accounts.google.com", "*.supabase.co"],
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;

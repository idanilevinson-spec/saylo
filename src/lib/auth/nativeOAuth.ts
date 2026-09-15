"use client";

import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/lib/supabase/browserClient";

// The custom URL scheme registered in Info.plist (CFBundleURLTypes). Apple's
// own "Return URL" for the Services ID stays the fixed Supabase callback
// (https only — Apple doesn't accept custom schemes there) — this is the
// *second* redirect, the one Supabase itself issues after processing that
// callback, and it must also be added to Supabase's own Redirect URLs
// allowlist (Authentication -> URL Configuration) or Supabase falls back to
// Site URL instead of honoring it, the same failure mode already hit once
// with a plain https redirectTo.
const REDIRECT_SCHEME = "com.saylolearn.app://auth/callback";

// Native sign-in avoids the full-page WKWebView redirect chain the web flow
// uses (provider page -> Supabase's callback domain -> our own /auth/
// callback -> /dashboard) — several real network hops inside the app's own
// WebView, which is what produced a visible white flash between pages even
// after tinting the WebView's background (MainViewController.swift). Opening
// the OAuth URL in a dismissible modal browser instead, and returning via a
// deep link (the custom scheme above) rather than a same-origin page
// navigation, is the standard Capacitor+Supabase pattern for this and
// sidesteps the multi-hop navigation entirely — the modal just closes and
// the app already has a session by the time control returns to it.
export async function signInWithOAuthNative(provider: "google" | "apple"): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: REDIRECT_SCHEME, skipBrowserRedirect: true },
  });
  if (error || !data.url) return false;

  return new Promise((resolve) => {
    // Captured once App.addListener's own promise resolves (a fast local
    // registration, done well before the user could possibly complete the
    // sign-in and produce a real deep link) so the handler can remove
    // itself the moment it fires — this sign-in attempt is a one-shot, and
    // leaving the listener registered afterward would let some unrelated
    // future deep link resolve this same stale promise.
    let handle: { remove: () => Promise<void> } | null = null;

    async function onUrlOpen({ url }: { url: string }) {
      if (!url.startsWith(REDIRECT_SCHEME)) return;
      await handle?.remove();
      await Browser.close();
      const code = new URL(url).searchParams.get("code");
      const ok = code ? !(await supabase.auth.exchangeCodeForSession(code)).error : false;
      resolve(ok);
    }

    App.addListener("appUrlOpen", onUrlOpen).then((h) => {
      handle = h;
    });

    Browser.open({ url: data.url });
  });
}

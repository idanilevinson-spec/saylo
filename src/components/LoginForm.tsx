"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import AppleLogo from "@/components/icons/AppleLogo";
import GoogleLogo from "@/components/icons/GoogleLogo";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabase/browserClient";
import { signInWithOAuthNative } from "@/lib/auth/nativeOAuth";
import PasswordField from "@/components/PasswordField";
import { EMAIL_INPUT } from "@/lib/utils/inputProps";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("אימייל או סיסמה שגויים");
      setLoading(false);
      return;
    }

    router.push(searchParams.get("next") ?? "/dashboard");
  }

  // Native runs the whole round trip through a dismissible modal browser and
  // a deep-link return (see nativeOAuth.ts) instead of the full-page redirect
  // chain the web flow below uses — that chain is several real cross-origin
  // navigations inside the app's own WebView, which is what produced a
  // visible white flash between pages even after tinting the WebView's
  // background.
  async function handleGoogleLogin() {
    if (Capacitor.isNativePlatform()) {
      if (await signInWithOAuthNative("google")) router.push("/dashboard");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  }

  // Required alongside Google sign-in, not optional: App Store Review
  // Guideline 4.8 requires an app offering a third-party login to also
  // offer Sign in with Apple as an equivalent option. Same Supabase OAuth
  // mechanism as Google — the actual "Apple" provider has to be configured
  // in the Supabase dashboard (Services ID, Team ID, Key ID, private key
  // from Apple Developer) before this button does anything.
  async function handleAppleLogin() {
    if (Capacitor.isNativePlatform()) {
      if (await signInWithOAuthNative("apple")) router.push("/dashboard");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  }

  const socialClass =
    "game-press flex items-center justify-center gap-2 w-full min-h-12 px-4 rounded-lg border border-card-border bg-background font-bold hover:bg-background-2 transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="rise-in">
        <h1 className="text-3xl font-black tracking-tight text-center">ברוכים השבים</h1>
        <p className="mt-2 text-center text-muted">התחברו כדי להמשיך ללמוד</p>
      </div>

      {/* The same plate language as the rest of the site: a card with a
          primary-colored edge, not bare inputs floating on the page. */}
      <div className="rise-in relative mt-8 bg-card border border-card-border rounded-lg shadow-sm p-6 sm:p-7" style={{ animationDelay: "0.1s" }}>
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-primary" />

        <div className="space-y-2.5">
          <button type="button" onClick={handleGoogleLogin} className={socialClass}>
            <GoogleLogo /> המשך עם Google
          </button>
          <button type="button" onClick={handleAppleLogin} className={socialClass}>
            <AppleLogo size={22} /> המשך עם Apple
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-card-border" />
          <span className="text-xs text-muted">או עם אימייל</span>
          <div className="flex-1 h-px bg-card-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium mb-1.5">אימייל</label>
            <input
              id="login-email"
              {...EMAIL_INPUT}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-1.5">סיסמה</label>
            <PasswordField
              id="login-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          <div className="text-left">
            <Link href="/reset-password" className="text-sm text-primary">
              שכחתם סיסמה?
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {loading ? "מתחברים..." : "התחברות"}
          </motion.button>
        </form>

        <p className="mt-4 text-xs text-muted leading-relaxed">
          התחברות עם Google או Apple בפעם הראשונה פותחת חשבון חדש. בהמשך תתבקשו לאשר את{" "}
          <Link href="/terms" className="text-primary underline underline-offset-2">
            תנאי השימוש
          </Link>{" "}
          ואת{" "}
          <Link href="/privacy" className="text-primary underline underline-offset-2">
            מדיניות הפרטיות
          </Link>
          .
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        עדיין אין לכם חשבון?{" "}
        <Link href="/signup" className="text-primary font-medium">
          הרשמה
        </Link>
      </p>
    </div>
  );
}

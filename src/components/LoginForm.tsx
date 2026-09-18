"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Apple } from "lucide-react";
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

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-black tracking-tight text-center">ברוכים השבים</h1>
        <p className="mt-2 text-center text-muted">התחברו כדי להמשיך ללמוד</p>
      </motion.div>

      {/* The same plate language as the rest of the site: a card with a
          primary-colored edge, not bare inputs floating on the page. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mt-8 bg-card border border-card-border rounded-lg shadow-sm p-6 sm:p-7"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-primary" />

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
            {loading ? "מתחבר..." : "התחברות"}
          </motion.button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-card-border" />
          <span className="text-xs text-muted">או</span>
          <div className="flex-1 h-px bg-card-border" />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleLogin}
          className="mt-4 w-full px-4 py-3 rounded-lg border border-card-border bg-background font-medium hover:bg-background-2 transition-colors"
        >
          המשך עם Google
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAppleLogin}
          className="mt-2.5 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-card-border bg-background font-medium hover:bg-background-2 transition-colors"
        >
          <Apple size={18} fill="currentColor" /> המשך עם Apple
        </motion.button>

        <p className="mt-4 text-xs text-muted leading-relaxed">
          התחברות עם Google או Apple בפעם הראשונה פותחת חשבון חדש. בהמשך תתבקשו לאשר את{" "}
          <Link href="/terms" className="text-primary hover:underline">
            תנאי השימוש
          </Link>{" "}
          ואת{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            מדיניות הפרטיות
          </Link>
          .
        </p>
      </motion.div>

      <p className="mt-6 text-center text-sm text-muted">
        עדיין אין לכם חשבון?{" "}
        <Link href="/signup" className="text-primary font-medium">
          הרשמה
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/browserClient";

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

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-center">ברוכים השבים</h1>
        <p className="mt-2 text-center text-muted">התחברו כדי להמשיך ללמוד</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1.5">אימייל</label>
          <input
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">סיסמה</label>
          <input
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

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
          className="w-full px-4 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {loading ? "מתחבר..." : "התחברות"}
        </motion.button>
      </motion.form>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-card-border" />
        <span className="text-xs text-muted">או</span>
        <div className="flex-1 h-px bg-card-border" />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleGoogleLogin}
        className="mt-4 w-full px-4 py-3 rounded-xl border border-card-border bg-card font-medium hover:bg-background-2 transition-colors"
      >
        המשך עם Google
      </motion.button>

      <p className="mt-6 text-center text-sm text-muted">
        עדיין אין לכם חשבון?{" "}
        <Link href="/signup" className="text-primary font-medium">
          הרשמה
        </Link>
      </p>
    </div>
  );
}

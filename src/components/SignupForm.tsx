"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { deriveAgeBand } from "@/lib/auth/ageBand";
import { TRIAL_DAYS } from "@/lib/subscriptions/plans";

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const ageNum = Number(age);
    if (!displayName.trim() || !ageNum || ageNum < 4 || ageNum > 119) {
      setError("בדקו שהשם והגיל תקינים");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session && data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        display_name: displayName,
        age: ageNum,
        age_band: deriveAgeBand(ageNum),
        native_language: "he",
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from("subscriptions")
        .insert({ profile_id: data.user.id, status: "trialing", trial_ends_at: trialEndsAt });

      router.push("/dashboard");
      return;
    }

    setAwaitingConfirmation(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  if (awaitingConfirmation) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black tracking-tight">בדקו את המייל שלכם</h1>
        <p className="mt-3 text-muted">
          שלחנו קישור אישור לכתובת <span dir="ltr" className="inline-block">{email}</span>. לחצו עליו כדי
          להשלים את ההרשמה.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-black tracking-tight text-center">יוצרים חשבון</h1>
        <p className="mt-2 text-center text-muted">3 ימים ראשונים חינם, בלי כרטיס אשראי</p>
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
            <label htmlFor="signup-name" className="block text-sm font-medium mb-1.5">שם מלא</label>
            <input
              id="signup-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label htmlFor="signup-age" className="block text-sm font-medium mb-1.5">גיל</label>
            <input
              id="signup-age"
              type="number"
              min={4}
              max={119}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5">אימייל</label>
            <input
              id="signup-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5">סיסמה</label>
            <input
              id="signup-password"
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          {/* The one CTA on the page that's genuinely "start" gets the
              same press-play language as the hero's own primary CTA. */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {!loading && <Play size={16} fill="currentColor" strokeWidth={0} />}
            {loading ? "יוצר חשבון..." : "יצירת חשבון"}
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
          onClick={handleGoogleSignup}
          className="mt-4 w-full px-4 py-3 rounded-lg border border-card-border bg-background font-medium hover:bg-background-2 transition-colors"
        >
          המשך עם Google
        </motion.button>
      </motion.div>

      <p className="mt-6 text-center text-sm text-muted">
        כבר יש לכם חשבון?{" "}
        <Link href="/login" className="text-primary font-medium">
          התחברות
        </Link>
      </p>
    </div>
  );
}

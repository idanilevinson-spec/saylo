"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/browserClient";
import { deriveAgeBand } from "@/lib/auth/ageBand";

export default function SignupPage() {
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
        <h1 className="text-2xl font-bold">בדקו את המייל שלכם</h1>
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
        <h1 className="text-3xl font-bold text-center">יוצרים חשבון</h1>
        <p className="mt-2 text-center text-muted">3 ימים ראשונים חינם, בלי כרטיס אשראי</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1.5">שם מלא</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">גיל</label>
          <input
            type="number"
            min={4}
            max={119}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
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
            minLength={6}
            className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {loading ? "יוצר חשבון..." : "יצירת חשבון"}
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
        onClick={handleGoogleSignup}
        className="mt-4 w-full px-4 py-3 rounded-xl border border-card-border bg-card font-medium hover:bg-background-2 transition-colors"
      >
        המשך עם Google
      </motion.button>

      <p className="mt-6 text-center text-sm text-muted">
        כבר יש לכם חשבון?{" "}
        <Link href="/login" className="text-primary font-medium">
          התחברות
        </Link>
      </p>
    </div>
  );
}

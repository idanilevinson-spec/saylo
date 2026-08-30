"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { deriveAgeBand } from "@/lib/auth/ageBand";
import { TRIAL_DAYS } from "@/lib/subscriptions/plans";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { session, profile, loading: authLoading, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && profile) {
      router.replace("/dashboard");
    }
  }, [authLoading, profile, router]);

  const fallbackName = (session?.user.user_metadata?.display_name as string | undefined) ?? "";
  const nameValue = displayName || fallbackName;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const finalName = nameValue.trim();
    const ageNum = Number(age);
    if (!session || !finalName || !ageNum || ageNum < 4 || ageNum > 119) {
      setError("בדקו שהשם והגיל תקינים");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("profiles").insert({
      id: session.user.id,
      display_name: finalName,
      age: ageNum,
      age_band: deriveAgeBand(ageNum),
      native_language: "he",
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("subscriptions")
      .insert({ profile_id: session.user.id, status: "trialing", trial_ends_at: trialEndsAt });

    await refreshProfile();
    router.push("/dashboard");
  }

  if (authLoading) {
    return <div className="max-w-md mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-center">כמה פרטים אחרונים</h1>
        <p className="mt-2 text-center text-muted">כדי שנוכל להתאים לכם את קצב הלימוד הנכון</p>
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
            value={nameValue}
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

        {error && <p className="text-sm text-danger">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {submitting ? "שומר..." : "המשך ללוח הבקרה"}
        </motion.button>
      </motion.form>
    </div>
  );
}

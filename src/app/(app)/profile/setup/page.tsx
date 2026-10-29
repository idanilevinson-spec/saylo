"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { deriveAgeBand } from "@/lib/auth/ageBand";
import { TRIAL_DAYS } from "@/lib/subscriptions/plans";
import TermsConsent from "@/components/TermsConsent";
import { TERMS_REQUIRED_MESSAGE, termsConsentMetadata } from "@/lib/legal/consent";

import { EASE_OUT } from "@/lib/motion/easing";
export default function ProfileSetupPage() {
  const router = useRouter();
  const { session, profile, loading: authLoading, refreshProfile } = useAuth();
  // null until the learner types in the field: before that it shows what
  // sign-up already told us, and after that only what they typed, so
  // clearing it to type something else doesn't bring the old value back.
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && profile) {
      router.replace("/dashboard");
    }
  }, [authLoading, profile, router]);

  const meta = session?.user.user_metadata;
  // Email sign-ups chose a nickname on the sign-up form; Google (and Apple,
  // the first time) send a full name instead, of which the first name is
  // offered.
  const fullName = [meta?.full_name, meta?.name].find((v): v is string => typeof v === "string" && v.trim() !== "");
  const fallbackName =
    typeof meta?.display_name === "string" && meta.display_name ? meta.display_name : (fullName?.trim().split(/\s+/)[0] ?? "");
  const nameValue = displayName ?? fallbackName;
  // Email sign-ups typed their age on the sign-up form already.
  const metaAge = Number(meta?.age);
  const fallbackAge = Number.isInteger(metaAge) && metaAge >= 4 && metaAge <= 119 ? String(metaAge) : "";
  const ageValue = age ?? fallbackAge;
  // Email sign-ups already accepted the terms on the sign-up form.
  const alreadyAccepted = Boolean(session?.user.user_metadata?.terms_accepted_at);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const finalName = nameValue.trim();
    const ageNum = Number(ageValue);
    if (!session || !finalName || !ageNum || ageNum < 4 || ageNum > 119) {
      setError("בדקו שהכינוי והגיל תקינים");
      return;
    }
    if (!alreadyAccepted && !accepted) {
      setError(TERMS_REQUIRED_MESSAGE);
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("profiles").insert({
      id: session.user.id,
      display_name: finalName,
      age: ageNum,
      age_band: deriveAgeBand(ageNum),
      native_language: "he",
      email_reminders_enabled: false,
    });

    // 23505: the profile already exists (a double tap, or saved in another
    // tab), so there is nothing left to do here but move on.
    if (insertError?.code === "23505") {
      await refreshProfile();
      router.push("/dashboard");
      return;
    }
    if (insertError) {
      console.error("profile setup failed:", insertError.message);
      setError("לא הצלחנו לשמור את הפרטים. בדקו את החיבור לאינטרנט ונסו שוב.");
      setSubmitting(false);
      return;
    }

    const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("subscriptions")
      .insert({ profile_id: session.user.id, status: "trialing", trial_ends_at: trialEndsAt });

    if (!alreadyAccepted) {
      await supabase.auth.updateUser({ data: termsConsentMetadata() });
    }

    await refreshProfile();
    router.push("/dashboard");
  }

  if (authLoading) {
    return <div className="max-w-md mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
        <h1 className="text-3xl font-bold text-center">כמה פרטים אחרונים</h1>
        <p className="mt-2 text-center text-muted">כדי שנוכל להתאים לכם את קצב הלימוד הנכון</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1, ease: EASE_OUT }}
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >
        <div>
          <label htmlFor="setup-name" className="block text-sm font-medium mb-1.5">כינוי</label>
          <input
            id="setup-name"
            type="text"
            autoComplete="given-name"
            aria-describedby="setup-name-hint"
            value={nameValue}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p id="setup-name-hint" className="mt-1.5 text-xs text-muted">
            כינוי מספיק, אין צורך בשם מלא. הוא מוצג בלוח התוצאות למשתמשים בוגרים.
          </p>
        </div>
        <div>
          <label htmlFor="setup-age" className="block text-sm font-medium mb-1.5">גיל</label>
          <input
            id="setup-age"
            type="number"
            inputMode="numeric"
            autoComplete="off"
            min={4}
            max={119}
            value={ageValue}
            onChange={(e) => setAge(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {!alreadyAccepted && <TermsConsent checked={accepted} onChange={setAccepted} />}

        {error && <p role="alert" className="text-sm text-danger">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {submitting ? "שומר..." : "המשך ללוח הבקרה"}
        </motion.button>
      </motion.form>
    </div>
  );
}

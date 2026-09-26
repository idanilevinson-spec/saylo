"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import AppleLogo from "@/components/icons/AppleLogo";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabase/browserClient";
import { deriveAgeBand } from "@/lib/auth/ageBand";
import { TRIAL_DAYS } from "@/lib/subscriptions/plans";
import { signInWithOAuthNative } from "@/lib/auth/nativeOAuth";
import PasswordField from "@/components/PasswordField";
import TermsConsent from "@/components/TermsConsent";
import { TERMS_REQUIRED_MESSAGE, termsConsentMetadata } from "@/lib/legal/consent";
import { EMAIL_INPUT } from "@/lib/utils/inputProps";

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // The confirmation mail may be slow, land in spam, or be sent to a mistyped
  // address — none of which the learner can fix from a page that only says
  // "check your email". This is the way out.
  async function handleResend() {
    setResendStatus("sending");
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
    setResendStatus(resendError ? "error" : "sent");
  }

  function requireAccepted() {
    if (accepted) return true;
    setError(TERMS_REQUIRED_MESSAGE);
    return false;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const ageNum = Number(age);
    if (!displayName.trim() || !ageNum || ageNum < 4 || ageNum > 119) {
      setError("בדקו שהכינוי והגיל תקינים");
      return;
    }
    if (!requireAccepted()) return;

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, ...termsConsentMetadata() } },
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
        email_reminders_enabled: false,
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

  // See LoginForm.tsx — native avoids the multi-hop redirect chain (and the
  // white flash it produced) via a modal browser + deep-link return instead.
  async function handleGoogleSignup() {
    setError(null);
    if (!requireAccepted()) return;
    if (Capacitor.isNativePlatform()) {
      if (await signInWithOAuthNative("google")) router.push("/dashboard");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  }

  // See LoginForm.tsx — same App Store Review Guideline 4.8 requirement
  // applies here too.
  async function handleAppleSignup() {
    setError(null);
    if (!requireAccepted()) return;
    if (Capacitor.isNativePlatform()) {
      if (await signInWithOAuthNative("apple")) router.push("/dashboard");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  }

  if (awaitingConfirmation) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black tracking-tight">בדקו את המייל שלכם</h1>
        <p className="mt-3 text-muted">
          שלחנו קישור אישור לכתובת <span dir="ltr" className="inline-block">{email}</span>. לחצו עליו כדי
          להשלים את ההרשמה. אם המייל לא הגיע, בדקו גם בתיקיית הספאם.
        </p>
        <p className="mt-2 text-sm text-muted">אחרי שאישרתם, חזרו לכאן והתחברו עם האימייל והסיסמה שבחרתם.</p>

        <div className="mt-8 space-y-3">
          <Link
            href="/login"
            className="block w-full px-4 py-3 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            אישרתי, אפשר להתחבר
          </Link>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === "sending"}
            className="w-full px-4 py-3 rounded-lg border border-card-border bg-background font-medium hover:bg-background-2 transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {resendStatus === "sending" ? "שולחים..." : "שלחו לי את המייל שוב"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAwaitingConfirmation(false);
              setResendStatus("idle");
            }}
            className="w-full px-4 py-2 text-sm text-muted hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            הכתובת שגויה? חזרו לתיקון
          </button>
        </div>

        <p role="status" className="mt-4 min-h-5 text-sm">
          {resendStatus === "sent" && <span className="text-success">שלחנו שוב. זה יכול לקחת דקה.</span>}
          {resendStatus === "error" && (
            <span className="text-danger">לא הצלחנו לשלוח שוב כרגע. נסו שוב בעוד דקה.</span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-black tracking-tight text-center">יוצרים חשבון</h1>
        <p className="mt-2 text-center text-muted">3 ימים ראשונים חינם, בלי כרטיס אשראי</p>
        {/* App Store Review Guideline 5.1.1: says explicitly, at the exact
            point registration is required, why it's required — every
            feature past this point is tied to the account itself. */}
        <p className="mt-1 text-center text-xs text-muted">
          החשבון הוא מה שמאפשר מסלול לימוד אישי, מורה AI שזוכר אתכם, ושמירת ההתקדמות בכל המכשירים שלכם.
        </p>
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
            <label htmlFor="signup-name" className="block text-sm font-medium mb-1.5">כינוי</label>
            <input
              id="signup-name"
              type="text"
              autoComplete="given-name"
              aria-describedby="signup-name-hint"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p id="signup-name-hint" className="mt-1.5 text-xs text-muted">
              כינוי מספיק, אין צורך בשם מלא. הוא מוצג בלוח התוצאות למשתמשים בוגרים.
            </p>
          </div>
          <div>
            <label htmlFor="signup-age" className="block text-sm font-medium mb-1.5">גיל</label>
            <input
              id="signup-age"
              type="number"
              inputMode="numeric"
              autoComplete="off"
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
              {...EMAIL_INPUT}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5">סיסמה</label>
            <PasswordField
              id="signup-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              aria-describedby="signup-password-hint"
            />
            <p id="signup-password-hint" className="mt-1.5 text-xs text-muted">
              לפחות 6 תווים
            </p>
          </div>

          <TermsConsent checked={accepted} onChange={setAccepted} />

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

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAppleSignup}
          className="mt-2.5 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-card-border bg-background font-medium hover:bg-background-2 transition-colors"
        >
          <AppleLogo size={24} /> המשך עם Apple
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

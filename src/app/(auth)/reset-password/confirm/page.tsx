"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import IconBadge from "@/components/IconBadge";
import { supabase } from "@/lib/supabase/browserClient";

// Reached only via the link in the password-reset email. Supabase's client
// auto-detects the recovery token in the URL on load and fires a
// PASSWORD_RECOVERY auth event once the session is ready — only then do we
// know it's safe to show the "set a new password" form.
export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <IconBadge icon={CheckCircle2} tone="success" />
        <h1 className="text-2xl font-bold">הסיסמה עודכנה בהצלחה</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/dashboard")}
          className="mt-6 px-6 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          המשך ללוח הבקרה
        </motion.button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-muted">
        מאמת את הקישור...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-center">בחרו סיסמה חדשה</h1>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium mb-1.5">סיסמה חדשה</label>
          <input
            id="new-password"
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
          disabled={submitting}
          className="w-full px-4 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {submitting ? "מעדכן..." : "עדכון סיסמה"}
        </motion.button>
      </motion.form>
    </div>
  );
}

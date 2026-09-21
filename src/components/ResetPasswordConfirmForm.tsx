"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import IconBadge from "@/components/IconBadge";
import { supabase } from "@/lib/supabase/browserClient";
import PasswordField from "@/components/PasswordField";

// Reached via the link in the password-reset email. The link either signs the
// learner in on the server first (/auth/confirm, works in any browser) or
// carries a code the client exchanges on load — which only works in the same
// browser that asked for the reset. Either way a session exists once it has
// worked, so the form is shown as soon as there is one. If there is none, the
// page says so and offers a new link, instead of waiting forever.
export default function ResetPasswordConfirmForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Resolves once the client has finished reading the URL, so a failed
    // exchange shows up here as "no session" rather than as silence.
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setStatus(data.session ? "ready" : "invalid");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) setStatus("ready");
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
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
        <h1 className="text-2xl font-black tracking-tight">הסיסמה עודכנה בהצלחה</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/dashboard")}
          className="mt-6 px-6 py-3 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors"
        >
          המשך ללוח הבקרה
        </motion.button>
      </div>
    );
  }

  if (status === "checking") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-muted">
        מאמת את הקישור...
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black tracking-tight">הקישור לא תקף</h1>
        <p className="mt-3 text-muted">
          הקישור פג תוקף, כבר נוצל, או נפתח בדפדפן אחר מזה שביקשתם ממנו את האיפוס. בקשו קישור חדש ופתחו אותו באותו
          דפדפן.
        </p>
        <Link
          href="/reset-password"
          className="mt-6 inline-block px-6 py-3 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          בקשת קישור חדש
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-black tracking-tight text-center">בחרו סיסמה חדשה</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mt-8 bg-card border border-card-border rounded-lg shadow-sm p-6 sm:p-7"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-primary" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium mb-1.5">סיסמה חדשה</label>
            <PasswordField
              id="new-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {submitting ? "מעדכן..." : "עדכון סיסמה"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

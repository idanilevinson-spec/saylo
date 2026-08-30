"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";
import { AGE_BAND_LABELS } from "@/lib/auth/ageBand";
import { supabase } from "@/lib/supabase/browserClient";
import PushSubscribeButton from "@/components/PushSubscribeButton";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, signOut, refreshProfile } = useAuth();
  const [savingEmailPref, setSavingEmailPref] = useState(false);

  async function toggleEmailReminders() {
    if (!profile || savingEmailPref) return;
    setSavingEmailPref(true);
    await supabase
      .from("profiles")
      .update({ email_reminders_enabled: !profile.email_reminders_enabled })
      .eq("id", profile.id);
    await refreshProfile();
    setSavingEmailPref(false);
  }

  useEffect(() => {
    if (!loading && !profile) {
      router.replace("/profile/setup");
    }
  }, [loading, profile, router]);

  if (loading || !profile) {
    return <div className="max-w-md mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-center"
      >
        הפרופיל שלי
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mt-8 bg-card border border-card-border rounded-2xl p-6 space-y-4"
      >
        <div>
          <p className="text-sm text-muted">שם</p>
          <p className="font-medium">{profile.display_name}</p>
        </div>
        <div>
          <p className="text-sm text-muted">קבוצת גיל</p>
          <p className="font-medium">{AGE_BAND_LABELS[profile.age_band]}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-4 bg-card border border-card-border rounded-2xl p-6 space-y-3"
      >
        <h2 className="font-bold text-sm text-muted">התראות</h2>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm">תזכורות רצף במייל</span>
          <input
            type="checkbox"
            checked={profile.email_reminders_enabled}
            onChange={toggleEmailReminders}
            disabled={savingEmailPref}
            className="w-5 h-5 accent-primary"
          />
        </label>
        <PushSubscribeButton />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
        className="mt-6 w-full px-4 py-3 rounded-xl border border-card-border font-medium text-danger hover:bg-danger-ink transition-colors"
      >
        התנתקות
      </motion.button>
    </div>
  );
}

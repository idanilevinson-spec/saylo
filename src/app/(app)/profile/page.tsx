"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Trophy, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { AGE_BAND_LABELS } from "@/lib/auth/ageBand";
import { supabase } from "@/lib/supabase/browserClient";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import PushSubscribeButton from "@/components/PushSubscribeButton";

interface ProfileStats {
  totalXp: number;
  level: number;
  currentStreak: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, signOut, refreshProfile } = useAuth();
  const [savingEmailPref, setSavingEmailPref] = useState(false);
  const [stats, setStats] = useState<ProfileStats | null>(null);

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

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      supabase.from("user_xp").select("total_xp, current_level").eq("profile_id", profile.id).maybeSingle(),
      supabase.from("streaks").select("current_streak").eq("profile_id", profile.id).maybeSingle(),
    ]).then(([xpRes, streakRes]) => {
      setStats({
        totalXp: xpRes.data?.total_xp ?? 0,
        level: xpRes.data?.current_level ?? 1,
        currentStreak: streakRes.data?.current_streak ?? 0,
      });
    });
  }, [profile]);

  if (loading || !profile) {
    return <div className="max-w-md mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  const initial = profile.display_name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-l from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-ink shadow-lg shadow-primary/20">
          {initial}
        </div>
        <h1 className="mt-4 text-2xl font-bold">{profile.display_name}</h1>
        <p className="text-sm text-muted">{AGE_BAND_LABELS[profile.age_band]}</p>
      </motion.div>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-6 flex items-center justify-around bg-card border border-card-border rounded-2xl p-5"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="flex items-center gap-1 text-primary">
              <Star size={16} className="fill-current" />
              <EnglishText as="span" className="font-bold">
                {stats.totalXp}
              </EnglishText>
            </span>
            <p className="text-xs text-muted">XP</p>
          </div>
          <div className="h-8 border-e border-dashed border-card-border" />
          <div className="flex flex-col items-center gap-1">
            <span className="flex items-center gap-1 text-accent-hover">
              <Trophy size={16} />
              <EnglishText as="span" className="font-bold">
                {stats.level}
              </EnglishText>
            </span>
            <p className="text-xs text-muted">רמה</p>
          </div>
          <div className="h-8 border-e border-dashed border-card-border" />
          <div className="flex flex-col items-center gap-1">
            <span className="flex items-center gap-1 text-accent-hover">
              <Flame size={16} />
              <EnglishText as="span" className="font-bold">
                {stats.currentStreak}
              </EnglishText>
            </span>
            <p className="text-xs text-muted">ימים ברצף</p>
          </div>
        </motion.div>
      )}

      <MotionLink
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        href="/progress"
        className="mt-3 block text-center text-sm text-primary font-medium py-2"
      >
        כל ההתקדמות שלי ←
      </MotionLink>

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
        className="mt-6 w-full px-4 py-3 rounded-xl border border-card-border font-medium text-danger hover:bg-danger-ink transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        התנתקות
      </motion.button>
    </div>
  );
}

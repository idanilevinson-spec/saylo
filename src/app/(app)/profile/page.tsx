"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Trophy, Flame, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { AGE_BAND_LABELS } from "@/lib/auth/ageBand";
import { supabase } from "@/lib/supabase/browserClient";
import type { Subscription } from "@/types/database";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import PushSubscribeButton from "@/components/PushSubscribeButton";

interface ProfileStats {
  totalXp: number;
  level: number;
  currentStreak: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, signOut, refreshProfile } = useAuth();
  const [savingEmailPref, setSavingEmailPref] = useState(false);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [planLabel, setPlanLabel] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("subscriptions")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle()
      .then(async ({ data }) => {
        setSubscription(data);
        if (data?.plan_id) {
          const { data: plan } = await supabase
            .from("subscription_plans")
            .select("code, months")
            .eq("id", data.plan_id)
            .maybeSingle();
          if (plan) setPlanLabel(plan.months === 1 ? "מנוי חודשי" : `מנוי ל-${plan.months} חודשים`);
        }
      });
  }, [profile]);

  async function submitCancelToggle(cancelAtPeriodEnd: boolean) {
    setCancelLoading(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelAtPeriodEnd }),
      });
      if (!res.ok) throw new Error("cancel failed");
      setSubscription((prev) => (prev ? { ...prev, cancel_at_period_end: cancelAtPeriodEnd } : prev));
      setConfirmingCancel(false);
    } catch {
      setCancelError("אירעה שגיאה בעדכון המנוי. נסו שוב.");
    } finally {
      setCancelLoading(false);
    }
  }

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

      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mt-4 bg-card border border-card-border rounded-2xl p-6 space-y-3"
        >
          <h2 className="font-bold text-sm text-muted flex items-center gap-1.5">
            <CreditCard size={14} /> המנוי שלי
          </h2>

          {subscription.status === "trialing" && (
            <>
              <p className="text-sm">
                אתם בתקופת ניסיון עד <strong>{formatDate(subscription.trial_ends_at)}</strong>
              </p>
              <MotionLink
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                href="/pricing"
                className="inline-block text-sm text-primary font-medium hover:underline"
              >
                שדרוג למנוי בתשלום ←
              </MotionLink>
            </>
          )}

          {subscription.status === "active" && !subscription.cancel_at_period_end && (
            <>
              <p className="text-sm">
                {planLabel ?? "מנוי פעיל"} · מתחדש ב-<strong>{formatDate(subscription.current_period_end)}</strong>
              </p>
              {!confirmingCancel ? (
                <button
                  onClick={() => setConfirmingCancel(true)}
                  className="text-sm text-danger font-medium hover:underline"
                >
                  ביטול המנוי
                </button>
              ) : (
                <div className="bg-danger-ink border border-danger/30 rounded-xl p-4 space-y-3">
                  <p className="text-sm">
                    בטוחים שברצונכם לבטל? תמשיכו ליהנות מהמנוי עד{" "}
                    <strong>{formatDate(subscription.current_period_end)}</strong> — התשלום שכבר בוצע לא מוחזר, ואחרי
                    התאריך הזה פשוט לא תחויבו שוב.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitCancelToggle(true)}
                      disabled={cancelLoading}
                      className="px-3 py-1.5 rounded-lg bg-danger text-white text-sm font-medium disabled:opacity-60"
                    >
                      {cancelLoading ? "מבטל..." : "כן, בטלו את המנוי"}
                    </button>
                    <button
                      onClick={() => setConfirmingCancel(false)}
                      disabled={cancelLoading}
                      className="px-3 py-1.5 rounded-lg border border-card-border text-sm"
                    >
                      השאירו את המנוי
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {subscription.status === "active" && subscription.cancel_at_period_end && (
            <>
              <p className="text-sm">
                המנוי שלכם יבוטל ב-<strong>{formatDate(subscription.current_period_end)}</strong> — עד אז יש לכם
                גישה מלאה, ולא תחויבו שוב אחרי זה.
              </p>
              <button
                onClick={() => submitCancelToggle(false)}
                disabled={cancelLoading}
                className="text-sm text-primary font-medium hover:underline disabled:opacity-60"
              >
                {cancelLoading ? "מעדכן..." : "המשיכו את המנוי"}
              </button>
            </>
          )}

          {(subscription.status === "canceled" || subscription.status === "expired") && (
            <>
              <p className="text-sm text-muted">אין לכם מנוי פעיל כרגע.</p>
              <MotionLink
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                href="/pricing"
                className="inline-block text-sm text-primary font-medium hover:underline"
              >
                חידוש המנוי ←
              </MotionLink>
            </>
          )}

          {subscription.status === "past_due" && (
            <p role="alert" className="text-sm text-danger">
              יש בעיה בחיוב האחרון שלכם — בדקו את אמצעי התשלום מול חברת האשראי.
            </p>
          )}

          {cancelError && (
            <p role="alert" className="text-sm text-danger">
              {cancelError}
            </p>
          )}
        </motion.div>
      )}

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

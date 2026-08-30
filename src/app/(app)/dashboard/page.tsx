"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import TeacherSuggestionCard from "@/components/TeacherSuggestionCard";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { isPremiumActive } from "@/lib/subscriptions/entitlements";
import { getCurrentHearts } from "@/lib/subscriptions/heartsService";
import type { Subscription } from "@/types/database";

const MODULES = [
  { icon: "🎯", title: "מבחן רמה", body: "גלו את רמת האנגלית שלכם", href: "/placement", available: true },
  { icon: "🗺️", title: "מסלול לימוד", body: "הסדר המומלץ להתחלה", href: "/learn", available: true },
  { icon: "📚", title: "אוצר מילים", body: "מספרים, צבעים, משפחה ועוד", href: "/vocabulary", available: true },
  { icon: "✍️", title: "דקדוק", body: "5 שיעורי יסוד ברמת A1", href: "/grammar", available: true },
  { icon: "🧠", title: "חזרה חכמה", body: "המילים שהגיע זמנן", href: "/review", available: true },
  { icon: "📖", title: "קריאה", body: "טקסטים עם מילון בלחיצה", href: "/reading", available: true },
  { icon: "🎧", title: "האזנה", body: "הקשיבו ובדקו את עצמכם", href: "/listening", available: true },
  { icon: "📝", title: "כתיבה", body: "משוב אישי מ-AI על מה שכתבתם", href: "/writing", available: true },
  { icon: "🔥", title: "ניבים וביטויים", body: "אנגלית שאנשים באמת מדברים", href: "/idioms", available: true },
  { icon: "🗣️", title: "דיבור עם AI", body: "תרגלו שיחה אמיתית באנגלית", href: "/speaking", available: true },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "בוקר טוב";
  if (hour < 18) return "צהריים טובים";
  return "ערב טוב";
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [stats, setStats] = useState<{ totalXp: number; level: number; currentStreak: number } | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hearts, setHearts] = useState<{ current: number; max: number } | null>(null);

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
      supabase.from("subscriptions").select("*").eq("profile_id", profile.id).maybeSingle(),
    ]).then(([xpRes, streakRes, subRes]) => {
      setStats({
        totalXp: xpRes.data?.total_xp ?? 0,
        level: xpRes.data?.current_level ?? 1,
        currentStreak: streakRes.data?.current_streak ?? 0,
      });
      setSubscription(subRes.data ?? null);
    });
  }, [profile]);

  useEffect(() => {
    if (!profile || stats === null) return; // wait until the initial fetch above completes
    const premium = subscription ? isPremiumActive(subscription) : false;
    if (premium) return;
    getCurrentHearts(profile.id).then(setHearts);
  }, [profile, subscription, stats]);

  if (loading || !profile) {
    return <div className="max-w-4xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold"
      >
        {greeting()}, {profile.display_name} 👋
      </motion.h1>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-4 flex items-center gap-4 text-sm"
        >
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent-hover font-bold">
            🔥 {stats.currentStreak} ימים ברצף
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold">
            ⭐ {stats.totalXp} XP · רמה {stats.level}
          </span>
          {hearts && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger-ink text-danger font-bold">
              💔 {hearts.current}/{hearts.max} לבבות
            </span>
          )}
        </motion.div>
      )}

      {stats !== null && <SubscriptionBanner subscription={subscription} />}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-6 bg-card border border-card-border rounded-2xl p-6"
      >
        <p className="text-sm text-muted">היעד היומי שלכם</p>
        <p className="mt-1 text-2xl font-bold">15 דקות לימוד</p>
        <p className="mt-3 text-sm text-muted">
          15 דקות ביום מספיקות כדי להתקדם באמת — נסו לשמור על הרצף.
        </p>
      </motion.div>

      <TeacherSuggestionCard />

      <h2 className="mt-10 text-lg font-bold text-muted">המשך ללמוד</h2>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MODULES.map((m, i) => {
          const content = (
            <>
              <span className="text-2xl">{m.icon}</span>
              <h3 className="mt-2 font-bold">{m.title}</h3>
              <p className="mt-1 text-xs text-muted">{m.body}</p>
            </>
          );
          const className = `bg-card border border-card-border rounded-2xl p-5 ${
            m.available ? "hover:border-primary/40 hover:shadow-md transition-all" : "opacity-70"
          }`;

          return (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
              whileHover={m.available ? { y: -4 } : undefined}
              whileTap={m.available ? { scale: 0.97 } : undefined}
            >
              {m.available && m.href ? (
                <Link href={m.href} className={`block ${className}`}>
                  {content}
                </Link>
              ) : (
                <div className={className}>{content}</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

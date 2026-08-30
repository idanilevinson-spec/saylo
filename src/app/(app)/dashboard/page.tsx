"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  Map,
  BookOpen,
  PenLine,
  Brain,
  BookOpenText,
  Headphones,
  NotebookPen,
  Quote,
  MessageCircle,
  Phone,
  Flame,
  Star,
  Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import TeacherSuggestionCard from "@/components/TeacherSuggestionCard";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { isPremiumActive } from "@/lib/subscriptions/entitlements";
import { getCurrentHearts } from "@/lib/subscriptions/heartsService";
import type { Subscription } from "@/types/database";

const MODULES = [
  { icon: Target, title: "מבחן רמה", body: "גלו את רמת האנגלית שלכם", href: "/placement", available: true },
  { icon: Map, title: "מסלול לימוד", body: "הסדר המומלץ להתחלה", href: "/learn", available: true },
  { icon: BookOpen, title: "אוצר מילים", body: "מספרים, צבעים, משפחה ועוד", href: "/vocabulary", available: true },
  { icon: PenLine, title: "דקדוק", body: "5 שיעורי יסוד ברמת A1", href: "/grammar", available: true },
  { icon: Brain, title: "חזרה חכמה", body: "המילים שהגיע זמנן", href: "/review", available: true },
  { icon: BookOpenText, title: "קריאה", body: "טקסטים עם מילון בלחיצה", href: "/reading", available: true },
  { icon: Headphones, title: "האזנה", body: "הקשיבו ובדקו את עצמכם", href: "/listening", available: true },
  { icon: NotebookPen, title: "כתיבה", body: "משוב אישי מ-AI על מה שכתבתם", href: "/writing", available: true },
  { icon: Quote, title: "ניבים וביטויים", body: "אנגלית שאנשים באמת מדברים", href: "/idioms", available: true },
  { icon: MessageCircle, title: "דיבור עם AI", body: "תרגלו שיחה אמיתית באנגלית", href: "/speaking", available: true },
  { icon: Phone, title: "מורה AI", body: "שיחה קולית חופשית עם AI", href: "/speaking/voice", available: true },
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
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-9 w-64 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-4 flex gap-3">
          <div className="h-8 w-28 rounded-full bg-background-2 animate-pulse" />
          <div className="h-8 w-32 rounded-full bg-background-2 animate-pulse" />
        </div>
        <div className="mt-6 h-24 rounded-2xl bg-background-2 animate-pulse" />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-background-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
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
            <Flame size={16} className="fill-current" /> {stats.currentStreak} ימים ברצף
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold">
            <Star size={16} className="fill-current" /> {stats.totalXp} XP · רמה {stats.level}
          </span>
          {hearts && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger-ink text-danger font-bold">
              <Heart size={16} className="fill-current" /> {hearts.current}/{hearts.max} לבבות
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
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <m.icon size={20} strokeWidth={2} />
              </span>
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

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
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import TeacherSuggestionCard from "@/components/TeacherSuggestionCard";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { isPremiumActive } from "@/lib/subscriptions/entitlements";
import { getCurrentHearts } from "@/lib/subscriptions/heartsService";
import type { Subscription } from "@/types/database";

const FEATURED_MODULES = [
  {
    icon: Phone,
    title: "שיחה קולית עם מורה AI",
    body: "שיחה חופשית בקול — כמו שיחת טלפון",
    href: "/speaking/voice",
    tone: "accent" as const,
  },
  {
    icon: MessageCircle,
    title: "צ'אט עם מורה AI",
    body: "תרגלו שיחה אמיתית באנגלית בהקלדה",
    href: "/speaking",
    tone: "primary" as const,
  },
];

const MODULES = [
  { icon: Sparkles, title: "שיעור יומי", body: "נושא אחד, נבחר בשבילכם להיום", href: "/learn/today", available: true },
  { icon: Target, title: "מבחן רמה", body: "גלו את רמת האנגלית שלכם", href: "/placement", available: true },
  { icon: Map, title: "מסלול לימוד", body: "כל הנושאים מ-A1 עד C2", href: "/learn", available: true },
  { icon: BookOpen, title: "אוצר מילים", body: "מספרים, צבעים, משפחה ועוד", href: "/vocabulary", available: true },
  { icon: PenLine, title: "דקדוק", body: "מסלול מלא מ-A1 עד C2", href: "/grammar", available: true },
  { icon: Brain, title: "חזרה חכמה", body: "המילים שהגיע זמנן", href: "/review", available: true },
  { icon: Gamepad2, title: "משחקי אוצר מילים", body: "סיבוב מהירות, איות ואתגר יומי", href: "/games", available: true },
  { icon: BookOpenText, title: "קריאה", body: "טקסטים עם מילון בלחיצה", href: "/reading", available: true },
  { icon: Headphones, title: "האזנה", body: "הקשיבו ובדקו את עצמכם", href: "/listening", available: true },
  { icon: NotebookPen, title: "כתיבה", body: "משוב אישי מ-AI על מה שכתבתם", href: "/writing", available: true },
  { icon: Quote, title: "ניבים וביטויים", body: "אנגלית שאנשים באמת מדברים", href: "/idioms", available: true },
];

const DAILY_XP_GOAL = 50;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "בוקר טוב";
  if (hour < 18) return "צהריים טובים";
  return "ערב טוב";
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [stats, setStats] = useState<{ totalXp: number; level: number; currentStreak: number; todayXp: number } | null>(
    null
  );
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hearts, setHearts] = useState<{ current: number; max: number } | null>(null);

  useEffect(() => {
    if (!loading && !profile) {
      router.replace("/profile/setup");
    }
  }, [loading, profile, router]);

  useEffect(() => {
    if (!profile) return;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    Promise.all([
      supabase.from("user_xp").select("total_xp, current_level").eq("profile_id", profile.id).maybeSingle(),
      supabase.from("streaks").select("current_streak").eq("profile_id", profile.id).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("profile_id", profile.id).maybeSingle(),
      supabase
        .from("xp_events")
        .select("amount")
        .eq("profile_id", profile.id)
        .gte("created_at", startOfToday.toISOString()),
    ]).then(([xpRes, streakRes, subRes, todayXpRes]) => {
      setStats({
        totalXp: xpRes.data?.total_xp ?? 0,
        level: xpRes.data?.current_level ?? 1,
        currentStreak: streakRes.data?.current_streak ?? 0,
        todayXp: (todayXpRes.data ?? []).reduce((sum, e) => sum + e.amount, 0),
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
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-10 w-72 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-4 flex gap-3">
          <div className="h-8 w-28 rounded-full bg-background-2 animate-pulse" />
          <div className="h-8 w-32 rounded-full bg-background-2 animate-pulse" />
        </div>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 auto-rows-[minmax(112px,auto)]">
          <div className="col-span-2 row-span-2 rounded-2xl bg-background-2 animate-pulse" />
          <div className="col-span-2 rounded-2xl bg-background-2 animate-pulse" />
          <div className="col-span-2 rounded-2xl bg-background-2 animate-pulse" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-background-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const todayXp = stats?.todayXp ?? 0;
  const goalPct = Math.min(100, Math.round((todayXp / DAILY_XP_GOAL) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl sm:text-4xl font-extrabold tracking-tight"
      >
        {greeting()}, {profile.display_name} 👋
      </motion.h1>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-4 flex flex-wrap items-center gap-3 text-sm"
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
          <Link href="/progress" className="text-primary hover:underline">
            כל ההתקדמות שלי ←
          </Link>
        </motion.div>
      )}

      {stats !== null && <SubscriptionBanner subscription={subscription} />}

      <TeacherSuggestionCard />

      <h2 className="mt-10 text-lg font-bold text-muted">המשך ללמוד</h2>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 auto-rows-[minmax(112px,auto)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl border border-card-border p-6 flex flex-col justify-between"
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: [0.55, 0.75, 0.55] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 100% 0%, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 0% 100%, color-mix(in srgb, var(--accent) 15%, transparent) 0%, transparent 55%)",
            }}
          />
          <div className="relative">
            <p className="text-sm text-muted">היעד היומי שלכם</p>
            <p className="mt-1 text-sm text-muted">{DAILY_XP_GOAL} XP ביום מספיקים כדי להתקדם באמת</p>
          </div>
          <div className="relative flex items-center gap-5 mt-4">
            <RadialProgress percent={goalPct} />
            <div>
              <p className="text-3xl font-extrabold">
                {todayXp}
                <span className="text-base font-medium text-muted"> / {DAILY_XP_GOAL} XP</span>
              </p>
              <p className="mt-1 text-xs text-muted">
                {goalPct >= 100 ? "היעד הושלם היום — כל הכבוד!" : "נסו לשמור על הרצף שלכם"}
              </p>
            </div>
          </div>
        </motion.div>

        {FEATURED_MODULES.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            className="col-span-2"
          >
            <Link
              href={m.href}
              className={`h-full flex items-center gap-4 rounded-2xl border p-5 transition-all hover:shadow-md ${
                m.tone === "accent"
                  ? "bg-accent/10 border-accent/30 hover:border-accent/50"
                  : "bg-primary/10 border-primary/30 hover:border-primary/50"
              }`}
            >
              <span
                className={`inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl ${
                  m.tone === "accent" ? "bg-accent/20 text-accent-hover" : "bg-primary/20 text-primary"
                }`}
              >
                <m.icon size={22} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold">{m.title}</h3>
                <p className="mt-0.5 text-xs text-muted truncate">{m.body}</p>
              </div>
            </Link>
          </motion.div>
        ))}

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
          const className = `h-full bg-card border border-card-border rounded-2xl p-5 ${
            m.available ? "hover:border-primary/40 hover:shadow-md transition-all" : "opacity-70"
          }`;

          return (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.05 }}
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

function RadialProgress({ percent }: { percent: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg viewBox="0 0 64 64" className="w-16 h-16 shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--background-2)" strokeWidth="7" />
      <motion.circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      />
    </svg>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
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
  Mic,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import TeacherSuggestionCard from "@/components/TeacherSuggestionCard";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { isPremiumActive } from "@/lib/subscriptions/entitlements";
import { getCurrentHearts } from "@/lib/subscriptions/heartsService";
import type { Subscription } from "@/types/database";

interface ModuleItem {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
}

const FEATURED_MODULES: (ModuleItem & { tone: "accent" | "primary" })[] = [
  {
    icon: Phone,
    title: "שיחה קולית עם מורה AI",
    body: "שיחה חופשית בקול — כמו שיחת טלפון",
    href: "/speaking/voice",
    tone: "accent",
  },
  {
    icon: MessageCircle,
    title: "צ'אט עם מורה AI",
    body: "תרגלו שיחה אמיתית באנגלית בהקלדה",
    href: "/speaking",
    tone: "primary",
  },
];

// Grouped by what the learner is trying to do, not dumped into one
// undifferentiated grid — a dozen same-size cards forces the eye to
// scan every one; three named groups let it jump straight to the
// right kind of practice.
const MODULE_GROUPS: { title: string; items: ModuleItem[] }[] = [
  {
    title: "מסלול הלימוד",
    items: [
      { icon: Sparkles, title: "שיעור יומי", body: "נושא אחד, נבחר בשבילכם להיום", href: "/learn/today" },
      { icon: Map, title: "מסלול לימוד", body: "כל הנושאים מ-A1 עד C2", href: "/learn" },
      { icon: Target, title: "מבחן רמה", body: "גלו את רמת האנגלית שלכם", href: "/placement" },
      { icon: Brain, title: "חזרה חכמה", body: "המילים שהגיע זמנן", href: "/review" },
    ],
  },
  {
    title: "תרגול לפי כישור",
    items: [
      { icon: BookOpen, title: "אוצר מילים", body: "מספרים, צבעים, משפחה ועוד", href: "/vocabulary" },
      { icon: PenLine, title: "דקדוק", body: "מסלול מלא מ-A1 עד C2", href: "/grammar" },
      { icon: BookOpenText, title: "הבנת הנקרא", body: "סיפורים עם שאלות ומשוב AI", href: "/reading" },
      { icon: Headphones, title: "האזנה", body: "הקשיבו ובדקו את עצמכם", href: "/listening" },
      { icon: NotebookPen, title: "כתיבה", body: "משוב אישי מ-AI על מה שכתבתם", href: "/writing" },
      { icon: Quote, title: "ניבים וביטויים", body: "אנגלית שאנשים באמת מדברים", href: "/idioms" },
    ],
  },
  {
    title: "משחק ודיבור",
    items: [
      { icon: Gamepad2, title: "משחקי אוצר מילים", body: "סיבוב מהירות, איות ואתגר יומי", href: "/games" },
      { icon: Mic, title: 'מבחן דיבור', body: 'עונים בקול על מילים ושאלות פתוחות, מדורג ע"י AI', href: "/speaking-test" },
    ],
  },
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
  const [placementDone, setPlacementDone] = useState<boolean | null>(null);

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
      supabase
        .from("placement_tests")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("status", "completed")
        .limit(1),
    ]).then(([xpRes, streakRes, subRes, todayXpRes, placementRes]) => {
      setStats({
        totalXp: xpRes.data?.total_xp ?? 0,
        level: xpRes.data?.current_level ?? 1,
        currentStreak: streakRes.data?.current_streak ?? 0,
        todayXp: (todayXpRes.data ?? []).reduce((sum, e) => sum + e.amount, 0),
      });
      setSubscription(subRes.data ?? null);
      setPlacementDone((placementRes.data?.length ?? 0) > 0);
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
        <div className="h-24 rounded-2xl bg-background-2 animate-pulse" />
        <div className="mt-6 h-28 rounded-2xl bg-background-2 animate-pulse" />
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-background-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const todayXp = stats?.todayXp ?? 0;
  const goalPct = Math.min(100, Math.round((todayXp / DAILY_XP_GOAL) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Status strip: greeting beside today's numbers. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-card border border-card-border rounded-2xl overflow-hidden sm:flex sm:items-stretch"
      >
        <div className="p-6 sm:p-7 sm:flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting()}, {profile.display_name} 👋
          </h1>
          <Link href="/progress" className="mt-2 inline-block text-sm text-primary hover:underline">
            כל ההתקדמות שלי ←
          </Link>
        </div>

        {stats && (
          <div className="border-t sm:border-t-0 sm:border-e border-card-border sm:w-px" aria-hidden="true" />
        )}

        {stats && (
          <div className="flex divide-x divide-x-reverse divide-card-border sm:divide-none">
            <StatField icon={Flame} tone="accent" value={String(stats.currentStreak)} label="רצף ימים" />
            <StatField icon={Star} tone="primary" value={String(stats.totalXp)} label={`XP · רמה ${stats.level}`} />
            {hearts && (
              <StatField icon={Heart} tone="danger" value={`${hearts.current}/${hearts.max}`} label="לבבות" />
            )}
          </div>
        )}
      </motion.div>

      {placementDone === false && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-6"
        >
          <Link
            href="/placement"
            className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-accent/40 bg-accent/[0.07] p-6 transition-colors hover:bg-accent/[0.11]"
          >
            <span className="inline-flex w-14 h-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent-hover">
              <Target size={26} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-bold text-lg">התחילו כאן: מבחן הרמה שלכם</h2>
              <p className="mt-1 text-sm text-muted">
                פחות מ־10 דקות, ובסיומן נדע בדיוק איפה להתחיל ולבנות לכם מסלול שמתאים לרמה שלכם.
              </p>
            </div>
            <span className="ms-auto shrink-0 text-accent-hover font-medium hidden sm:block group-hover:translate-x-[-4px] transition-transform">
              בואו נתחיל ←
            </span>
          </Link>
        </motion.div>
      )}

      {stats !== null && <SubscriptionBanner subscription={subscription} />}

      <TeacherSuggestionCard />

      {/* Today's goal + the two differentiated AI-conversation modes sit
          together up top — the rest of the catalog is grouped below by
          what the learner is trying to do, not spread into one grid of
          identical cards. */}
      <div className="mt-10 grid lg:grid-cols-[1.1fr_1fr] gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-card-border p-6 flex flex-col justify-between"
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
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">היעד היומי שלכם</p>
              <p className="mt-1 text-3xl font-extrabold">
                {todayXp}
                <span className="text-base font-medium text-muted"> / {DAILY_XP_GOAL} XP</span>
              </p>
            </div>
            <span className="shrink-0 mt-1 text-sm font-bold text-primary">{goalPct}%</span>
          </div>
          <div className="relative mt-5">
            <div className="h-2 rounded-full bg-background-2 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {goalPct >= 100 ? "היעד הושלם היום — כל הכבוד!" : "נסו לשמור על הרצף שלכם"}
            </p>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {FEATURED_MODULES.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
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
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {MODULE_GROUPS.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + gi * 0.08 }}
          >
            <h2 className="text-sm font-bold text-muted mb-3">{group.title}</h2>
            <div className="rounded-2xl border border-card-border bg-card overflow-hidden divide-y divide-card-border">
              {group.items.map((m) => (
                <Link
                  key={m.title}
                  href={m.href}
                  className="group flex items-center gap-3 px-4 py-3.5 hover:bg-background-2 transition-colors"
                >
                  <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <m.icon size={18} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm">{m.title}</p>
                    <p className="mt-0.5 text-xs text-muted truncate">{m.body}</p>
                  </div>
                  <ChevronLeft
                    size={16}
                    className="shrink-0 text-muted group-hover:text-primary group-hover:-translate-x-0.5 transition-all"
                  />
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatField({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: LucideIcon;
  tone: "accent" | "primary" | "danger";
  value: string;
  label: string;
}) {
  const toneClass =
    tone === "accent" ? "text-accent-hover" : tone === "primary" ? "text-primary" : "text-danger";

  return (
    <div className="px-5 py-4 sm:py-6 flex flex-col items-center justify-center text-center min-w-[92px]">
      <span className={`flex items-center gap-1 font-extrabold text-lg ${toneClass}`}>
        <Icon size={15} className="fill-current" />
        {value}
      </span>
      <span className="mt-0.5 text-[11px] text-muted">{label}</span>
    </div>
  );
}

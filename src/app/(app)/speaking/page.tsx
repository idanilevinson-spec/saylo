"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { LucideProps } from "lucide-react";
import {
  Phone,
  MessageSquareText,
  Flame,
  ChevronLeft,
  Utensils,
  Lightbulb,
  Sprout,
  Sun,
  Smartphone,
  Globe2,
  House,
  Moon,
  Coffee,
  Users,
  Plane,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Scale,
  Clapperboard,
  History,
} from "lucide-react";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ConsentRequestForm from "@/components/ConsentRequestForm";
import PremiumGate from "@/components/PremiumGate";
import AiConsentGate from "@/components/AiConsentGate";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { requiresParentalConsent } from "@/lib/auth/consentGate";
import { DAILY_CONVERSATION_LIMIT } from "@/lib/legal/siteInfo";
import type { ConversationScenario, ConversationTopicCategory } from "@/types/database";

// The AI teacher's home: a "studio" page. One committed blue on-air plate
// (start talking: voice or chat, or pick up where you left off), a daily
// speaking goal, conversation starters, and the scenario library by topic.

// Sentences the learner writes or says in English today, across all their
// conversations — counted from conversation_messages, so it's a real
// number, not a streak gimmick.
const DAILY_SENTENCE_GOAL = 15;

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// Conversation starters: original prompts, open enough for any level. A
// tap opens a free conversation with the starter already in the message
// box — the learner still sends it (and can edit it) themselves.
const STARTERS: { icon: ComponentType<LucideProps>; en: string; he: string }[] = [
  { icon: Utensils, en: "If you could have dinner with anyone, who would it be?", he: "ארוחת ערב עם מי שרק תבחרו" },
  { icon: Lightbulb, en: "Pitch me an app that nobody needs.", he: "רעיון לאפליקציה מיותרת" },
  { icon: Sprout, en: "What small habit changed your life?", he: "הרגל קטן ששינה משהו" },
  { icon: Sun, en: "Describe your perfect weekend, hour by hour.", he: "סוף השבוע המושלם" },
  { icon: Smartphone, en: "Should phones be allowed in class?", he: "טלפונים בכיתה: בעד או נגד" },
  { icon: Globe2, en: "Which city would you live in for one year?", he: "שנה אחת בעיר אחרת" },
  { icon: House, en: "Tell me about a place that feels like home.", he: "מקום שמרגיש בית" },
  { icon: Moon, en: "Morning person or night owl? Defend your side.", he: "אנשי בוקר מול אנשי לילה" },
];

const CATEGORIES: Record<ConversationTopicCategory, { label: string; icon: ComponentType<LucideProps> }> = {
  daily_life: { label: "יום-יום", icon: Coffee },
  social: { label: "חברתי", icon: Users },
  travel: { label: "נסיעות", icon: Plane },
  work_professional: { label: "עבודה", icon: Briefcase },
  academic: { label: "לימודים", icon: GraduationCap },
  health_wellbeing: { label: "בריאות ורווחה", icon: HeartPulse },
  serious_topics: { label: "נושאים רציניים", icon: Scale },
  entertainment_culture: { label: "בידור ותרבות", icon: Clapperboard },
};

interface RecentConversation {
  id: string;
  status: "active" | "completed";
  created_at: string;
  conversation_scenarios: { title_he: string } | null;
}

// The voice meter: the teacher on air, drawn as a live audio level rather
// than a synthetic face.
const METER = [28, 52, 80, 100, 74, 92, 60, 38, 66, 86, 48, 30];
function StudioMeter() {
  return (
    <div className="flex h-16 sm:h-20 items-center gap-1 sm:gap-1.5" aria-hidden="true">
      {METER.map((h, i) => (
        <span
          key={i}
          className="studio-bar w-1.5 sm:w-2 rounded-full bg-primary-ink/85"
          style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}

function GoalRing({ value, goal }: { value: number; goal: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / goal);
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-background-2" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={pct >= 1 ? "stroke-success" : "stroke-primary"}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center chyron text-2xl tabular-nums">{Math.min(value, 99)}</span>
    </div>
  );
}

export default function SpeakingPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ConversationScenario[] | null>(null);
  const [recent, setRecent] = useState<RecentConversation[]>([]);
  const [sentencesToday, setSentencesToday] = useState<number | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    supabase
      .from("conversation_scenarios")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
      .then(({ data }) => setScenarios(data ?? []));
  }, []);

  useEffect(() => {
    if (!profile) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    Promise.all([
      supabase
        .from("conversations")
        .select("id, status, created_at, conversation_scenarios(title_he)")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("conversation_messages")
        .select("id, conversations!inner(profile_id)", { count: "exact", head: true })
        .eq("conversations.profile_id", profile.id)
        .eq("role", "user")
        .gte("created_at", todayStart.toISOString()),
      supabase.from("streaks").select("current_streak").eq("profile_id", profile.id).maybeSingle(),
    ]).then(([conv, msgs, st]) => {
      setRecent((conv.data ?? []) as unknown as RecentConversation[]);
      setSentencesToday(msgs.count ?? 0);
      setStreak(st.data?.current_streak ?? 0);
    });
  }, [profile]);

  if (authLoading || !profile) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (requiresParentalConsent(profile)) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-6">מורה AI</h1>
        <ConsentRequestForm status={profile.parental_consent_status} />
      </div>
    );
  }

  async function startConversation(scenarioId: string | null, opts: { voice?: boolean; starter?: string } = {}) {
    if (!profile || starting) return;
    setStarting(true);
    setLimitReached(false);
    const { data, error } = await supabase
      .from("conversations")
      .insert({ profile_id: profile.id, scenario_id: scenarioId })
      .select()
      .single();
    if (data) {
      const params = new URLSearchParams();
      if (opts.voice) params.set("mode", "voice");
      if (opts.starter) params.set("starter", opts.starter);
      const qs = params.toString();
      router.push(`/speaking/chat/${data.id}${qs ? `?${qs}` : ""}`);
      return;
    }
    if (error?.message.includes("daily_conversation_limit_reached")) setLimitReached(true);
    setStarting(false);
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const conversationsToday = recent.filter((c) => new Date(c.created_at) >= todayStart).length;
  const resumable = recent.find((c) => c.status === "active" && new Date(c.created_at) >= todayStart);
  const grouped = (Object.keys(CATEGORIES) as ConversationTopicCategory[])
    .map((category) => ({ category, items: (scenarios ?? []).filter((s) => s.category === category) }))
    .filter((g) => g.items.length > 0);

  return (
    <PremiumGate featureName="מורה AI" requirePaid>
      <AiConsentGate>
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
          {/* Daily goal strip */}
          <div className="flex items-center gap-4">
            <GoalRing value={sentencesToday ?? 0} goal={DAILY_SENTENCE_GOAL} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-muted">היעד היומי</p>
              <p className="text-lg font-bold leading-tight tabular-nums">
                {sentencesToday === null
                  ? "…"
                  : sentencesToday >= DAILY_SENTENCE_GOAL
                    ? "עמדתם ביעד של היום"
                    : `עוד ${DAILY_SENTENCE_GOAL - sentencesToday} משפטים באנגלית`}
              </p>
              <p className="text-xs text-muted tabular-nums">
                {sentencesToday ?? 0} מתוך {DAILY_SENTENCE_GOAL} משפטים היום · {conversationsToday} מתוך {DAILY_CONVERSATION_LIMIT} שיחות
              </p>
            </div>
            {streak !== null && (
              <div className="flex items-center gap-1 rounded-lg border border-card-border bg-card px-3 py-2" aria-label={`רצף של ${streak} ימים`}>
                <Flame size={18} aria-hidden="true" className={streak > 0 ? "text-accent-hover fill-current" : "text-muted"} />
                <span className="chyron text-2xl tabular-nums" aria-hidden="true">
                  {streak}
                </span>
              </div>
            )}
          </div>

          {limitReached && (
            <div role="alert" className="mt-5 p-4 rounded-lg bg-danger-ink text-danger text-sm">
              הגעתם למגבלה של {DAILY_CONVERSATION_LIMIT} שיחות ליום. אפשר להתחיל שיחה חדשה בעוד עד 24 שעות, והשיחות הקודמות עדיין זמינות.
            </div>
          )}

          {/* The on-air plate */}
          <motion.section
            aria-labelledby="studio-title"
            initial={{ opacity: 0, transform: "translateY(12px) scale(0.985)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="relative mt-6 overflow-hidden rounded-lg bg-primary text-primary-ink shadow-[0_24px_60px_-24px_rgb(0_0_0/0.55)]"
          >
            {/* A broadcast grid behind everything: the studio floor. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage: "linear-gradient(to bottom, black, transparent 85%)",
              }}
            />
            <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-md bg-primary-ink/12 px-2.5 py-1">
                  <span className="live-dot h-2 w-2 rounded-full bg-primary-ink" aria-hidden="true" />
                  <span className="chyron text-sm tracking-wide">On air</span>
                </p>
                <h1 id="studio-title" className="mt-4 text-3xl sm:text-4xl font-black tracking-tight leading-[1.05]">
                  המורה שלכם מוכן לדבר
                </h1>
                <p className="mt-2 max-w-md text-primary-ink/80 leading-relaxed">
                  שיחה אמיתית באנגלית, בקול או בכתב. המורה זוכר את הטעויות שלכם ומחזיר אותן לתרגול.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => router.push("/speaking/voice")}
                    disabled={starting}
                    className="game-press inline-flex items-center justify-center gap-2 min-h-13 px-6 rounded-lg bg-background text-foreground font-bold shadow-[0_8px_20px_-10px_rgb(0_0_0/0.6)] transition-transform duration-150 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
                  >
                    <Phone size={18} aria-hidden="true" /> שיחה קולית
                  </button>
                  <button
                    type="button"
                    onClick={() => startConversation(null)}
                    disabled={starting}
                    className="game-press inline-flex items-center justify-center gap-2 min-h-13 px-6 rounded-lg border-2 border-primary-ink/35 font-bold hover:bg-primary-ink/10 transition-[background-color,transform] duration-150 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
                  >
                    <MessageSquareText size={18} aria-hidden="true" /> צ׳אט בכתב
                  </button>
                </div>
                {resumable && (
                  <Link
                    href={`/speaking/chat/${resumable.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline"
                  >
                    <History size={15} aria-hidden="true" />
                    להמשיך את השיחה של היום{resumable.conversation_scenarios ? `: ${resumable.conversation_scenarios.title_he}` : ""}
                    <ChevronLeft size={15} aria-hidden="true" />
                  </Link>
                )}
              </div>

              {/* The teacher, on the monitor */}
              <div className="relative mx-auto md:mx-0">
                <div className="relative rounded-lg bg-primary-ink/10 px-6 py-5 ring-1 ring-primary-ink/20 rotate-[-2deg] shadow-[0_16px_32px_-18px_rgb(0_0_0/0.6)]">
                  <StudioMeter />
                  <p className="mt-3 flex items-center justify-between gap-6 text-xs font-bold text-primary-ink/75">
                    <span>המורה של Saylo</span>
                    <span className="chyron tracking-wide">Live</span>
                  </p>
                </div>
                {/* What the teacher actually does — tags pinned to the monitor */}
                <span className="absolute -top-3 -start-6 hidden md:inline-flex rotate-[4deg] rounded-md bg-background px-2.5 py-1 text-xs font-bold text-foreground shadow-lg">
                  זוכר את הטעויות שלכם
                </span>
                <span className="absolute -bottom-3 -end-4 hidden md:inline-flex rotate-[-3deg] rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-accent-ink shadow-lg">
                  משוב בסוף כל שיחה
                </span>
              </div>
            </div>
          </motion.section>

          {/* Conversation starters */}
          <section aria-labelledby="starters-title" className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="starters-title" className="text-xl font-black tracking-tight">
                או בחרו על מה לדבר
              </h2>
              <p className="text-sm text-muted">השאלה מחכה בתיבת ההודעה, ואפשר לשנות אותה</p>
            </div>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTERS.map((s, i) => (
                <li key={s.en}>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, transform: "translateY(8px)" }}
                    animate={{ opacity: 1, transform: "translateY(0px)" }}
                    transition={{ duration: 0.3, delay: 0.05 + i * 0.035, ease: EASE_OUT }}
                    onClick={() => startConversation(null, { starter: s.en })}
                    disabled={starting}
                    className="game-press group flex w-full items-center gap-3.5 rounded-lg border border-card-border bg-card p-4 text-start transition-[border-color,transform,box-shadow] duration-150 hover:border-primary/50 hover:shadow-[0_10px_28px_-16px_rgb(0_0_0/0.5)] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    <span
                      className={`inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-lg ${
                        i % 3 === 1 ? "bg-accent/15 text-accent-hover" : "bg-primary/12 text-primary"
                      }`}
                    >
                      <s.icon size={20} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <EnglishText as="span" className="block text-right font-bold leading-snug">
                        {s.en}
                      </EnglishText>
                      <span className="mt-0.5 block text-sm text-muted">{s.he}</span>
                    </span>
                  </motion.button>
                </li>
              ))}
            </ul>
          </section>

          {/* Scenario library by topic */}
          <section aria-labelledby="scenarios-title" className="mt-12">
            <h2 id="scenarios-title" className="text-xl font-black tracking-tight">
              תרחישים מהחיים
            </h2>
            <p className="mt-1 text-sm text-muted">המורה נכנס לתפקיד: מלצר, מראיין עבודה, רופא, ואתם משחקים את עצמכם. גוללים הצידה בכל נושא.</p>
            {scenarios === null ? (
              <p className="mt-6 text-sm text-muted">טוען תרחישים…</p>
            ) : (
              <div className="mt-5 space-y-6">
                {grouped.map(({ category, items }) => {
                  const Cat = CATEGORIES[category];
                  return (
                    <div key={category}>
                      <h3 className="flex items-center gap-2 font-bold">
                        <Cat.icon size={17} aria-hidden="true" className="text-primary" />
                        {Cat.label}
                      </h3>
                      {/* One swipeable shelf per topic, on every screen size —
                          a long library stays a short page. */}
                      <ul
                        aria-label={Cat.label}
                        className="mt-2.5 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:thin] [scrollbar-color:var(--card-border)_transparent]"
                      >
                        {items.map((s) => (
                          <li key={s.id} className="snap-start shrink-0 w-[72%] sm:w-64">
                            <button
                              type="button"
                              onClick={() => startConversation(s.id)}
                              disabled={starting}
                              className="game-press relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-card-border bg-card p-4 text-start transition-[border-color,transform] duration-150 hover:border-primary/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                            >
                              <span className="flex items-start justify-between gap-2">
                                <span className="font-bold leading-snug">{s.title_he}</span>
                                <CefrBadge level={s.cefr_level} />
                              </span>
                              <EnglishText as="span" className="mt-1 block text-right text-sm text-muted">
                                {s.title_en}
                              </EnglishText>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {recent.length > 0 && (
            <section aria-labelledby="recent-title" className="mt-12">
              <h2 id="recent-title" className="text-xl font-black tracking-tight">
                השיחות האחרונות
              </h2>
              <ul className="mt-3 bg-card border border-card-border rounded-lg divide-y divide-card-border overflow-hidden">
                {recent.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/speaking/chat/${c.id}`}
                      className="game-press group flex items-center gap-3 p-4 hover:bg-background-2 transition-[background-color,transform] duration-150"
                    >
                      <MessageSquareText size={17} aria-hidden="true" className="text-muted shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block font-medium truncate">{c.conversation_scenarios?.title_he ?? "שיחה חופשית"}</span>
                        <span className="block text-xs text-muted tabular-nums">
                          {new Date(c.created_at).toLocaleDateString("he-IL", { day: "numeric", month: "long" })} ·{" "}
                          {c.status === "completed" ? "הסתיימה, עם משוב" : "פתוחה"}
                        </span>
                      </span>
                      <ChevronLeft size={17} aria-hidden="true" className="text-muted shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </AiConsentGate>
    </PremiumGate>
  );
}

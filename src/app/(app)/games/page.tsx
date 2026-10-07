"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  PenTool,
  Sparkles,
  BookOpenCheck,
  Link2,
  Hand,
  Brain,
  Trophy,
  ChevronLeft,
  GraduationCap,
  ClipboardCheck,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import MotionLink from "@/components/MotionLink";
import type { VocabularyGameType } from "@/types/database";

interface GameEntry {
  type: VocabularyGameType;
  icon: LucideIcon;
  title: string;
  body: string;
  // What one round actually is, from each game's own constants — so the
  // learner knows the commitment before tapping.
  length: string;
  href: string;
  // Memory is scored by moves, not accuracy: its best is the fewest tries.
  bestBy?: "fewest_moves";
}

// Grouped by what each game trains, not listed flat: speed games build
// recall under pressure, meaning games build recognition, spelling builds
// production — a learner who knows what they want to work on can find it.
const GROUPS: { title: string; note: string; games: GameEntry[] }[] = [
  {
    title: "מהירות ותגובה",
    note: "שליפה מהירה של מילים שכבר פגשתם",
    games: [
      {
        type: "speed_round",
        icon: Zap,
        title: "סיבוב מהירות",
        body: "8 שניות לכל שאלה. תשובה בתוך 3 שניות מזכה בבונוס XP.",
        length: "10 שאלות",
        href: "/games/speed",
      },
      {
        type: "word_catch",
        icon: Hand,
        title: "תפסו את המילה",
        body: "מילה נופלת מלמעלה. תפסו את התרגום הנכון לפני שהיא נוחתת, וכל גל מהיר יותר.",
        length: "גלים מתגברים",
        href: "/games/catch",
      },
    ],
  },
  {
    title: "משמעות וזיהוי",
    note: "לזהות מילה לפי תרגום, הגדרה או הקשר",
    games: [
      {
        type: "definition",
        icon: BookOpenCheck,
        title: "זיהוי לפי הגדרה",
        body: "מוצגת הגדרה באנגלית, ובוחרים את המילה שמתאימה לה.",
        length: "10 שאלות",
        href: "/games/definition",
      },
      {
        type: "match",
        icon: Link2,
        title: "משחק התאמה",
        body: "מחברים כל מילה לזוג שלה: תרגום, ואז הפכים ומשפטים. נגד השעון.",
        length: "שלבים נגד השעון",
        href: "/games/match",
      },
      {
        type: "memory",
        icon: Brain,
        title: "זיכרון",
        body: "הופכים קלפים ומוצאים כל מילה והתרגום שלה, בכמה שפחות ניסיונות.",
        length: "עד 6 זוגות",
        href: "/games/memory",
        bestBy: "fewest_moves",
      },
    ],
  },
  {
    title: "כתיב",
    note: "לכתוב את המילה בעצמכם, לא רק לזהות אותה",
    games: [
      {
        type: "spelling",
        icon: PenTool,
        title: "אתגר איות",
        body: "מוצגים התרגום ומילה עם אותיות חסרות, ומקלידים אותה במלואה.",
        length: "10 מילים",
        href: "/games/spelling",
      },
    ],
  },
];

interface Session {
  game_type: VocabularyGameType;
  correct_count: number;
  total_questions: number;
  created_at: string;
}

function summarize(sessions: Session[], game: GameEntry): string | null {
  const own = sessions.filter((s) => s.game_type === game.type && s.total_questions > 0);
  if (own.length === 0) return null;
  const rounds = own.length === 1 ? "סיבוב אחד" : `${own.length} סיבובים`;
  if (game.bestBy === "fewest_moves") {
    return `שיא: ${Math.min(...own.map((s) => s.total_questions))} ניסיונות · ${rounds}`;
  }
  const best = Math.max(...own.map((s) => Math.round((s.correct_count / s.total_questions) * 100)));
  return `שיא: ${best}% · ${rounds}`;
}

export default function GamesHubPage() {
  const { profile, loading } = useAuth();
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("vocabulary_game_sessions")
      .select("game_type, correct_count, total_questions, created_at")
      .eq("profile_id", profile.id)
      .then(({ data }) => setSessions((data ?? []) as Session[]));
  }, [profile]);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dailyToday = (sessions ?? []).find(
    (s) => s.game_type === "daily_challenge" && new Date(s.created_at) >= todayStart
  );
  const played = (sessions ?? []).filter((s) => s.total_questions > 0 && s.game_type !== "memory");
  const totalQuestions = played.reduce((n, s) => n + s.total_questions, 0);
  const accuracy = totalQuestions ? Math.round((played.reduce((n, s) => n + s.correct_count, 0) / totalQuestions) * 100) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-3xl font-bold">משחקים</h1>
          <p className="mt-2 text-muted">אותן מילים שאתם לומדים, בכמה דרכים. מילה שטעיתם בה תחזור אליכם שוב.</p>
        </div>
        {sessions && sessions.length > 0 && (
          <dl className="flex gap-5">
            <div>
              <dt className="text-xs text-muted">סיבובים</dt>
              <dd className="chyron text-3xl tabular-nums">{sessions.length}</dd>
            </div>
            {accuracy !== null && (
              <div>
                <dt className="text-xs text-muted">הצלחה</dt>
                <dd className="chyron text-3xl tabular-nums">{accuracy}%</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* The one featured action: today's challenge, built from the words
          due for review, with its once-a-day bonus. */}
      <section
        aria-labelledby="daily-title"
        className="relative overflow-hidden mt-8 bg-card border border-card-border rounded-lg p-5 sm:p-6"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="inline-flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={22} aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 id="daily-title" className="text-lg font-bold">
              האתגר היומי
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              10 שאלות מהמילים שהכי כדאי לחזק היום, בבחירה מרובה ובאיות.
              {dailyToday ? "" : " השלמה ראשונה היום מזכה ב-20 XP."}
            </p>
            {dailyToday && (
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-success tabular-nums">
                <CheckCircle2 size={15} aria-hidden="true" />
                הושלם היום · {dailyToday.correct_count} מתוך {dailyToday.total_questions}
              </p>
            )}
          </div>
          <MotionLink
            whileTap={{ scale: 0.97 }}
            href="/games/daily"
            className={`shrink-0 text-center px-5 py-2.5 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
              dailyToday
                ? "border border-card-border hover:border-primary/40"
                : "bg-primary text-primary-ink hover:bg-primary-hover"
            }`}
          >
            {dailyToday ? "לשחק שוב" : "להתחיל"}
          </MotionLink>
        </div>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title} aria-labelledby={`group-${group.title}`} className="mt-10">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 id={`group-${group.title}`} className="text-lg font-bold">
              {group.title}
            </h2>
            <p className="text-sm text-muted">{group.note}</p>
          </div>
          <ul className="mt-3 bg-card border border-card-border rounded-lg divide-y divide-card-border overflow-hidden">
            {group.games.map((game) => {
              const stat = sessions ? summarize(sessions, game) : null;
              return (
                <li key={game.type}>
                  <Link
                    href={game.href}
                    className="game-press group flex items-center gap-4 p-4 hover:bg-background-2 transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                  >
                    <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <game.icon size={20} aria-hidden="true" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-bold">{game.title}</span>
                        <span className="text-xs text-muted">{game.length}</span>
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">{game.body}</span>
                      <span className={`mt-1 block text-xs tabular-nums ${stat ? "text-accent-hover font-medium" : "text-muted"}`}>
                        {stat ?? "עוד לא שיחקתם"}
                      </span>
                    </span>
                    <ChevronLeft
                      size={18}
                      aria-hidden="true"
                      className="text-muted shrink-0 transition-transform group-hover:-translate-x-0.5"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section aria-labelledby="study-title" className="mt-10">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 id="study-title" className="text-lg font-bold">
            לימוד ומבחן לפי נושא
          </h2>
          <p className="text-sm text-muted">לא משחק, אבל באותן מילים</p>
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <StudyLink
            href="/games/learn"
            icon={GraduationCap}
            title="למידה"
            body="סבב שמתאים את עצמו: שאלות קלות למילים חדשות, קשות יותר למילים שכבר מוכרות."
          />
          <StudyLink
            href="/games/test"
            icon={ClipboardCheck}
            title="מבחן תרגול"
            body="מבחן מלא לפי נושא: בחירה מרובה, השלמת מילה ונכון/לא נכון, עם ציון בסוף."
          />
        </div>
      </section>

      <Link
        href="/games/leaderboard"
        className="group mt-10 flex items-center gap-4 rounded-lg border border-card-border p-4 hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        <Trophy size={20} aria-hidden="true" className="text-accent-hover shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="font-bold">לוח המובילים השבועי</span>
          <span className="block text-sm text-muted">מי צבר הכי הרבה XP השבוע, מכל התרגול והמשחקים</span>
        </span>
        <ChevronLeft size={18} aria-hidden="true" className="text-muted shrink-0 transition-transform group-hover:-translate-x-0.5" />
      </Link>
    </div>
  );
}

function StudyLink({ href, icon: Icon, title, body }: { href: string; icon: LucideIcon; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-lg bg-card border border-card-border p-4 hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      <Icon size={20} aria-hidden="true" className="text-primary shrink-0 mt-0.5" />
      <span className="min-w-0">
        <span className="font-bold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted">{body}</span>
      </span>
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, PenTool, Sparkles, Flame, BookOpenCheck, Link2, Hand, Brain, Trophy, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import ContentCard from "@/components/ContentCard";
import MotionLink from "@/components/MotionLink";

const GAME_MODES = [
  {
    icon: Sparkles,
    title: "אתגר יומי",
    body: "מבחר משחקים קצר, מותאם למילים שהכי כדאי לכם לחזק היום",
    href: "/games/daily",
    tone: "accent" as const,
  },
  {
    icon: Zap,
    title: "סיבוב מהירות",
    body: "ענו נכון ומהר ככל האפשר — כל תשובה מהירה מזכה בבונוס XP",
    href: "/games/speed",
    tone: "primary" as const,
  },
  {
    icon: BookOpenCheck,
    title: "זיהוי לפי הגדרה",
    body: "מוצגת הגדרה באנגלית — זהו איזו מילה מתאימה",
    href: "/games/definition",
    tone: "primary" as const,
  },
  {
    icon: PenTool,
    title: "אתגר איות",
    body: "מוצגת מילה עם אותיות חסרות — השלימו אותה נכון",
    href: "/games/spelling",
    tone: "primary" as const,
  },
  {
    icon: Link2,
    title: "משחק התאמה",
    body: "גררו כל מילה לזוג שלה — תרגום, הפכים ומשפטים, נגד השעון",
    href: "/games/match",
    tone: "accent" as const,
  },
  {
    icon: Hand,
    title: "תפוס את המילה",
    body: "מילה נופלת מלמעלה — תפסו את התרגום הנכון לפני שהיא נוחתת",
    href: "/games/catch",
    tone: "primary" as const,
  },
  {
    icon: Brain,
    title: "זיכרון",
    body: "הפכו קלפים ומצאו את כל זוגות המילה-תרגום בכמה שפחות ניסיונות",
    href: "/games/memory",
    tone: "accent" as const,
  },
];

interface GameStats {
  totalSessions: number;
  totalCorrect: number;
  totalQuestions: number;
}

export default function GamesHubPage() {
  const { profile, loading } = useAuth();
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("vocabulary_game_sessions")
      .select("correct_count, total_questions")
      .eq("profile_id", profile.id)
      .then(({ data }) => {
        const rows = data ?? [];
        setStats({
          totalSessions: rows.length,
          totalCorrect: rows.reduce((sum, r) => sum + r.correct_count, 0),
          totalQuestions: rows.reduce((sum, r) => sum + r.total_questions, 0),
        });
      });
  }, [profile]);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  const accuracy = stats && stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover mb-2">תרגול משחקי</span>
        <h1 className="text-3xl font-bold">משחקי אוצר מילים</h1>
        <p className="mt-2 text-muted">אותן מילים שאתם לומדים, בכמה דרכים — אם טעיתם במילה, היא תחזור אליכם שוב.</p>
      </motion.div>

      <MotionLink
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        href="/games/leaderboard"
        className="mt-6 flex items-center gap-4 bg-gradient-to-l from-primary/10 to-accent/10 border border-primary/25 rounded-2xl p-5 hover:border-primary/45 hover:shadow-md transition-all"
      >
        <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Trophy size={22} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold">לוח המובילים השבועי</h2>
          <p className="mt-0.5 text-sm text-muted">מי צבר הכי הרבה XP השבוע — מכל התרגול והמשחקים</p>
        </div>
        <ChevronLeft size={18} className="text-muted shrink-0" />
      </MotionLink>

      {stats && stats.totalSessions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-6 flex items-center gap-6 bg-card border border-card-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-1.5 text-accent-hover">
            <Flame size={18} />
            <span className="font-bold">{stats.totalSessions}</span>
          </div>
          <p className="text-sm text-muted">סיבובים ששיחקתם</p>
          {accuracy !== null && (
            <>
              <span className="text-card-border">·</span>
              <p className="text-sm text-muted">
                <span className="font-bold text-foreground">{accuracy}%</span> אחוז הצלחה כולל
              </p>
            </>
          )}
        </motion.div>
      )}

      <div className="mt-6 space-y-4">
        {GAME_MODES.map((game, i) => (
          <ContentCard key={game.title} href={game.href} index={i} className="p-5">
            <div className="flex items-center gap-4">
              <span
                className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
                  game.tone === "accent" ? "bg-accent/15 text-accent-hover" : "bg-primary/10 text-primary"
                }`}
              >
                <game.icon size={22} />
              </span>
              <div>
                <p className="font-bold">{game.title}</p>
                <p className="mt-0.5 text-sm text-muted">{game.body}</p>
              </div>
            </div>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Star,
  Trophy,
  Award,
  BookOpen,
  PenLine,
  BookOpenText,
  Headphones,
  NotebookPen,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import IconBadge from "@/components/IconBadge";
import EnglishText from "@/components/EnglishText";
import type { CefrLevel, SkillArea } from "@/types/database";

const CEFR_ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const DAYS = 14;

const SKILL_META: Record<SkillArea, { label: string; icon: typeof BookOpen }> = {
  vocabulary: { label: "אוצר מילים", icon: BookOpen },
  grammar: { label: "דקדוק", icon: PenLine },
  reading: { label: "קריאה", icon: BookOpenText },
  listening: { label: "האזנה", icon: Headphones },
  writing: { label: "כתיבה", icon: NotebookPen },
  speaking: { label: "דיבור", icon: MessageCircle },
};

interface DayBucket {
  date: string;
  label: string;
}

interface ProgressData {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  dailyXp: number[];
  dailyAccuracy: (number | null)[];
  skillAccuracy: Partial<Record<SkillArea, { correct: number; total: number }>>;
  skillLevels: Partial<Record<SkillArea, CefrLevel>>;
  conversationScores: number[];
  badges: { name_he: string; description_he: string; earned_at: string }[];
}

function lastNDays(n: number): DayBucket[] {
  const days: DayBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" }),
    });
  }
  return days;
}

export default function ProgressPage() {
  const { profile, loading: authLoading } = useAuth();
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    if (!profile) return;
    const buckets = lastNDays(DAYS);
    const since = new Date();
    since.setDate(since.getDate() - (DAYS - 1));
    since.setHours(0, 0, 0, 0);

    Promise.all([
      supabase.from("user_xp").select("total_xp, current_level").eq("profile_id", profile.id).maybeSingle(),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak")
        .eq("profile_id", profile.id)
        .maybeSingle(),
      supabase
        .from("xp_events")
        .select("amount, created_at")
        .eq("profile_id", profile.id)
        .gte("created_at", since.toISOString()),
      supabase
        .from("exercise_attempts")
        .select("is_correct, created_at, exercises(skill_area)")
        .eq("profile_id", profile.id)
        .gte("created_at", since.toISOString()),
      supabase
        .from("exercise_attempts")
        .select("is_correct, exercises(skill_area)")
        .eq("profile_id", profile.id),
      supabase.from("skill_levels").select("skill, cefr_level").eq("profile_id", profile.id),
      supabase
        .from("conversations")
        .select("created_at, conversation_scores(overall_score)")
        .eq("profile_id", profile.id)
        .eq("status", "completed")
        .order("created_at")
        .limit(10),
      supabase
        .from("user_badges")
        .select("earned_at, badges(name_he, description_he)")
        .eq("profile_id", profile.id)
        .order("earned_at", { ascending: false }),
    ]).then(([xpRes, streakRes, xpEventsRes, attemptsRes, allTimeAttemptsRes, skillLevelsRes, conversationsRes, badgesRes]) => {
      const dailyXp = buckets.map((b) =>
        (xpEventsRes.data ?? [])
          .filter((e) => e.created_at.slice(0, 10) === b.date)
          .reduce((sum, e) => sum + e.amount, 0)
      );

      const dailyAccuracy = buckets.map((b) => {
        const dayAttempts = (attemptsRes.data ?? []).filter((a) => a.created_at.slice(0, 10) === b.date);
        if (dayAttempts.length === 0) return null;
        const correct = dayAttempts.filter((a) => a.is_correct).length;
        return Math.round((correct / dayAttempts.length) * 100);
      });

      const skillAccuracy: ProgressData["skillAccuracy"] = {};
      for (const a of allTimeAttemptsRes.data ?? []) {
        const area = (a.exercises as unknown as { skill_area: SkillArea } | null)?.skill_area;
        if (!area) continue;
        if (!skillAccuracy[area]) skillAccuracy[area] = { correct: 0, total: 0 };
        skillAccuracy[area]!.total += 1;
        if (a.is_correct) skillAccuracy[area]!.correct += 1;
      }

      const skillLevels: ProgressData["skillLevels"] = {};
      for (const row of skillLevelsRes.data ?? []) {
        skillLevels[row.skill as SkillArea] = row.cefr_level as CefrLevel;
      }

      const conversationScores = (conversationsRes.data ?? [])
        .map((c) => (c.conversation_scores as unknown as { overall_score: number }[] | null)?.[0]?.overall_score)
        .filter((s): s is number => typeof s === "number");

      const badges = (badgesRes.data ?? []).map((b) => ({
        name_he: (b.badges as unknown as { name_he: string; description_he: string } | null)?.name_he ?? "",
        description_he: (b.badges as unknown as { name_he: string; description_he: string } | null)?.description_he ?? "",
        earned_at: b.earned_at,
      }));

      setData({
        totalXp: xpRes.data?.total_xp ?? 0,
        level: xpRes.data?.current_level ?? 1,
        currentStreak: streakRes.data?.current_streak ?? 0,
        longestStreak: streakRes.data?.longest_streak ?? 0,
        dailyXp,
        dailyAccuracy,
        skillAccuracy,
        skillLevels,
        conversationScores,
        badges,
      });
    });
  }, [profile]);

  if (authLoading || !profile || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-9 w-48 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-6 h-40 rounded-2xl bg-background-2 animate-pulse" />
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="h-56 rounded-2xl bg-background-2 animate-pulse" />
          <div className="h-56 rounded-2xl bg-background-2 animate-pulse" />
        </div>
      </div>
    );
  }

  const buckets = lastNDays(DAYS);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold"
      >
        ההתקדמות שלי
      </motion.h1>
      <p className="mt-2 text-muted">מבט על השבועיים האחרונים וההישגים שצברתם עד עכשיו</p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mt-6 relative overflow-hidden rounded-2xl border border-card-border p-6 sm:p-8"
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          initial={{ opacity: 0.45 }}
          animate={{ opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 15% 0%, color-mix(in srgb, var(--primary) 16%, transparent) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 55%)",
          }}
        />
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-6">
          <StatHero icon={Star} tone="text-primary" value={data.totalXp} label="XP סה״כ" />
          <StatHero icon={Trophy} tone="text-accent-hover" value={data.level} label="רמה" />
          <StatHero icon={Flame} tone="text-accent-hover" value={data.currentStreak} label="ימים ברצף" />
          <StatHero icon={Flame} tone="text-muted" value={data.longestStreak} label="השיא שלכם" />
        </div>
      </motion.div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-card-border rounded-2xl p-6"
        >
          <h2 className="font-bold">XP לפי יום</h2>
          <p className="text-xs text-muted mt-0.5">14 הימים האחרונים</p>
          <XpBarChart buckets={buckets} values={data.dailyXp} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-card border border-card-border rounded-2xl p-6"
        >
          <h2 className="font-bold">אחוז הצלחה בתרגילים</h2>
          <p className="text-xs text-muted mt-0.5">14 הימים האחרונים</p>
          <AccuracyLineChart buckets={buckets} values={data.dailyAccuracy} />
        </motion.div>
      </div>

      <SkillLevelsPanel skillLevels={data.skillLevels} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-4 bg-card border border-card-border rounded-2xl p-6"
      >
        <h2 className="font-bold">דיוק לפי תחום</h2>
        <p className="text-xs text-muted mt-0.5">מכל הזמנים</p>
        <div className="mt-5 space-y-4">
          {(Object.keys(SKILL_META) as SkillArea[]).map((area) => {
            const stat = data.skillAccuracy[area];
            const pct = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
            const meta = SKILL_META[area];
            return (
              <div key={area} className="flex items-center gap-3">
                <span className="inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <meta.icon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{meta.label}</span>
                    <span className="text-muted">{pct === null ? "אין נתונים עדיין" : `${pct}%`}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-background-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct ?? 0}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-l from-primary to-accent"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {data.conversationScores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-4 bg-card border border-card-border rounded-2xl p-6"
        >
          <h2 className="font-bold">ציוני שיחות עם AI</h2>
          <p className="text-xs text-muted mt-0.5">10 השיחות האחרונות שסיימתם</p>
          <ScoreSparkline values={data.conversationScores} />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-4 bg-card border border-card-border rounded-2xl p-6"
      >
        <h2 className="font-bold">תגים שהרווחתם</h2>
        {data.badges.length === 0 ? (
          <div className="mt-4 text-center py-6">
            <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
            <p className="text-sm text-muted">עדיין אין תגים — המשיכו ללמוד כדי להרוויח את הראשון!</p>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {data.badges.map((b, i) => (
              <motion.div
                key={b.name_he + b.earned_at}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * i, type: "spring", bounce: 0.4 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-background-2"
              >
                <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-hover">
                  <Award size={18} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{b.name_he}</p>
                  <p className="text-xs text-muted truncate">{b.description_he}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SkillLevelsPanel({ skillLevels }: { skillLevels: Partial<Record<SkillArea, CefrLevel>> }) {
  const assessed = (Object.keys(SKILL_META) as SkillArea[]).filter((s) => skillLevels[s]);
  const weakestRank = assessed.length
    ? Math.min(...assessed.map((s) => CEFR_ORDER.indexOf(skillLevels[s] as CefrLevel)))
    : -1;
  const weakestSkills = assessed.filter((s) => CEFR_ORDER.indexOf(skillLevels[s] as CefrLevel) === weakestRank);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="mt-4 bg-card border border-card-border rounded-2xl p-6"
    >
      <h2 className="font-bold">חוזקות וחולשות</h2>
      <p className="text-xs text-muted mt-0.5">רמת CEFR נוכחית בכל תחום, מתעדכנת ככל שאתם מתרגלים</p>

      {assessed.length === 0 ? (
        <p className="mt-4 text-sm text-muted">עדיין אין מספיק נתונים. עברו מבחן רמה או תרגלו כדי להתחיל לראות כאן פירוט.</p>
      ) : (
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          {(Object.keys(SKILL_META) as SkillArea[]).map((skill) => {
            const meta = SKILL_META[skill];
            const level = skillLevels[skill];
            const isWeakest = level && weakestSkills.includes(skill);
            return (
              <div
                key={skill}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isWeakest ? "border-accent/50 bg-accent/5" : "border-card-border"
                }`}
              >
                <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <meta.icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{meta.label}</p>
                  {level ? (
                    <EnglishText as="p" className="text-xs text-muted">
                      רמה {level}
                    </EnglishText>
                  ) : (
                    <p className="text-xs text-muted">
                      {skill === "speaking" ? "יבדק בשיחה עם ה-AI" : "טרם נבדק"}
                    </p>
                  )}
                </div>
                {isWeakest && (
                  <span className="shrink-0 text-xs font-medium text-accent-hover bg-accent/10 px-2 py-1 rounded-full">
                    להתמקד כאן
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function StatHero({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: typeof Star;
  tone: string;
  value: number;
  label: string;
}) {
  return (
    <div>
      <div className={`flex items-center gap-1.5 ${tone}`}>
        <Icon size={18} className="fill-current" />
        <EnglishText as="span" className="text-2xl sm:text-3xl font-bold">
          {value}
        </EnglishText>
      </div>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function XpBarChart({ buckets, values }: { buckets: DayBucket[]; values: number[] }) {
  const max = Math.max(1, ...values);
  const barSlot = 100 / buckets.length;
  const barWidth = barSlot * 0.6;

  return (
    <svg viewBox="0 0 100 44" className="mt-4 w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="xpBarGradient" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      {buckets.map((b, i) => {
        const h = (values[i] / max) * 38;
        const x = i * barSlot + (barSlot - barWidth) / 2;
        return (
          <motion.rect
            key={b.date}
            x={x}
            y={44 - h}
            width={barWidth}
            height={h}
            rx={1.2}
            fill="url(#xpBarGradient)"
            style={{ transformOrigin: "bottom", transformBox: "fill-box" }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.03, duration: 0.5, ease: "easeOut" }}
          >
            <title>
              {b.label}: {values[i]} XP
            </title>
          </motion.rect>
        );
      })}
    </svg>
  );
}

function AccuracyLineChart({ buckets, values }: { buckets: DayBucket[]; values: (number | null)[] }) {
  const known = buckets
    .map((b, i) => ({ i, v: values[i] }))
    .filter((p): p is { i: number; v: number } => p.v !== null);

  if (known.length === 0) {
    return (
      <div className="mt-4 h-32 flex items-center justify-center text-sm text-muted">אין עדיין נתוני תרגול</div>
    );
  }

  const toXY = (i: number, v: number) => {
    const x = (i / (buckets.length - 1)) * 100;
    const y = 40 - (v / 100) * 36;
    return [x, y] as const;
  };

  const linePath = known.map(({ i, v }, idx) => {
    const [x, y] = toXY(i, v);
    return `${idx === 0 ? "M" : "L"}${x},${y}`;
  });
  const firstX = toXY(known[0].i, known[0].v)[0];
  const lastX = toXY(known[known.length - 1].i, known[known.length - 1].v)[0];
  const areaPath = [`M${firstX},40`, ...linePath.map((seg, idx) => (idx === 0 ? seg.replace("M", "L") : seg)), `L${lastX},40`, "Z"];

  return (
    <svg viewBox="0 0 100 44" className="mt-4 w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="accuracyAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath.join(" ")}
        fill="url(#accuracyAreaGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
      <motion.path
        d={linePath.join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {known.map(({ i, v }) => {
        const [x, y] = toXY(i, v);
        return <circle key={i} cx={x} cy={y} r={1.3} fill="var(--accent)" />;
      })}
    </svg>
  );
}

function ScoreSparkline({ values }: { values: number[] }) {
  const toXY = (i: number, v: number) => {
    const x = values.length === 1 ? 50 : (i / (values.length - 1)) * 100;
    const y = 40 - (v / 100) * 36;
    return [x, y] as const;
  };
  const path = values.map((v, i) => {
    const [x, y] = toXY(i, v);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  });

  return (
    <div>
      <svg viewBox="0 0 100 44" className="mt-4 w-full h-24" preserveAspectRatio="none">
        <motion.path
          d={path.join(" ")}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {values.map((v, i) => {
          const [x, y] = toXY(i, v);
          return <circle key={i} cx={x} cy={y} r={1.4} fill="var(--primary)" />;
        })}
      </svg>
      <p className="mt-1 text-xs text-muted text-center">
        ציון אחרון: <EnglishText as="span">{values[values.length - 1]}</EnglishText>
      </p>
    </div>
  );
}

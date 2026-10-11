"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
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
  Snowflake,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import IconBadge from "@/components/IconBadge";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import { getCanDoStatement } from "@/lib/content/canDoStatements";
import { buildScoreSummary, type ScoreRange, type ScoreSummary } from "@/lib/reports/buildScoreSummary";
import type { CefrLevel, SkillArea } from "@/types/database";
import { fetchAll } from "@/lib/supabase/fetchAll";

const CEFR_ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const RANGE_LABELS: Record<ScoreRange, string> = { week: "השבוע", month: "החודש", all: "הכל" };
// The two daily charts need a concrete day count to bucket by — "all" is
// capped at 90 rather than actually unbounded, since a bar per day forever
// stops being a readable chart; buildScoreSummary's own "all" range (used
// for the test-history list below) has no such cap.
const RANGE_CHART_DAYS: Record<ScoreRange, number> = { week: 7, month: 30, all: 90 };

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
  freezeCount: number;
  skillAccuracy: Partial<Record<SkillArea, { correct: number; total: number }>>;
  skillLevels: Partial<Record<SkillArea, CefrLevel>>;
  conversationScores: number[];
  badges: { name_he: string; description_he: string; earned_at: string }[];
}

interface ChartData {
  buckets: DayBucket[];
  dailyXp: number[];
  dailyAccuracy: (number | null)[];
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
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [range, setRange] = useState<ScoreRange>("week");
  const [summary, setSummary] = useState<ScoreSummary | null>(null);

  // Lifetime stats — not range-dependent, so they load once per profile
  // rather than refetching every time the range toggle below changes.
  useEffect(() => {
    if (!profile) return;

    Promise.all([
      supabase.from("user_xp").select("total_xp, current_level").eq("profile_id", profile.id).maybeSingle(),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak, freeze_count")
        .eq("profile_id", profile.id)
        .maybeSingle(),
      fetchAll((from, to) =>
        supabase
          .from("exercise_attempts")
          .select("is_correct, exercises(skill_area)")
          .eq("profile_id", profile.id)
          .order("id")
          .range(from, to),
      ),
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
    ]).then(([xpRes, streakRes, allTimeAttemptsRes, skillLevelsRes, conversationsRes, badgesRes]) => {
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
        freezeCount: streakRes.data?.freeze_count ?? 0,
        skillAccuracy,
        skillLevels,
        conversationScores,
        badges,
      });
    });
  }, [profile]);

  // Charts + test-history list — both driven by the range toggle, so they
  // refetch whenever it changes; buildScoreSummary is the same function the
  // weekly/monthly report emails use, so these numbers and the mailed ones
  // can never drift apart.
  useEffect(() => {
    if (!profile) return;
    const days = RANGE_CHART_DAYS[range];
    const buckets = lastNDays(days);
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    Promise.all([
      supabase
        .from("xp_events")
        .select("amount, created_at")
        .eq("profile_id", profile.id)
        .gte("created_at", since.toISOString()),
      fetchAll((from, to) =>
        supabase
          .from("exercise_attempts")
          .select("is_correct, created_at, exercises(skill_area)")
          .eq("profile_id", profile.id)
          .gte("created_at", since.toISOString())
          .order("id")
          .range(from, to),
      ),
    ]).then(([xpEventsRes, attemptsRes]) => {
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

      setChartData({ buckets, dailyXp, dailyAccuracy });
    });

    buildScoreSummary(supabase, profile.id, range).then(setSummary);
  }, [profile, range]);

  if (authLoading || !profile || !data || !chartData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-9 w-48 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-6 h-40 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="h-56 rounded-lg bg-background-2 animate-pulse" />
          <div className="h-56 rounded-lg bg-background-2 animate-pulse" />
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
        ההתקדמות שלי
      </motion.h1>
      <p className="mt-2 text-muted">מבט על השבועיים האחרונים וההישגים שצברתם עד עכשיו</p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mt-6 relative overflow-hidden rounded-lg border border-card-border p-6 sm:p-8"
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
          <StatHero icon={Trophy} tone="text-accent-hover" value={data.level} label="שלב XP" />
          <StatHero
            icon={Flame}
            tone="text-accent-hover"
            value={data.currentStreak}
            label="ימים ברצף"
            badge={
              data.freezeCount > 0 ? (
                <span
                  className="flex items-center gap-0.5 text-xs text-primary"
                  title={`${data.freezeCount} ${data.freezeCount === 1 ? "הקפאת רצף זמינה" : "הקפאות רצף זמינות"}. שומרת על הרצף אם מפספסים יום אחד`}
                >
                  <Snowflake size={12} />
                  {data.freezeCount}
                </span>
              ) : null
            }
          />
          <StatHero icon={Flame} tone="text-muted" value={data.longestStreak} label="השיא שלכם" />
        </div>
      </motion.div>

      {profile.age_band === "adult" && (
        <Link
          href="/patterns"
          className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-card-border p-4 hover:bg-background-2 transition-colors"
        >
          <span>
            <span className="block font-bold">הדפוסים שלי</span>
            <span className="block text-sm text-muted">טעויות שבאות מהעברית וחוזרות אצלכם, ומה לתרגל בעקבותיהן</span>
          </span>
          <span className="text-primary text-sm shrink-0">לצפייה ←</span>
        </Link>
      )}

      <div className="mt-6 flex items-center justify-end">
        <div className="flex items-center gap-1 bg-card/60 border border-card-border rounded-xl p-1">
          {(Object.keys(RANGE_LABELS) as ScoreRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                range === r ? "bg-primary text-primary-ink" : "text-muted hover:text-foreground hover:bg-background-2"
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-card-border rounded-lg p-6"
        >
          <h2 className="font-bold">XP לפי יום</h2>
          <p className="text-xs text-muted mt-0.5">{RANGE_CHART_DAYS[range]} הימים האחרונים</p>
          <XpBarChart buckets={chartData.buckets} values={chartData.dailyXp} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-card border border-card-border rounded-lg p-6"
        >
          <h2 className="font-bold">אחוז הצלחה בתרגילים</h2>
          <p className="text-xs text-muted mt-0.5">{RANGE_CHART_DAYS[range]} הימים האחרונים</p>
          <AccuracyLineChart buckets={chartData.buckets} values={chartData.dailyAccuracy} />
        </motion.div>
      </div>

      <ScoreHistoryPanel summary={summary} />

      <SkillLevelsPanel skillLevels={data.skillLevels} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-4 bg-card border border-card-border rounded-lg p-6"
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
                      className="h-full rounded-full bg-primary"
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
          className="mt-4 bg-card border border-card-border rounded-lg p-6"
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
        className="mt-4 bg-card border border-card-border rounded-lg p-6"
      >
        <h2 className="font-bold">תגים שהרווחתם</h2>
        {data.badges.length === 0 ? (
          <div className="mt-4 text-center py-6">
            <IconBadge icon={Trophy} tone="accent" className="mx-auto" />
            <p className="text-sm text-muted">עוד אין תגים. התג הראשון מגיע אחרי כמה ימי תרגול.</p>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {data.badges.map((b, i) => (
              <motion.div
                key={b.name_he + b.earned_at}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * i, type: "spring", bounce: 0.4 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-background-2"
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

function ScoreHistoryPanel({ summary }: { summary: ScoreSummary | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="mt-4 bg-card border border-card-border rounded-lg p-6"
    >
      <h2 className="font-bold">מה עשיתם</h2>
      <p className="text-xs text-muted mt-0.5">תרגולים, מבחנים ושיחות עם המורה בטווח שבחרתם למעלה</p>

      {!summary ? (
        <div className="mt-5 h-24 rounded-lg bg-background-2 animate-pulse" />
      ) : (
        <>
          {/* One line of numbers, read as a sentence, not three identical tiles. */}
          <dl className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-y border-card-border py-4">
            <div className="flex items-baseline gap-2">
              <dd className="chyron text-4xl leading-none tabular-nums">{summary.testsCount}</dd>
              <dt className="text-sm text-muted">פעילויות</dt>
            </div>
            <div className="flex items-baseline gap-2">
              <dd className="chyron text-4xl leading-none tabular-nums" dir="ltr">
                {summary.averageScore !== null ? `${summary.averageScore}%` : "–"}
              </dd>
              <dt className="text-sm text-muted">ציון ממוצע</dt>
            </div>
            <div className="flex items-baseline gap-2">
              <dd className="chyron text-4xl leading-none tabular-nums">{summary.xpEarned}</dd>
              <dt className="text-sm text-muted">XP</dt>
            </div>
          </dl>

          {summary.items.length === 0 ? (
            <p className="mt-5 py-4 text-center text-sm text-muted">אין עדיין פעילות בטווח הזה</p>
          ) : (
            <div className="mt-2">
              {summary.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b border-card-border py-3 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.typeLabel}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString("he-IL", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-medium ${
                      item.scorePct === null ? "text-muted" : item.scorePct >= 60 ? "text-success" : item.scorePct >= 40 ? "text-foreground" : "text-danger"
                    }`}
                  >
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

function SkillLevelsPanel({ skillLevels }: { skillLevels: Partial<Record<SkillArea, CefrLevel>> }) {
  const assessed = (Object.keys(SKILL_META) as SkillArea[]).filter((s) => skillLevels[s]);
  // "Weakest" only means something once there's at least one other skill to
  // compare against — with a single assessed skill it trivially "wins" the
  // minimum and would get flagged as a weak spot even at C2.
  const weakestRank =
    assessed.length >= 2 ? Math.min(...assessed.map((s) => CEFR_ORDER.indexOf(skillLevels[s] as CefrLevel))) : -1;
  const weakestSkills = assessed.filter((s) => CEFR_ORDER.indexOf(skillLevels[s] as CefrLevel) === weakestRank);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="mt-4 bg-card border border-card-border rounded-lg p-6"
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
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isWeakest ? "border-accent/50 bg-accent/5" : "border-card-border"
                }`}
              >
                <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <meta.icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{meta.label}</p>
                  {level ? (
                    <>
                      <span className="mt-0.5 inline-block">
                        <CefrBadge level={level} />
                      </span>
                      {getCanDoStatement(skill, level) && (
                        <p className="mt-1 text-xs text-muted leading-relaxed">{getCanDoStatement(skill, level)}</p>
                      )}
                    </>
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
  badge,
}: {
  icon: typeof Star;
  tone: string;
  value: number;
  label: string;
  badge?: ReactNode;
}) {
  return (
    <div>
      <div className={`flex items-center gap-1.5 ${tone}`}>
        <Icon size={18} className="fill-current" />
        <EnglishText as="span" className="text-2xl sm:text-3xl font-bold">
          {value}
        </EnglishText>
        {badge}
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

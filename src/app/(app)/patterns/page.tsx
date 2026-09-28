"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import EnglishText from "@/components/EnglishText";
import { fetchMyPatternStats, type PatternStat } from "@/lib/patterns/getMyPatterns";
import { getPatternDefinition } from "@/lib/patterns/patternDefinitions";
import { getReviewedDrill } from "@/lib/patterns/drills";

const TREND_META = {
  improving: { Icon: TrendingDown, label: "משתפר", className: "text-success" },
  worsening: { Icon: TrendingUp, label: "מחמיר", className: "text-danger" },
  flat: { Icon: Minus, label: "יציב", className: "text-muted" },
} as const;

export default function MyPatternsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<PatternStat[] | null>(null);

  useEffect(() => {
    // Only ever populated for adult accounts (recordPatternObservations
    // skips minors) — a minor account never fetches and just sees the empty
    // state below via displayStats.
    if (!profile || profile.age_band !== "adult") return;
    fetchMyPatternStats(supabase, profile.id).then(setStats);
  }, [profile]);

  const displayStats = profile && profile.age_band !== "adult" ? [] : stats;

  if (authLoading || !profile || displayStats === null) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-9 w-48 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-6 space-y-4">
          <div className="h-32 rounded-lg bg-background-2 animate-pulse" />
          <div className="h-32 rounded-lg bg-background-2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold"
      >
        הדפוסים שלי
      </motion.h1>
      <p className="mt-2 text-muted">
        טעויות שקשורות ספציפית לעברית וחוזרות אצלכם בכתיבה ובשיחות — לא כל טעות, רק מה שבאמת חוזר.
      </p>

      {displayStats.length === 0 ? (
        <div className="mt-8 rounded-lg border border-card-border p-6 text-center text-muted">
          עוד אין מספיק כתיבה או שיחות כדי להראות לכם מה חוזר. המשיכו לתרגל, ותוך כמה שבועות נדע יותר.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {displayStats.map((stat, i) => {
            const definition = getPatternDefinition(stat.code);
            if (!definition) return null;
            const trend = stat.trend ? TREND_META[stat.trend] : null;
            const hasDrill = Boolean(getReviewedDrill(stat.code));

            return (
              <motion.div
                key={stat.code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-lg border border-card-border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-lg">{definition.labelHe}</h2>
                  {trend && (
                    <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ${trend.className}`}>
                      <trend.Icon size={14} />
                      {trend.label}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{definition.whyHe}</p>
                <div className="mt-3 flex flex-col gap-1 text-sm">
                  <EnglishText className="text-danger line-through decoration-danger/60">
                    {definition.exampleWrong}
                  </EnglishText>
                  <EnglishText className="text-success">{definition.exampleRight}</EnglishText>
                </div>

                {hasDrill ? (
                  <Link
                    href={`/patterns/${stat.code}`}
                    className="mt-4 inline-block px-4 py-2 rounded-lg bg-primary text-primary-ink text-sm font-medium hover:bg-primary-hover transition-colors"
                  >
                    תרגול קצר
                  </Link>
                ) : (
                  <span className="mt-4 inline-block px-4 py-2 rounded-lg bg-background-2 text-muted text-sm">
                    תרגול קצר — בקרוב
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

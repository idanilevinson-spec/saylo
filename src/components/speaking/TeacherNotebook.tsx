"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, NotebookPen, Sparkles } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { supabase } from "@/lib/supabase/browserClient";
import { fetchMyPatternStats, type PatternStat } from "@/lib/patterns/getMyPatterns";
import { getPatternDefinition } from "@/lib/patterns/patternDefinitions";
import type { ConversationFeedback } from "@/types/database";

// "What the teacher remembers": everything here is read from the learner's
// own rows — sentences per day from conversation_messages, the last scored
// conversation from conversation_scores, recurring Hebrew-transfer patterns
// from the Pattern Coach. Nothing is invented to fill the space; an empty
// account gets an honest empty state.

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const DAY_LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

interface LastScore {
  overall_score: number;
  fluency_score: number;
  grammar_score: number;
  vocabulary_score: number;
  feedback: ConversationFeedback;
  created_at: string;
  conversation_id: string;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function TeacherNotebook({
  profileId,
  isAdult,
  disabled,
  onPractice,
}: {
  profileId: string;
  isAdult: boolean;
  disabled: boolean;
  // Opens a new conversation with this message waiting in the box.
  onPractice: (starter: string) => void;
}) {
  const [week, setWeek] = useState<{ date: Date; count: number }[] | null>(null);
  const [last, setLast] = useState<LastScore | null | undefined>(undefined);
  const [patterns, setPatterns] = useState<PatternStat[]>([]);

  useEffect(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    Promise.all([
      supabase
        .from("conversation_messages")
        .select("created_at, conversations!inner(profile_id)")
        .eq("conversations.profile_id", profileId)
        .eq("role", "user")
        .gte("created_at", start.toISOString())
        .limit(2000),
      supabase
        .from("conversation_scores")
        .select("overall_score, fluency_score, grammar_score, vocabulary_score, feedback, created_at, conversation_id, conversations!inner(profile_id)")
        .eq("conversations.profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      // The Pattern Coach only records adults (minors are skipped at write).
      isAdult ? fetchMyPatternStats(supabase, profileId) : Promise.resolve([] as PatternStat[]),
    ]).then(([msgs, score, pats]) => {
      const counts = new Map<string, number>();
      for (const m of (msgs.data ?? []) as { created_at: string }[]) {
        const k = dayKey(new Date(m.created_at));
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      setWeek(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          return { date: d, count: counts.get(dayKey(d)) ?? 0 };
        }),
      );
      setLast((score.data as unknown as LastScore | null) ?? null);
      setPatterns(pats);
    });
  }, [profileId, isAdult]);

  if (week === null || last === undefined) {
    return (
      <div className="mt-12 grid gap-3 md:grid-cols-2" aria-hidden="true">
        <div className="h-48 rounded-lg bg-background-2 animate-pulse" />
        <div className="h-48 rounded-lg bg-background-2 animate-pulse" />
      </div>
    );
  }

  const weekTotal = week.reduce((n, d) => n + d.count, 0);
  const peak = Math.max(1, ...week.map((d) => d.count));
  const activeDays = week.filter((d) => d.count > 0).length;
  const words = (last?.feedback.suggestedVocabulary ?? []).slice(0, 4);
  const fixes = (last?.feedback.grammarMistakes ?? []).slice(0, 2);
  const shownPatterns = patterns.map((p) => getPatternDefinition(p.code)).filter((d) => d !== undefined).slice(0, 2);

  return (
    <section aria-labelledby="notebook-title" className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="notebook-title" className="flex items-center gap-2 text-xl font-black tracking-tight">
          <NotebookPen size={19} aria-hidden="true" className="text-primary" />
          מה המורה זוכר עליכם
        </h2>
        {last && (
          <Link href={`/speaking/chat/${last.conversation_id}`} className="text-sm font-bold text-primary hover:underline">
            למשוב המלא מהשיחה האחרונה
          </Link>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* This week, as a level meter: one bar per day. */}
        <div className="rounded-lg border border-card-border bg-card p-5">
          <p className="flex items-baseline justify-between gap-2">
            <span className="font-bold">השבוע שלכם</span>
            <span className="text-sm text-muted tabular-nums">
              {activeDays} מתוך 7 ימים
            </span>
          </p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="chyron text-4xl tabular-nums">{weekTotal}</span>
            <span className="text-sm text-muted">משפטים באנגלית</span>
          </p>
          <ol className="mt-4 grid grid-cols-7 gap-1.5 items-end h-24" aria-label="משפטים בכל יום השבוע">
            {week.map((d, i) => {
              const isToday = i === 6;
              const h = d.count === 0 ? 6 : 14 + (d.count / peak) * 86;
              return (
                <li key={d.date.toISOString()} className="flex h-full flex-col items-center justify-end gap-1.5">
                  <span className="sr-only">
                    {DAY_LETTERS[d.date.getDay()]}: {d.count} משפטים
                  </span>
                  <motion.span
                    aria-hidden="true"
                    className={`w-full max-w-7 rounded-sm ${d.count === 0 ? "bg-background-2" : isToday ? "bg-primary" : "bg-primary/45"}`}
                    initial={{ height: "6%" }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.6, delay: 0.05 * i, ease: EASE_OUT }}
                  />
                  <span aria-hidden="true" className={`text-xs tabular-nums ${isToday ? "font-bold text-foreground" : "text-muted"}`}>
                    {DAY_LETTERS[d.date.getDay()]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* The last scored conversation, and what to carry into the next. */}
        <div className="rounded-lg border border-card-border bg-card p-5">
          {last ? (
            <>
              <div className="flex items-center gap-4">
                <span className="chyron inline-flex w-16 h-16 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-ink text-4xl tabular-nums">
                  {last.overall_score}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">השיחה האחרונה</p>
                  <p className="text-xs text-muted tabular-nums">
                    {new Date(last.created_at).toLocaleDateString("he-IL", { day: "numeric", month: "long" })} · ציון כללי מתוך 100
                  </p>
                  <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    {(
                      [
                        ["שטף", last.fluency_score],
                        ["דקדוק", last.grammar_score],
                        ["אוצר מילים", last.vocabulary_score],
                      ] as const
                    ).map(([label, v]) => (
                      <div key={label}>
                        <dt className="flex items-baseline justify-between gap-1">
                          <span className="text-muted">{label}</span>
                          <span className="font-bold tabular-nums">{v}</span>
                        </dt>
                        <dd className="mt-1 h-1.5 overflow-hidden rounded-full bg-background-2">
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {words.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-bold">מילים שהמורה הציע לנסות</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {words.map((w) => (
                      <li key={w} className="rounded-md bg-background-2 px-2.5 py-1 text-sm font-medium" lang="en">
                        {w}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onPractice(`Can we practice using these words: ${words.join(", ")}?`)}
                    className="game-press mt-3 inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-lg bg-primary text-primary-ink text-sm font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    <Sparkles size={15} aria-hidden="true" /> לתרגל אותן בשיחה
                  </button>
                </div>
              )}

              {words.length === 0 && fixes.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-bold">לשים לב בפעם הבאה</p>
                  <ul className="mt-2 space-y-1.5">
                    {fixes.map((f) => (
                      <li key={f} className="text-sm text-muted leading-snug">
                        <EnglishText as="span">{f}</EnglishText>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col justify-center">
              <p className="font-bold">כאן יופיע המשוב שלכם</p>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                בסוף כל שיחה המורה נותן ציון לשטף, לדקדוק ולאוצר המילים, ומציע מילים חדשות לנסות. אחרי השיחה הראשונה זה יופיע
                כאן.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recurring Hebrew-transfer patterns, only when the coach has enough evidence. */}
      {shownPatterns.length > 0 && (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {shownPatterns.map((def) => (
            <li key={def.code}>
              <Link
                href="/patterns"
                className="game-press group flex h-full flex-col rounded-lg border border-card-border bg-card p-4 transition-[border-color,transform] duration-150 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-bold">{def.labelHe}</span>
                  <ChevronLeft size={16} aria-hidden="true" className="text-muted shrink-0 transition-transform group-hover:-translate-x-0.5" />
                </span>
                <span dir="ltr" lang="en" className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="text-danger line-through decoration-danger/60">{def.exampleWrong}</span>
                  <ArrowLeft size={14} aria-hidden="true" className="text-muted rotate-180" />
                  <span className="font-medium text-success">{def.exampleRight}</span>
                </span>
                <span className="mt-auto pt-2 text-xs text-muted">חוזר אצלכם בכתיבה ובשיחות</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

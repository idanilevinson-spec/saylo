"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  PenLine,
  BookOpen,
  BookOpenText,
  Headphones,
  NotebookPen,
  MessageCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Play,
  Mic,
} from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { getCanDoStatement } from "@/lib/content/canDoStatements";
import type { LevelPlan, PlanKind } from "@/lib/content/levelPlan";
import type { CefrLevel, SkillArea } from "@/types/database";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export const KIND_META: Record<PlanKind, { label: string; icon: LucideIcon; area: string; noun: [string, string] }> = {
  grammar: { label: "דקדוק", icon: PenLine, area: "/grammar", noun: ["נושא", "נושאים"] },
  vocabulary: { label: "אוצר מילים", icon: BookOpen, area: "/vocabulary", noun: ["נושא", "נושאים"] },
  reading: { label: "קריאה", icon: BookOpenText, area: "/reading", noun: ["טקסט", "טקסטים"] },
  listening: { label: "האזנה", icon: Headphones, area: "/listening", noun: ["קטע", "קטעים"] },
  speaking: { label: "שיחה עם המורה", icon: MessageCircle, area: "/speaking", noun: ["תרחיש", "תרחישים"] },
  writing: { label: "כתיבה", icon: NotebookPen, area: "/writing", noun: ["נושא", "נושאים"] },
};

const SKILLS: { skill: SkillArea; label: string; icon: LucideIcon }[] = [
  { skill: "vocabulary", label: "אוצר מילים", icon: BookOpen },
  { skill: "grammar", label: "דקדוק", icon: PenLine },
  { skill: "reading", label: "קריאה", icon: BookOpenText },
  { skill: "listening", label: "האזנה", icon: Headphones },
  { skill: "writing", label: "כתיבה", icon: NotebookPen },
  { skill: "speaking", label: "דיבור", icon: Mic },
];

// The home page's lead: the learner's level, what it means, their level
// per skill, and today's plan built at that level.
export default function TodayAtLevel({ plan, level }: { plan: LevelPlan; level: CefrLevel }) {
  const done = plan.items.filter((i) => i.doneToday).length;
  const next = plan.items.find((i) => !i.doneToday);
  const canDo = getCanDoStatement("speaking", level);

  return (
    <div className="mt-6 space-y-4">
      {/* The level plate */}
      <motion.section
        aria-labelledby="level-title"
        initial={{ opacity: 0, transform: "translateY(10px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        className="relative overflow-hidden rounded-lg bg-primary text-primary-ink"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to left, black, transparent 75%)",
          }}
        />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-5">
            <div className="shrink-0 text-center">
              <span className="chyron block text-7xl sm:text-8xl leading-[0.85]" dir="ltr">
                {level}
              </span>
              <span className="mt-1 block text-xs font-bold text-primary-ink/75">{CEFR_NAME_HE[level]}</span>
            </div>
            <div className="min-w-0">
              <h2 id="level-title" className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                הרמה שלכם
              </h2>
              {canDo && <p className="mt-1.5 max-w-md text-primary-ink/80 leading-relaxed">{canDo}</p>}
              {next ? (
                <Link
                  href={next.href}
                  className="game-press mt-5 inline-flex items-center gap-2 min-h-12 px-5 rounded-lg bg-background text-foreground font-bold transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary-ink focus-visible:outline-offset-2"
                >
                  <Play size={16} aria-hidden="true" className="fill-current" />
                  {done === 0 ? "להתחיל את התוכנית של היום" : "להמשיך בתוכנית"}
                </Link>
              ) : (
                plan.items.length > 0 && (
                  <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-ink/15 px-4 py-2.5 font-bold">
                    <CheckCircle2 size={18} aria-hidden="true" /> התוכנית של היום הושלמה
                  </p>
                )
              )}
            </div>
          </div>

          {/* Level per skill */}
          <dl className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {SKILLS.map(({ skill, label, icon: Icon }) => {
              const l = plan.bySkill[skill] ?? null;
              return (
                <div key={skill} className="rounded-lg bg-primary-ink/10 ring-1 ring-primary-ink/15 px-3 py-2 min-w-[5.5rem]">
                  <dt className="flex items-center gap-1 text-[0.7rem] font-bold text-primary-ink/75">
                    <Icon size={12} aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="chyron mt-0.5 text-2xl leading-none" dir="ltr">
                    {l ?? "–"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </motion.section>

      {/* Today's plan */}
      {plan.items.length > 0 && (
        <section aria-labelledby="plan-title" className="rounded-lg border border-card-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5">
            <h2 id="plan-title" className="text-xl font-black tracking-tight">
              התוכנית של היום
            </h2>
            <p className="flex items-center gap-2 text-sm text-muted tabular-nums">
              <span className="flex gap-1" aria-hidden="true">
                {plan.items.map((i) => (
                  <span key={i.kind} className={`h-1.5 w-5 rounded-full ${i.doneToday ? "bg-success" : "bg-background-2"}`} />
                ))}
              </span>
              {done} מתוך {plan.items.length}
            </p>
          </div>
          <ol className="mt-3 divide-y divide-card-border">
            {plan.items.map((item, idx) => {
              const meta = KIND_META[item.kind];
              return (
                <motion.li
                  key={item.kind}
                  initial={{ opacity: 0, transform: "translateY(6px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  transition={{ duration: 0.3, delay: 0.1 + idx * 0.04, ease: EASE_OUT }}
                >
                  <Link
                    href={item.href}
                    className="game-press group flex items-center gap-4 px-5 py-4 hover:bg-background-2 transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                  >
                    <span
                      className={`inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-lg ${
                        item.doneToday ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {item.doneToday ? <CheckCircle2 size={21} aria-hidden="true" /> : <meta.icon size={20} aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 text-xs font-bold text-muted">
                        {meta.label}
                        <span className="chyron text-sm text-primary" dir="ltr">
                          {item.level}
                        </span>
                        {item.fallbackFrom && <span className="font-medium">· הכי קרוב לרמה שלכם</span>}
                      </span>
                      <EnglishText as="span" className="mt-0.5 block text-right font-bold leading-snug truncate">
                        {item.titleEn}
                      </EnglishText>
                      <span className="block text-sm text-muted truncate">{item.titleHe}</span>
                    </span>
                    <span className="hidden sm:inline-flex shrink-0 items-center gap-1 text-xs text-muted tabular-nums">
                      {item.doneToday ? (
                        <span className="font-bold text-success">הושלם היום</span>
                      ) : (
                        <>
                          <Clock size={13} aria-hidden="true" />
                          {item.minutes} דק׳
                        </>
                      )}
                    </span>
                    <ChevronLeft size={17} aria-hidden="true" className="shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
                  </Link>
                </motion.li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}

// "More at your level": every area with how much of it fits the learner,
// linking to the area (which itself opens on the learner's level).
export function MoreAtLevel({ plan }: { plan: LevelPlan }) {
  const kinds = (Object.keys(KIND_META) as PlanKind[]).filter((k) => plan.countsAtLevel[k] > 0);
  if (kinds.length === 0) return null;
  return (
    <section aria-labelledby="more-title" className="mt-10">
      <h2 id="more-title" className="text-xl font-black tracking-tight">
        עוד ברמה שלכם
      </h2>
      <ul className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {kinds.map((k) => {
          const meta = KIND_META[k];
          const n = plan.countsAtLevel[k];
          return (
            <li key={k}>
              <Link
                href={meta.area}
                className="game-press group flex h-full items-center gap-3 rounded-lg border border-card-border bg-card p-4 transition-[border-color,transform] duration-150 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <meta.icon size={19} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{meta.label}</span>
                  <span className="block text-xs text-muted tabular-nums">
                    {n} {n === 1 ? meta.noun[0] : meta.noun[1]} ברמה שלכם
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

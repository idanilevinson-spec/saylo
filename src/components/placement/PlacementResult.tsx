"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, GraduationCap } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import { getCanDoStatement } from "@/lib/content/canDoStatements";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import { modulesForUnits, type BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import { BAGRUT_READINESS_COPY, bagrutReadiness } from "@/lib/content/bagrut/placementItems";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/reducedMotion";
import type { CefrLevel, SkillArea } from "@/types/database";

// The end of the placement test: the wait while the AI reads it, and the
// result. Kept apart from the test page so the result can be rendered on
// its own.

export const SKILL_LABELS_HE: Record<SkillArea, string> = {
  vocabulary: "אוצר מילים",
  grammar: "דקדוק",
  listening: "האזנה",
  reading: "קריאה",
  writing: "כתיבה",
  speaking: "דיבור",
};

export const SKILL_ORDER: SkillArea[] = ["vocabulary", "grammar", "reading", "listening", "writing", "speaking"];

interface SkillScore {
  skill: SkillArea;
  percentCorrect: number;
  cefrLevel: string;
}

export interface PlacementResult {
  overallCefr: string;
  summary: string;
  scores: SkillScore[];
  bagrut: { units: BagrutStudyUnits; correct: number; total: number; percent: number } | null;
}

function BagrutResultCard({ bagrut }: { bagrut: NonNullable<PlacementResult["bagrut"]> }) {
  const readiness = BAGRUT_READINESS_COPY[bagrutReadiness(bagrut.percent)];
  const startModule = modulesForUnits(bagrut.units)[0];
  return (
    <section
      data-reveal
      aria-labelledby="bagrut-result-title"
      className="relative overflow-hidden mt-6 bg-card border border-card-border rounded-lg p-6"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
      <h2 id="bagrut-result-title" className="text-lg font-bold flex items-center gap-2">
        <GraduationCap size={18} aria-hidden="true" className="text-primary shrink-0" />
        בגרות {bagrut.units} יח״ל: {readiness.titleHe}
      </h2>
      <p className="mt-1 text-sm text-muted tabular-nums">
        {bagrut.correct} מתוך {bagrut.total} נכונות בקטע הבגרות
      </p>
      <p className="mt-2 text-sm leading-relaxed">{readiness.bodyHe}</p>
      <p className="mt-2 text-xs text-muted">זו בדיקה קצרה של ההיכרות עם סוגי השאלות, לא הערכה של ציון בבגרות.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <MotionLink
          whileTap={{ scale: 0.97 }}
          href={`/bagrut/track/${bagrut.units}#module-${startModule}`}
          className="px-4 py-2 rounded-lg bg-primary text-primary-ink text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          להתחיל במודול {startModule}
        </MotionLink>
        <MotionLink
          whileTap={{ scale: 0.97 }}
          href={`/bagrut/track/${bagrut.units}`}
          className="px-4 py-2 rounded-lg border border-card-border text-sm font-medium hover:border-primary/40 transition-colors"
        >
          אזור הלימוד של {bagrut.units} יח״ל
        </MotionLink>
      </div>
    </section>
  );
}

// The wait after the last answer: two AI calls (the writing sample, then
// the summary), bounded at 30 seconds by submitFinal. Say what is actually
// happening and how long it can take, instead of a bare line of grey text.
export function PlacementFinishing({ withWriting }: { withWriting: boolean }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <section role="status" className="relative overflow-hidden rounded-lg border border-card-border bg-card p-6 sm:p-8">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
        <h1 className="text-2xl font-black tracking-tight">בודקים את המבחן</h1>
        <p className="mt-2 text-muted leading-relaxed">
          {withWriting
            ? "המורה קורא את מה שכתבתם ועובר על התשובות, כדי לקבוע רמה לכל מיומנות בנפרד."
            : "המורה עובר על התשובות וקובע רמה לכל מיומנות בנפרד."}{" "}
          זה יכול לקחת עד חצי דקה.
        </p>
        <div aria-hidden="true" className="mt-6 h-1 overflow-hidden rounded-full bg-background-2">
          <div className="working-sweep h-full w-1/3 rounded-full bg-primary" />
        </div>
      </section>
    </div>
  );
}

// The result, played once: the level lands like a chyron cut-in, then each
// skill fills in order and names its level as its bar arrives, then the
// rest settles in. About two seconds, the first time a learner ever sees
// where they stand. Everything renders at its final state; the sequence
// only plays toward it, so with reduced motion it's all simply there.
export function PlacementResultView({ result }: { result: PlacementResult }) {
  const canDo = getCanDoStatement("speaking", result.overallCefr as CefrLevel);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPreference();

  useGSAP(
    () => {
      // A hidden page (the learner switched apps during the half-minute
      // check) doesn't run animation frames, so the sequence would sit on
      // its first frame, "0%" bars, until they come back. Then the result
      // is simply shown, like with reduced motion.
      if (reduced || document.hidden) return;
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const counters: HTMLElement[] = [];

      tl.from(q("[data-plate]"), { opacity: 0, y: 12, scale: 0.985, duration: 0.45 })
        .from(q("[data-level]"), { clipPath: "inset(100% 0 0 0)", y: 18, duration: 0.55 }, 0.12)
        .from(q("[data-skills]"), { opacity: 0, y: 10, duration: 0.35 }, 0.5);

      q("[data-skill-row]").forEach((row: Element, i: number) => {
        const at = 0.7 + i * 0.12;
        const fill = row.querySelector("[data-fill]");
        const pct = row.querySelector<HTMLElement>("[data-pct]");
        const level = row.querySelector("[data-cefr]");
        if (fill) tl.from(fill, { scaleX: 0, duration: 0.5 }, at);
        if (pct) {
          const target = Number(pct.dataset.pct);
          const counter = { v: 0 };
          // Starts at 0% with its empty bar, not at the final number.
          pct.textContent = "0%";
          counters.push(pct);
          tl.to(
            counter,
            {
              v: target,
              duration: 0.5,
              onUpdate: () => {
                pct.textContent = `${Math.round(counter.v)}%`;
              },
            },
            at
          );
        }
        if (level) tl.from(level, { opacity: 0, x: -6, duration: 0.25 }, at + 0.4);
      });

      tl.from(q("[data-reveal]"), { opacity: 0, y: 12, duration: 0.4, stagger: 0.1 }, ">-0.1");

      // GSAP reverts the styles it set, not text it wrote: put the final
      // numbers back if the sequence is cut short (unmount, or motion
      // switched off mid-way).
      return () => {
        counters.forEach((el) => {
          el.textContent = `${el.dataset.pct}%`;
        });
      };
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <div ref={rootRef} className="max-w-3xl mx-auto px-4 pt-10 pb-16">
      <section data-plate className="relative overflow-hidden rounded-lg bg-primary text-primary-ink p-6 sm:p-8">
        <p className="text-sm font-bold text-primary-ink/90">התוצאה שלכם</p>
        <div className="mt-2 flex items-end gap-5">
          <span data-level className="inline-block">
            <EnglishText as="span" className="chyron text-8xl sm:text-9xl leading-[0.8]">
              {result.overallCefr}
            </EnglishText>
          </span>
          <div className="pb-1">
            <p className="text-2xl font-black">{CEFR_NAME_HE[result.overallCefr as CefrLevel]}</p>
            {canDo && <p className="mt-1 max-w-sm text-sm text-primary-ink/90 leading-relaxed">{canDo}</p>}
          </div>
        </div>
        <Link
          href="/dashboard"
          className="game-press mt-6 inline-flex items-center gap-2 min-h-12 px-5 rounded-lg bg-background text-foreground font-bold transition-transform duration-150"
        >
          לתוכנית של היום <ChevronLeft size={17} aria-hidden="true" />
        </Link>
      </section>

      <section data-skills className="mt-4 rounded-lg border border-card-border bg-card p-5 sm:p-6" aria-labelledby="by-skill">
        <h2 id="by-skill" className="font-black">
          לפי מיומנות
        </h2>
        <ul className="mt-4 space-y-3.5">
          {SKILL_ORDER.map((skill) => {
            const s = result.scores.find((sc) => sc.skill === skill);
            return (
              <li key={skill} data-skill-row={s ? "" : undefined} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="font-bold">{SKILL_LABELS_HE[skill]}</span>
                {s ? (
                  <>
                    <span className="h-2 overflow-hidden rounded-full bg-background-2" aria-hidden="true">
                      {/* Full width, scaled to the score from the reading
                          start (right): a transform, so the fill never
                          triggers layout. */}
                      <span
                        data-fill
                        className="block h-full rounded-full bg-primary origin-right"
                        style={{ transform: `scaleX(${s.percentCorrect / 100})` }}
                      />
                    </span>
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="text-muted" data-pct={s.percentCorrect}>
                        {s.percentCorrect}%
                      </span>
                      <span data-cefr className="chyron text-lg text-primary" dir="ltr">
                        {s.cefrLevel}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="col-span-2 text-muted">
                    {skill === "speaking" ? "נבדק בשיחה הראשונה עם המורה" : "לא נבדק הפעם"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {result.summary && (
        <section data-reveal className="mt-4 rounded-lg border border-card-border bg-card p-5 sm:p-6">
          <h2 className="font-black">מה המורה ראה במבחן</h2>
          <p className="mt-2 leading-relaxed text-foreground/90">{result.summary}</p>
        </section>
      )}

      {result.bagrut && <BagrutResultCard bagrut={result.bagrut} />}
    </div>
  );
}

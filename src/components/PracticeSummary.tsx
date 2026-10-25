"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, RotateCcw, ChevronRight, Keyboard } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { getActiveUnit, pathInUnit } from "@/lib/content/courseSession";
import { startRetry, summarize, type PracticeRun } from "@/lib/exercises/practiceSession";

// The end of a practice set: how it went, what was missed and what the right
// answer was, a short pass over the mistakes right away (the moment they are
// easiest to fix), and the way back to the course unit when the set was a
// step in one.
export default function PracticeSummary({
  run,
  retry,
  backHref,
  backLabel,
}: {
  run: PracticeRun | null;
  retry: boolean;
  backHref: string;
  backLabel: string;
}) {
  const router = useRouter();
  const unit = (() => {
    const active = getActiveUnit();
    return active && pathInUnit(backHref, active.paths) ? active : null;
  })();
  const back = unit
    ? { href: `/course/${unit.id}`, label: `חזרה ליחידה: ${unit.titleHe}` }
    : { href: backHref, label: `חזרה ל${backLabel}` };

  if (retry && run?.retry) {
    const total = run.retry.queue.length;
    const fixed = Object.values(run.retry.results).filter(Boolean).length;
    return (
      <section aria-labelledby="practice-done" className="mt-6 border-t border-card-border pt-5">
        <CheckCircle2 size={34} aria-hidden="true" className="text-success" />
        <h2 id="practice-done" className="mt-2 text-xl font-black tracking-tight">
          {fixed === total ? "תיקנתם את כל הטעויות" : "סיימתם את החזרה על הטעויות"}
        </h2>
        <p className="mt-1 text-muted">
          <span className="font-bold text-foreground tabular-nums">
            {fixed}/{total}
          </span>{" "}
          נכונות בפעם השנייה. מה שעדיין קשה יחזור אליכם בחזרה החכמה.
        </p>
        <Link
          href={back.href}
          className="game-press mt-5 flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <ChevronRight size={16} aria-hidden="true" />
          {back.label}
        </Link>
      </section>
    );
  }

  const s = run ? summarize(run) : null;
  const words = s?.missed.some((m) => m.word) ?? false;

  return (
    <section aria-labelledby="practice-done" className="mt-6 border-t border-card-border pt-5">
      <CheckCircle2 size={34} aria-hidden="true" className="text-success" />
      <h2 id="practice-done" className="mt-2 text-xl font-black tracking-tight">
        סיימתם את התרגול ב{backLabel}
      </h2>
      {s && s.answered > 0 && (
        <p className="mt-1 text-muted">
          <span className="chyron text-2xl text-primary tabular-nums align-middle">
            {s.correct}/{s.answered}
          </span>{" "}
          תשובות נכונות{s.answered < (run?.total ?? 0) ? ` · עניתם עכשיו על ${s.answered} מתוך ${run?.total}` : ""}
        </p>
      )}

      {s && s.missed.length > 0 && (
        <div className="mt-5">
          <h3 className="font-bold">מה כדאי לזכור</h3>
          <ul className="mt-2 space-y-2">
            {s.missed.map((m) => (
              <li key={m.id} className="rounded-lg border border-card-border bg-background-2 px-4 py-3">
                {/[֐-׿]/.test(m.prompt) ? (
                  <p className="text-sm text-muted">{m.prompt}</p>
                ) : (
                  <EnglishText as="p" className="text-sm text-muted">
                    {m.prompt}
                  </EnglishText>
                )}
                <p className="mt-1 text-sm">
                  <span className="text-muted">התשובה הנכונה: </span>
                  <EnglishText className="font-bold">{m.answer}</EnglishText>
                </p>
              </li>
            ))}
          </ul>
          {words && <p className="mt-2 text-xs text-muted">המילים שטעיתם בהן יחזרו אליכם בחזרה החכמה, במרווחים הולכים וגדלים.</p>}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2.5">
        {s && s.missed.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const first = startRetry(run!.setKey);
              if (first) router.push(`/practice/${first}?retry=1`);
            }}
            className="game-press flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <RotateCcw size={16} aria-hidden="true" />
            לתרגל שוב את הטעויות ({s.missed.length})
          </button>
        )}
        {/* A vocabulary set is recognition (pick the word); the next step
            is recall, typing the words from memory. */}
        {backHref.startsWith("/vocabulary/") && (
          <Link
            href={`/games/spelling?topic=${backHref.slice("/vocabulary/".length)}`}
            className="game-press flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg border border-card-border bg-card font-bold hover:border-primary/50 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <Keyboard size={16} aria-hidden="true" />
            עכשיו להקליד את המילים מהזיכרון
          </Link>
        )}
        <Link
          href={back.href}
          className={`game-press flex items-center justify-center gap-2 min-h-12 px-4 rounded-lg font-bold transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
            s && s.missed.length > 0
              ? "border border-card-border bg-card hover:border-primary/50"
              : "bg-primary text-primary-ink hover:bg-primary-hover"
          }`}
        >
          <ChevronRight size={16} aria-hidden="true" />
          {back.label}
        </Link>
      </div>
    </section>
  );
}

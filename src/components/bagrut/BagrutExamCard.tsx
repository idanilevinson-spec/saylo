import Link from "next/link";
import { CheckCircle2, Circle, ChevronLeft } from "lucide-react";
import type { BagrutUnitProgress } from "@/types/database";
import type { BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import type { BagrutExamState } from "@/lib/content/bagrut/learnerState";
import { getPublishableSampleUnits } from "@/lib/content/bagrut/sampleUnits";
import {
  buildExamPlan,
  daysLeftHe,
  examKindAfter,
  examKindLabel,
  examKindsFor,
  israelDate,
} from "@/lib/bagrut/examPlan";
import BagrutExamDateForm from "./BagrutExamDateForm";

// The countdown to the learner's next exam and this week's tasks, at the
// top of /bagrut (src/lib/bagrut/examPlan.ts). Nothing until migration 056
// has run.
export default function BagrutExamCard({
  exam,
  track,
  progress,
}: {
  exam: BagrutExamState;
  track: BagrutStudyUnits | null;
  progress: BagrutUnitProgress[];
}) {
  if (!exam.available) return null;
  const todayIso = israelDate(new Date());
  const kinds = examKindsFor(track);
  const form = (
    <BagrutExamDateForm kinds={kinds} todayIso={todayIso} initialDate={exam.date} initialKind={exam.kind} />
  );
  const shell = "lit-plate mt-6 rounded-lg border border-card-border bg-card p-5 sm:p-6";

  if (!exam.date || !exam.kind) {
    return (
      <section aria-labelledby="exam-plan" className={shell}>
        <h2 id="exam-plan" className="text-xl font-black">מתי הבחינה הבאה שלכם?</h2>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          בוחרים בחינה ותאריך, ומקבלים כל שבוע משימות עד הבחינה, לפי מה שכבר עשיתם.
        </p>
        {form}
      </section>
    );
  }

  const label = examKindLabel(exam.kind);
  const plan = buildExamPlan({
    todayIso,
    examDate: exam.date,
    kind: exam.kind,
    sets: exam.kind === "oral" ? [] : getPublishableSampleUnits(exam.kind),
    progress,
    oralGradesThisWeek: exam.oralGradesThisWeek,
    conversationsThisWeek: exam.conversationsThisWeek,
  });

  if (plan.status !== "upcoming") {
    return (
      <section aria-labelledby="exam-plan" className={shell}>
        <h2 id="exam-plan" className="text-xl font-black">
          {plan.status === "today" ? `${label} היום. בהצלחה!` : `איך הלך ${examKindAfter("ב", exam.kind)}?`}
        </h2>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          {plan.status === "today"
            ? "אחרי הבחינה אפשר להזין כאן את הבחינה הבאה."
            : "אפשר להזין את הבחינה הבאה, ונבנה לה תוכנית שבועית."}
        </p>
        {plan.status === "past" ? (
          form
        ) : (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-bold text-primary">לשנות את הבחינה</summary>
            {form}
          </details>
        )}
      </section>
    );
  }

  const done = plan.tasks.filter((t) => t.done).length;
  const dateHe = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${exam.date}T00:00:00Z`),
  );

  return (
    <section aria-labelledby="exam-plan" className={shell}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h2 id="exam-plan" className="text-xl font-black">
          {daysLeftHe(plan.daysLeft)} {examKindAfter("ל", exam.kind)}
        </h2>
        <p className="text-sm text-muted">{dateHe}</p>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-bold">{plan.finalWeek ? "השבוע האחרון לפני הבחינה" : "המשימות של השבוע"}</h3>
        {plan.tasks.length > 0 && (
          <p className="text-sm text-muted tabular-nums">
            {done} מתוך {plan.tasks.length}
          </p>
        )}
      </div>
      <ul className="mt-2 divide-y divide-card-border rounded-lg border border-card-border">
        {plan.tasks.map((t) => (
          <li key={t.key}>
            <Link
              href={t.href}
              className="flex min-h-12 items-center gap-3 px-4 py-2.5 hover:bg-background-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
            >
              {t.done ? (
                <CheckCircle2 size={20} aria-hidden="true" className="shrink-0 text-accent-hover" />
              ) : (
                <Circle size={20} aria-hidden="true" className="shrink-0 text-muted" />
              )}
              <span className={`min-w-0 flex-1 ${t.done ? "text-muted" : "font-medium"}`}>
                {t.labelHe}
                {t.done && <span className="sr-only"> (בוצע)</span>}
              </span>
              <ChevronLeft size={16} aria-hidden="true" className="shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
      {plan.tasks.length > 0 && done === plan.tasks.length && (
        <p className="mt-3 text-sm font-medium">המשימות של השבוע בוצעו. ביום ראשון יופיעו המשימות הבאות.</p>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-bold text-primary">לשנות את הבחינה או את התאריך</summary>
        {form}
      </details>
    </section>
  );
}

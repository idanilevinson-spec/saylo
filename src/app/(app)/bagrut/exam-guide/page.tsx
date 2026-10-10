import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ListChecks, Map as MapIcon, Layers, Timer, NotebookPen, CheckCircle2 } from "lucide-react";
import { BAGRUT_MODULE_FORMATS, modulesForUnits, type BagrutModuleCode, type BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import BagrutCredit from "@/components/BagrutCredit";

export const metadata: Metadata = {
  title: "לקראת בחינת הבגרות — Saylo",
};

const TRACKS: BagrutStudyUnits[] = [3, 4, 5];

// A suggested split of a questionnaire's time: about a tenth kept for a
// final check, the rest divided by each section's points. Derived only
// from the verified duration and points in moduleFormats.ts; labelled on
// the page as a suggestion, not an official rule.
function timePlan(code: BagrutModuleCode): { nameHe: string; minutes: number }[] | null {
  const f = BAGRUT_MODULE_FORMATS[code];
  if (!f.timeMinutes) return null;
  const review = Math.max(5, Math.round(f.timeMinutes * 0.1));
  const working = f.timeMinutes - review;
  const totalPoints = f.sections.reduce((n, s) => n + s.points, 0);
  const parts = f.sections.map((s) => ({ nameHe: s.nameHe, minutes: Math.round((working * s.points) / totalPoints) }));
  return [...parts, { nameHe: "בדיקה חוזרת", minutes: review }];
}

const PREP_STEPS: { icon: typeof MapIcon; title: string; body: string; href: string; cta: string }[] = [
  {
    icon: MapIcon,
    title: "להכיר את המבנה",
    body: "לדעת מראש כמה חלקים יש בכל שאלון, כמה נקודות כל חלק שווה וכמה זמן יש. ככה אין הפתעות ביום הבחינה.",
    href: "/bagrut",
    cta: "לבחירת מסלול",
  },
  {
    icon: Layers,
    title: "לחזק מיומנויות",
    body: "מיומנות אחת בכל פעם: רעיון מרכזי, מילות הפניה, הסקת מסקנות, כתיבה בטווח מילים. כל אחת עם דוגמה פתורה.",
    href: "/bagrut/skills",
    cta: "לספריית המיומנויות",
  },
  {
    icon: ListChecks,
    title: "לתרגל בלי שעון",
    body: "ערכת תרגול ראשונה בקצב שלכם, עם הטקסט פתוח. המטרה היא להבין את סוגי השאלות, לא לעמוד בזמן.",
    href: "/bagrut",
    cta: "לערכות התרגול",
  },
  {
    icon: Timer,
    title: "לתרגל בזמן אמיתי",
    body: "ערכה נוספת עם השעון של הבחינה. שימו לב איפה הזמן נגמר לכם, ולפי זה תכננו את החלוקה.",
    href: "/bagrut",
    cta: "לערכות התרגול",
  },
  {
    icon: NotebookPen,
    title: "לחזור על הטעויות",
    body: "מילים ונושאי דקדוק שטעיתם בהם חוזרים במחברת הטעויות. כדאי לעבור עליה לפני כל ערכה חדשה.",
    href: "/mistakes",
    cta: "למחברת הטעויות",
  },
];

const EXAM_DAY_TIPS = [
  "לקרוא את השאלות לפני הטקסט, כדי לדעת מה מחפשים.",
  "לענות קודם על השאלות שבטוחים בהן, ולחזור לקשות בסוף.",
  "בשאלה פתוחה: משפט מלא באנגלית, שחוזר על מילות השאלה, עם פרט מהטקסט.",
  "בכתיבה: לתכנן דקה או שתיים לפני שמתחילים, ולשמור על טווח המילים.",
  "לא להשאיר שאלה ריקה. תשובה חלקית עדיפה על כלום.",
  "להשאיר כמה דקות בסוף לבדיקה: איות, זמנים, ושלא דילגתם על שאלה.",
];

export default function BagrutExamGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">לקראת הבחינה</h1>
      <p className="mt-2 text-muted leading-relaxed max-w-prose">
        איך להתכונן בסדר הנכון, איך לחלק את הזמן בכל שאלון, ומה לזכור ביום עצמו.
      </p>

      <section aria-labelledby="plan-title" className="mt-10">
        <h2 id="plan-title" className="text-xl font-black tracking-tight">
          תוכנית הכנה בחמישה צעדים
        </h2>
        <ol className="mt-4 space-y-3">
          {PREP_STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 rounded-lg border border-card-border bg-card p-4">
              <span className="chyron inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-ink text-2xl tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-bold">
                  <step.icon size={16} aria-hidden="true" className="text-primary" />
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-muted leading-relaxed">{step.body}</p>
                <Link href={step.href} className="mt-2 inline-block text-sm font-bold text-primary hover:underline">
                  {step.cta}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="time-title" className="mt-12">
        <h2 id="time-title" className="flex items-center gap-2 text-xl font-black tracking-tight">
          <Clock size={19} aria-hidden="true" className="text-primary" /> חלוקת זמן מוצעת לכל שאלון
        </h2>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          הצעה בלבד: כעשירית מהזמן לבדיקה בסוף, והשאר לפי משקל הנקודות של כל חלק. זה לא כלל רשמי.
        </p>
        <div className="mt-5 space-y-8">
          {TRACKS.map((units) => (
            <div key={units}>
              <h3 className="flex items-baseline gap-1.5 font-bold">
                <span className="chyron text-3xl text-primary tabular-nums">{units}</span> יח״ל
                <span className="text-sm font-normal text-muted">
                  · שאלונים <span dir="ltr">{modulesForUnits(units).join(" + ")}</span>
                </span>
              </h3>
              <ul className="mt-3 grid sm:grid-cols-3 gap-3">
                {modulesForUnits(units).map((code) => {
                  const f = BAGRUT_MODULE_FORMATS[code];
                  const plan = timePlan(code);
                  return (
                    <li key={code} className="rounded-lg border border-card-border bg-card p-4">
                      <p className="flex items-baseline justify-between gap-2">
                        <span className="chyron text-3xl">{code}</span>
                        <span className="text-sm text-muted tabular-nums">{f.timeMinutes ? `${f.timeMinutes} דק׳` : "זמן לא אומת"}</span>
                      </p>
                      {plan ? (
                        <>
                          {/* The split as one bar, then the minutes per part. */}
                          <div className="mt-3 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
                            {plan.map((p, i) => (
                              <span
                                key={p.nameHe}
                                className={i === plan.length - 1 ? "bg-card-border" : i === 0 ? "bg-primary" : "bg-accent"}
                                style={{ width: `${(p.minutes / (f.timeMinutes as number)) * 100}%` }}
                              />
                            ))}
                          </div>
                          <ul className="mt-2.5 space-y-1 text-sm">
                            {plan.map((p) => (
                              <li key={p.nameHe} className="flex justify-between gap-2">
                                <span className="text-muted">{p.nameHe}</span>
                                <span className="font-bold tabular-nums">כ-{p.minutes} דק׳</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <ul className="mt-2.5 space-y-1 text-sm">
                          {f.sections.map((s) => (
                            <li key={s.nameHe} className="flex justify-between gap-2">
                              <span className="text-muted">{s.nameHe}</span>
                              <span className="font-bold tabular-nums">{s.points} נק׳</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="day-title" className="mt-12">
        <h2 id="day-title" className="text-xl font-black tracking-tight">
          ביום הבחינה
        </h2>
        <ul className="mt-4 grid sm:grid-cols-2 gap-3">
          {EXAM_DAY_TIPS.map((tip) => (
            <li key={tip} className="flex gap-2.5 rounded-lg bg-background-2 p-3.5 text-sm leading-relaxed">
              <CheckCircle2 size={16} aria-hidden="true" className="shrink-0 mt-0.5 text-success" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <BagrutCredit className="mt-12" />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Eye, RotateCcw } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MixedText from "@/components/MixedText";
import TextRights from "@/components/TextRights";
import AiConsentGate, { useAiConsent } from "@/components/AiConsentGate";
import type { BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";
import { skillsForModule } from "@/lib/content/bagrut/skills";
import { countWords, minWordsToCheck, WRITING_CRITERIA, WRITING_RUBRICS, writingRulesFor, type WritingGrade, type WritingCriterionKey } from "@/lib/bagrut/writingRules";
import type { WritingFix } from "@/lib/bagrut/writingFeedback";
import { PAID_WRITING_CHECKS_PER_DAY, TRIAL_WRITING_CHECKS, WRITING_LIMIT_ERROR } from "@/lib/bagrut/writingAllowance";
import { AI_CONSENT_REQUIRED_ERROR } from "@/lib/ai/consent";

interface CheckResult {
  grade: WritingGrade;
  words: number;
  zero: boolean;
  notesHe: Record<WritingCriterionKey, string>;
  fixes: WritingFix[];
  improved: string;
}

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "premium" }
  | { kind: "limit"; trial: boolean };

const points = (n: number) => (n === 1 ? "נקודה אחת" : `${n} נקודות`);

const linkButton =
  "inline-flex min-h-10 items-center gap-1.5 rounded text-sm font-medium text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary";

// Under the writing task of a Bagrut practice set: sends the learner's text
// to be marked against the Ministry's public writing rubric and shows the
// points per criterion, corrections quoted from the text, and the same text
// one level up (docs/specs/bagrut-writing-check.md). Nothing is stored; the
// result lives on this page until it is closed.
export default function BagrutWritingCheck({
  moduleCode,
  unitSlug,
  text,
  wordCountRange,
}: {
  moduleCode: BagrutModuleCode;
  unitSlug: string;
  text: string;
  wordCountRange: [number, number];
}) {
  const consented = useAiConsent();
  const [askConsent, setAskConsent] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [result, setResult] = useState<{ data: CheckResult; text: string } | null>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  const rules = writingRulesFor(moduleCode);
  const words = countWords(text);
  const [min, max] = wordCountRange;
  const floor = minWordsToCheck(moduleCode);
  const loading = status.kind === "loading";
  const stale = !!result && result.text !== text.trim();

  // The result replaces a button the learner just pressed: move keyboard
  // and screen-reader focus to it.
  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  if (!rules) return null;

  async function check() {
    if (loading || words < floor) return;
    if (!consented) {
      setAskConsent(true);
      return;
    }
    const sent = text.trim();
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/ai/bagrut-writing-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleCode, unitSlug, text: sent }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 429 && data?.error === WRITING_LIMIT_ERROR) return setStatus({ kind: "limit", trial: !!data.trial });
      if (res.status === 403 && data?.error === AI_CONSENT_REQUIRED_ERROR) {
        setAskConsent(true);
        return setStatus({ kind: "idle" });
      }
      if (res.status === 403) return setStatus({ kind: "premium" });
      if (!res.ok || !data?.grade) return setStatus({ kind: "error" });
      setResult({ data: data as CheckResult, text: sent });
      setStatus({ kind: "idle" });
    } catch {
      setStatus({ kind: "error" });
    }
  }

  const g = result?.data.grade;

  return (
    <div className="mt-5 border-t border-card-border pt-5">
      {askConsent && !consented && <AiConsentGate compact declineHref={null}>{null}</AiConsentGate>}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={check}
          disabled={loading || words < floor}
          className="game-press inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 font-bold text-primary-ink transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {result ? <RotateCcw size={16} aria-hidden="true" /> : <ClipboardCheck size={17} aria-hidden="true" />}
          {loading ? "בודקים..." : result ? "לבדוק שוב" : "בדקו לי"}
        </button>
        <p className="text-sm text-muted">
          {words < floor
            ? `אפשר לבדוק מ-${floor} מילים. בבחינה, טקסט קצר מזה מקבל 0 על כל המטלה.`
            : `ציון מתוך ${WRITING_RUBRICS[rules.rubric].total} לפי המחוון, הערות בעברית וגרסה משופרת.`}
        </p>
      </div>

      <div aria-live="polite">
        {loading && <p className="mt-3 text-sm">הבדיקה לוקחת בערך חצי דקה. אפשר להמשיך לקרוא בינתיים.</p>}
        {status.kind === "error" && (
          <p className="mt-3 text-sm text-danger">הבדיקה לא הצליחה הפעם. הטקסט שלכם שמור; נסו שוב בעוד רגע.</p>
        )}
        {status.kind === "limit" && (
          <p className="mt-3 rounded-lg bg-background-2 px-4 py-3 text-sm">
            {status.trial
              ? `בתקופת הניסיון אפשר לבדוק ${TRIAL_WRITING_CHECKS} מטלות כתיבה, והן כבר נוצלו. בדיקות נוספות זמינות במנוי.`
              : `אפשר לבדוק עד ${PAID_WRITING_CHECKS_PER_DAY} מטלות כתיבה ב-24 שעות, והן נוצלו. הטקסט שלכם שמור; אפשר לבדוק אותו מחר.`}
          </p>
        )}
        {status.kind === "premium" && (
          <p className="mt-3 rounded-lg bg-background-2 px-4 py-3 text-sm">
            בדיקת הכתיבה זמינה בתקופת הניסיון ובמנוי.{" "}
            <Link href="/pricing" className="font-medium text-primary underline underline-offset-2">
              לצפייה במסלולים
            </Link>
          </p>
        )}
      </div>

      {!result && (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          בלחיצה על הכפתור הטקסט נשלח לבדיקה אוטומטית של AI לפי מחוון הכתיבה שמשרד החינוך מפרסם. הוא לא נשמר אצלנו. במכשיר
          הזה הוא נשמר עד שמסיימים את הערכה.
        </p>
      )}

      {result && g && (
        <section aria-labelledby="writing-result-title" className="mt-6">
          <h3 id="writing-result-title" ref={resultRef} tabIndex={-1} className="text-lg font-bold focus:outline-none">
            ההערכה: <span className="tabular-nums">{g.total}</span> מתוך <span className="tabular-nums">{g.outOf}</span>
          </h3>
          {stale && (
            <p className="mt-1 text-sm text-muted">שיניתם את הטקסט מאז הבדיקה. ההערכה כאן היא של הגרסה שנבדקה.</p>
          )}
          {result.data.zero ? (
            <p className="mt-2 text-sm leading-relaxed">
              הטקסט לא עונה על המטלה, או שלא ניתן להבין אותו. לפי המחוון, מטלה כזו מקבלת 0 בכל הסעיפים. כדאי לקרוא שוב את
              המטלה ולכתוב עליה.
            </p>
          ) : (
            g.lengthOff > 0 && (
              <p className="mt-2 text-sm leading-relaxed">
                על התוכן והשפה: <span className="tabular-nums">{g.onMerit}</span>. ירדו {points(g.lengthOff)} על האורך: נבדקו{" "}
                <span className="tabular-nums">{result.data.words}</span> מילים, והמטלה מבקשת {min}–{max}.
              </p>
            )
          )}

          {!result.data.zero && (
            <dl className="mt-4 divide-y divide-card-border border-y border-card-border">
              {WRITING_CRITERIA.map(({ key, labelHe }) => (
                <div key={key} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="font-bold">{labelHe}</dt>
                    <dd className="shrink-0 text-sm tabular-nums">
                      {g.points[key]} מתוך {g.max[key]}
                    </dd>
                  </div>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">
                    <MixedText>{result.data.notesHe[key]}</MixedText>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {result.data.fixes.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold">תיקונים מתוך הטקסט שלכם</h4>
              <ul className="mt-2 space-y-3">
                {result.data.fixes.map((f, i) => (
                  <li key={i} className="rounded-lg bg-background-2 p-3 text-sm">
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-muted">כתבתם:</span>
                      <EnglishText as="del" className="text-danger">
                        {f.wrote}
                      </EnglishText>
                    </p>
                    <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                      <span className="text-muted">עדיף:</span>
                      <EnglishText as="ins" className="font-bold no-underline">
                        {f.better}
                      </EnglishText>
                    </p>
                    <p className="mt-1.5 leading-relaxed text-muted">
                      <MixedText>{f.whyHe}</MixedText>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!result.data.zero && (
            <div className="mt-6">
              <h4 className="font-bold">הטקסט שלכם, ברמה הבאה</h4>
              <p className="mt-1 text-sm text-muted">אותם רעיונות, בניסוח שמקבל יותר נקודות. סוגריים מרובעים מסמנים מקום שכדאי להשלים בו פרט משלכם.</p>
              <EnglishText as="p" className="mt-2 whitespace-pre-line rounded-lg bg-background-2 p-4 leading-relaxed">
                {result.data.improved}
              </EnglishText>
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-muted">
            זו הערכה אוטומטית של AI לפי מחוון הכתיבה שמשרד החינוך מפרסם. היא עלולה לטעות, והיא לא ציון של בודק בגרות ולא
            תחזית לציון בבחינה. הטקסט וההערכה לא נשמרים אצלנו. {rules.rubricNoteHe}
          </p>
        </section>
      )}

      <ExampleAnswer moduleCode={moduleCode} unlocked={words >= min || !!result} min={min} />
    </div>
  );
}

// A model answer to a task of the same kind (not to this task), from the
// skill pages. Opens once the learner has written their own, so it is a
// point of comparison and not something to copy from.
function ExampleAnswer({ moduleCode, unlocked, min }: { moduleCode: BagrutModuleCode; unlocked: boolean; min: number }) {
  const [open, setOpen] = useState(false);
  const skill = skillsForModule(moduleCode).find((s) => s.kind === "writing" && s.example.modelAnswerEn);
  if (!skill) return null;
  if (!unlocked) {
    return <p className="mt-5 text-sm text-muted">דוגמה לתשובה מהסוג הזה תיפתח כשתגיעו ל-{min} מילים.</p>;
  }
  return (
    <div className="mt-5">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={linkButton}>
        <Eye size={15} aria-hidden="true" /> {open ? "להסתיר את הדוגמה" : "להציג דוגמה לתשובה מהסוג הזה"}
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-background-2 p-4">
          <p className="text-sm text-muted">זו תשובה למטלה אחרת, מאותו סוג:</p>
          <EnglishText as="p" className="mt-2 text-sm font-bold leading-relaxed">
            {skill.example.questionEn}
          </EnglishText>
          <EnglishText as="p" className="mt-2 whitespace-pre-line leading-relaxed">
            {skill.example.modelAnswerEn}
          </EnglishText>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            <MixedText>{skill.example.explanationHe}</MixedText>
          </p>
          <Link href={`/bagrut/skills/${skill.slug}`} className={`mt-1 ${linkButton}`}>
            איך כותבים תשובה כזו, צעד אחר צעד
          </Link>
          <TextRights className="mt-3" />
        </div>
      )}
    </div>
  );
}

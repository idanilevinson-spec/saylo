"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Headphones,
  BookOpenText,
  PenLine,
  Timer,
  Trophy,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import EnglishText from "@/components/EnglishText";
import PrintedPage from "@/components/PrintedPage";
import ListeningPlayer from "@/components/ListeningPlayer";
import type { BagrutSampleUnit, BagrutReadingQuestion, BagrutVocabularyQuestion } from "@/lib/content/bagrut/sampleUnits";
import BagrutCredit from "@/components/BagrutCredit";
import { optionOrder } from "@/lib/utils/shuffle";
import { withoutAnswerLetter } from "@/lib/content/bagrut/answerLetter";
import { paragraphRef, splitParagraphs } from "@/lib/content/bagrut/studyHelpers";
import type { BagrutModuleFormat } from "@/lib/content/bagrut/moduleFormats";

interface BagrutPracticeUnitProps {
  unit: BagrutSampleUnit;
  format: BagrutModuleFormat;
  nextUnit?: { slug: string; titleHe: string } | null;
}

// Self-check, not auto-graded: multiple-choice reveals correct/incorrect on
// selection; open and sentence-completion questions reveal a model answer
// on demand (there's no automated grading for free text here — that would
// need an AI call this v1 deliberately doesn't add, see
// docs/specs/bagrut-track.md §6). The writing task is just a counted
// textarea, not submitted or graded anywhere.
// Multiple-choice questions are the only ones with a right answer to count,
// so they're what a practice set's score is made of. Keyed by section so the
// same index in two sections doesn't collide.
function mcKeys(unit: BagrutSampleUnit): string[] {
  const keys: string[] = [];
  unit.listeningTask?.questions.forEach((q, i) => q.options && keys.push(`L${i}`));
  unit.readingQuestions.forEach((q, i) => q.options && keys.push(`R${i}`));
  unit.vocabularyQuestions?.forEach((q, i) => q.options && keys.push(`V${i}`));
  return keys;
}

const paragraphId = (passage: number, paragraph: number) => `passage-${passage}-p${paragraph}`;

// Moves the reader to an element and puts keyboard and screen-reader focus
// there too, so "where am I" is the same for every learner.
function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  el.focus({ preventScroll: true });
}

export default function BagrutPracticeUnit({ unit, format, nextUnit }: BagrutPracticeUnitProps) {
  const isLiterature = unit.moduleCode === "D";
  const { profile } = useAuth();
  const [results, setResults] = useState<Record<string, boolean>>({});
  // The question a learner jumped up to the text from, so one tap brings
  // them back to it instead of a long scroll down.
  const [returnTo, setReturnTo] = useState<{ id: string; label: string } | null>(null);
  const savedRef = useRef(false);
  const keys = mcKeys(unit);
  const answered = keys.filter((k) => k in results).length;
  const correct = keys.filter((k) => results[k]).length;
  const finished = keys.length > 0 && answered === keys.length;
  const paragraphs = unit.readingPassages.map(splitParagraphs);
  const counts = paragraphs.map((p) => p.length);

  function record(key: string, isCorrect: boolean) {
    setResults((r) => (key in r ? r : { ...r, [key]: isCorrect }));
  }

  function toText(fromId: string, label: string, target: string) {
    setReturnTo({ id: fromId, label });
    goTo(target);
  }

  // Saved once, when the last multiple-choice question is answered. Doing a
  // set again keeps the best score and counts the attempt.
  useEffect(() => {
    if (!finished || !profile || savedRef.current) return;
    savedRef.current = true;
    const percent = Math.round((correct / keys.length) * 100);
    void (async () => {
      const { data: prev } = await supabase
        .from("bagrut_unit_progress")
        .select("best_percent, attempts")
        .eq("profile_id", profile.id)
        .eq("module_code", unit.moduleCode)
        .eq("unit_slug", unit.unitSlug)
        .maybeSingle();
      await supabase.from("bagrut_unit_progress").upsert({
        profile_id: profile.id,
        module_code: unit.moduleCode,
        unit_slug: unit.unitSlug,
        mc_correct: correct,
        mc_total: keys.length,
        best_percent: Math.max(percent, prev?.best_percent ?? 0),
        attempts: (prev?.attempts ?? 0) + 1,
        completed_at: new Date().toISOString(),
      });
    })();
  }, [finished, profile, correct, keys.length, unit.moduleCode, unit.unitSlug]);

  // A reading question gets the paragraph it names (shown in the card) or,
  // when it names none, a way up to the text and back.
  function readingHelp(q: BagrutReadingQuestion, cardId: string, label: string): QuestionHelp {
    const ref = paragraphRef(q.promptEn, counts);
    if (ref) {
      return {
        kind: "paragraph",
        number: ref.paragraph,
        textLabel: unit.readingPassages.length > 1 ? `קטע ${ref.passage + 1}, ` : "",
        text: paragraphs[ref.passage][ref.paragraph - 1],
      };
    }
    return { kind: "jump", go: () => toText(cardId, label, "passage-0") };
  }

  const steps = [
    unit.listeningTask ? "מקשיבים לקטע ועונים על השאלות שלו." : null,
    "קוראים את הקטע. המספרים בשוליים הם מספרי הפסקאות.",
    "עונים על השאלות. בשאלות עם אפשרויות רואים מיד אם צדקתם; בשאלות הפתוחות כותבים לבד ומשווים לתשובה לדוגמה.",
    unit.vocabularyQuestions?.length ? "עונים על שאלות אוצר המילים." : null,
    unit.writingTask ? "כותבים את החיבור. הוא לתרגול עצמי ולא נשלח לבדיקה." : null,
    keys.length > 0 ? "בסוף מקבלים ציון על השאלות עם האפשרויות, והוא נשמר." : null,
  ].filter((s): s is string => s !== null);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-28">
      <Link
        href={`/bagrut/${unit.moduleCode}`}
        className="inline-flex items-center gap-1 py-2 text-sm font-medium text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
      >
        <ChevronRight size={16} aria-hidden="true" />
        כל הערכות של שאלון {unit.moduleCode}
      </Link>

      <h1 className="mt-2 text-2xl font-bold leading-snug">{unit.titleHe}</h1>
      <p className="mt-1 text-sm text-muted">
        שאלון {unit.moduleCode}, ערכה {unit.unitSlug}
        {format.timeMinutes ? ` · בבחינה: ${format.timeMinutes} דקות` : ""}
      </p>

      <section aria-labelledby="how-title" className="mt-5 rounded-lg bg-background-2 px-5 py-4">
        <h2 id="how-title" className="text-sm font-bold">
          איך עובדים עם הערכה
        </h2>
        <ol className="mt-2 space-y-1.5 text-sm leading-relaxed list-decimal ps-5 marker:text-muted marker:font-bold">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        {format.timeMinutes && <ExamTimer minutes={format.timeMinutes} />}
      </section>

      {/* Module D's real exam tests a specific story/poem chosen by the
          Ministry and studied in advance — this practice text is original,
          not an assigned work, so the gap is called out plainly rather than
          left for the learner to assume otherwise. */}
      {isLiterature && (
        <div className="mt-4 flex gap-3 rounded-lg border border-card-border p-4 text-sm leading-relaxed text-muted">
          <BookOpenText size={18} aria-hidden="true" className="shrink-0 mt-0.5" />
          <p>
            בבחינה האמיתית של שאלון D לומדים מראש יצירה ספציפית (סיפור ושיר) שנקבעת על ידי משרד החינוך. הטקסט כאן{" "}
            <strong className="text-foreground">מקורי</strong> ונועד לתרגל את סוג הניתוח הספרותי הנדרש, והוא אינו
            תחליף ללימוד היצירות הרשמיות שנבחרו לבית הספר שלכם.
          </p>
        </div>
      )}

      {unit.listeningTask && (
        <section aria-labelledby="listening-title" className="mt-8">
          <h2 id="listening-title" className="flex items-center gap-2 text-lg font-bold">
            <Headphones size={18} aria-hidden="true" className="text-muted" /> הבנת הנשמע
          </h2>
          <div className="mt-3 rounded-lg border border-card-border bg-card p-5">
            <ListeningPlayer transcriptEn={unit.listeningTask.transcriptEn} />
          </div>
          <div className="mt-4 space-y-4">
            {unit.listeningTask.questions.map((q, i) => (
              <QuestionCard key={i} id={`q-L${i}`} index={i + 1} question={q} onAnswer={(c) => record(`L${i}`, c)} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="reading-title" className="mt-8">
        <h2 id="reading-title" className="flex items-center gap-2 text-lg font-bold">
          <BookOpenText size={18} aria-hidden="true" className="text-muted" /> הבנת הנקרא
        </h2>
        {unit.readingPassages.map((passage, passageIndex) => (
          <div key={passageIndex} id={`passage-${passageIndex}`} tabIndex={-1} className="mt-3 scroll-mt-4 focus:outline-none">
            <PrintedPage
              label={<span className="text-sm">{unit.readingPassages.length > 1 ? `קטע ${passageIndex + 1}` : "הקטע"}</span>}
            >
              <div className="text-lg leading-relaxed space-y-4">
                {paragraphs[passageIndex].map((paragraph, i) => (
                  <p
                    key={i}
                    id={paragraphId(passageIndex, i + 1)}
                    className="whitespace-pre-line"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </PrintedPage>
          </div>
        ))}

        <h3 className="mt-8 text-base font-bold">שאלות על הקטע</h3>
        <div className="mt-3 space-y-4">
          {unit.readingQuestions.map((q, i) => {
            const id = `q-R${i}`;
            return (
              <QuestionCard
                key={i}
                id={id}
                index={i + 1}
                question={q}
                help={readingHelp(q, id, `לשאלה ${i + 1}`)}
                onAnswer={(c) => record(`R${i}`, c)}
              />
            );
          })}
        </div>
      </section>

      {unit.vocabularyQuestions && unit.vocabularyQuestions.length > 0 && (
        <section aria-labelledby="vocab-title" className="mt-10">
          <h2 id="vocab-title" className="flex items-center gap-2 text-lg font-bold">
            <BookOpenText size={18} aria-hidden="true" className="text-muted" /> אוצר מילים
          </h2>
          <div className="mt-3 space-y-4">
            {unit.vocabularyQuestions.map((q, i) => (
              <QuestionCard key={i} id={`q-V${i}`} index={i + 1} question={q} onAnswer={(c) => record(`V${i}`, c)} />
            ))}
          </div>
        </section>
      )}

      {unit.writingTask && (
        <WritingTaskCard promptEn={unit.writingTask.promptEn} wordCountRange={unit.writingTask.wordCountRange} />
      )}

      {keys.length > 0 && (
        <section
          aria-live="polite"
          className={`mt-10 rounded-lg border p-5 ${finished ? "border-primary/40 bg-primary/[0.05]" : "border-card-border bg-card"}`}
        >
          {finished ? (
            <>
              <p className="flex items-center gap-2 text-lg font-bold">
                <Trophy size={20} aria-hidden="true" className="text-primary" />
                {correct} מתוך {keys.length} נכונות
              </p>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                {profile ? "הציון נשמר. " : ""}
                את השאלות הפתוחות ואת הכתיבה בודקים לבד מול התשובה לדוגמה.
              </p>
              {correct / keys.length < 0.6 && (
                <p className="mt-2 text-sm leading-relaxed">
                  זה בסדר, בשביל זה מתרגלים. כדאי לקרוא את ההסבר ליד כל שאלה שטעיתם בה, ואחר כך לחזור על הערכה. נשמר
                  הציון הכי טוב שלכם.
                </p>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                {nextUnit && (
                  <Link
                    href={`/bagrut/${unit.moduleCode}/${nextUnit.slug}`}
                    className="game-press inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-primary-ink hover:bg-primary-hover transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    לערכה הבאה: {nextUnit.titleHe}
                    <ChevronLeft size={17} aria-hidden="true" />
                  </Link>
                )}
                <Link
                  href={`/bagrut/${unit.moduleCode}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-card-border px-5 font-bold hover:bg-background-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  כל הערכות של שאלון {unit.moduleCode}
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted tabular-nums">
              נענו {answered} מתוך {keys.length} השאלות עם האפשרויות. כשכולן נענות, הציון מופיע כאן.
            </p>
          )}
        </section>
      )}

      <BagrutCredit className="mt-8" />

      {returnTo && (
        <button
          type="button"
          onClick={() => {
            goTo(returnTo.id);
            setReturnTo(null);
          }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-20 -translate-x-1/2 inline-flex min-h-12 items-center gap-2 rounded-lg bg-foreground px-5 font-bold text-background shadow-[0_6px_20px_rgb(0_0_0/0.25)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <ArrowDown size={17} aria-hidden="true" />
          חזרה {returnTo.label}
        </button>
      )}
    </div>
  );
}

// Optional exam conditions: the module's real duration, counting down.
// Nothing locks when it runs out; it only shows where the learner would
// have stood in the real exam.
function ExamTimer({ minutes }: { minutes: number }) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (endsAt === null) {
    return (
      <button
        type="button"
        onClick={() => {
          setNow(Date.now());
          setEndsAt(Date.now() + minutes * 60_000);
        }}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 text-sm font-medium hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        <Timer size={15} aria-hidden="true" /> שעון של בחינה ({minutes} דקות), לא חובה
      </button>
    );
  }

  const left = Math.max(0, endsAt - now);
  const mm = Math.floor(left / 60_000);
  const ss = Math.floor((left % 60_000) / 1000);
  const over = left === 0;
  return (
    <div
      role="timer"
      aria-live="off"
      className={`sticky top-2 z-10 mt-3 flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-2 text-sm shadow-sm ${
        over ? "border-danger text-danger" : left < 10 * 60_000 ? "border-accent" : "border-card-border"
      }`}
    >
      <span className="flex items-center gap-1.5 font-medium">
        <Timer size={15} aria-hidden="true" />
        {over ? "הזמן של הבחינה נגמר" : "זמן שנותר"}
      </span>
      <span dir="ltr" className="font-bold tabular-nums text-base">
        {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
      </span>
      <button
        type="button"
        onClick={() => setEndsAt(null)}
        className="min-h-9 rounded px-2 text-xs text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        לעצור את השעון
      </button>
    </div>
  );
}

type QuestionHelp =
  | { kind: "paragraph"; number: number; textLabel: string; text: string }
  | { kind: "jump"; go: () => void };

function QuestionCard({
  id,
  index,
  question,
  help,
  onAnswer,
}: {
  id: string;
  index: number;
  question: BagrutReadingQuestion | BagrutVocabularyQuestion;
  help?: QuestionHelp;
  onAnswer?: (isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showParagraph, setShowParagraph] = useState(false);
  const answered = selected !== null;
  const right = answered && selected === question.correctOptionIndex;
  const linkButton =
    "inline-flex min-h-10 items-center gap-1.5 rounded text-sm font-medium text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary";

  return (
    <div
      id={id}
      tabIndex={-1}
      role="group"
      aria-labelledby={`${id}-label`}
      className="scroll-mt-4 rounded-lg border border-card-border bg-card p-5 focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
    >
      <p id={`${id}-label`} className="text-xs font-medium text-muted">
        שאלה {index} · {question.formatHe}
      </p>
      <EnglishText as="p" className="mt-1.5 font-medium leading-relaxed">
        {question.promptEn}
      </EnglishText>

      {help?.kind === "paragraph" && (
        <div className="mt-2">
          <button type="button" aria-expanded={showParagraph} onClick={() => setShowParagraph((v) => !v)} className={linkButton}>
            <BookOpenText size={15} aria-hidden="true" />
            {showParagraph ? "להסתיר את הפסקה" : `להציג כאן את ${help.textLabel}פסקה ${help.number}`}
          </button>
          {showParagraph && (
            <blockquote className="mt-1 rounded-lg bg-background-2 px-4 py-3 leading-relaxed">
              <EnglishText as="p">{help.text}</EnglishText>
            </blockquote>
          )}
        </div>
      )}
      {help?.kind === "jump" && (
        <button type="button" onClick={help.go} className={`mt-2 ${linkButton}`}>
          <ArrowUp size={15} aria-hidden="true" />
          לחזור לקטע
        </button>
      )}

      {question.options ? (
        <div className="mt-3 flex flex-col gap-2">
          {optionOrder(question.options.length, question.promptEn).map((i) => {
            const option = question.options![i];
            const isSelected = selected === i;
            const isCorrectOption = i === question.correctOptionIndex;
            const markRight = answered && isCorrectOption;
            const markWrong = answered && isSelected && !isCorrectOption;
            return (
              <button
                key={option}
                type="button"
                // English options read left to right, so a two-line answer
                // lines up with the one-line answers instead of jumping sides.
                dir={/[֐-׿]/.test(option) ? "rtl" : "ltr"}
                onClick={() => {
                  if (answered) return;
                  setSelected(i);
                  onAnswer?.(i === question.correctOptionIndex);
                }}
                // aria-disabled, not disabled: after answering the buttons
                // stay focusable, so keyboard and screen-reader users keep
                // their place instead of being dropped to the top.
                aria-disabled={answered || undefined}
                aria-pressed={answered ? isSelected : undefined}
                className={`flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2 text-start transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                  markRight
                    ? "border-success bg-success-ink"
                    : markWrong
                      ? "border-danger bg-danger-ink"
                      : answered
                        ? "border-card-border cursor-default text-muted"
                        : "border-card-border hover:bg-background-2"
                }`}
              >
                <EnglishText as="span" className="flex-1">
                  {option}
                </EnglishText>
                {markRight && <CheckCircle2 size={18} aria-hidden="true" className="shrink-0 text-success" />}
                {markWrong && <XCircle size={18} aria-hidden="true" className="shrink-0 text-danger" />}
                {markRight && <span className="sr-only"> (התשובה הנכונה)</span>}
                {markWrong && <span className="sr-only"> (הבחירה שלכם, לא נכונה)</span>}
              </button>
            );
          })}
          <div aria-live="polite">
            {answered && (
              <p className="mt-1 flex items-start gap-1.5 text-sm">
                {right ? (
                  <CheckCircle2 size={16} aria-hidden="true" className="text-success shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={16} aria-hidden="true" className="text-danger shrink-0 mt-0.5" />
                )}
                <span>
                  <strong>{right ? "נכון. " : "לא נכון. "}</strong>
                  <span className="text-muted">
                    {withoutAnswerLetter(question.modelAnswerHe) || (right ? "" : "התשובה הנכונה מסומנת בירוק.")}
                  </span>
                </span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <button type="button" aria-expanded={showAnswer} onClick={() => setShowAnswer((v) => !v)} className={linkButton}>
            <Eye size={15} aria-hidden="true" /> {showAnswer ? "להסתיר את התשובה לדוגמה" : "להציג תשובה לדוגמה"}
          </button>
          {showAnswer && <p className="mt-2 rounded-lg bg-background-2 p-3 text-sm leading-relaxed">{question.modelAnswerHe}</p>}
        </div>
      )}
    </div>
  );
}

function WritingTaskCard({ promptEn, wordCountRange }: { promptEn: string; wordCountRange: [number, number] }) {
  const [text, setText] = useState("");
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const [min, max] = wordCountRange;
  const inRange = wordCount >= min && wordCount <= max;

  return (
    <section aria-labelledby="writing-title" className="mt-10">
      <h2 id="writing-title" className="flex items-center gap-2 text-lg font-bold">
        <PenLine size={18} aria-hidden="true" className="text-muted" /> מטלת כתיבה
      </h2>
      <div className="mt-3 rounded-lg border border-card-border bg-card p-5">
        <div id="writing-prompt">
          <EnglishText as="p" className="leading-relaxed">
            {promptEn}
          </EnglishText>
        </div>
        <label htmlFor="writing-answer" className="mt-4 block text-sm font-bold">
          התשובה שלכם ({min}–{max} מילים)
        </label>
        <textarea
          id="writing-answer"
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir="ltr"
          lang="en"
          rows={7}
          aria-describedby="writing-prompt writing-count"
          className="mt-1.5 w-full rounded-lg border border-card-border bg-background px-3 py-2.5 text-base font-content focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        />
        <p id="writing-count" className={`mt-1.5 text-sm tabular-nums ${inRange ? "text-success" : "text-muted"}`}>
          {wordCount} מילים{inRange ? ", בטווח" : ""}
        </p>
        <p className="mt-1 text-xs text-muted">הכתיבה כאן לתרגול עצמי ואינה נשלחת לבדיקה.</p>
      </div>
    </section>
  );
}

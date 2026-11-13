"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Headphones, Mic, Pause, Play, RotateCcw } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import BagrutCredit from "@/components/BagrutCredit";
import { useNeuralSpeech } from "@/lib/speech/useNeuralSpeech";
import { pickSimulation, type OralSimulation } from "@/lib/bagrut/oralPick";
import { examGrade, ORAL_EXAM_MINUTES, formatSeconds, type OralPart } from "@/lib/bagrut/oralRules";
import { ORAL_LIMIT_ERROR } from "@/lib/bagrut/oralAllowance";
import type { PartATopic } from "@/lib/content/bagrutOral";
import OralRecorder, { type RecordedAnswer } from "./OralRecorder";
import OralResults, { type GradedSet, type SetResult } from "./OralResults";

type Step = "intro" | "a-choose" | "a" | "b" | "c-listen" | "c1" | "c2" | "results";

const PART_OF: Record<Step, OralPart | null> = {
  intro: null,
  "a-choose": "A",
  a: "A",
  b: "B",
  "c-listen": "C",
  c1: "C",
  c2: "C",
  results: null,
};

const PART_TITLE: Record<OralPart, string> = {
  A: "חלק A: תגובה אישית",
  B: "חלק B: הפרויקט שלכם",
  C: "חלק C: תגובה לקטע שמע",
};

// The oral Bagrut simulation (docs/specs/bagrut-oral.md): intro, the three
// parts in the real exam's order, then all four question sets are graded
// together and the results open. Nothing is saved; leaving the page ends
// the simulation.
export default function BagrutOralExam() {
  const [sim, setSim] = useState<OralSimulation | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [topicA, setTopicA] = useState<PartATopic | null>(null);
  const [projectTopic, setProjectTopic] = useState("");
  const [answers, setAnswers] = useState<Record<string, RecordedAnswer>>({});
  const [results, setResults] = useState<Record<string, SetResult>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  // The exam's own 30-minute clock, as information: practice is never cut off.
  useEffect(() => {
    if (startedAt === null || step === "results") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt, step]);

  function start() {
    setSim(pickSimulation());
    setTopicA(null);
    setProjectTopic("");
    setAnswers({});
    setResults({});
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    setStep("a-choose");
    window.scrollTo({ top: 0 });
  }

  function go(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function save(setId: string, answer: RecordedAnswer, next: Step) {
    setAnswers((a) => ({ ...a, [setId]: answer }));
    if (next === "results") grade({ ...answers, [setId]: answer });
    go(next);
  }

  const graded: GradedSet[] = sim && topicA ? buildSets(sim, topicA, answers, results) : [];

  async function gradeOne(set: GradedSet) {
    setResults((r) => ({ ...r, [set.setId]: { status: "loading" } }));
    let result: SetResult;
    try {
      const res = await fetch("/api/ai/bagrut-oral-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setId: set.setId,
          transcript: set.answer.transcript,
          seconds: set.answer.seconds,
          projectTopic: set.part === "B" ? projectTopic : undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) result = { status: "ok", grade: body.grade, lengthDeduction: body.lengthDeduction, feedback: body.feedback };
      else
        result = {
          status: "error",
          message:
            body.error === ORAL_LIMIT_ERROR
              ? body.trial
                ? "בתקופת הניסיון אפשר לעשות סימולציה אחת. סימולציות נוספות זמינות במנוי."
                : "הגעתם למספר הסימולציות ליום. אפשר להמשיך מחר."
              : "לא הצלחנו לבדוק את התשובה הזו. אפשר לנסות שוב.",
        };
    } catch {
      result = { status: "error", message: "אין חיבור כרגע. אפשר לנסות שוב כשהחיבור יחזור." };
    }
    setResults((r) => ({ ...r, [set.setId]: result }));
  }

  function grade(all: Record<string, RecordedAnswer>) {
    if (!sim || !topicA) return;
    buildSets(sim, topicA, all, {}).forEach((s) => void gradeOne(s));
  }

  const allOk = graded.length === 4 && graded.every((s) => s.result.status === "ok");
  const total = allOk
    ? examGrade(graded.map((s) => ({ part: s.part, grade: s.result.status === "ok" ? s.result.grade : 0 })))
    : null;
  const part = PART_OF[step];
  const elapsed = startedAt === null ? 0 : Math.floor((now - startedAt) / 1000);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      {step === "intro" ? (
        <Intro onStart={start} />
      ) : (
        <>
          <header className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-black tracking-tight">{step === "results" ? "התוצאות שלכם" : part && PART_TITLE[part]}</h1>
              {step !== "results" && (
                <span className="text-sm text-muted tabular-nums">
                  {formatSeconds(elapsed)} מתוך {ORAL_EXAM_MINUTES}:00
                </span>
              )}
            </div>
            <ol className="mt-3 grid grid-cols-3 gap-1.5" aria-label="חלקי הבחינה">
              {(["A", "B", "C"] as OralPart[]).map((p) => {
                const order = { A: 0, B: 1, C: 2 }[p];
                const current = part ? { A: 0, B: 1, C: 2 }[part] : 3;
                return (
                  <li
                    key={p}
                    aria-current={p === part ? "step" : undefined}
                    className={`h-1.5 rounded-full ${order < current ? "bg-primary" : order === current ? "bg-primary/60" : "bg-background-2"}`}
                  >
                    <span className="sr-only">
                      חלק {p}
                      {order < current ? ", הושלם" : order === current ? ", עכשיו" : ""}
                    </span>
                  </li>
                );
              })}
            </ol>
          </header>

          {sim && step === "a-choose" && (
            <div>
              <p className="text-muted">שני נושאים. בוחרים אחד ועונים רק על השאלות שלו.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {sim.partA.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTopicA(t);
                      go("a");
                    }}
                    className="lit-plate lit-hover game-press rounded-lg border border-card-border bg-card p-5 text-start hover:border-primary/50 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    <span className="block font-black">{t.topicHe}</span>
                    <EnglishText as="span" className="mt-2 block text-sm text-muted leading-relaxed">
                      {t.questions.join(" ")}
                    </EnglishText>
                  </button>
                ))}
              </div>
            </div>
          )}

          {sim && topicA && step === "a" && (
            <Stage>
              <OralRecorder key={topicA.id} questions={topicA.questions} onDone={(a) => save(topicA.id, a, "b")} />
            </Stage>
          )}

          {sim && step === "b" && (
            <Stage>
              <label htmlFor="project-topic" className="block text-sm font-bold">
                על מה הפרויקט שלכם? <span className="font-normal text-muted">(לא חובה, עוזר לבדיקה)</span>
              </label>
              <input
                id="project-topic"
                type="text"
                maxLength={120}
                value={projectTopic}
                onChange={(e) => setProjectTopic(e.target.value)}
                placeholder="למשל: דבורים בעיר"
                className="mt-1.5 mb-5 w-full px-4 py-2.5 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="mb-3 text-sm text-muted">מדברים בין דקה לשתי דקות. מתחת לדקה יורדות נקודות.</p>
              <OralRecorder key={sim.partB.id} questions={sim.partB.questions} lengthMeter onDone={(a) => save(sim.partB.id, a, "c-listen")} />
            </Stage>
          )}

          {sim && step === "c-listen" && <Listen script={sim.partC.script} titleHe={sim.partC.titleHe} onNext={() => go("c1")} />}

          {sim && step === "c1" && (
            <Stage note="קבוצת שאלות ראשונה מתוך שתיים">
              <OralRecorder key={sim.partC.sets[0].id} questions={sim.partC.sets[0].questions} onDone={(a) => save(sim.partC.sets[0].id, a, "c2")} />
            </Stage>
          )}

          {sim && step === "c2" && (
            <Stage note="קבוצת שאלות שנייה מתוך שתיים">
              <OralRecorder
                key={sim.partC.sets[1].id}
                questions={sim.partC.sets[1].questions}
                onDone={(a) => save(sim.partC.sets[1].id, a, "results")}
              />
            </Stage>
          )}

          {step === "results" && (
            <>
              <OralResults sets={graded} examGrade={total} onRetry={(id) => {
                const s = graded.find((g) => g.setId === id);
                if (s) void gradeOne(s);
              }} />
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={start}
                  className="game-press inline-flex items-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  <RotateCcw size={16} aria-hidden="true" /> סימולציה חדשה
                </button>
                <Link
                  href="/bagrut"
                  className="inline-flex items-center gap-1.5 min-h-12 px-5 rounded-lg border border-card-border bg-card font-bold hover:bg-background-2 transition-colors"
                >
                  לאזור הבגרות <ChevronLeft size={16} aria-hidden="true" />
                </Link>
              </div>
            </>
          )}
        </>
      )}
      <BagrutCredit className="mt-10" />
    </div>
  );
}

function buildSets(
  sim: OralSimulation,
  topicA: PartATopic,
  answers: Record<string, RecordedAnswer>,
  results: Record<string, SetResult>,
): GradedSet[] {
  const rows = [
    { setId: topicA.id, part: "A" as const, labelHe: `חלק A · ${topicA.topicHe}`, questions: topicA.questions },
    { setId: sim.partB.id, part: "B" as const, labelHe: "חלק B · הפרויקט", questions: sim.partB.questions },
    { setId: sim.partC.sets[0].id, part: "C" as const, labelHe: `חלק C · ${sim.partC.titleHe}, קבוצה 1`, questions: sim.partC.sets[0].questions },
    { setId: sim.partC.sets[1].id, part: "C" as const, labelHe: `חלק C · ${sim.partC.titleHe}, קבוצה 2`, questions: sim.partC.sets[1].questions },
  ];
  return rows
    .filter((r) => answers[r.setId])
    .map((r) => ({ ...r, answer: answers[r.setId], result: results[r.setId] ?? { status: "loading" } }));
}

function Stage({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="relative rounded-lg border border-card-border bg-card p-5 sm:p-7">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-primary" />
      {note && <p className="mb-3 text-sm font-bold text-muted">{note}</p>}
      {children}
    </div>
  );
}

function Listen({ script, titleHe, onNext }: { script: string; titleHe: string; onNext: () => void }) {
  const segments = useMemo(() => [script], [script]);
  const { state, togglePlayPause } = useNeuralSpeech(segments);
  // The questions open once the recording has been started.
  const [heard, setHeard] = useState(false);
  return (
    <Stage>
      <div className="flex items-start gap-3">
        <Headphones size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-primary-hover" />
        <div>
          <h2 className="font-black">{titleHe}</h2>
          <p className="mt-1 text-sm text-muted leading-relaxed">
            מקשיבים לקטע, ואחריו עונים על שתי קבוצות שאלות. בבחינה האמיתית זה סרטון קצר; כאן זה קטע שמע מקורי של Saylo.
            הטקסט לא מוצג, כמו בבחינה.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setHeard(true);
            togglePlayPause();
          }}
          disabled={state === "loading"}
          className="game-press inline-flex items-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-colors disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {state === "playing" ? <Pause size={16} aria-hidden="true" /> : <Play size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />}
          {state === "playing" ? "השהיה" : state === "loading" ? "טוען..." : heard ? "להמשיך להאזין" : "להאזין לקטע"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!heard}
          className="game-press inline-flex items-center gap-2 min-h-12 px-5 rounded-lg border border-card-border bg-card font-bold hover:bg-background-2 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <Mic size={15} aria-hidden="true" /> לשאלות
        </button>
      </div>
    </Stage>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight">סימולציה: בגרות בעל פה</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted leading-relaxed">
        בחינה ממוחשבת של {ORAL_EXAM_MINUTES} דקות, באותו מבנה כמו הבחינה בעל פה של 4 ו-5 יחידות. מקליטים את התשובות, ובסוף
        מקבלים ציון לכל אחד מארבעת הקריטריונים של המחוון, מה בדיוק להוסיף כדי לקבל יותר נקודות, ואת התשובה שלכם עצמה ברמה
        הבאה.
      </p>
      <ol className="mt-6 divide-y divide-card-border rounded-lg border border-card-border bg-card">
        {[
          ["חלק A · 25 נקודות", "שני נושאים אישיים. בוחרים אחד ועונים על השאלות שלו."],
          ["חלק B · 25 נקודות", "מדברים על הפרויקט שלכם, בין דקה לשתי דקות. מד זמן מראה מתי עברתם את הדקה."],
          ["חלק C · 50 נקודות", "מקשיבים לקטע קצר ועונים על שתי קבוצות שאלות."],
        ].map(([title, body]) => (
          <li key={title} className="px-5 py-4">
            <span className="block font-bold">{title}</span>
            <span className="block text-sm text-muted">{body}</span>
          </li>
        ))}
      </ol>
      <ul className="mt-5 space-y-1.5 text-sm text-muted">
        <li>כדאי מקום שקט ואוזניות עם מיקרופון.</li>
        <li>ההקלטות והתשובות לא נשמרות אצלנו. הן נשלחות רק לזיהוי הדיבור ולבדיקה, ונעלמות כשסוגרים את הדף.</li>
        <li>השאלות והקטעים נכתבו על ידי Saylo במבנה של הבחינה. הם לא שאלות של משרד החינוך.</li>
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="game-press mt-7 inline-flex items-center gap-2 min-h-12 px-7 rounded-lg bg-primary text-primary-ink font-bold text-lg hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        <Play size={18} fill="currentColor" strokeWidth={0} aria-hidden="true" /> להתחיל את הסימולציה
      </button>
    </div>
  );
}

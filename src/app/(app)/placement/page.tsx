"use client";

import { ENGLISH_TEXT_INPUT } from "@/lib/utils/inputProps";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Volume2, Turtle, Target, GraduationCap, AlertTriangle, BookOpenText, BookOpen, PenLine, Headphones, NotebookPen, Mic, ChevronLeft, type LucideIcon } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import AiConsentGate from "@/components/AiConsentGate";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { speak } from "@/lib/speech/browserTts";
import { getCanDoStatement } from "@/lib/content/canDoStatements";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import type { CefrLevel, PlacementQuestion, SkillArea } from "@/types/database";
import { modulesForUnits, type BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import { BAGRUT_AI_CONTENT_DISCLAIMER } from "@/lib/content/bagrut/sampleUnits";
import { BAGRUT_PLACEMENT_SECTIONS, BAGRUT_READINESS_COPY, bagrutReadiness } from "@/lib/content/bagrut/placementItems";

const SKILL_LABELS_HE: Record<SkillArea, string> = {
  vocabulary: "אוצר מילים",
  grammar: "דקדוק",
  listening: "האזנה",
  reading: "קריאה",
  writing: "כתיבה",
  speaking: "דיבור",
};

const SKILL_ICONS: Record<SkillArea, LucideIcon> = {
  vocabulary: BookOpen,
  grammar: PenLine,
  reading: BookOpenText,
  listening: Headphones,
  writing: NotebookPen,
  speaking: Mic,
};

const SKILL_ORDER: SkillArea[] = ["vocabulary", "grammar", "reading", "listening", "writing", "speaking"];

const WRITING_SAMPLE_PROMPT_HE =
  "כתבו 2-4 משפטים באנגלית על עצמכם: מה שמכם, מאיפה אתם, ודבר אחד שאתם אוהבים לעשות.";

// Fill-in-the-blank prompts mark the missing word with a run of underscores
// in the source text (e.g. "She ___ a teacher."), but content authors don't
// all type the same number of them — and a blank whose width happens to
// match the missing word's length gives away how many letters it has. This
// renders every such run as the same fixed-width line regardless of how
// many underscores are actually in the text, so the blank never hints at
// the answer. Screen readers get "מילה חסרה" instead of a run of literal
// underscore characters (mostly ignored by TTS anyway).
function renderPromptWithUniformBlanks(prompt: string): ReactNode[] {
  return prompt.split(/(_{2,})/g).map((part, i) =>
    /^_{2,}$/.test(part) ? (
      <span key={i} className="inline-block w-14 align-middle border-b-2 border-current mx-1" aria-label="מילה חסרה">
        &nbsp;
      </span>
    ) : (
      part
    )
  );
}

interface SkillScore {
  skill: SkillArea;
  percentCorrect: number;
  cefrLevel: string;
}

interface PlacementResult {
  overallCefr: string;
  summary: string;
  scores: SkillScore[];
  bagrut: { units: BagrutStudyUnits; correct: number; total: number; percent: number } | null;
}

type Goal = "general" | BagrutStudyUnits;

const GOAL_OPTIONS: { value: Goal; label: string; hint: string }[] = [
  { value: "general", label: "אנגלית באופן כללי", hint: "בלי הכנה לבגרות" },
  { value: 3, label: "בגרות 3 יח״ל", hint: "מודולים A, B, C" },
  { value: 4, label: "בגרות 4 יח״ל", hint: "מודולים C, D, E" },
  { value: 5, label: "בגרות 5 יח״ל", hint: "מודולים E, F, G" },
];

export default function PlacementPage() {
  const { profile, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<PlacementQuestion[] | null>(null);
  const [testId, setTestId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showWritingStep, setShowWritingStep] = useState(false);
  const [writingSample, setWritingSample] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showBagrutStep, setShowBagrutStep] = useState(false);
  const [bagrutAnswers, setBagrutAnswers] = useState<(number | null)[]>([]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("placement_questions")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
      .then(({ data }) => setQuestions(data ?? []));
  }, [profile]);

  if (authLoading || questions === null) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">
        מבחן הרמה עוד לא זמין.
      </div>
    );
  }

  // Preselect what the learner told us before (on /bagrut or an earlier
  // test). Someone who never answered has nothing preselected and has to
  // choose before starting.
  const chosenGoal: Goal | null = goal ?? profile?.bagrut_units ?? null;
  const bagrutUnits = chosenGoal !== null && chosenGoal !== "general" ? chosenGoal : null;
  const bagrutSection = bagrutUnits ? BAGRUT_PLACEMENT_SECTIONS[bagrutUnits] : null;

  async function handleStart() {
    if (!profile || starting || chosenGoal === null) return;
    setStarting(true);
    if ((profile.bagrut_units ?? null) !== bagrutUnits) {
      await supabase.from("profiles").update({ bagrut_units: bagrutUnits }).eq("id", profile.id);
    }
    setBagrutAnswers(bagrutSection ? bagrutSection.questions.map(() => null) : []);
    const { data: test } = await supabase.from("placement_tests").insert({ profile_id: profile.id }).select().single();
    setTestId(test?.id ?? null);
    setStarted(true);
    setStarting(false);
  }

  if (!started) {
    // The test as it actually is: how many questions in each skill.
    const perSkill = SKILL_ORDER.filter((s) => s !== "speaking" && s !== "writing")
      .map((skill) => ({ skill, count: questions.filter((q) => q.skill_area === skill).length }))
      .filter((s) => s.count > 0);
    return (
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">מבחן רמה</h1>
          <p className="mt-3 max-w-xl text-lg text-muted leading-relaxed">
            כ-10 דקות, {questions.length} שאלות קצרות. בסוף תקבלו רמה לכל מיומנות בנפרד, ותוכנית יומית שבנויה עליה.
          </p>

          <ul className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-px overflow-hidden rounded-lg border border-card-border bg-card-border">
            {perSkill.map(({ skill, count }) => {
              const Icon = SKILL_ICONS[skill];
              return (
                <li key={skill} className="flex flex-col gap-1 bg-card px-4 py-4">
                  <Icon size={17} aria-hidden="true" className="text-primary" />
                  <span className="chyron text-3xl leading-none tabular-nums">{count}</span>
                  <span className="text-sm text-muted">{SKILL_LABELS_HE[skill]}</span>
                </li>
              );
            })}
            <li className="flex flex-col gap-1 bg-card px-4 py-4">
              <NotebookPen size={17} aria-hidden="true" className="text-muted" />
              <span className="chyron text-3xl leading-none text-muted" dir="ltr">+1</span>
              <span className="text-sm text-muted">כתיבה, לא חובה</span>
            </li>
          </ul>

          <fieldset className="mt-10">
            <legend className="text-xl font-black tracking-tight">מה המטרה שלכם?</legend>
            <p className="mt-1 text-sm text-muted leading-relaxed">
              מי שמתכוננים לבגרות יקבלו בסוף המבחן גם קטע קריאה קצר בפורמט הבגרות, לפי מספר היחידות.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((option) => {
                const active = chosenGoal === option.value;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setGoal(option.value)}
                    className={`game-press flex items-center gap-3 rounded-lg border px-4 py-3.5 text-start transition-[background-color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                      active ? "border-primary bg-primary/[0.07]" : "border-card-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-primary" : "border-card-border"}`}
                    >
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-bold">
                        {option.value !== "general" && <GraduationCap size={15} aria-hidden="true" className="text-primary" />}
                        {option.label}
                      </span>
                      <span className="block text-xs text-muted">{option.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              disabled={starting || chosenGoal === null}
              className="game-press inline-flex items-center justify-center gap-2 min-h-13 px-8 rounded-lg bg-primary text-primary-ink text-lg font-bold hover:bg-primary-hover transition-[background-color,opacity,transform] duration-150 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <Target size={19} aria-hidden="true" />
              {starting ? "מתחילים..." : chosenGoal === null ? "בחרו מטרה כדי להתחיל" : "להתחיל את המבחן"}
            </button>
            <p className="text-xs text-muted">הערכה פנימית של Saylo לפי סולם CEFR, לא מבחן רשמי.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (result) {
    const canDo = getCanDoStatement("speaking", result.overallCefr as CefrLevel);
    return (
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
        <motion.section
          initial={{ opacity: 0, transform: "translateY(12px) scale(0.985)" }}
          animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative overflow-hidden rounded-lg bg-primary text-primary-ink p-6 sm:p-8"
        >
          <p className="text-sm font-bold text-primary-ink/75">התוצאה שלכם</p>
          <div className="mt-2 flex items-end gap-5">
            <EnglishText as="span" className="chyron text-8xl sm:text-9xl leading-[0.8]">
              {result.overallCefr}
            </EnglishText>
            <div className="pb-1">
              <p className="text-2xl font-black">{CEFR_NAME_HE[result.overallCefr as CefrLevel]}</p>
              {canDo && <p className="mt-1 max-w-sm text-sm text-primary-ink/80 leading-relaxed">{canDo}</p>}
            </div>
          </div>
          <Link
            href="/dashboard"
            className="game-press mt-6 inline-flex items-center gap-2 min-h-12 px-5 rounded-lg bg-background text-foreground font-bold transition-transform duration-150"
          >
            לתוכנית של היום <ChevronLeft size={17} aria-hidden="true" />
          </Link>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-4 rounded-lg border border-card-border bg-card p-5 sm:p-6"
          aria-labelledby="by-skill"
        >
          <h2 id="by-skill" className="font-black">לפי מיומנות</h2>
          <ul className="mt-4 space-y-3.5">
            {SKILL_ORDER.map((skill) => {
              const s = result.scores.find((sc) => sc.skill === skill);
              return (
                <li key={skill} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm">
                  <span className="font-bold">{SKILL_LABELS_HE[skill]}</span>
                  {s ? (
                    <>
                      <span className="h-2 overflow-hidden rounded-full bg-background-2" aria-hidden="true">
                        <motion.span
                          className="block h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${s.percentCorrect}%` }}
                          transition={{ duration: 0.7, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        />
                      </span>
                      <span className="flex items-center gap-2 tabular-nums">
                        <span className="text-muted">{s.percentCorrect}%</span>
                        <span className="chyron text-lg text-primary" dir="ltr">
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
        </motion.section>

        {result.summary && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-4 rounded-lg border border-card-border bg-card p-5 sm:p-6"
          >
            <h2 className="font-black">מה המורה ראה במבחן</h2>
            <p className="mt-2 leading-relaxed text-foreground/90">{result.summary}</p>
          </motion.section>
        )}

        {result.bagrut && <BagrutResultCard bagrut={result.bagrut} />}
      </div>
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  async function submitFinal(sample: string) {
    if (!testId) return;
    setFinishing(true);
    setError(null);
    // This call has no upper bound otherwise — it waits on two sequential
    // Claude calls (writing sample scoring, then the summary), which can
    // legitimately take a while. Without a timeout, a request that hangs
    // (weak connection, the app backgrounded mid-request) leaves the
    // learner stuck on "מנתח את התוצאות שלכם..." with no way back; see the
    // same fix on account deletion for the same underlying gap.
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 30_000);
    try {
      const res = await fetch("/api/ai/placement-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placementTestId: testId,
          writingSample: sample,
          bagrutUnits,
          bagrutAnswers: bagrutUnits ? bagrutAnswers : undefined,
        }),
        signal: timeout.signal,
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as PlacementResult;
      setResult(data);
    } catch {
      setError("אירעה שגיאה בניתוח התוצאות. נסו שוב.");
    } finally {
      clearTimeout(timer);
      setFinishing(false);
    }
  }

  async function handleNext() {
    if (selected === null || !testId || !profile) return;

    const isCorrect = selected === question.correct_index;
    await supabase.from("placement_test_responses").insert({
      placement_test_id: testId,
      question_id: question.id,
      selected_index: selected,
      is_correct: isCorrect,
    });

    if (!isLast) {
      setIndex((i) => i + 1);
      setSelected(null);
      return;
    }

    goToEndSteps();
  }

  function goToEndSteps() {
    if (bagrutSection) setShowBagrutStep(true);
    else setShowWritingStep(true);
  }

  // No response is recorded for a skipped question — it's excluded from
  // that skill's score entirely (same as a skill nobody got any questions
  // for: the results screen already shows "טרם נבדק" for it) rather than
  // counted wrong, since a guess-free skip isn't evidence the learner
  // doesn't know the material.
  function handleSkip() {
    if (!testId) return;
    setSelected(null);
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    goToEndSteps();
  }

  if (finishing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">מנתח את התוצאות שלכם...</div>
    );
  }

  if (showBagrutStep && bagrutSection) {
    const answered = bagrutAnswers.filter((a) => a !== null).length;
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden bg-card border border-card-border rounded-lg p-6 sm:p-8">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
          <h1 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap size={20} aria-hidden="true" className="text-primary shrink-0" />
            קטע קריאה בפורמט הבגרות ({bagrutSection.units} יח״ל)
          </h1>
          <p className="mt-1 text-sm text-muted leading-relaxed">
            הקטע קצר יותר מזה שבבחינה, אבל השאלות הן מאותם סוגים: רעיון מרכזי, פרטים מהטקסט, מילות הפניה והסקת
            מסקנות. אפשר לחזור לקטע תוך כדי.
          </p>
          <div role="note" className="mt-4 flex gap-2.5 rounded-lg border border-accent/40 bg-accent/[0.07] p-3 text-xs leading-relaxed">
            <AlertTriangle size={15} aria-hidden="true" className="shrink-0 text-accent-hover mt-0.5" />
            <p>{BAGRUT_AI_CONTENT_DISCLAIMER}</p>
          </div>

          <h2 className="mt-6 flex items-center gap-2 font-bold text-sm text-muted">
            <BookOpenText size={16} aria-hidden="true" /> הבנת הנקרא
          </h2>
          <EnglishText as="h3" className="mt-2 text-lg font-bold">
            {bagrutSection.titleEn}
          </EnglishText>
          <EnglishText as="div" className="mt-2 leading-relaxed whitespace-pre-line font-content">
            {bagrutSection.passageEn}
          </EnglishText>
        </div>

        <ol className="mt-6 space-y-4">
          {bagrutSection.questions.map((q, qi) => (
            <li key={qi} className="bg-card border border-card-border rounded-lg p-5">
              <p className="text-xs text-muted">
                {qi + 1}. {q.formatHe}
              </p>
              <EnglishText as="p" className="mt-1.5 font-medium leading-relaxed">
                {renderPromptWithUniformBlanks(q.promptEn)}
              </EnglishText>
              <div className="mt-3 space-y-2" role="radiogroup" aria-label={`שאלה ${qi + 1}`}>
                {q.options.map((option, oi) => {
                  const active = bagrutAnswers[qi] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setBagrutAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                      className={`w-full text-start px-4 py-2.5 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                        active ? "border-primary bg-primary/5" : "border-card-border hover:border-primary/40"
                      }`}
                    >
                      <EnglishText>{option}</EnglishText>
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => {
            setShowBagrutStep(false);
            setShowWritingStep(true);
          }}
          className="mt-6 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {answered === bagrutSection.questions.length
            ? "לשלב האחרון →"
            : `לשלב האחרון (נענו ${answered} מתוך ${bagrutSection.questions.length}) →`}
        </button>
      </div>
    );
  }

  if (showWritingStep) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <p className="text-sm text-muted mb-4">שלב אחרון (רשות)</p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-card border border-card-border rounded-lg p-6 sm:p-8"
        >
          <p className="font-medium text-lg">{WRITING_SAMPLE_PROMPT_HE}</p>
          <p className="mt-1 text-sm text-muted">
            זה עוזר לנו להעריך גם את רמת הכתיבה שלכם. אפשר לדלג אם אתם מעדיפים.
          </p>
          {/* The writing sample and the summary are read by the AI, so the
              text box only appears once the learner has agreed to that.
              Skipping needs no agreement — the result is then computed
              from the answers alone, with no AI involved. */}
          <AiConsentGate compact declineHref={null}>
            <textarea
              {...ENGLISH_TEXT_INPUT}
              aria-label="דגימת כתיבה למבחן ההתחלה"
              value={writingSample}
              onChange={(e) => setWritingSample(e.target.value)}
              rows={5}
              placeholder="Write your answer here..."
              className="mt-4 w-full px-4 py-3 rounded-lg border border-card-border bg-card font-content focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </AiConsentGate>

          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}

          <div className="mt-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => submitFinal("")}
              className="px-4 py-2.5 rounded-lg border border-card-border font-medium hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              דילוג
            </motion.button>
            <motion.button
              whileHover={writingSample.trim() ? { scale: 1.02 } : undefined}
              whileTap={writingSample.trim() ? { scale: 0.97 } : undefined}
              onClick={() => submitFinal(writingSample)}
              disabled={!writingSample.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              סיום המבחן
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <p className="text-sm text-muted mb-4">
        שאלה {index + 1} מתוך {questions.length}
      </p>
      <div className="h-1.5 rounded-full bg-background-2 overflow-hidden mb-8">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <motion.div
        key={index}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-card border border-card-border rounded-lg p-6 sm:p-8"
      >
        {question.skill_area === "listening" && question.audio_text ? (
          <div>
            <p className="font-medium text-lg mb-3">{renderPromptWithUniformBlanks(question.prompt)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => speak(question.audio_text as string, 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-card-border hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                <Volume2 size={16} /> השמעה
              </button>
              <button
                onClick={() => speak(question.audio_text as string, 0.6)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-card-border hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                <Turtle size={16} /> לאט
              </button>
            </div>
          </div>
        ) : (
          <EnglishText as="p" className="font-medium text-lg">
            {renderPromptWithUniformBlanks(question.prompt)}
          </EnglishText>
        )}

        <div className="mt-4 space-y-2">
          {question.options.map((option, i) => (
            <motion.button
              key={i}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(i)}
              className={`w-full text-right px-4 py-3 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                selected === i ? "border-primary bg-primary/5" : "border-card-border hover:border-primary/40"
              }`}
            >
              <EnglishText>{option}</EnglishText>
            </motion.button>
          ))}
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}

        <motion.button
          whileHover={selected !== null ? { scale: 1.02 } : undefined}
          whileTap={selected !== null ? { scale: 0.97 } : undefined}
          onClick={handleNext}
          disabled={selected === null}
          className="mt-6 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {isLast ? "לשלב האחרון →" : "הבא →"}
        </motion.button>

        <button
          onClick={handleSkip}
          className="mt-2.5 w-full px-4 py-2 rounded-lg text-sm text-muted font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          לא יודעים? דלגו לשאלה הבאה
        </button>
      </motion.div>
    </div>
  );
}

function BagrutResultCard({ bagrut }: { bagrut: NonNullable<PlacementResult["bagrut"]> }) {
  const readiness = BAGRUT_READINESS_COPY[bagrutReadiness(bagrut.percent)];
  const startModule = modulesForUnits(bagrut.units)[0];
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
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
    </motion.section>
  );
}

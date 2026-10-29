"use client";

import { ENGLISH_TEXT_INPUT } from "@/lib/utils/inputProps";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target, GraduationCap, BookOpenText, BookOpen, PenLine, Headphones, NotebookPen, Mic, type LucideIcon } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import { placementInstructionHe } from "@/lib/placement/instructionHe";
import { optionOrder } from "@/lib/utils/shuffle";
import AiConsentGate from "@/components/AiConsentGate";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import SentenceAudioButtons from "@/components/SentenceAudioButtons";
import type { PlacementQuestion, SkillArea } from "@/types/database";
import type { BagrutStudyUnits } from "@/lib/content/bagrut/moduleFormats";
import { BAGRUT_PLACEMENT_SECTIONS } from "@/lib/content/bagrut/placementItems";
import BagrutCredit from "@/components/BagrutCredit";
import { placementResumePoint } from "@/lib/assessment/placementResume";
import { PlacementFinishing, PlacementResultView, SKILL_LABELS_HE, SKILL_ORDER, type PlacementResult } from "@/components/placement/PlacementResult";

import { EASE_OUT } from "@/lib/motion/easing";
const SKILL_ICONS: Record<SkillArea, LucideIcon> = {
  vocabulary: BookOpen,
  grammar: PenLine,
  reading: BookOpenText,
  listening: Headphones,
  writing: NotebookPen,
  speaking: Mic,
};



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
      <span key={i} role="img" className="inline-block w-14 align-middle border-b-2 border-current mx-1" aria-label="מילה חסרה">
        &nbsp;
      </span>
    ) : (
      part
    )
  );
}

type Goal = "general" | BagrutStudyUnits;

const GOAL_OPTIONS: { value: Goal; label: string; hint: string }[] = [
  { value: "general", label: "אנגלית באופן כללי", hint: "בלי הכנה לבגרות" },
  { value: 3, label: "בגרות 3 יח״ל", hint: "מודולים A, B, C" },
  { value: 4, label: "בגרות 4 יח״ל", hint: "מודולים C, D, E" },
  { value: 5, label: "בגרות 5 יח״ל", hint: "מודולים E, F, G" },
];

// A test left unfinished (a call, the app closed in the background, a
// stray swipe back) can be picked up for this long. In the data, three
// learners lost 19, 20 and all 28 answers and had to start over; one of
// them never finished.
const RESUME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const CONNECTION_ERROR = "לא הצלחנו לשמור. בדקו את החיבור לאינטרנט ונסו שוב.";

interface Resumable {
  testId: string;
  answered: number;
  nextIndex: number;
}

export default function PlacementPage() {
  const router = useRouter();
  const { session, profile, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<PlacementQuestion[] | null>(null);
  const [testId, setTestId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showWritingStep, setShowWritingStep] = useState(false);
  const [writingSample, setWritingSample] = useState("");
  const [saving, setSaving] = useState(false);
  // The state above only reaches handleNext after a re-render, so taps that
  // come before it (a fast double tap) would each pass a check on it.
  const savingRef = useRef(false);
  const [finishing, setFinishing] = useState(false);
  const [finishingWithWriting, setFinishingWithWriting] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showBagrutStep, setShowBagrutStep] = useState(false);
  const [bagrutAnswers, setBagrutAnswers] = useState<(number | null)[]>([]);
  // undefined while checking, null when there's nothing to resume.
  const [resumable, setResumable] = useState<Resumable | null | undefined>(undefined);

  // A new Google/Apple sign-up, or an email sign-up back from the
  // confirmation link, has no profile yet: proxy.ts sends every app page here
  // first, and without a profile the questions never load, so the learner
  // sat on "טוען..." forever (three real sign-ups in October). Nickname and
  // age come first; setup then returns to the dashboard and so to this test.
  useEffect(() => {
    if (!authLoading && session && !profile) {
      router.replace("/profile/setup");
    }
  }, [authLoading, session, profile, router]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("placement_questions")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
      .then(({ data }) => setQuestions(data ?? []));
  }, [profile]);

  // The learner's latest unfinished test, if it has answers (see
  // placementResumePoint for where it picks up).
  useEffect(() => {
    if (!profile || !questions) return;
    const since = new Date(Date.now() - RESUME_WINDOW_MS).toISOString();
    supabase
      .from("placement_tests")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("status", "in_progress")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(async ({ data: test }) => {
        if (!test) return setResumable(null);
        const { data: answers } = await supabase.from("placement_test_responses").select("question_id").eq("placement_test_id", test.id);
        const point = placementResumePoint(
          questions.map((q) => q.id),
          (answers ?? []).map((a) => a.question_id)
        );
        setResumable(point ? { testId: test.id, ...point } : null);
      });
  }, [profile, questions]);

  if (authLoading || questions === null || (questions.length > 0 && resumable === undefined)) {
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
    setStarting(false);
    // Without a test to record into, "הבא" and the skip button do nothing,
    // so the learner would be stuck on the first question.
    if (!test) {
      setError(CONNECTION_ERROR);
      return;
    }
    setError(null);
    setTestId(test.id);
    setStarted(true);
  }

  function handleResume() {
    if (!resumable) return;
    setBagrutAnswers(bagrutSection ? bagrutSection.questions.map(() => null) : []);
    setTestId(resumable.testId);
    setStarted(true);
    if (resumable.nextIndex < questions!.length) {
      setIndex(resumable.nextIndex);
    } else if (bagrutSection) {
      setShowBagrutStep(true);
    } else {
      setShowWritingStep(true);
    }
  }

  if (!started) {
    // The test as it actually is: how many questions in each skill.
    const perSkill = SKILL_ORDER.filter((s) => s !== "speaking" && s !== "writing")
      .map((skill) => ({ skill, count: questions.filter((q) => q.skill_area === skill).length }))
      .filter((s) => s.count > 0);
    return (
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
          {resumable && (
            <section aria-labelledby="resume-title" className="relative mb-8 overflow-hidden rounded-lg border border-primary bg-card p-5 sm:p-6">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
              <h2 id="resume-title" className="text-lg font-black">יש לכם מבחן באמצע</h2>
              <p className="mt-1 text-muted leading-relaxed">
                {resumable.nextIndex < questions.length
                  ? `עניתם על ${resumable.answered} מתוך ${questions.length} שאלות. אפשר להמשיך בדיוק מהמקום שבו עצרתם.`
                  : "עניתם על כל השאלות. נשאר רק השלב האחרון, ואז מקבלים את הרמה."}
              </p>
              <button
                type="button"
                onClick={handleResume}
                className="game-press mt-4 inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                להמשיך מהמקום שעצרתם
              </button>
            </section>
          )}
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
            {/* Spans the row on phones, where the grid has two columns and the
                fifth cell would otherwise leave a bare gap beside it. */}
            <li className="col-span-2 sm:col-span-1 flex flex-col gap-1 bg-card px-4 py-4">
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
              {starting ? "מתחילים..." : chosenGoal === null ? "בחרו מטרה כדי להתחיל" : resumable ? "להתחיל מבחן חדש" : "להתחיל את המבחן"}
            </button>
            <p className="text-xs text-muted">הערכה פנימית של Saylo לפי סולם CEFR, לא מבחן רשמי.</p>
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
        </motion.div>
      </div>
    );
  }

  if (result) {
    return <PlacementResultView result={result} />;
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  async function submitFinal(sample: string) {
    if (!testId) return;
    setFinishingWithWriting(sample.trim().length > 0);
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
    if (selected === null || !testId || !profile || savingRef.current) return;

    // A second tap while the answer is saving would record it twice and
    // jump over the next question.
    savingRef.current = true;
    setSaving(true);
    const isCorrect = selected === question.correct_index;
    const { error: saveError } = await supabase.from("placement_test_responses").insert({
      placement_test_id: testId,
      question_id: question.id,
      selected_index: selected,
      is_correct: isCorrect,
    });
    // Released together with the move to the next question, which also
    // clears the selection, so a late tap finds nothing selected.
    savingRef.current = false;
    setSaving(false);
    // Moving on anyway would lose the answer without a word (it would then
    // count as skipped); staying lets the learner tap again.
    if (saveError) {
      setError(CONNECTION_ERROR);
      return;
    }
    setError(null);

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

  // No response is recorded for a skipped question. It is not counted
  // wrong: the server scores it as a guess would score on average (a
  // quarter of a point), so skipping neither costs nor gains anything over
  // guessing (see placementScore). A skill with no answers at all still
  // shows "לא נבדק הפעם" on the results screen.
  function handleSkip() {
    // While an answer is saving, "הבא" will move on by itself.
    if (!testId || savingRef.current) return;
    setSelected(null);
    setError(null);
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    goToEndSteps();
  }

  if (finishing) {
    return <PlacementFinishing withWriting={finishingWithWriting} />;
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
          <BagrutCredit className="mt-3" />

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
                {optionOrder(q.options.length, q.promptEn).map((oi) => {
                  const option = q.options[oi];
                  const active = bagrutAnswers[qi] === oi;
                  return (
                    <button
                      key={oi}
                      dir={/[֐-׿]/.test(option) ? "rtl" : "ltr"}
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
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
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <motion.div
        key={index}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        className="bg-card border border-card-border rounded-lg p-6 sm:p-8"
      >
        {question.skill_area === "listening" && question.audio_text ? (
          <div>
            {placementInstructionHe(question.prompt) && (
              <p className="mb-1.5 text-sm text-muted">{placementInstructionHe(question.prompt)}</p>
            )}
            <EnglishText as="p" className="font-medium text-lg mb-3">
              {renderPromptWithUniformBlanks(question.prompt)}
            </EnglishText>
            <SentenceAudioButtons key={question.id} text={question.audio_text} />
          </div>
        ) : (
          <>
            {placementInstructionHe(question.prompt) && (
              <p className="mb-1.5 text-sm text-muted">{placementInstructionHe(question.prompt)}</p>
            )}
            <EnglishText as="p" className="font-medium text-lg">
              {renderPromptWithUniformBlanks(question.prompt)}
            </EnglishText>
          </>
        )}

        <div className="mt-4 space-y-2">
          {optionOrder(question.options.length, question.id).map((i) => (
            <motion.button
              key={i}
              dir={/[֐-׿]/.test(question.options[i]) ? "rtl" : "ltr"}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(i)}
              className={`w-full text-start px-4 py-3 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                selected === i ? "border-primary bg-primary/5" : "border-card-border hover:border-primary/40"
              }`}
            >
              <EnglishText>{question.options[i]}</EnglishText>
            </motion.button>
          ))}
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}

        <motion.button
          whileHover={selected !== null ? { scale: 1.02 } : undefined}
          whileTap={selected !== null ? { scale: 0.97 } : undefined}
          onClick={handleNext}
          disabled={selected === null || saving}
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

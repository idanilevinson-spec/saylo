"use client";

import { ENGLISH_TEXT_INPUT } from "@/lib/utils/inputProps";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Volume2, Turtle, Target, GraduationCap, AlertTriangle, BookOpenText } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import CefrBadge from "@/components/CefrBadge";
import AiConsentGate from "@/components/AiConsentGate";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { speak } from "@/lib/speech/browserTts";
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
        מבחן הרמה עוד לא זמין — חזרו בקרוב.
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
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-card-border rounded-lg p-6 sm:p-10 text-center"
        >
          <div className="mx-auto w-20 h-20 rounded-full border-2 border-dashed border-primary bg-primary/[0.07] flex items-center justify-center">
            <Target size={30} className="text-primary" strokeWidth={2} />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-bold">מבחן רמה</h1>
          <p className="mt-3 text-muted leading-relaxed">
            {questions.length} שאלות קצרות שבודקות אוצר מילים, דקדוק, קריאה והאזנה — ובסוף אפשרות לדגימת כתיבה
            קצרה. בסיום תקבלו הערכת רמה לפי סולם CEFR, לפי תחום. זו הערכה פנימית של Saylo ולא מבחן רשמי.
          </p>
          <fieldset className="mt-8 text-start">
            <legend className="font-bold">בשביל מה תשתמשו ב-Saylo?</legend>
            <p className="mt-1 text-sm text-muted leading-relaxed">
              מי שמתכוננים לבגרות יקבלו בסוף המבחן גם קטע קריאה קצר בפורמט הבגרות, לפי מספר היחידות.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((option) => {
                const active = chosenGoal === option.value;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setGoal(option.value)}
                    className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg border text-start transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                      active ? "border-primary bg-primary/[0.07]" : "border-card-border hover:border-primary/40"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      {option.value !== "general" && <GraduationCap size={15} aria-hidden="true" className="text-primary" />}
                      {option.label}
                    </span>
                    <span className="text-xs text-muted">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <motion.button
            whileHover={chosenGoal !== null ? { scale: 1.02 } : undefined}
            whileTap={chosenGoal !== null ? { scale: 0.97 } : undefined}
            onClick={handleStart}
            disabled={starting || chosenGoal === null}
            className="mt-8 w-full sm:w-auto px-10 py-3.5 rounded-lg bg-primary text-primary-ink font-medium text-lg disabled:opacity-60 hover:bg-primary-hover transition-colors"
          >
            {starting ? "מתחילים..." : chosenGoal === null ? "בחרו מטרה כדי להתחיל" : "התחילו את המבחן"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-center"
        >
          התוצאות שלכם
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, type: "spring", bounce: 0.4 }}
          className="mt-8 flex flex-col items-center"
        >
          {/* The big payoff moment: your CEFR level filled in solid, not
              stamped — the moment the scrubber's dashed marker resolves
              into a completed chapter. */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: -6 }}
            transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
            className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-accent flex flex-col items-center justify-center shadow-lg shadow-accent/20"
          >
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-accent-ink/80">רמתכם</span>
            <EnglishText as="span" className="text-4xl sm:text-5xl font-extrabold text-accent-ink leading-none mt-1">
              {result.overallCefr}
            </EnglishText>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 bg-card border border-card-border rounded-lg p-6"
        >
          <p className="leading-relaxed">{result.summary}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 bg-card border border-card-border rounded-lg overflow-hidden"
        >
          <table className="w-full text-sm">
            <tbody>
              {SKILL_ORDER.map((skill) => {
                const s = result.scores.find((sc) => sc.skill === skill);
                return (
                  <tr key={skill} className="border-b border-card-border last:border-0">
                    <td className="p-3 font-medium">{SKILL_LABELS_HE[skill]}</td>
                    {s ? (
                      <>
                        <td className="p-3 text-muted">{s.percentCorrect}%</td>
                        <td className="p-3">
                          <CefrBadge level={s.cefrLevel as CefrLevel} />
                        </td>
                      </>
                    ) : (
                      <td className="p-3 text-muted italic" colSpan={2}>
                        {skill === "speaking" ? "יבדק בשיחה הראשונה שלכם עם ה-AI" : "טרם נבדק"}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        {result.bagrut && <BagrutResultCard bagrut={result.bagrut} />}

        <MotionLink
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href="/learn"
          className="mt-6 block text-center px-5 py-3 rounded-lg bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          למסלול הלימוד שלי
        </MotionLink>
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
          לא יודע/ת · דלגו לשאלה הבאה
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
          href={`/bagrut/${startModule}`}
          className="px-4 py-2 rounded-lg bg-primary text-primary-ink text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          להתחיל במודול {startModule}
        </MotionLink>
        <MotionLink
          whileTap={{ scale: 0.97 }}
          href="/bagrut"
          className="px-4 py-2 rounded-lg border border-card-border text-sm font-medium hover:border-primary/40 transition-colors"
        >
          כל מודולי הבגרות
        </MotionLink>
      </div>
    </motion.section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Turtle, Target } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import CefrBadge from "@/components/CefrBadge";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { speak } from "@/lib/speech/browserTts";
import type { CefrLevel, PlacementQuestion, SkillArea } from "@/types/database";

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

interface SkillScore {
  skill: SkillArea;
  percentCorrect: number;
  cefrLevel: string;
}

interface PlacementResult {
  overallCefr: string;
  summary: string;
  scores: SkillScore[];
}

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

  async function handleStart() {
    if (!profile || starting) return;
    setStarting(true);
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
          className="bg-card border border-card-border rounded-2xl p-6 sm:p-10 text-center"
        >
          <div className="mx-auto w-20 h-20 rounded-full border-2 border-dashed border-primary bg-primary/[0.07] flex items-center justify-center">
            <Target size={30} className="text-primary" strokeWidth={2} />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-bold">מבחן רמה</h1>
          <p className="mt-3 text-muted leading-relaxed">
            {questions.length} שאלות קצרות שבודקות אוצר מילים, דקדוק, קריאה והאזנה — ובסוף אפשרות לדגימת כתיבה
            קצרה. לוקח פחות מ־10 דקות, ובסיום תקבלו את רמת ה-CEFR שלכם, לפי תחום.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            disabled={starting}
            className="mt-8 w-full sm:w-auto px-10 py-3.5 rounded-xl bg-primary text-primary-ink font-medium text-lg disabled:opacity-60 hover:bg-primary-hover transition-colors"
          >
            {starting ? "מתחילים..." : "התחילו את המבחן"}
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
          {/* The big payoff moment — your CEFR level, stamped like the
              landing page's passport badges, just larger for once. */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: -6 }}
            transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
            className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-[3px] border-dashed border-accent bg-accent/[0.07] flex flex-col items-center justify-center"
          >
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-accent-hover">רמתכם</span>
            <EnglishText as="span" className="text-4xl sm:text-5xl font-extrabold text-accent-hover leading-none mt-1">
              {result.overallCefr}
            </EnglishText>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 bg-card border border-card-border rounded-2xl p-6"
        >
          <p className="leading-relaxed">{result.summary}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 bg-card border border-card-border rounded-2xl overflow-hidden"
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

        <MotionLink
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href="/learn"
          className="mt-6 block text-center px-5 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
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
    try {
      const res = await fetch("/api/ai/placement-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placementTestId: testId, writingSample: sample }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as PlacementResult;
      setResult(data);
    } catch {
      setError("אירעה שגיאה בניתוח התוצאות. נסו שוב.");
    } finally {
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

    setShowWritingStep(true);
  }

  if (finishing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">מנתח את התוצאות שלכם...</div>
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
          className="bg-card border border-card-border rounded-2xl p-6 sm:p-8"
        >
          <p className="font-medium text-lg">{WRITING_SAMPLE_PROMPT_HE}</p>
          <p className="mt-1 text-sm text-muted">
            זה עוזר לנו להעריך גם את רמת הכתיבה שלכם. אפשר לדלג אם אתם מעדיפים.
          </p>
          <textarea
            dir="ltr"
            aria-label="דגימת כתיבה למבחן ההתחלה"
            value={writingSample}
            onChange={(e) => setWritingSample(e.target.value)}
            rows={5}
            placeholder="Write your answer here..."
            className="mt-4 w-full px-4 py-3 rounded-xl border border-card-border bg-card font-content focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}

          <div className="mt-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => submitFinal("")}
              className="px-4 py-2.5 rounded-xl border border-card-border font-medium hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              דילוג
            </motion.button>
            <motion.button
              whileHover={writingSample.trim() ? { scale: 1.02 } : undefined}
              whileTap={writingSample.trim() ? { scale: 0.97 } : undefined}
              onClick={() => submitFinal(writingSample)}
              disabled={!writingSample.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
        className="bg-card border border-card-border rounded-2xl p-6 sm:p-8"
      >
        {question.skill_area === "listening" && question.audio_text ? (
          <div>
            <p className="font-medium text-lg mb-3">{question.prompt}</p>
            <div className="flex gap-2">
              <button
                onClick={() => speak(question.audio_text as string, 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-card-border hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                <Volume2 size={16} /> השמעה
              </button>
              <button
                onClick={() => speak(question.audio_text as string, 0.6)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-card-border hover:border-primary/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                <Turtle size={16} /> לאט
              </button>
            </div>
          </div>
        ) : (
          <EnglishText as="p" className="font-medium text-lg">
            {question.prompt}
          </EnglishText>
        )}

        <div className="mt-4 space-y-2">
          {question.options.map((option, i) => (
            <motion.button
              key={i}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(i)}
              className={`w-full text-right px-4 py-3 rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
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
          className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          {isLast ? "לשלב האחרון →" : "הבא →"}
        </motion.button>
      </motion.div>
    </div>
  );
}

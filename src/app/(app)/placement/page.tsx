"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";
import MotionLink from "@/components/MotionLink";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import type { PlacementQuestion, SkillArea } from "@/types/database";

const SKILL_LABELS_HE: Record<SkillArea, string> = {
  vocabulary: "אוצר מילים",
  grammar: "דקדוק",
  listening: "האזנה",
  reading: "קריאה",
  writing: "כתיבה",
  speaking: "דיבור",
};

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
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: qs }, { data: test }] = await Promise.all([
        supabase.from("placement_questions").select("*").eq("status", "published").order("sort_order"),
        supabase
          .from("placement_tests")
          .insert({ profile_id: profile.id })
          .select()
          .single(),
      ]);
      setQuestions(qs ?? []);
      setTestId(test?.id ?? null);
    })();
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
          className="mt-8 bg-card border border-card-border rounded-2xl p-6 sm:p-8 text-center"
        >
          <p className="text-sm text-muted">רמת האנגלית שלכם</p>
          <EnglishText as="p" className="mt-1 text-5xl font-bold text-primary">
            {result.overallCefr}
          </EnglishText>
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
              {result.scores.map((s) => (
                <tr key={s.skill} className="border-b border-card-border last:border-0">
                  <td className="p-3 font-medium">{SKILL_LABELS_HE[s.skill]}</td>
                  <td className="p-3 text-muted">{s.percentCorrect}%</td>
                  <td className="p-3">
                    <EnglishText as="span" className="font-bold text-primary">
                      {s.cefrLevel}
                    </EnglishText>
                  </td>
                </tr>
              ))}
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

    setFinishing(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/placement-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placementTestId: testId }),
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

  if (finishing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">מנתח את התוצאות שלכם...</div>
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
        <EnglishText as="p" className="font-medium text-lg">
          {question.prompt}
        </EnglishText>

        <div className="mt-4 space-y-2">
          {question.options.map((option, i) => (
            <motion.button
              key={i}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(i)}
              className={`w-full text-right px-4 py-3 rounded-xl border transition-colors ${
                selected === i ? "border-primary bg-primary/5" : "border-card-border hover:border-primary/40"
              }`}
            >
              <EnglishText>{option}</EnglishText>
            </motion.button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <motion.button
          whileHover={selected !== null ? { scale: 1.02 } : undefined}
          whileTap={selected !== null ? { scale: 0.97 } : undefined}
          onClick={handleNext}
          disabled={selected === null}
          className="mt-6 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
        >
          {isLast ? "סיום המבחן" : "הבא →"}
        </motion.button>
      </motion.div>
    </div>
  );
}

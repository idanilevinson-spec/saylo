"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import IconBadge from "@/components/IconBadge";

interface ReadingResponseResult {
  score: number;
  feedback_he: string;
  model_answer_en: string;
}

interface ReadingResponseFormProps {
  readingTextId: string;
  questionEn: string;
}

export default function ReadingResponseForm({ readingTextId, questionEn }: ReadingResponseFormProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ReadingResponseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [premiumRequired, setPremiumRequired] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setPremiumRequired(false);
    setLimitReached(false);
    try {
      const res = await fetch("/api/ai/reading-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readingTextId, submittedText: text }),
      });
      if (res.status === 403) {
        setPremiumRequired(true);
        return;
      }
      if (res.status === 429) {
        setLimitReached(true);
        return;
      }
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setResult(data.response);
    } catch {
      setError("אירעה שגיאה בקבלת המשוב. נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  if (premiumRequired) {
    return (
      <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
        <IconBadge icon={Crown} tone="accent" className="mx-auto" />
        <p className="font-bold">שאלות הבנת נקרא פתוחות זמינות למנויי פרימיום</p>
        <p className="mt-2 text-sm text-muted">תקופת הניסיון שלכם הסתיימה. שדרגו כדי להמשיך לקבל משוב על תשובות פתוחות.</p>
        <Link
          href="/pricing"
          className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          לצפייה במסלולים
        </Link>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
        <p className="font-bold">הגעתם למגבלת התשובות היומית</p>
        <p className="mt-2 text-sm text-muted">אפשר לשלוח עד 15 תשובות פתוחות ליום. נסו שוב בעוד עד 24 שעות.</p>
      </div>
    );
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="font-bold">משוב על ההבנה שלכם</p>
            <span className="px-3 py-1 rounded-full bg-primary text-primary-ink text-sm font-bold">
              {result.score}/100
            </span>
          </div>
          <p className="mt-3 leading-relaxed">{result.feedback_he}</p>
        </div>

        {result.model_answer_en && (
          <div className="bg-success/5 border border-success/20 rounded-2xl p-6">
            <p className="font-bold text-success">דוגמה לתשובה טובה</p>
            <EnglishText as="p" className="mt-2 leading-relaxed text-left">
              {result.model_answer_en}
            </EnglishText>
          </div>
        )}

        <button
          onClick={() => {
            setResult(null);
            setText("");
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-card-border font-medium hover:bg-background-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          נסו שוב
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <p className="font-bold">שאלה פתוחה</p>
      <EnglishText as="p" className="mt-2 leading-relaxed">
        {questionEn}
      </EnglishText>
      <textarea
        dir="ltr"
        aria-label="התשובה שלכם באנגלית לשאלה הפתוחה"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitting}
        rows={5}
        placeholder="Write your answer here in English..."
        className="mt-4 w-full px-4 py-3 rounded-xl border border-card-border bg-background font-content focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-70"
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || submitting}
        className="mt-4 w-full px-4 py-3 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        {submitting ? "מנתח את ההבנה שלכם..." : "בדקו את התשובה שלי"}
      </button>
    </div>
  );
}

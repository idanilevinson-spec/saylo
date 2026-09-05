"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import IconBadge from "@/components/IconBadge";

interface WritingFeedbackResult {
  overall_score: number;
  feedback_he: string;
  improved_version: string;
}

interface WritingCoachFormProps {
  writingPromptId: string;
}

export default function WritingCoachForm({ writingPromptId }: WritingCoachFormProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedbackResult | null>(null);
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
      const res = await fetch("/api/ai/writing-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingPromptId, submittedText: text }),
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
      setFeedback(data.feedback);
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
        <p className="font-bold">Writing Coach זמין למנויי פרימיום</p>
        <p className="mt-2 text-sm text-muted">תקופת הניסיון שלכם הסתיימה. שדרגו כדי להמשיך לקבל משוב על כתיבה.</p>
        <Link
          href="/pricing"
          className="mt-4 inline-block px-6 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          לצפייה במסלולים
        </Link>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
        <p className="font-bold">הגעתם למגבלת המשובים היומית</p>
        <p className="mt-2 text-sm text-muted">אפשר לשלוח עד 15 טקסטים ליום. נסו שוב בעוד עד 24 שעות.</p>
      </div>
    );
  }

  if (feedback) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-card-border rounded-2xl p-6">
          <p className="text-sm text-muted">מה שכתבתם</p>
          <EnglishText as="p" className="mt-2 leading-relaxed text-left">
            {text}
          </EnglishText>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="font-bold">משוב</p>
            <span className="px-3 py-1 rounded-full bg-primary text-primary-ink text-sm font-bold">
              {feedback.overall_score}/100
            </span>
          </div>
          <p className="mt-3 leading-relaxed">{feedback.feedback_he}</p>
        </div>

        <div className="bg-success/5 border border-success/20 rounded-2xl p-6">
          <p className="font-bold text-success">גרסה משופרת</p>
          <EnglishText as="p" className="mt-2 leading-relaxed text-left">
            {feedback.improved_version}
          </EnglishText>
        </div>

        <button
          onClick={() => {
            setFeedback(null);
            setText("");
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-card-border font-medium hover:bg-background-2 transition-colors"
        >
          כתבו שוב
        </button>
      </div>
    );
  }

  return (
    <div>
      <textarea
        dir="ltr"
        aria-label="התשובה שלכם באנגלית"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitting}
        rows={8}
        placeholder="Write your answer here in English..."
        className="w-full px-4 py-3 rounded-xl border border-card-border bg-card font-content focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70"
      />
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || submitting}
        className="mt-4 w-full px-4 py-3 rounded-xl bg-primary text-primary-ink font-medium disabled:opacity-40 hover:bg-primary-hover transition-colors"
      >
        {submitting ? "מנתח את הכתיבה שלכם..." : "קבלו משוב"}
      </button>
    </div>
  );
}

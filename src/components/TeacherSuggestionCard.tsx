"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Lightbulb } from "lucide-react";
import { withoutLeadStep, type TeacherAction } from "@/lib/teacher/teacherActions";
import { useAiConsent } from "@/components/AiConsentGate";

import { EASE_OUT } from "@/lib/motion/easing";
// Sits under the course lead as its complement: a few minutes of review
// beside the next step, never a second "do this first". leadHref is where
// the lead already points, so no action here repeats it.
export default function TeacherSuggestionCard({ leadHref = null }: { leadHref?: string | null }) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [actions, setActions] = useState<TeacherAction[]>([]);
  const [failed, setFailed] = useState(false);
  // The suggestion is written by the AI from the learner's practice stats, so
  // it is only requested once they have agreed to that sharing.
  const consented = useAiConsent();

  useEffect(() => {
    if (!consented) return;
    fetch("/api/ai/teacher-suggestion")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        setSuggestion(data.suggestion);
        setActions(data.actions ?? []);
      })
      .catch(() => setFailed(true));
  }, [consented]);

  if (!consented || failed || !suggestion) return null;
  const shown = withoutLeadStep(actions, leadHref);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15, ease: EASE_OUT }}
      className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-5 flex items-start gap-3"
    >
      <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-hover">
        <Lightbulb size={18} />
      </span>
      <div>
        <p className="text-sm font-bold text-primary">{leadHref ? "בנוסף למסלול: חזרה קצרה מהמורה AI" : "המורה AI שלכם ממליץ"}</p>
        <p className="mt-1 leading-relaxed">{suggestion}</p>
        {shown.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {shown.map((a) => (
              <li key={a.kind}>
                <Link
                  href={a.href}
                  className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-primary/30 bg-background px-3 text-sm font-medium hover:bg-primary/10 transition-colors"
                >
                  {a.label} <ChevronLeft size={15} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

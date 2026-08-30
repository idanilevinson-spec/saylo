"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function TeacherSuggestionCard() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/ai/teacher-suggestion")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => setSuggestion(data.suggestion))
      .catch(() => setFailed(true));
  }, []);

  if (failed || !suggestion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-3"
    >
      <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Lightbulb size={18} />
      </span>
      <div>
        <p className="text-sm font-bold text-primary">המורה AI שלכם ממליץ</p>
        <p className="mt-1 leading-relaxed">{suggestion}</p>
      </div>
    </motion.div>
  );
}

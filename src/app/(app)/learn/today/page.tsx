"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, PenLine, Sparkles } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import MotionLink from "@/components/MotionLink";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { pickDailyLessonTopic, type TopicWithMastery } from "@/lib/content/topicMastery";
import type { CefrLevel } from "@/types/database";

export default function DailyLessonPage() {
  const { profile, loading } = useAuth();
  const [topic, setTopic] = useState<TopicWithMastery | null | undefined>(undefined);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("skill_levels")
      .select("skill, cefr_level")
      .eq("profile_id", profile.id)
      .then(({ data }) => {
        const levels: { vocabulary?: CefrLevel; grammar?: CefrLevel } = {};
        for (const row of data ?? []) {
          if (row.skill === "vocabulary") levels.vocabulary = row.cefr_level as CefrLevel;
          if (row.skill === "grammar") levels.grammar = row.cefr_level as CefrLevel;
        }
        return pickDailyLessonTopic(profile.id, levels);
      })
      .then(setTopic);
  }, [profile]);

  if (loading || topic === undefined) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען את השיעור שלכם...</div>
    );
  }

  if (topic === null) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">
        עוד אין מספיק תוכן לשיעור יומי — חזרו בקרוב.
      </div>
    );
  }

  const Icon = topic.kind === "vocabulary" ? BookOpen : PenLine;
  const kindLabel = topic.kind === "vocabulary" ? "אוצר מילים" : "דקדוק";
  const reason =
    topic.status === "in_progress"
      ? `כבר התחלתם את הנושא הזה (${topic.accuracy}% הצלחה) — בואו נשלים אותו`
      : "נבחר בשבילכם לפי מבחן הרמה שלכם";

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <span className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-accent/15 text-accent-hover">
          <Sparkles size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-bold">השיעור היומי שלכם</h1>
        <p className="mt-1 text-sm text-muted">{new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, type: "spring", bounce: 0.35 }}
        className="mt-8 bg-card border border-card-border rounded-2xl p-6 sm:p-8"
      >
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">{kindLabel}</p>
            <p className="font-bold text-lg truncate">{topic.name_he}</p>
            <EnglishText as="p" className="text-sm text-muted">
              {topic.name_en}
            </EnglishText>
          </div>
          <CefrBadge level={topic.cefr_level} />
        </div>

        <p className="mt-4 text-sm text-muted">{reason}</p>

        <MotionLink
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href={topic.href}
          className="mt-6 block text-center px-5 py-3 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
        >
          התחילו את השיעור →
        </MotionLink>
      </motion.div>

      <p className="mt-4 text-center text-xs text-muted">שיעור חדש יבחר בשבילכם כל יום</p>
    </div>
  );
}

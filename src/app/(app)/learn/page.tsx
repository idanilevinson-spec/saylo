"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, CircleDot, Sparkles } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ContentCard from "@/components/ContentCard";
import MotionLink from "@/components/MotionLink";
import { useAuth } from "@/context/AuthProvider";
import { listTopicsWithMastery, type TopicWithMastery } from "@/lib/content/topicMastery";
import { getTopicIcon } from "@/lib/content/topicIcons";

const STATUS_META = {
  not_started: { icon: Circle, className: "text-muted" },
  in_progress: { icon: CircleDot, className: "text-accent-hover" },
  mastered: { icon: CheckCircle2, className: "text-success" },
} as const;

export default function LearnPage() {
  const { profile, loading } = useAuth();
  const [entries, setEntries] = useState<TopicWithMastery[] | null>(null);

  useEffect(() => {
    if (!profile) return;
    listTopicsWithMastery(profile.id).then(setEntries);
  }, [profile]);

  if (loading || entries === null) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-9 w-56 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-6 h-24 rounded-2xl bg-background-2 animate-pulse" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-background-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const masteredCount = entries.filter((e) => e.status === "mastered").length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold">מסלול הלימוד שלי</h1>
        <p className="mt-2 text-muted">
          כל הנושאים, מהבסיס ועד המתקדם — {masteredCount} מתוך {entries.length} כבר בשליטה מלאה.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <MotionLink
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          href="/learn/today"
          className="mt-6 flex items-center gap-4 p-5 rounded-2xl border border-accent/30 bg-accent/5 hover:border-accent/50 transition-colors"
        >
          <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-hover">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="font-bold">השיעור היומי שלכם</p>
            <p className="text-sm text-muted mt-0.5">נושא אחד, נבחר במיוחד בשבילכם לפי מבחן הרמה וההתקדמות שלכם</p>
          </div>
        </MotionLink>
      </motion.div>

      {entries.length === 0 ? (
        <p className="mt-10 text-muted">התוכן בדרך — חזרו לבדוק בקרוב.</p>
      ) : (
        <ol className="mt-6 space-y-3">
          {entries.map((entry, i) => {
            const Icon = getTopicIcon(entry.kind, entry.slug);
            const status = STATUS_META[entry.status];
            const StatusIcon = status.icon;
            return (
              <li key={entry.id}>
                <ContentCard href={entry.href} index={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon size={18} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium truncate">{entry.name_he}</span>
                      <span className="mt-1.5 flex flex-col items-start gap-1">
                        <EnglishText as="span" className="text-xs font-medium tracking-tight text-foreground/60 truncate">
                          {entry.name_en}
                          {entry.accuracy !== null && ` · ${entry.accuracy}%`}
                        </EnglishText>
                        <CefrBadge level={entry.cefr_level} />
                      </span>
                    </span>
                    <StatusIcon size={20} className={`shrink-0 ${status.className}`} aria-label={entry.status} />
                  </div>
                </ContentCard>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

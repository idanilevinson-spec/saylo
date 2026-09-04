"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardCheck, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { buildVocabTest, type VocabularyItemLite, type TestStep } from "@/lib/games/testContent";
import VocabTest from "@/components/VocabTest";
import IconBadge from "@/components/IconBadge";
import type { Topic } from "@/types/database";

const MIN_POOL_SIZE = 8;

type Phase = "picker" | "generating" | "ready" | "empty";

// useSearchParams() (for the ?topic= deep link from the vocabulary topic
// page) needs a Suspense boundary on this route since it has no dynamic
// segment of its own, so Next tries to statically prerender it.
export default function VocabTestPage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>}>
      <VocabTestPageInner />
    </Suspense>
  );
}

function VocabTestPageInner() {
  const { profile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialTopicSlug = searchParams.get("topic");

  const [phase, setPhase] = useState<Phase>("picker");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [steps, setSteps] = useState<TestStep[]>([]);

  useEffect(() => {
    supabase
      .from("topics")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
      .then(({ data }) => setTopics(data ?? []));
  }, []);

  useEffect(() => {
    if (initialTopicSlug && topics.length > 0) {
      const topic = topics.find((t) => t.slug === initialTopicSlug);
      if (topic) generate(topic.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopicSlug, topics]);

  async function generate(topicId?: string) {
    if (!profile) return;
    setPhase("generating");
    let query = supabase.from("vocabulary_items").select("id, headword, translation_he").eq("status", "published");
    if (topicId) query = query.eq("topic_id", topicId);
    else query = query.eq("cefr_level", (await currentLevel(profile.id)) ?? "A1");
    const { data } = await query.limit(200);
    const pool = (data ?? []) as VocabularyItemLite[];
    if (pool.length < MIN_POOL_SIZE) {
      setPhase("empty");
      return;
    }
    setSteps(buildVocabTest(pool));
    setPhase("ready");
  }

  async function currentLevel(profileId: string): Promise<string | null> {
    const { data } = await supabase
      .from("skill_levels")
      .select("cefr_level")
      .eq("profile_id", profileId)
      .eq("skill", "vocabulary")
      .maybeSingle();
    return data?.cefr_level ?? null;
  }

  if (authLoading) {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">טוען...</div>;
  }

  if (phase === "ready") {
    return <VocabTest steps={steps} />;
  }

  if (phase === "generating") {
    return <div className="max-w-xl mx-auto px-4 py-24 text-center text-muted">בונים לכם מבחן...</div>;
  }

  if (phase === "empty") {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <IconBadge icon={ClipboardCheck} tone="accent" className="mx-auto" />
        <h1 className="text-2xl font-bold">אין עדיין מספיק מילים למבחן</h1>
        <p className="mt-2 text-muted">תרגלו כמה נושאי אוצר מילים קודם, ותחזרו הנה.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover mb-2">מבחן תרגול</span>
        <h1 className="text-3xl font-bold">בחרו נושא למבחן</h1>
        <p className="mt-2 text-muted">מבחן אחד מלא — רב-ברירה, השלמת מילה ונכון/לא נכון — עם סיכום וציון בסוף.</p>
      </motion.div>

      <button
        onClick={() => generate()}
        className="mt-6 w-full flex items-center gap-4 bg-gradient-to-l from-primary/10 to-accent/10 border border-primary/25 rounded-2xl p-5 hover:border-primary/45 hover:shadow-md transition-all text-right"
      >
        <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Layers size={22} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold">כל הרמה שלי</h2>
          <p className="mt-0.5 text-sm text-muted">מבחן שמערבב מילים מכל הנושאים ברמה הנוכחית שלכם</p>
        </div>
      </button>

      <div className="mt-6 space-y-3">
        {topics.map((topic, i) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            onClick={() => generate(topic.id)}
            className="w-full flex items-center justify-between gap-3 bg-card border border-card-border rounded-2xl p-4 hover:border-primary/40 transition-colors text-right"
          >
            <div>
              <p className="font-bold">{topic.name_he}</p>
              <p className="mt-0.5 text-sm text-muted">{topic.name_en}</p>
            </div>
            <ClipboardCheck size={18} className="text-muted shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

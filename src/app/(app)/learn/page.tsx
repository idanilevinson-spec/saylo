"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Map as MapIcon, Sparkles, ChevronLeft, CheckCircle2, CircleDot } from "lucide-react";
import AreaHeader from "@/components/content/AreaHeader";
import LevelShelves from "@/components/content/LevelShelves";
import TopicTile from "@/components/content/TopicTile";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabase/browserClient";
import { listTopicsWithMastery, type TopicWithMastery } from "@/lib/content/topicMastery";
import { overallLevel } from "@/lib/content/levelOrder";
import type { CefrLevel, SkillArea } from "@/types/database";

// Every vocabulary and grammar topic, arranged around the learner's level
// like the other areas — not one long A1-to-C2 list to scroll through.
export default function LearnPage() {
  const { profile, loading } = useAuth();
  const [entries, setEntries] = useState<TopicWithMastery[] | null>(null);
  const [level, setLevel] = useState<CefrLevel | null>(null);

  useEffect(() => {
    if (!profile) return;
    listTopicsWithMastery(profile.id).then(setEntries);
    Promise.all([
      supabase
        .from("placement_tests")
        .select("result_cefr_overall")
        .eq("profile_id", profile.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("skill_levels").select("skill, cefr_level").eq("profile_id", profile.id),
    ]).then(([placement, skills]) => {
      const bySkill: Partial<Record<SkillArea, CefrLevel>> = {};
      for (const s of skills.data ?? []) bySkill[s.skill as SkillArea] = s.cefr_level as CefrLevel;
      setLevel(overallLevel((placement.data?.result_cefr_overall as CefrLevel | null) ?? null, bySkill));
    });
  }, [profile]);

  if (loading || entries === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
        <div className="h-24 rounded-lg bg-background-2 animate-pulse" />
        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-background-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const mastered = entries.filter((e) => e.status === "mastered").length;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <AreaHeader
        icon={MapIcon}
        title="מסלול הלימוד"
        description={`כל נושאי אוצר המילים והדקדוק. ${mastered} מתוך ${entries.length} כבר בשליטה מלאה.`}
        level={level}
        levelLabel="הרמה שלכם"
      />

      <Link
        href="/learn/today"
        className="game-press group mt-8 flex items-center gap-4 rounded-lg border border-card-border bg-card p-4 transition-[border-color,transform] duration-150 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-ink">
          <Sparkles size={20} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">השיעור היומי</span>
          <span className="block text-sm text-muted">נושא אחד שנבחר לפי הרמה וההתקדמות שלכם</span>
        </span>
        <ChevronLeft size={18} aria-hidden="true" className="shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
      </Link>

      <div className="mt-10">
        {entries.length === 0 ? (
          <p className="text-muted">התוכן בדרך. כדאי לחזור לבדוק בקרוב.</p>
        ) : (
          <LevelShelves
            items={entries}
            level={level}
            levelOf={(e) => e.cefr_level}
            keyOf={(e) => `${e.kind}-${e.id}`}
            renderItem={(e) => (
              <TopicTile
                href={e.href}
                titleEn={e.name_en}
                titleHe={e.name_he}
                level={e.cefr_level}
                done={e.status === "mastered"}
                meta={
                  <>
                    <span>{e.kind === "grammar" ? "דקדוק" : "אוצר מילים"}</span>
                    {e.status === "mastered" ? (
                      <span className="inline-flex items-center gap-1 font-medium text-success">
                        <CheckCircle2 size={12} aria-hidden="true" /> בשליטה · {e.accuracy}%
                      </span>
                    ) : e.status === "in_progress" ? (
                      <span className="inline-flex items-center gap-1 font-medium text-accent-hover">
                        <CircleDot size={12} aria-hidden="true" /> בתהליך · {e.accuracy}%
                      </span>
                    ) : (
                      <span>עוד לא התחלתם</span>
                    )}
                  </>
                }
              />
            )}
          />
        )}
      </div>
    </div>
  );
}

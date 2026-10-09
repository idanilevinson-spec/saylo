import type { Metadata } from "next";
import { NotebookPen } from "lucide-react";
import AreaHeader from "@/components/content/AreaHeader";
import LevelShelves from "@/components/content/LevelShelves";
import TopicTile from "@/components/content/TopicTile";
import { createClient } from "@/lib/supabase/serverClient";
import { getLearnerLevels, levelFor } from "@/lib/content/learnerLevel";
import type { WritingPrompt } from "@/types/database";

export const metadata: Metadata = {
  title: "כתיבה — Saylo",
};

export default async function WritingPage() {
  const supabase = await createClient();
  const [{ data }, levels] = await Promise.all([
    supabase.from("writing_prompts").select("*").eq("status", "published").order("sort_order"),
    getLearnerLevels(),
  ]);
  const prompts: WritingPrompt[] = data ?? [];
  const level = levelFor(levels, "writing");

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <AreaHeader
        icon={NotebookPen}
        title="כתיבה"
        description="כותבים טקסט קצר באנגלית ומקבלים משוב אישי: מה עבד, מה לתקן, ואיך לנסח טוב יותר."
        level={level}
        levelLabel="הרמה שלכם בכתיבה"
        signedIn={levels.signedIn}
      />
      <div className="mt-10">
        {prompts.length === 0 ? (
          <p className="text-muted">אין עדיין נושאי כתיבה זמינים — יתווספו בקרוב.</p>
        ) : (
          <LevelShelves
            items={prompts}
            level={level}
            levelOf={(p) => p.cefr_level}
            keyOf={(p) => p.id}
            renderItem={(p) => <TopicTile href={`/writing/${p.id}`} titleEn={p.prompt_en} titleHe={p.title_he} level={p.cefr_level} />}
          />
        )}
      </div>
    </div>
  );
}

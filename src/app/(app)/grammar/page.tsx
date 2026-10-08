import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import AreaHeader from "@/components/content/AreaHeader";
import LevelShelves from "@/components/content/LevelShelves";
import TopicTile from "@/components/content/TopicTile";
import { listGrammarTopics } from "@/lib/content/grammar";
import { getLearnerLevels, levelFor } from "@/lib/content/learnerLevel";

export const metadata: Metadata = {
  title: "דקדוק — Saylo",
};

export default async function GrammarPage() {
  const [topics, levels] = await Promise.all([listGrammarTopics(), getLearnerLevels()]);
  const level = levelFor(levels, "grammar");

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <AreaHeader
        icon={PenLine}
        title="דקדוק"
        description="כל נושא עם הסבר קצר בעברית, דוגמאות, ותרגול של השלמה וסידור משפטים."
        level={level}
        levelLabel="הרמה שלכם בדקדוק"
        signedIn={levels.signedIn}
      />
      <div className="mt-10">
        {topics.length === 0 ? (
          <p className="text-muted">אין עדיין שיעורים זמינים — יתווספו בקרוב.</p>
        ) : (
          <LevelShelves
            items={topics}
            level={level}
            levelOf={(t) => t.cefr_level}
            keyOf={(t) => t.id}
            renderItem={(t) => <TopicTile href={`/grammar/${t.slug}`} titleEn={t.name_en} titleHe={t.name_he} level={t.cefr_level} />}
          />
        )}
      </div>
    </div>
  );
}

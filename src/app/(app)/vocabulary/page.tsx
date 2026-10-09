import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import AreaHeader from "@/components/content/AreaHeader";
import LevelShelves from "@/components/content/LevelShelves";
import TopicTile from "@/components/content/TopicTile";
import { listVocabularyTopics } from "@/lib/content/vocabulary";
import { getLearnerLevels, levelFor } from "@/lib/content/learnerLevel";

export const metadata: Metadata = {
  title: "אוצר מילים — Saylo",
};

export default async function VocabularyPage() {
  const [topics, levels] = await Promise.all([listVocabularyTopics(), getLearnerLevels()]);
  const level = levelFor(levels, "vocabulary");

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <AreaHeader
        icon={BookOpen}
        title="אוצר מילים"
        description="מילים לפי נושא, עם הגייה ומשפט לדוגמה. מילה שטעיתם בה חוזרת אליכם בחזרה החכמה."
        level={level}
        levelLabel="הרמה שלכם באוצר מילים"
        signedIn={levels.signedIn}
      />
      <div className="mt-10">
        {topics.length === 0 ? (
          <p className="text-muted">אין עדיין נושאים זמינים — יתווספו בקרוב.</p>
        ) : (
          <LevelShelves
            items={topics}
            level={level}
            levelOf={(t) => t.cefr_level}
            keyOf={(t) => t.id}
            gridClassName="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
            renderItem={(t) => <TopicTile href={`/vocabulary/${t.slug}`} titleEn={t.name_en} titleHe={t.name_he} level={t.cefr_level} />}
          />
        )}
      </div>
    </div>
  );
}

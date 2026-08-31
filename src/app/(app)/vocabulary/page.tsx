import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ContentCard from "@/components/ContentCard";
import { listVocabularyTopics } from "@/lib/content/vocabulary";

export const metadata: Metadata = {
  title: "אוצר מילים — Saylo",
};

export default async function VocabularyPage() {
  const topics = await listVocabularyTopics();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">אוצר מילים</h1>
        <p className="mt-2 text-muted">בחרו נושא כדי להתחיל ללמוד מילים חדשות</p>
      </div>

      {topics.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין נושאים זמינים — יתווספו בקרוב.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic, i) => (
            <ContentCard key={topic.id} href={`/vocabulary/${topic.slug}`} index={i}>
              <h2 className="font-bold text-lg">{topic.name_he}</h2>
              <div className="mt-3 flex flex-col items-start gap-1.5">
                <EnglishText as="span" className="text-sm font-medium tracking-tight text-foreground/70">
                  {topic.name_en}
                </EnglishText>
                <CefrBadge level={topic.cefr_level} />
              </div>
            </ContentCard>
          ))}
        </div>
      )}
    </div>
  );
}

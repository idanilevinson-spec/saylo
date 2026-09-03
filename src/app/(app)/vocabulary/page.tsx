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
      <div className="relative -mx-4 px-4 pb-2 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 h-48 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 20% 30%, color-mix(in srgb, var(--primary) 11%, transparent) 0%, transparent 65%), radial-gradient(ellipse 45% 100% at 85% 10%, color-mix(in srgb, var(--accent) 9%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="animate-fade-up">
          <span className="block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover mb-2">בניית אוצר מילים</span>
          <h1 className="text-3xl font-bold">אוצר מילים</h1>
          <p className="mt-2 text-muted">בחרו נושא כדי להתחיל ללמוד מילים חדשות</p>
        </div>
      </div>

      {topics.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין נושאים זמינים — יתווספו בקרוב.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic, i) => (
            <ContentCard key={topic.id} href={`/vocabulary/${topic.slug}`} index={i}>
              <div className="flex flex-col items-start gap-1.5">
                <EnglishText as="h2" className="text-lg font-bold">
                  {topic.name_en}
                </EnglishText>
                <p className="text-sm font-medium text-foreground/70">{topic.name_he}</p>
                <CefrBadge level={topic.cefr_level} />
              </div>
            </ContentCard>
          ))}
        </div>
      )}
    </div>
  );
}

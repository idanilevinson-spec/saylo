import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import CefrBadge from "@/components/CefrBadge";
import ContentCard from "@/components/ContentCard";
import { listReadingTexts } from "@/lib/content/reading";

export const metadata: Metadata = {
  title: "קריאה — Saylo",
};

export default async function ReadingPage() {
  const texts = await listReadingTexts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">קריאה</h1>
        <p className="mt-2 text-muted">לחצו על כל מילה מוכרת בטקסט כדי לראות תרגום והגייה</p>
      </div>

      {texts.length === 0 ? (
        <p className="mt-10 text-muted">אין עדיין טקסטים זמינים — יתווספו בקרוב.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {texts.map((text, i) => (
            <ContentCard key={text.id} href={`/reading/${text.id}`} index={i}>
              <h2 className="font-bold text-lg">{text.title_he}</h2>
              <div className="mt-3 flex flex-col items-start gap-1.5">
                <EnglishText as="span" className="text-sm font-medium tracking-tight text-foreground/70">
                  {text.title_en}
                </EnglishText>
                <CefrBadge level={text.cefr_level} />
              </div>
            </ContentCard>
          ))}
        </div>
      )}
    </div>
  );
}

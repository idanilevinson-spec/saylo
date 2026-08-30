import type { Metadata } from "next";
import EnglishText from "@/components/EnglishText";
import ContentCard from "@/components/ContentCard";
import { listIdiomsAndPhrasalVerbs } from "@/lib/content/idioms";

export const metadata: Metadata = {
  title: "ניבים ופעלים דו-מיליים — Saylo",
};

export default async function IdiomsPage() {
  const all = await listIdiomsAndPhrasalVerbs();
  const phrasalVerbs = all.filter((i) => i.type === "phrasal_verb");
  const idioms = all.filter((i) => i.type === "idiom");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">ניבים ופעלים דו-מיליים</h1>
        <p className="mt-2 text-muted">אנגלית שאנשים באמת מדברים — לא רק מה שכתוב בספר הדקדוק</p>
      </div>

      <h2 className="mt-10 text-lg font-bold text-muted">Phrasal Verbs</h2>
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        {phrasalVerbs.map((item, i) => (
          <ContentCard key={item.id} index={i}>
            <EnglishText as="p" className="text-lg font-bold text-primary">
              {item.phrase}
            </EnglishText>
            <p className="mt-1 font-medium">{item.meaning_he}</p>
            <EnglishText as="p" className="mt-2 text-sm text-muted">
              {item.example_en}
            </EnglishText>
          </ContentCard>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold text-muted">Idioms</h2>
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        {idioms.map((item, i) => (
          <ContentCard key={item.id} index={i}>
            <EnglishText as="p" className="text-lg font-bold text-primary">
              {item.phrase}
            </EnglishText>
            <p className="mt-1 font-medium">{item.meaning_he}</p>
            <EnglishText as="p" className="mt-2 text-sm text-muted">
              {item.example_en}
            </EnglishText>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}

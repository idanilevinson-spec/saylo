import type { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import ContentCard from "@/components/ContentCard";
import MotionLink from "@/components/MotionLink";
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
      <div className="relative -mx-4 px-4 pb-2 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 h-48 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 20% 30%, color-mix(in srgb, var(--primary) 11%, transparent) 0%, transparent 65%), radial-gradient(ellipse 45% 100% at 85% 10%, color-mix(in srgb, var(--accent) 9%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="animate-fade-up flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover mb-2">שפה יומיומית</span>
            <h1 className="text-3xl font-bold">ניבים ופעלים דו-מיליים</h1>
            <p className="mt-2 text-muted">אנגלית שאנשים באמת מדברים — לא רק מה שכתוב בספר הדקדוק</p>
          </div>
          <MotionLink
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="/idioms/practice"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
          >
            תרגלו את הניבים <Gamepad2 size={16} />
          </MotionLink>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-bold text-muted">Phrasal Verbs</h2>
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        {phrasalVerbs.map((item, i) => (
          <ContentCard key={item.id} index={i}>
            <EnglishText as="p" className="text-lg font-bold text-primary">
              {item.phrase}
            </EnglishText>
            <p className="mt-1 font-pen text-lg text-accent-hover">{item.meaning_he}</p>
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
            <p className="mt-1 font-pen text-lg text-accent-hover">{item.meaning_he}</p>
            <EnglishText as="p" className="mt-2 text-sm text-muted">
              {item.example_en}
            </EnglishText>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}

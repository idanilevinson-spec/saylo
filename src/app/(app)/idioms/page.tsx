import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, Quote } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import AreaHeader from "@/components/content/AreaHeader";
import LevelShelves from "@/components/content/LevelShelves";
import { listIdiomsAndPhrasalVerbs } from "@/lib/content/idioms";
import { getLearnerLevels, levelFor } from "@/lib/content/learnerLevel";
import type { IdiomPhrasalVerb } from "@/types/database";

export const metadata: Metadata = {
  title: "ניבים ופעלים דו-מיליים — Saylo",
};

function PhraseCard({ item }: { item: IdiomPhrasalVerb }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-card-border bg-card p-4">
      <span className="flex items-start justify-between gap-3">
        <EnglishText as="span" className="block text-right text-lg font-bold text-primary leading-snug">
          {item.phrase}
        </EnglishText>
        <span className="shrink-0 rounded-md bg-background-2 px-1.5 py-0.5 text-[0.7rem] font-bold text-muted">
          {item.type === "phrasal_verb" ? "פועל דו-מילי" : "ניב"}
        </span>
      </span>
      <span className="mt-1 font-bold">{item.meaning_he}</span>
      <EnglishText as="span" className="mt-2 block text-right text-sm text-muted leading-relaxed">
        {item.example_en}
      </EnglishText>
    </div>
  );
}

export default async function IdiomsPage() {
  const [all, levels] = await Promise.all([listIdiomsAndPhrasalVerbs(), getLearnerLevels()]);
  // Idioms live between vocabulary and speaking; the vocabulary level is
  // the closer measure of whether a phrase will be within reach.
  const level = levelFor(levels, "vocabulary");

  return (
    <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <AreaHeader
        icon={Quote}
        title="ניבים ופעלים דו-מיליים"
        description="אנגלית שאנשים באמת מדברים, לא רק מה שכתוב בספר הדקדוק: המשמעות בעברית ומשפט לדוגמה."
        level={level}
        levelLabel="הרמה שלכם באוצר מילים"
        signedIn={levels.signedIn}
        actions={
          <Link
            href="/idioms/practice"
            className="game-press inline-flex items-center gap-2 min-h-11 px-5 rounded-lg bg-primary text-primary-ink font-bold hover:bg-primary-hover transition-[background-color,transform] duration-150"
          >
            <Gamepad2 size={17} aria-hidden="true" /> לתרגל את הניבים
          </Link>
        }
      />
      <div className="mt-10">
        <LevelShelves
          items={all}
          level={level}
          levelOf={(i) => i.cefr_level}
          keyOf={(i) => i.id}
          renderItem={(i) => <PhraseCard item={i} />}
        />
      </div>
    </div>
  );
}

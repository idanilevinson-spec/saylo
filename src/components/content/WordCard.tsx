import type { ReactNode } from "react";
import SpeakButton from "@/components/SpeakButton";
import PronunciationRecorder from "@/components/PronunciationRecorder";
import type { VocabularyItem } from "@/types/database";

const POS_HE: Record<string, string> = {
  noun: "שם עצם",
  verb: "פועל",
  adjective: "תואר",
  adverb: "תואר הפועל",
  preposition: "מילת יחס",
  conjunction: "מילת חיבור",
  pronoun: "כינוי",
  phrase: "צירוף",
};

// The word, bold, inside its own example — matching the start of each
// word ("resigned" for "resign", "fries" won't match "fry", that's fine).
function highlight(example: string, headword: string): ReactNode {
  const stem = headword.toLowerCase().split(" ")[0];
  const key = stem.length > 4 ? stem.slice(0, stem.length - 1) : stem;
  const parts = example.split(/(\s+)/);
  let done = false;
  return parts.map((part, i) => {
    if (!done && part.toLowerCase().replace(/[^a-z'-]/g, "").startsWith(key)) {
      done = true;
      return (
        <strong key={i} className="font-bold text-foreground">
          {part}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// One word in a vocabulary topic: how it's said, what kind of word it is,
// what it means in Hebrew and in English, and the word in a sentence —
// each shown once, with listening and speaking right there.
export default function WordCard({ item }: { item: VocabularyItem }) {
  const pos = item.part_of_speech ? (POS_HE[item.part_of_speech] ?? item.part_of_speech) : null;
  return (
    <article className="flex h-full flex-col rounded-lg border border-card-border bg-card p-4 sm:p-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-lg font-black leading-tight">{item.translation_he}</p>
          {pos && <p className="mt-0.5 text-xs text-muted">{pos}</p>}
        </div>
        <div dir="ltr" lang="en" className="min-w-0 text-left">
          <p className="flex items-center gap-2">
            <span className="text-2xl font-bold leading-tight text-primary font-content">{item.headword}</span>
            <SpeakButton text={item.headword} className="p-1 -m-1 rounded-md" />
          </p>
          {item.ipa && <p className="text-sm text-muted font-content">{item.ipa}</p>}
        </div>
      </header>

      {item.definition_en && (
        <p dir="ltr" lang="en" className="mt-3 text-left text-sm text-muted font-content leading-relaxed">
          {item.definition_en}
        </p>
      )}

      <div className="mt-auto pt-4">
        <p dir="ltr" lang="en" className="flex items-start gap-2 border-s-2 border-primary/50 ps-3 text-left font-content leading-relaxed text-foreground/85">
          <span className="flex-1">{highlight(item.example_en, item.headword)}</span>
          <SpeakButton text={item.example_en} className="mt-1 p-1 -m-1 rounded-md" />
        </p>
        <div className="mt-3">
          <PronunciationRecorder targetPhrase={item.example_en} hidePhrase />
        </div>
      </div>
    </article>
  );
}

import type { FillBlankContent } from "@/types/exercises";

// After a wrong fill-in: the whole sentence with the right answer in place,
// and the rule behind it (the item's hint), so "not quite" comes with a why.
export default function FillBlankExplanation({ content }: { content: FillBlankContent }) {
  const [before, after = ""] = content.sentence.split("___");
  return (
    <div className="mt-1.5 space-y-1 text-sm">
      <p dir="ltr" lang="en" className="text-left font-content">
        {before}
        <strong className="rounded bg-success/15 px-1 font-bold">{content.correctAnswer}</strong>
        {after}
      </p>
      {content.hint && (
        <p className="text-muted">
          למה: <span className="text-foreground">{content.hint}</span>
        </p>
      )}
    </div>
  );
}

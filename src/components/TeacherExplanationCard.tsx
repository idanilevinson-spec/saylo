import { Presentation } from "lucide-react";

interface TeacherExplanationCardProps {
  text: string;
}

// Server-renderable (no client state) — the text is generated once per
// topic and cached (see src/lib/ai/topicIntro.ts), so the page just passes
// in a plain string. Same "teacher" visual language as TeacherSuggestionCard,
// sized as a full-width page section rather than a small dashboard aside.
// unicode-bidi: plaintext lets inline English words (e.g. "one (אחת)") pick
// their own direction instead of being forced into the page's RTL flow —
// same treatment GrammarLessonContent uses for mixed-language prose.
export default function TeacherExplanationCard({ text }: TeacherExplanationCardProps) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 flex items-start gap-3">
      <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Presentation size={18} />
      </span>
      <div>
        <p className="text-sm font-bold text-primary">המורה AI מסביר</p>
        <p className="mt-1 leading-relaxed" style={{ unicodeBidi: "plaintext" }}>
          {text}
        </p>
      </div>
    </div>
  );
}

import { ArrowRight } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import MixedText from "@/components/MixedText";
import type { ConversationFix } from "@/lib/ai/conversationFix";

// The teacher's correction of the message above it, kept on screen: the
// spoken reply mentions it once and moves on, this is what the learner can
// look back at. What they said, what to say instead, and why in Hebrew.
export default function CorrectionCard({ fix }: { fix: ConversationFix }) {
  return (
    <div className="mt-1.5 w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm">
      <p className="text-xs font-bold text-muted">תיקון</p>
      <div dir="ltr" className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        <EnglishText className="text-danger line-through decoration-danger/60">{fix.original}</EnglishText>
        <ArrowRight size={14} aria-hidden="true" className="text-muted" />
        <EnglishText className="font-bold text-success">{fix.better}</EnglishText>
      </div>
      {fix.why && (
        <p className="mt-1 text-muted">
          <MixedText>{fix.why}</MixedText>
        </p>
      )}
    </div>
  );
}

import { BAGRUT_AI_CONTENT_DISCLAIMER } from "@/lib/content/bagrut/sampleUnits";

// The Bagrut area's disclosure: who made the content and that it isn't
// official. Small print at the end of a page, not a warning box at the top.
export default function BagrutCredit({ className = "" }: { className?: string }) {
  return <p className={`text-[11px] leading-relaxed text-muted/80 ${className}`}>{BAGRUT_AI_CONTENT_DISCLAIMER}</p>;
}

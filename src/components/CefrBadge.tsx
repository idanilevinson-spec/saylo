import EnglishText from "@/components/EnglishText";
import type { CefrLevel } from "@/types/database";

// Dashed border echoes the CEFR "passport stamps" on the landing page —
// every level badge in the app is a small stamp from the same set,
// scaled down to stay legible inline in dense lists.
export default function CefrBadge({ level }: { level: CefrLevel }) {
  return (
    <EnglishText
      as="span"
      className="inline-block px-2 py-0.5 rounded-full border border-dashed border-primary/50 text-primary text-xs font-bold"
    >
      {level}
    </EnglishText>
  );
}

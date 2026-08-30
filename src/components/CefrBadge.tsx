import EnglishText from "@/components/EnglishText";
import type { CefrLevel } from "@/types/database";

export default function CefrBadge({ level }: { level: CefrLevel }) {
  return (
    <EnglishText
      as="span"
      className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold"
    >
      {level}
    </EnglishText>
  );
}

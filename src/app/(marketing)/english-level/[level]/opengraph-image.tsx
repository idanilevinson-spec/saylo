import { shareCard, OG_SIZE } from "@/lib/og/card";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import type { CefrLevel } from "@/types/database";

export const alt = "אנגלית לפי רמת CEFR";
export const size = OG_SIZE;
export const contentType = "image/png";

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function generateStaticParams() {
  return LEVELS.map((l) => ({ level: l.toLowerCase() }));
}

export default async function Image({ params }: { params: Promise<{ level: string }> }) {
  const level = (await params).level.toUpperCase() as CefrLevel;
  if (!LEVELS.includes(level)) return shareCard({ title: "אנגלית לפי רמה", subtitle: "A1 עד C2 לפי הסולם הבינלאומי CEFR" });
  return shareCard({
    title: "אנגלית ברמה הזו",
    subtitle: `${CEFR_NAME_HE[level]}: מה יודעים לעשות, ומילים, דקדוק וטקסטים שלומדים ברמה`,
    badge: level,
  });
}

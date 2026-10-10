import { shareCard, OG_SIZE } from "@/lib/og/card";
import { getPublicVocabulary, listPublicVocabulary } from "@/lib/content/publicVocabulary";

export const alt = "אוצר מילים באנגלית";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await listPublicVocabulary()).map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const topic = await getPublicVocabulary((await params).slug);
  if (!topic) return shareCard({ title: "אוצר מילים באנגלית", subtitle: "לפי נושא ורמה" });
  return shareCard({
    title: `${topic.name_he} באנגלית`,
    subtitle: `${topic.wordCount} מילים עם תרגום, הגייה ומשפט לדוגמה`,
    badge: topic.cefr_level,
  });
}

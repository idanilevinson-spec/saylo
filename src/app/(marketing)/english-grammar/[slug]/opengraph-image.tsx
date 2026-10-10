import { shareCard, OG_SIZE } from "@/lib/og/card";
import { getPublicGrammar, listPublicGrammar } from "@/lib/content/publicGrammar";

export const alt = "הסבר דקדוק באנגלית";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await listPublicGrammar()).map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const topic = await getPublicGrammar((await params).slug);
  if (!topic) return shareCard({ title: "דקדוק באנגלית", subtitle: "הסברים בעברית לפי רמה" });
  return shareCard({
    title: topic.name_he,
    subtitle: `${topic.name_en}: הסבר בעברית, דוגמאות והטעויות הנפוצות`,
    badge: topic.cefr_level,
  });
}

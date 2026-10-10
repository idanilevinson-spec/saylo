import { shareCard, OG_SIZE } from "@/lib/og/card";
import { getPublicReading, listPublicReading } from "@/lib/content/publicReading";

export const alt = "קטע קריאה באנגלית";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await listPublicReading()).map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const text = await getPublicReading((await params).slug);
  if (!text) return shareCard({ title: "קטעי קריאה באנגלית", subtitle: "לפי רמה, עם שאלות הבנה" });
  return shareCard({
    title: text.title_he,
    subtitle: `${text.title_en}: קטע קריאה עם ${text.questions.length} שאלות הבנה`,
    badge: text.cefr_level,
  });
}

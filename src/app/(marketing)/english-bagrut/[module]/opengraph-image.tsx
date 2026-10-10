import { shareCard, OG_SIZE } from "@/lib/og/card";
import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "@/lib/content/bagrut/moduleFormats";

export const alt = "שאלון בבגרות באנגלית";
export const size = OG_SIZE;
export const contentType = "image/png";

const CODES: BagrutModuleCode[] = ["A", "B", "C", "D", "E", "F", "G"];

export function generateStaticParams() {
  return CODES.map((c) => ({ module: c.toLowerCase() }));
}

export default async function Image({ params }: { params: Promise<{ module: string }> }) {
  const code = (await params).module.toUpperCase() as BagrutModuleCode;
  const f = BAGRUT_MODULE_FORMATS[code];
  if (!f) return shareCard({ title: "הכנה לבגרות באנגלית", subtitle: "3, 4 ו-5 יח״ל" });
  const tracks = f.studyUnitTracks.map((u) => `${u} יח״ל`).join(" ו-");
  return shareCard({
    title: `שאלון ${code} בבגרות באנגלית`,
    subtitle: `${tracks}${f.timeMinutes ? ` · ${f.timeMinutes} דקות` : ""} · ${f.sections.map((s) => s.nameHe).join(", ")}`,
    badge: code,
  });
}

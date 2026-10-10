import { shareCard, OG_SIZE } from "@/lib/og/card";

export const alt = "קטעי קריאה באנגלית עם שאלות";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    title: "קטעי קריאה באנגלית",
    subtitle: "טקסטים מקוריים עם שאלות הבנה, לפי רמה מ-A1 עד C2",
  });
}

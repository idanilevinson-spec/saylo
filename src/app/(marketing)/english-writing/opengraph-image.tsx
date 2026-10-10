import { shareCard, OG_SIZE } from "@/lib/og/card";

export const alt = "נושאים לחיבור באנגלית לפי רמה";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    title: "נושאים לחיבור באנגלית",
    subtitle: "משימות כתיבה לפי רמה, מהצגה עצמית ועד מסה, עם משוב באפליקציה",
  });
}

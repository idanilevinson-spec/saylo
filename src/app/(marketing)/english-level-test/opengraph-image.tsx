import { shareCard, OG_SIZE } from "@/lib/og/card";

export const alt = "מבחן רמה באנגלית";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    title: "מבחן רמה באנגלית",
    subtitle: "כ-10 דקות, רמה נפרדת לכל מיומנות מ-A1 עד C2, ותוכנית יומית בדיוק ברמה שלכם",
  });
}

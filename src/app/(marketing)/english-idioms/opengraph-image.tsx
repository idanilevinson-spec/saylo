import { shareCard, OG_SIZE } from "@/lib/og/card";

export const alt = "ביטויים באנגלית ופירושם בעברית";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    title: "ביטויים באנגלית ופירושם",
    subtitle: "piece of cake, break the ice ועוד, עם פירוש בעברית ומשפט לדוגמה",
  });
}

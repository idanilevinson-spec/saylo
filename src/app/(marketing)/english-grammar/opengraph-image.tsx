import { shareCard, OG_SIZE } from "@/lib/og/card";

export const alt = "דקדוק באנגלית: הסברים בעברית לפי רמה";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    title: "דקדוק באנגלית, בעברית",
    subtitle: "הסבר לכל נושא מ-A1 עד C2, עם דוגמאות והטעויות הנפוצות של דוברי עברית",
  });
}

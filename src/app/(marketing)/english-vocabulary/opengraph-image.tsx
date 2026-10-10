import { shareCard, OG_SIZE } from "@/lib/og/card";

export const alt = "אוצר מילים באנגלית לפי נושא ורמה";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    title: "אוצר מילים באנגלית לפי נושא",
    subtitle: "כל מילה עם תרגום, הגייה, משפט לדוגמה והגדרה, מ-A1 עד C2",
  });
}

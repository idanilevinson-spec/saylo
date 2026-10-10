import { shareCard, OG_SIZE } from "@/lib/og/card";

export const alt = "הכנה לבגרות באנגלית: 3, 4 ו-5 יח״ל";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    title: "הכנה לבגרות באנגלית",
    subtitle: "3, 4 ו-5 יח״ל: מבנה כל שאלון, מיומנויות עם דוגמה פתורה, וערכות תרגול עם שעון",
    badge: "A–G",
  });
}

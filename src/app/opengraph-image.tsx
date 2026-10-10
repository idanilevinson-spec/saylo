import { shareCard, OG_SIZE } from "@/lib/og/card";

export const alt = "Saylo: לומדים אנגלית ברמה שלכם";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    title: "לומדים אנגלית ברמה שלכם",
    subtitle: "מבחן רמה, תוכנית יומית, ומורה שמדבר איתכם ומתקן תוך כדי שיחה",
  });
}

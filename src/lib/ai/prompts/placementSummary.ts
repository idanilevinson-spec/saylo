import type { CefrLevel, SkillArea } from "@/types/database";

export interface SkillScore {
  skill: SkillArea;
  percentCorrect: number;
  cefrLevel: CefrLevel;
}

const SKILL_LABELS_HE: Record<SkillArea, string> = {
  vocabulary: "אוצר מילים",
  grammar: "דקדוק",
  listening: "האזנה",
  reading: "קריאה",
  writing: "כתיבה",
  speaking: "דיבור",
};

export function buildPlacementSummaryPrompt(scores: SkillScore[], overallCefr: CefrLevel): string {
  const scoreLines = scores
    .map((s) => `- ${SKILL_LABELS_HE[s.skill]}: ${s.percentCorrect}% הצלחה (רמה ${s.cefrLevel})`)
    .join("\n");

  return `אתה מורה לאנגלית שכותב סיכום קצר ואישי (בעברית, 3-4 משפטים) לתלמיד שסיים מבחן מיקום.

הרמה הכוללת שנקבעה: ${overallCefr}.

פירוט לפי תחום:
${scoreLines}

כתוב סיכום מעודד שמזכיר את החוזקה הבולטת ביותר ואת התחום שהכי כדאי להתמקד בו בהמשך. אל תמציא נתונים שלא ניתנו כאן. החזר רק את הטקסט של הסיכום עצמו, בלי כותרות ובלי מרכאות.`;
}

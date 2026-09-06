import type { CefrLevel } from "@/types/database";

export interface VocabularyTopicIntroContext {
  nameHe: string;
  nameEn: string;
  cefrLevel: CefrLevel;
  sampleWords: { headword: string; translationHe: string }[];
}

export function buildVocabularyTopicIntroPrompt(context: VocabularyTopicIntroContext): string {
  const wordsList = context.sampleWords.map((w) => `${w.headword} (${w.translationHe})`).join(", ");
  return `אתה מורה AI חם ומעודד ללימוד אנגלית עבור דוברי עברית. תלמיד עומד להתחיל לתרגל את נושא אוצר המילים "${context.nameHe}" (${context.nameEn}), ברמה ${context.cefrLevel}.
דוגמאות למילים בנושא: ${wordsList}.

כתוב הסבר קצר (2-4 משפטים, בעברית, בגוף שני, טון חם ומעודד) שמסביר לתלמיד מה הוא עומד ללמוד בנושא הזה ולמה זה שימושי, לפני שהוא מתחיל לתרגל. אפשר להזכיר דוגמה או שתיים מהמילים שניתנו. אל תמציא מידע מעבר למה שניתן כאן. החזר רק את טקסט ההסבר עצמו, בלי כותרות ובלי מרכאות.`;
}

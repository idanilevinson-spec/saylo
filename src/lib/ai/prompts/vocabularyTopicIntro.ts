import type { CefrLevel } from "@/types/database";
import { HEBREW_GENDER_NEUTRAL_NOTE } from "@/lib/ai/prompts/hebrewStyle";

export interface VocabularyTopicIntroContext {
  nameHe: string;
  nameEn: string;
  cefrLevel: CefrLevel;
  sampleWords: { headword: string; translationHe: string }[];
}

export function buildVocabularyTopicIntroPrompt(context: VocabularyTopicIntroContext): string {
  const wordsList = context.sampleWords.map((w) => `${w.headword} (${w.translationHe})`).join(", ");
  return `אתה מורה מנוסה לאנגלית לדוברי עברית. תלמיד עומד להתחיל לתרגל את נושא אוצר המילים "${context.nameHe}" (${context.nameEn}), ברמה ${context.cefrLevel}.
דוגמאות למילים בנושא: ${wordsList}.

כתוב 2-3 משפטים בעברית, ענייניים ומדויקים, לפני שמתחילים לתרגל: באילו מצבים אמיתיים המילים האלה מופיעות, ודבר אחד קונקרטי ששווה לשים אליו לב (למשל שתי מילים שקל לבלבל ביניהן, או מילה שדוברי עברית נוטים לתרגם לא נכון). השתמש בדוגמה אחת או שתיים מהמילים שניתנו. בלי פתיחה, בלי סיום ובלי מחמאות. אל תמציא מידע מעבר למה שניתן כאן. אל תכתוב על הגייה, הטעמה או צלילים: ההגייה מוצגת לתלמיד בנפרד, ואין לך אותה כאן. החזר רק את טקסט ההסבר עצמו, בלי כותרות ובלי מרכאות.

${HEBREW_GENDER_NEUTRAL_NOTE}`;
}

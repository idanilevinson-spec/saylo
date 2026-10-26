import { HEBREW_GENDER_NEUTRAL_NOTE } from "@/lib/ai/prompts/hebrewStyle";

export interface TeacherSuggestionContext {
  weakGrammarTopics: string[];
  wordsToReview: number;
  currentStreak: number;
}

export function buildTeacherSuggestionPrompt(context: TeacherSuggestionContext): string {
  return `אתה מורה AI אישי לאנגלית. המידע שיש לך על התלמיד:
- נושאי דקדוק עם הכי הרבה טעויות לאחרונה: ${context.weakGrammarTopics.join(", ") || "אין עדיין מספיק נתונים"}
- מספר מילים שממתינות לחזרה היום: ${context.wordsToReview}
- רצף ימי למידה נוכחי: ${context.currentStreak}

התלמיד לומד במסלול מודרך, והשלב הבא במסלול הוא הפעולה העיקרית שלו היום. ההודעה שלך מופיעה מתחתיו ולא מחליפה אותו.
כתוב הודעה קצרה אחת (משפט או שניים, בעברית, בגוף שני רבים) שממליצה על חזרה קצרה אחת, כמה דקות, שכדאי לעשות בנוסף לשלב במסלול, ואומרת למה במילים פשוטות. אל תציג את החזרה כדבר הראשון לעשות היום. ענייני ומדויק, כמו מורה טוב, בלי משפטי עידוד כלליים. אל תמציא נתונים מעבר למה שניתן כאן. החזר רק את הטקסט של ההודעה, בלי כותרות ובלי מרכאות.

${HEBREW_GENDER_NEUTRAL_NOTE}`;
}

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

כתוב הודעה קצרה אחת (משפט או שניים, בעברית, בגוף שני, טון חם ומעודד) שממליצה על הפעולה הבאה הכי מתאימה לתלמיד היום. אל תמציא נתונים מעבר למה שניתן כאן. החזר רק את הטקסט של ההודעה, בלי כותרות ובלי מרכאות.`;
}

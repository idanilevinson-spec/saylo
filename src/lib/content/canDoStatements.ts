import type { CefrLevel, SkillArea } from "@/types/database";

// "What can I actually do at this level" — shown next to the CEFR badge on
// the progress page (SkillLevelsPanel) instead of leaving "B1" to speak for
// itself. Adapted in original Hebrew phrasing from the general competency
// described at each CEFR level for the matching Council of Europe skill
// category (Listening, Reading, Spoken Production/Interaction, Writing) —
// not a translation of any single official sentence.
//
// Only the four skills CEFR itself describes per-level are covered.
// vocabulary/grammar aren't official CEFR skill categories on their own
// (they're inputs to the other four), so there's no matching statement to
// show for them and none is invented here.
const CAN_DO_STATEMENTS: Partial<Record<SkillArea, Record<CefrLevel, string>>> = {
  listening: {
    A1: "מבינים מילים ומשפטים פשוטים ומוכרים, כשמדברים לאט וברור.",
    A2: "מבינים משפטים ומידע שגרתי בנושאים קרובים אליכם, כמו קניות ומשפחה.",
    B1: "עוקבים אחרי דיבור ברור בנושאים מוכרים מהעבודה, מהפנאי או מהלימודים.",
    B2: "מבינים הרצאות ודיווחים ארוכים, וגם רוב תוכניות החדשות והסרטים.",
    C1: "עוקבים אחרי דיבור מורכב וארוך, גם כשהמבנה לא תמיד ברור מיד.",
    C2: "מבינים כל דיבור מדובר או משודר, גם בקצב טבעי מהיר של דובר שפת אם.",
  },
  reading: {
    A1: "מבינים שמות, מילים ומשפטים פשוטים מאוד, למשל בשלטים ובטפסים.",
    A2: "קוראים טקסטים קצרים ופשוטים ומוצאים מידע צפוי בטקסטים יומיומיים.",
    B1: "מבינים טקסטים שכתובים בשפה יומיומית או הקשורה לתחום שלכם.",
    B2: "קוראים מאמרים ודיווחים על נושאי היום, כולל עמדות ונקודות מבט שונות.",
    C1: "מבינים טקסטים ארוכים ומורכבים, כולל כאלה שאינם בתחום המומחיות שלכם.",
    C2: "קוראים כמעט כל סוג טקסט בקלות, כולל כתיבה מופשטת ומורכבת מבנית.",
  },
  writing: {
    A1: "כותבים גלויה קצרה ופשוטה וממלאים טפסים עם פרטים אישיים.",
    A2: "כותבים הערות ומכתבים קצרים ופשוטים בנושאים מוכרים.",
    B1: "כותבים טקסט פשוט ורציף בנושאים מוכרים או שמעניינים אתכם אישית.",
    B2: "כותבים טקסט ברור ומפורט במגוון נושאים, כולל הבעת עמדה בכתיבה.",
    C1: "כותבים טקסטים ברורים, מובְנים היטב, על נושאים מורכבים.",
    C2: "כותבים טקסט ברור וזורם בסגנון המתאים לקורא, גם בנושאים מורכבים.",
  },
  speaking: {
    A1: "משוחחים בעזרת משפטים פשוטים, ושואלים ועונים על שאלות בסיסיות.",
    A2: "מתקשרים במשימות פשוטות ויומיומיות שדורשות חילופי מידע ישירים.",
    B1: "מתמודדים עם רוב המצבים הצפויים בנסיעה למקום שבו מדוברת אנגלית.",
    B2: "משוחחים בשטף וספונטניות שמאפשרים שיחה טבעית עם דוברי שפת אם.",
    C1: "מביעים את עצמכם בשטף וכמעט בלי לחפש מילים, גם בנושאים מורכבים.",
    C2: "משתתפים בכל שיחה או דיון, ומביעים ניואנסים דקים של משמעות בקלות.",
  },
};

export function getCanDoStatement(skill: SkillArea, level: CefrLevel): string | null {
  return CAN_DO_STATEMENTS[skill]?.[level] ?? null;
}

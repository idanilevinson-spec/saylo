// The skills library of the Bagrut learning area (/bagrut/skills/[slug]).
//
// Same rules as sampleUnits.ts and docs/specs/bagrut-track.md §5: every
// explanation and every example below was written from scratch for this
// file — general, long-established exam-skill technique (how to find a main
// idea, resolve a reference word, plan a paragraph), never adapted from a
// real exam, a past paper or a prep book's wording. AI-written, shown with
// BAGRUT_AI_CONTENT_DISCLAIMER, not reviewed by a teacher.
//
// Module ↔ skill links say "worth strengthening before this module", not
// "this exact question type appears in this module": only module E's
// question formats are verified individually (moduleFormats.ts), so the
// screens never claim more than that.

import type { BagrutModuleCode } from "./moduleFormats";

export type BagrutSkillKind = "reading" | "listening" | "literature" | "vocabulary" | "writing";

export interface BagrutSkillExample {
  // A short original text the question is about (absent for writing skills,
  // where the example is a model answer instead).
  passageEn?: string;
  questionEn: string;
  options?: string[];
  correctOptionIndex?: number;
  // Why the answer is what it is — the actual teaching moment.
  explanationHe: string;
  // Writing skills: a short model answer that follows the steps above.
  modelAnswerEn?: string;
}

export interface BagrutSkill {
  slug: string;
  kind: BagrutSkillKind;
  titleHe: string;
  summaryHe: string;
  whatHe: string;
  stepsHe: string[];
  trapsHe: string[];
  example: BagrutSkillExample;
  modules: BagrutModuleCode[];
}

export const BAGRUT_SKILL_KIND_LABEL: Record<BagrutSkillKind, string> = {
  reading: "הבנת הנקרא",
  listening: "הבנת הנשמע",
  literature: "ספרות",
  vocabulary: "אוצר מילים",
  writing: "כתיבה",
};

export const BAGRUT_SKILLS: readonly BagrutSkill[] = [
  {
    slug: "main-idea",
    kind: "reading",
    titleHe: "רעיון מרכזי",
    summaryHe: "לזהות על מה הטקסט או הפסקה באמת, ולא להיתפס לפרט אחד.",
    whatHe:
      "שאלת רעיון מרכזי בודקת אם הבנתם את התמונה הכוללת: מה הכותב רוצה שנבין מהטקסט כולו או מפסקה מסוימת. התשובה הנכונה מכסה את כל הפסקה, לא רק משפט אחד ממנה.",
    stepsHe: [
      "קראו את המשפט הראשון והאחרון של הפסקה. לרוב שם מנוסח הרעיון.",
      "שאלו את עצמכם: אם הייתי צריך לתת לפסקה כותרת של כמה מילים, מה היא הייתה?",
      "בדקו כל תשובה: האם היא נכונה לכל הפסקה, או רק לחלק ממנה?",
    ],
    trapsHe: [
      "תשובה שמזכירה פרט נכון מהטקסט, אבל צר מדי כדי להיות הרעיון המרכזי.",
      "תשובה רחבה מדי, שמדברת על נושא כללי שהטקסט לא באמת עוסק בו.",
      "תשובה עם מילים שמופיעות בטקסט, אבל שאומרת משהו אחר ממה שכתוב.",
    ],
    example: {
      passageEn:
        "Many people think that houseplants only need water. In fact, light matters just as much. A plant placed in a dark corner will slowly turn pale, even if it is watered every day. Before choosing a plant, it is worth checking how much sunlight the room actually gets.",
      questionEn: "What is the main idea of the paragraph?",
      options: [
        "Houseplants should be watered every day.",
        "Light is as important as water for houseplants.",
        "Dark corners are bad places for furniture.",
        "Most people do not like houseplants.",
      ],
      correctOptionIndex: 1,
      explanationHe:
        "הפסקה פותחת בטעות נפוצה (צמחים צריכים רק מים) ומתקנת אותה: גם לאור יש חשיבות. כל שאר המשפטים מדגימים את הרעיון הזה. התשובה הראשונה לוקחת פרט אחד מתוך דוגמה, והאחרונות לא נאמרות בטקסט בכלל.",
    },
    modules: ["A", "B", "C", "E", "F", "G"],
  },
  {
    slug: "detail",
    kind: "reading",
    titleHe: "פרט מהטקסט",
    summaryHe: "למצוא בטקסט את המקום המדויק שעונה על השאלה, ולא לענות מהזיכרון.",
    whatHe:
      "שאלות שמתחילות ב-According to the text או שואלות מי, מתי, איפה, כמה או למה. התשובה כתובה בטקסט, לפעמים במילים אחרות. המשימה היא למצוא אותה ולהשוות.",
    stepsHe: [
      "סמנו בשאלה את מילת המפתח: שם, מספר, מקום או מילה ייחודית.",
      "חפשו את המילה הזו (או מילה דומה לה) בטקסט, וקראו את המשפט שלפניה ושאחריה.",
      "בחרו את התשובה שאומרת את מה שכתוב שם, גם אם במילים אחרות.",
    ],
    trapsHe: [
      "לענות לפי מה שנשמע הגיוני מהידע הכללי שלכם, ולא לפי מה שכתוב.",
      "תשובה שמעתיקה מילים מהטקסט אבל מחברת אותן לא נכון.",
      "פרט נכון, אבל מפסקה אחרת שלא עליה נשאלה השאלה.",
    ],
    example: {
      passageEn:
        "The library in Neve Shalom opens at nine in the morning on weekdays. On Fridays it closes early, at one o'clock, and it stays closed on Saturdays. During the summer holiday, the opening hours are shorter.",
      questionEn: "According to the text, when does the library close on Fridays?",
      options: ["At nine in the morning", "At one o'clock", "It is closed all day", "It depends on the season"],
      correctOptionIndex: 1,
      explanationHe:
        "מילת המפתח היא Fridays. בטקסט כתוב במפורש On Fridays it closes early, at one o'clock. 'תשע בבוקר' היא שעת הפתיחה, וכל היום סגור רק בשבת. השעות בקיץ הן פרט אמיתי, אבל לא תשובה לשאלה הזו.",
    },
    modules: ["A", "B", "C", "E", "F", "G"],
  },
  {
    slug: "reference",
    kind: "reading",
    titleHe: "מילות הפניה",
    summaryHe: "להבין למה מתייחסות מילים כמו it, they, this ו-which.",
    whatHe:
      "מילת הפניה מחליפה משהו שכבר נאמר, כדי לא לחזור עליו. שאלה כזו מבקשת לזהות בדיוק מה המילה מחליפה. זו בדיקה של מעקב אחרי הטקסט, לא של אוצר מילים.",
    stepsHe: [
      "חפשו אחורה: מילת ההפניה מתייחסת כמעט תמיד למשהו שנאמר לפניה, לרוב במשפט הקודם או באותו משפט.",
      "בדקו התאמה: it ו-this מחליפים יחיד או רעיון שלם, they ו-them מחליפים רבים.",
      "הציבו את התשובה במקום המילה וקראו את המשפט. אם הוא הגיוני, מצאתם.",
    ],
    trapsHe: [
      "לבחור את שם העצם הקרוב ביותר רק כי הוא קרוב. צריך שגם המשמעות תתאים.",
      "לשכוח ש-this ו-that יכולים להחליף רעיון שלם, לא רק מילה אחת.",
    ],
    example: {
      passageEn:
        "Mia's grandparents bought her an old bicycle. At first she was disappointed, but after her father painted it bright red, she rode it everywhere.",
      questionEn: 'In the second sentence, "it" refers to ___.',
      options: ["the paint", "the bicycle", "her disappointment", "her father's car"],
      correctOptionIndex: 1,
      explanationHe:
        "אבא צבע 'אותו' באדום בוהק, והיא רכבה 'עליו' לכל מקום. מה שאפשר גם לצבוע וגם לרכוב עליו הוא האופניים. 'הצבע' קרוב יותר במשפט, אבל אי אפשר לרכוב עליו, ולכן הוא לא מתאים.",
    },
    modules: ["A", "B", "C", "E", "F", "G"],
  },
  {
    slug: "word-in-context",
    kind: "reading",
    titleHe: "מילה בהקשר",
    summaryHe: "לפענח מילה לא מוכרת (או מוכרת במשמעות אחרת) מתוך המשפט שסביבה.",
    whatHe:
      "השאלה מבקשת את המשמעות של מילה כפי שהיא בטקסט הזה. לפעמים זו מילה שלא מכירים, ולפעמים מילה מוכרת שיש לה כאן משמעות אחרת. ההקשר הוא הכלי העיקרי.",
    stepsHe: [
      "קראו את כל המשפט, ואת המשפט שלפניו. חפשו רמזים: ניגוד (but, however), הסבר (that is) או דוגמה.",
      "נסו לנחש מילה בעברית שהייתה מתאימה במקום, עוד לפני שאתם מסתכלים על התשובות.",
      "הציבו כל תשובה במקום המילה. הנכונה תשאיר את המשפט הגיוני ונאמן לטקסט.",
    ],
    trapsHe: ["לבחור את המשמעות הנפוצה של המילה, כשבמשפט הזה היא אומרת משהו אחר.", "לבחור תשובה רק כי היא נשמעת דומה למילה באנגלית."],
    example: {
      passageEn:
        "The new phone is very fragile. Unlike the old model, which survived many falls, this one cracked the first time it was dropped.",
      questionEn: 'The word "fragile" is closest in meaning to ___.',
      options: ["expensive", "easily broken", "very light", "old-fashioned"],
      correctOptionIndex: 1,
      explanationHe:
        "המילה Unlike מסמנת ניגוד לדגם הישן, ששרד נפילות רבות. הטלפון החדש נסדק כבר בנפילה הראשונה, ולכן fragile פירושה 'שבריר, נשבר בקלות'. אולי הוא גם יקר או קל, אבל הטקסט לא אומר את זה.",
    },
    modules: ["A", "B", "C", "E", "F", "G"],
  },
  {
    slug: "inference",
    kind: "reading",
    titleHe: "הסקת מסקנות",
    summaryHe: "להבין את מה שהטקסט רומז, בלי לכתוב במפורש, ובלי להמציא.",
    whatHe:
      "שאלת הסקה שואלת מה אפשר להבין מהטקסט, גם אם זה לא כתוב בו במילים. התשובה הנכונה נשענת על רמזים בטקסט. היא לא ניחוש ולא דעה אישית.",
    stepsHe: [
      "מצאו בטקסט את המשפטים שהשאלה מתייחסת אליהם.",
      "שאלו: מה חייב להיות נכון אם המשפטים האלה נכונים?",
      "פסלו תשובות שהולכות רחוק מדי, או שאין להן שום עוגן בטקסט.",
    ],
    trapsHe: [
      "תשובה שנכונה בעולם, אבל הטקסט לא נותן לה שום רמז.",
      "תשובה שכתובה בטקסט במפורש. זו כבר לא הסקה, ולרוב היא לא עונה בדיוק על מה שנשאל.",
    ],
    example: {
      passageEn:
        "When Daniel got home, the lights were off and the table was covered with plates and a large cake. Before he could turn on the light, twenty voices shouted his name.",
      questionEn: "What can we learn from the text?",
      options: [
        "Daniel forgot to pay the electricity bill.",
        "Daniel's friends planned a surprise party for him.",
        "Daniel does not like cake.",
        "Daniel came home very late at night.",
      ],
      correctOptionIndex: 1,
      explanationHe:
        "לא כתוב 'מסיבת הפתעה', אבל הרמזים מצטרפים: אורות כבויים, שולחן ערוך עם עוגה, ועשרים קולות שצועקים את שמו. אין שום רמז לחשבון חשמל או לשעה מאוחרת, ולכן אלה ניחושים ולא הסקה.",
    },
    modules: ["A", "C", "D", "E", "F", "G"],
  },
  {
    slug: "open-answer",
    kind: "reading",
    titleHe: "תשובה פתוחה",
    summaryHe: "לענות במשפט מלא באנגלית, בשפה שלכם, עם פרט שמוכיח את התשובה.",
    whatHe:
      "בשאלה פתוחה כותבים את התשובה בעצמכם. בודקים אם התשובה נכונה ומדויקת, ואם היא מבוססת על הטקסט. בדרך כלל לא נדרשת שפה מושלמת, אבל צריך שיהיה ברור מה רציתם לומר.",
    stepsHe: [
      "מצאו בטקסט את השורות שעונות על השאלה.",
      "ענו במשפט מלא שחוזר על מילות השאלה. למשל לשאלה Why did she leave? מתחילים ב-She left because…",
      "הוסיפו פרט אחד מהטקסט שמוכיח את התשובה, ואל תעתיקו פסקה שלמה.",
    ],
    trapsHe: [
      "להעתיק קטע ארוך מהטקסט בלי לענות באמת על השאלה.",
      "לענות רק על חצי מהשאלה, כשהיא שואלת שני דברים (למשל what and why).",
      "תשובה של מילה אחת, כשביקשו להסביר.",
    ],
    example: {
      passageEn:
        "Noa stopped taking the bus to school last month. The bus was often late, and she missed the first lesson twice. Now she rides her bike, and she says she arrives earlier and feels more awake.",
      questionEn: "Why did Noa stop taking the bus? Give one reason from the text.",
      explanationHe:
        "תשובה טובה עונה במשפט מלא, חוזרת על מילות השאלה ונשענת על פרט מהטקסט: She stopped taking the bus because it was often late and she missed the first lesson. התשובה 'she rides her bike' נכונה לגבי ההווה, אבל לא עונה על 'למה'.",
      modelAnswerEn: "She stopped taking the bus because it was often late, and she missed the first lesson twice.",
    },
    modules: ["A", "B", "C", "D", "E", "F", "G"],
  },
  {
    slug: "sentence-completion",
    kind: "reading",
    titleHe: "השלמת משפטים",
    summaryHe: "להשלים משפט לפי הטקסט, כך שגם התוכן וגם הדקדוק יתאימו.",
    whatHe:
      "מקבלים התחלה של משפט ומשלימים אותו לפי הטקסט. ההשלמה צריכה להיות נכונה לפי התוכן, וגם להשתלב במשפט מבחינת הדקדוק.",
    stepsHe: [
      "קראו את תחילת המשפט ושאלו: מה חסר כאן, סיבה, זמן, מקום או תוצאה?",
      "מצאו את המקום בטקסט שמדבר על זה.",
      "השלימו בקצרה, ובדקו שהמשפט כולו נקרא נכון באנגלית.",
    ],
    trapsHe: ["השלמה נכונה בתוכן שלא מתחברת דקדוקית להתחלה.", "להעתיק משפט שלם מהטקסט במקום רק את החלק החסר."],
    example: {
      passageEn:
        "The community garden was closed for two weeks in March because heavy rain had flooded the paths. It reopened once volunteers repaired the drainage.",
      questionEn: "The garden was closed in March because ___.",
      explanationHe:
        "התחלת המשפט מבקשת סיבה (because). בטקסט הסיבה היא שגשם כבד הציף את השבילים. ההשלמה הנכונה: heavy rain had flooded the paths. התשובה 'volunteers repaired the drainage' היא מה שקרה אחר כך, לא הסיבה.",
      modelAnswerEn: "heavy rain had flooded the paths.",
    },
    modules: ["E"],
  },
  {
    slug: "graphic-organizer",
    kind: "reading",
    titleHe: "מארגן גרפי",
    summaryHe: "למלא טבלה או תרשים שמסכמים את הטקסט, בפרטים קצרים ומדויקים.",
    whatHe:
      "במארגן גרפי מקבלים טבלה, רשימה או תרשים שחלק מהתאים בו ריקים, וממלאים אותם מתוך הטקסט. זה בודק אם אתם מבינים איך המידע בטקסט בנוי: השוואה, רצף, סיבה ותוצאה.",
    stepsHe: [
      "לפני הקריאה, הבינו מה המבנה: השוואה בין שני דברים, שלבים לפי סדר, או יתרונות וחסרונות.",
      "קראו את הכותרות של השורות והעמודות. הן אומרות לכם מה לחפש בטקסט.",
      "מלאו בכמה מילים בלבד, ושמרו על אותו סוג מידע בכל עמודה.",
    ],
    trapsHe: ["למלא משפט ארוך במקום פרט קצר.", "להחליף בין עמודות, למשל לכתוב יתרון בעמודת החסרונות."],
    example: {
      passageEn:
        "Electric scooters are cheap to use and easy to park. However, they can be dangerous in heavy traffic, and their batteries need to be charged often.",
      questionEn: "Complete the table: Advantages — cheap to use, ___ . Disadvantages — dangerous in heavy traffic, ___ .",
      explanationHe:
        "הטבלה בנויה כמו הטקסט: יתרונות לפני However וחסרונות אחריו. ביתרונות חסר easy to park, ובחסרונות חסר batteries need to be charged often. מספיקות כמה מילים לכל תא.",
      modelAnswerEn: "Advantages: easy to park. Disadvantages: the batteries need to be charged often.",
    },
    modules: ["E"],
  },
  {
    slug: "listening",
    kind: "listening",
    titleHe: "הבנת הנשמע",
    summaryHe: "להקשיב לקטע קצר ולענות עליו, כשאי אפשר לחזור אחורה בטקסט.",
    whatHe:
      "בחלק ההאזנה שומעים קטע (שיחה, ראיון או דיווח) ועונים על שאלות. בניגוד לקריאה, אי אפשר לחזור לשורה מסוימת, ולכן ההכנה לפני ההאזנה חשובה במיוחד.",
    stepsHe: [
      "לפני ההאזנה, קראו את כל השאלות וסמנו מה לחפש: שמות, מספרים, סיבות.",
      "בהאזנה הראשונה, הבינו מי מדבר ועל מה. בשנייה, השלימו פרטים.",
      "רשמו מילות מפתח בזמן ההאזנה, לא משפטים שלמים.",
    ],
    trapsHe: [
      "להיתקע על מילה אחת שלא הבנתם ולפספס את ההמשך.",
      "לבחור תשובה רק כי שמעתם בה מילה מהקטע. הקטע יכול להזכיר אותה בהקשר אחר.",
    ],
    example: {
      passageEn:
        "Interviewer: So why did you open the bakery on this street? — Owner: Honestly, I wanted to be near the school. Kids pass by every morning, and parents stop for coffee on the way back.",
      questionEn: "Why did the owner choose this street?",
      options: ["The rent was low.", "It is close to the school.", "Her family lives there.", "There was no other bakery."],
      correctOptionIndex: 1,
      explanationHe:
        "הבעלים אומרת I wanted to be near the school ומסבירה שילדים והורים עוברים שם. אין שום אזכור לשכר דירה או למשפחה. בבחינה שומעים את זה ולא קוראים, ולכן כדאי לשמוע את הקטע כאן בהשמעה.",
    },
    modules: ["A"],
  },
  {
    slug: "literature",
    kind: "literature",
    titleHe: "ניתוח סיפור ושיר",
    summaryHe: "לדבר על דמות, קונפליקט, נושא ואמצעים ספרותיים, עם עוגן ביצירה.",
    whatHe:
      "במודול D לומדים מראש יצירות שנבחרו על ידי משרד החינוך, ושואלים עליהן שאלות ניתוח. ההכנה היא בעיקר להכיר היטב את היצירות שנלמדות בבית הספר. מה שמתורגל כאן הוא סוג החשיבה שהשאלות מבקשות.",
    stepsHe: [
      "דמות: מה הדמות רוצה, מה מונע ממנה, ואיך היא משתנה מתחילת היצירה ועד סופה.",
      "קונפליקט ונושא: מה המאבק המרכזי, ומה היצירה אומרת על החיים דרכו.",
      "בכל טענה, הביאו דוגמה מהיצירה: מעשה, משפט או תמונה.",
    ],
    trapsHe: ["לספר מחדש את העלילה במקום לנתח אותה.", "טענה כללית בלי דוגמה מהיצירה.", "לבלבל בין דעת הדמות לבין מה שהיצירה עצמה מציגה."],
    example: {
      passageEn:
        "Every evening, Mr. Adler fed the pigeons in the square, alone. When the city put up a sign forbidding it, he kept coming — but now he only sat and watched them, the bag of bread untouched beside him.",
      questionEn: "What does the untouched bag of bread show about Mr. Adler?",
      explanationHe:
        "השקית שלא נפתחה מראה שהוא מציית לחוק, אבל ממשיך להגיע. ההרגל חשוב לו גם כשהוא כבר לא יכול לעשות את מה שאהב. זו דמות בודדה, שהשגרה הזו היא אולי הקשר היחיד שלה. ניתוח טוב מצביע על פרט אחד, השקית, ומסביר מה הוא אומר על הדמות. (הסיפור מקורי ונכתב לתרגול. בבחינה עונים על היצירות שנלמדו בכיתה.)",
      modelAnswerEn:
        "The untouched bag shows that he obeys the new rule, but he still comes every evening. The routine matters to him even without feeding the birds, which suggests he is lonely.",
    },
    modules: ["D"],
  },
  {
    slug: "vocabulary",
    kind: "vocabulary",
    titleHe: "אוצר מילים במודול E",
    summaryHe: "לבחור או להשלים מילה לפי משמעות, צורה דקדוקית וצירוף נפוץ.",
    whatHe:
      "בחלק אוצר המילים של מודול E משלימים משפטים, בוחרים מילה או מתאימים. השאלות נבנות מתוך רשימות המילים הרשמיות (Core). חשוב להכיר לא רק את התרגום, אלא גם את הצורה הנכונה של המילה במשפט.",
    stepsHe: [
      "קראו את כל המשפט לפני שאתם מסתכלים על המילים לבחירה.",
      "זהו מה חסר מבחינה דקדוקית: שם עצם, פועל, שם תואר או תואר הפועל.",
      "בדקו צירופים: מילים מסוימות באות יחד (make a decision ולא do a decision).",
    ],
    trapsHe: ["לבחור מילה עם המשמעות הנכונה אבל בצורה הלא נכונה (success במקום successful).", "לשנן תרגומים בלי משפט שמראה איך משתמשים במילה."],
    example: {
      questionEn: "The team worked hard, and the project was very ___.",
      options: ["success", "succeed", "successful", "successfully"],
      correctOptionIndex: 2,
      explanationHe:
        "אחרי was very חסר שם תואר שמתאר את הפרויקט, ולכן successful. success הוא שם עצם, succeed פועל ו-successfully תואר הפועל. לכל אחת מהן אותה משמעות בסיסית, אבל רק צורה אחת נכונה במשפט הזה.",
    },
    modules: ["E"],
  },
  {
    slug: "writing-short",
    kind: "writing",
    titleHe: "כתיבה קצרה (35–40 מילים)",
    summaryHe: "לכתוב תשובה קצרה וממוקדת שעונה על כל מה שהמשימה מבקשת.",
    whatHe:
      "במודול B כותבים טקסט קצר של 35–40 מילים. באורך כזה כל משפט צריך לעשות עבודה: לענות על חלק מהמשימה. בודקים בעיקר אם עניתם על הכול, ואם הכתיבה ברורה.",
    stepsHe: [
      "סמנו במשימה כל דבר שמבקשים לכתוב (למשל: מה, למה ומתי). כל אחד מהם הוא משפט.",
      "כתבו 3–4 משפטים פשוטים ומדויקים, עם מילת קישור אחת או שתיים.",
      "ספרו מילים ובדקו: עניתם על כל חלק במשימה?",
    ],
    trapsHe: ["לכתוב הרבה על חלק אחד ולשכוח חלק אחר.", "לחרוג הרבה מטווח המילים, לשני הכיוונים."],
    example: {
      questionEn: "Write to a friend about a place you visited recently. Say where it was, what you did there and whether you recommend it.",
      explanationHe:
        "בתשובה לדוגמה יש שלושה חלקים, בדיוק כמו במשימה: איפה (פארק הירקון), מה עשינו, והאם ממליצים ולמה. האורך 38 מילים, עם מילות קישור פשוטות (and, because).",
      modelAnswerEn:
        "Last week I went to Hayarkon Park with my cousins. We rented bikes and rode along the river, and later we had a picnic on the grass. I really recommend it because it is green, quiet and free.",
    },
    modules: ["B"],
  },
  {
    slug: "writing-paragraph",
    kind: "writing",
    titleHe: "כתיבת פסקה (70–120 מילים)",
    summaryHe: "לבנות פסקה עם משפט פתיחה, תוכן שתומך בו וסגירה.",
    whatHe:
      "במודול C כותבים 70–90 מילים ובמודול D 100–120 מילים. באורך כזה כבר צריך מבנה: משפט פתיחה שאומר את הרעיון, שני-שלושה משפטים שמפתחים אותו עם דוגמה, ומשפט סיום.",
    stepsHe: [
      "תכננו דקה לפני הכתיבה: מה הרעיון, ומה שתי הדוגמאות או הסיבות.",
      "פתחו במשפט שעונה ישירות על המשימה.",
      "פתחו כל סיבה במשפט משלה, עם מילת קישור (First, Also, For example).",
      "סיימו במשפט שחוזר לרעיון במילים אחרות, ובדקו את טווח המילים.",
    ],
    trapsHe: ["להתחיל לכתוב בלי תכנון, ולחזור על אותו רעיון במילים שונות.", "פסקה בלי משפט פתיחה, שהקורא לא מבין לאן היא הולכת."],
    example: {
      questionEn: "Should students have less homework? Write a paragraph giving your opinion.",
      explanationHe:
        "המבנה: משפט פתיחה עם הדעה, שתי סיבות שכל אחת נפתחת במילת קישור, ומשפט סיום שמסכם. האורך כ-80 מילים, בטווח של מודול C. במודול D מרחיבים לאותו מבנה עם דוגמה נוספת.",
      modelAnswerEn:
        "In my opinion, students should have less homework, but not none at all. First, after a long school day, many students also have sports, music or jobs, and too much homework leaves no time to rest. In addition, a few well-planned tasks help more than many repetitive ones. For example, one short reading task can teach more than three pages of copying. To sum up, less but better homework would help students learn and stay healthy.",
    },
    modules: ["C", "D"],
  },
  {
    slug: "essay",
    kind: "writing",
    titleHe: "חיבור (120–140 מילים)",
    summaryHe: "חיבור דעה או תיאור עם פתיחה, גוף וסיום, בטווח המילים.",
    whatHe:
      "במודולים F ו-G כותבים חיבור של 120–140 מילים. ב-G סוגי החיבור הם בדרך כלל תיאורי או חיבור דעה, ולעיתים נדירות מכתב רשמי. החיבור נבדק על התוכן, הארגון והשפה, ולכן תכנון קצר לפני הכתיבה משתלם.",
    stepsHe: [
      "פתיחה (2 משפטים): הצגת הנושא ועמדה ברורה, או מה מתארים ולמה.",
      "גוף (2 פסקאות קצרות): בכל פסקה רעיון אחד עם דוגמה או פירוט.",
      "סיום (1–2 משפטים): סיכום במילים אחרות, בלי רעיון חדש.",
      "בדיקה: טווח מילים, מילות קישור בין הפסקאות, וזמנים דקדוקיים עקביים.",
    ],
    trapsHe: [
      "חיבור דעה שלא אומר בבירור מה הדעה.",
      "רעיון חדש בסיום, במקום סיכום.",
      "מכתב רשמי בלי פתיחה וסגירה של מכתב (Dear… / Yours sincerely).",
    ],
    example: {
      questionEn: "Some people say that smartphones bring families closer, others say the opposite. What do you think?",
      explanationHe:
        "פתיחה עם עמדה, שתי פסקאות גוף שכל אחת מפתחת צד אחד, וסיום שמסכם בלי רעיון חדש. האורך כ-130 מילים. כדאי לשים לב איך מילות הקישור (On the one hand, However, In conclusion) מובילות את הקורא.",
      modelAnswerEn:
        "Smartphones are part of almost every family's life, and I believe they can bring families closer, but only when they are used with care.\n\nOn the one hand, phones help relatives stay in touch. My grandparents live far away, yet we talk to them on video every week and share photos from school events they cannot attend.\n\nHowever, at home phones often do the opposite. When everyone looks at a screen during dinner, nobody really listens. In our house we decided to leave phones in another room while we eat, and the conversations became longer and funnier.\n\nIn conclusion, a smartphone is just a tool. It connects families across distance, but around the table it is better to put it away.",
    },
    modules: ["F", "G"],
  },
  {
    slug: "connectors",
    kind: "writing",
    titleHe: "מילות קישור",
    summaryHe: "לחבר בין רעיונות כך שהקורא יבין את הקשר ביניהם: הוספה, ניגוד, סיבה, תוצאה.",
    whatHe:
      "מילות קישור הופכות רשימת משפטים לטקסט אחד. הן גם עוזרות בקריאה: מילה כמו However מאותתת שמגיע ניגוד, ו-Therefore מאותתת על תוצאה.",
    stepsHe: [
      "הוספה: and, also, in addition, moreover.",
      "ניגוד: but, however, although, on the other hand.",
      "סיבה ותוצאה: because, since, so, therefore, as a result.",
      "דוגמה וסיכום: for example, such as, to sum up, in conclusion.",
    ],
    trapsHe: [
      "להשתמש ב-However בתוך משפט כמו but בלי פיסוק. However באה בתחילת משפט ואחריה פסיק.",
      "לערום מילות קישור בלי שיש באמת קשר כזה בין הרעיונות.",
    ],
    example: {
      questionEn: "The tickets were expensive. ___, the concert was sold out in an hour.",
      options: ["Because", "However", "For example", "In addition"],
      correctOptionIndex: 1,
      explanationHe:
        "יש כאן ניגוד: היה צפוי שכרטיסים יקרים יימכרו לאט, ובכל זאת נמכרו תוך שעה. מילת ניגוד בתחילת משפט, עם פסיק אחריה, היא However.",
    },
    modules: ["B", "C", "D", "F", "G"],
  },
];

export function getBagrutSkill(slug: string): BagrutSkill | undefined {
  return BAGRUT_SKILLS.find((s) => s.slug === slug);
}

export function skillsForModule(code: BagrutModuleCode): BagrutSkill[] {
  return BAGRUT_SKILLS.filter((s) => s.modules.includes(code));
}

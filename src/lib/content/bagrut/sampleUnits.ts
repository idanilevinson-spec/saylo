// Original sample content demonstrating the verified module formats in
// moduleFormats.ts — see docs/specs/bagrut-track.md §2.2, §5, and §8.
//
// This content was composed from scratch for this file. Nothing here was
// copied, adapted, or even read from any actual Bagrut exam, past or
// present — the research behind moduleFormats.ts only ever looked at how
// exams are STRUCTURED (sections, point values, word counts), never at real
// exam text, specifically so there would be nothing to accidentally echo.
//
// Two DIFFERENT, NEVER-MERGED gates (spec §5, updated 2026-09-28 at the
// owner's explicit request to proceed without a professional teacher):
//   - teacherReviewed: a qualified English teacher actually checked this
//     against the current syllabus. Still false on everything below — no
//     teacher has been involved yet.
//   - aiContentDisclosed: this is AI-written from a verified module format,
//     and the mandatory disclosure in BAGRUT_AI_CONTENT_DISCLAIMER will be
//     shown alongside it every single time. This does NOT mean "reviewed" —
//     it means "shown honestly for what it is."
// getPublishableSampleUnit() is the only function that should ever feed a
// learner-facing screen; it enforces that at least one of the two is true,
// and any future UI must render the disclaimer whenever aiContentDisclosed
// is what justified showing the content (teacherReviewed content doesn't
// strictly need it, but showing it anyway is never wrong).

import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "./moduleFormats";

export const BAGRUT_AI_CONTENT_DISCLAIMER =
  "החומר הזה נוצר על ידי AI, בהתבסס על מבנה הבחינה הרשמי — הוא לא נבדק על ידי מורה מוסמך ואינו רשמי או מטעם משרד החינוך. מומלץ להשתמש בו כתרגול נוסף, ולא כתחליף לחומר לימוד רשמי או להנחיית מורה.";

export interface BagrutReadingQuestion {
  formatHe: string;
  promptEn: string;
  options?: string[];
  // Only set (and only meaningful) when `options` is set — the UI uses this
  // to color a multiple-choice answer, rather than trying to infer
  // correctness by string-matching the option text against modelAnswerHe,
  // which isn't reliable (modelAnswerHe is free text like "תשובה נכונה: B.").
  correctOptionIndex?: number;
  // Not shown to a learner even once published — this is a reviewer/grading
  // aid, not part of the exercise itself.
  modelAnswerHe: string;
}

export interface BagrutWritingTask {
  promptEn: string;
  wordCountRange: [number, number];
}

export interface BagrutVocabularyQuestion {
  formatHe: string;
  promptEn: string;
  options?: string[];
  correctOptionIndex?: number;
  modelAnswerHe: string;
}

export interface BagrutSampleUnit {
  moduleCode: BagrutModuleCode;
  titleHe: string;
  teacherReviewed: boolean;
  aiContentDisclosed: boolean;
  readingBodyEn: string;
  readingQuestions: BagrutReadingQuestion[];
  // Module E has no writing task (spec §2.2) — vocabulary instead.
  writingTask?: BagrutWritingTask;
  vocabularyQuestions?: BagrutVocabularyQuestion[];
}

const GREEN_CORNER_PASSAGE = `Two years ago, students at Neve Yosef High School decided to turn an empty piece of land behind the sports hall into something useful. The area had been full of old furniture and rubbish for as long as anyone could remember. A group of tenth-graders, led by a student named Dana, asked the principal for permission to clean it up and build a small garden.

At first, only twelve students joined the project. They spent every Thursday afternoon removing broken chairs, old tires, and plastic bottles. Local shops donated tools, and a nearby plant nursery gave the students seeds and young plants for free. By the end of the first year, the "Green Corner," as it became known, had vegetable beds, herb pots, and a small seating area where students could relax during breaks.

The garden quickly became more popular than anyone expected. Younger students started asking how they could help, and by the second year, more than fifty students were taking part. Some grew vegetables that were later used in the school cafeteria. Others learned simple skills, such as watering schedules and composting, which many said they had never thought about before.

Teachers noticed another change as well. Students who rarely spoke up in class began taking charge of small tasks in the garden, from organizing volunteers to keeping records of what had been planted. For many of them, the Green Corner became the first project where they truly felt responsible for something from start to finish.`;

const BIKE_SHARE_PASSAGE = `Ten years ago, getting across the city center of Ramat Sharon usually meant sitting in traffic or waiting for a bus that rarely arrived on time. Today, thousands of residents start their day differently: they unlock a bicycle from one of forty stations scattered around the city, ride to work or school, and leave it at another station near their destination.

The idea began almost by accident. A small group of engineers at the local transportation authority noticed that most car trips within the city center were shorter than three kilometers — distances that could easily be covered by bike in under fifteen minutes. Convincing the city council to invest in a shared bicycle network took nearly two years of meetings, pilot studies, and public debates. Many residents doubted that people would actually use the bikes, especially during the hot summer months.

The results surprised almost everyone. Within the first year, the number of daily bike trips crossed ten thousand, far beyond what planners had predicted. Local shop owners reported an unexpected benefit as well: cyclists, unlike drivers searching for parking, tended to stop more often along their route, which increased foot traffic to small businesses.

Not every part of the project succeeded immediately. Several stations ran out of available bikes during rush hour, forcing the authority to redesign its distribution system using data collected from every ride. Engineers now predict busy periods and move bicycles between stations overnight, a process that has cut shortages by more than half.

Perhaps the most significant change, according to a recent survey, is not environmental but social. Many residents said the shared bikes gave them a reason to notice parts of their own neighborhood they had never really looked at before. What started as a transportation experiment has slowly become something the city now considers part of its identity.`;

export const BAGRUT_SAMPLE_UNITS: readonly BagrutSampleUnit[] = [
  {
    moduleCode: "B",
    titleHe: "דוגמה למודול B — הפינה הירוקה",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingBodyEn: GREEN_CORNER_PASSAGE,
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What was the area behind the sports hall used for before the project began?",
        options: [
          "A vegetable garden",
          "A place full of old furniture and rubbish",
          "A parking lot for teachers",
          "A second sports field",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The Green Corner became more popular in its second year because ___.",
        modelAnswerHe: "תשובה מקובלת: יותר תלמידים ביקשו להצטרף / התלמידים הצעירים רצו לעזור, מספר המשתתפים גדל למעל חמישים.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, in what way did the garden change some students who \"rarely spoke up in class\"? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: הם התחילו לקחת אחריות על משימות קטנות בגינה, כמו ארגון מתנדבים או רישום מה נשתל.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which of the following is NOT mentioned as something the students did?",
        options: [
          "Removing broken furniture",
          "Selling vegetables outside the school",
          "Learning about composting",
          "Keeping records of what was planted",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B — מכירת ירקות מחוץ לבית הספר אינה מוזכרת בטקסט.",
      },
      {
        formatHe: "אוצר מילים בהקשר",
        promptEn: 'Find a word in paragraph 2 that means "gave without asking for payment."',
        modelAnswerHe: "תשובה: donated.",
      },
    ],
    writingTask: {
      promptEn:
        "Write a short message to a friend about a school or class project you took part in. Say what you did and how you felt about it.",
      wordCountRange: [35, 40],
    },
  },
  {
    moduleCode: "E",
    titleHe: "דוגמה למודול E — אופניים שיתופיים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingBodyEn: BIKE_SHARE_PASSAGE,
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What was one of the main reasons the transportation authority became interested in a bike-share program?",
        options: [
          "A new law required every city to build one",
          "Most car trips in the city center were quite short",
          "Residents demanded free public transportation",
          "The city wanted to close all its bus lines",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, how did the bike-share program affect local businesses? Explain in your own words.",
        modelAnswerHe: "תשובה מקובלת: רוכבי אופניים נטו לעצור יותר לאורך הדרך (בניגוד לנהגים שמחפשים חניה), מה שהגביר את התנועה הרגלית לעסקים קטנים.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Before the program started, many residents doubted that people would use it, especially ___.",
        modelAnswerHe: "תשובה מקובלת: בחודשי הקיץ החמים.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What problem did the program experience during its first year?",
        options: [
          "Too few residents signed up",
          "Bicycles were frequently stolen",
          "Some stations ran out of bikes during busy hours",
          "The bikes were too expensive to maintain",
        ],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "How did engineers solve the problem mentioned in the previous question?",
        modelAnswerHe: "תשובה מקובלת: הם השתמשו בנתונים מכל נסיעה כדי לחזות שעות עומס, ומעבירים אופניים בין תחנות במהלך הלילה.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "According to a recent survey, the most significant change caused by the program was not environmental but ___.",
        modelAnswerHe: "תשובה: חברתית (social).",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which sentence best describes how the writer feels about the bike-share program overall?",
        options: [
          "It has been a disappointing failure",
          "It started with difficulties but has become a valued part of city life",
          "It is too expensive to continue",
          "It was successful only among tourists",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Why do you think the number of daily bike trips surprised city planners? Support your answer with information from the text.",
        modelAnswerHe: "תשובה מקובלת: תוכננה רק מספר מוגבל של תחנות/אופניים מתוך ציפייה נמוכה, ומספר הנסיעות היומי חצה עשרת אלפים — הרבה מעבר לתחזית.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Engineers now use data from every ride in order to ___.",
        modelAnswerHe: "תשובה מקובלת: לחזות שעות עומס ולהעביר אופניים בין תחנות מראש.",
      },
    ],
    vocabularyQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the word closest in meaning to "convince":',
        options: ["persuade", "ignore", "forbid", "delay"],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: persuade.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The new policy will __________ (reduce) traffic in the city center.",
        modelAnswerHe: "תשובה: reduce.",
      },
      {
        formatHe: "התאמה",
        promptEn:
          'Match each word to its meaning: (1) unexpected (2) scattered (3) significant — (a) spread out over an area (b) important (c) surprising, not predicted.',
        modelAnswerHe: "תשובה: 1-c, 2-a, 3-b.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: '"Foot traffic" in the text refers to:',
        options: ["people walking to or through a place", "traffic jams", "shoes sold in stores", "hiking trails"],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: people walking to or through a place.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Many students find it difficult to __________ (predict) which topics will appear on the exam.",
        modelAnswerHe: "תשובה: predict.",
      },
    ],
  },
] as const;

export function getSampleUnit(moduleCode: BagrutModuleCode): BagrutSampleUnit | undefined {
  return BAGRUT_SAMPLE_UNITS.find((u) => u.moduleCode === moduleCode);
}

// The only function a future learner-facing screen should call. See the
// module-level comment above for what the two flags mean and why they
// never merge into one.
export function getPublishableSampleUnit(moduleCode: BagrutModuleCode): BagrutSampleUnit | undefined {
  const unit = getSampleUnit(moduleCode);
  if (!unit) return undefined;
  return unit.teacherReviewed || unit.aiContentDisclosed ? unit : undefined;
}

// Building sample content for a module whose own structure isn't verified
// yet (moduleFormats.ts) would mean guessing at both the format AND the
// content at once — kept as a hard error, not just a lint note, so it fails
// loudly in tests rather than shipping quietly.
for (const unit of BAGRUT_SAMPLE_UNITS) {
  if (!BAGRUT_MODULE_FORMATS[unit.moduleCode].verified) {
    throw new Error(`Sample content exists for unverified module ${unit.moduleCode} — see moduleFormats.ts`);
  }
}

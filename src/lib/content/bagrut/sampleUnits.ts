// Original sample content demonstrating the verified module formats in
// moduleFormats.ts — see docs/specs/bagrut-track.md §2.2 and §8.
//
// This passage, its questions and the writing prompt below were composed
// from scratch for this file. Nothing here was copied, adapted, or even
// read from any actual Bagrut exam, past or present — the research behind
// moduleFormats.ts only ever looked at how exams are STRUCTURED (sections,
// point values, word counts), never at real exam text, specifically so
// there would be nothing to accidentally echo.
//
// `reviewed: false` is the same content gate as drills.ts in the Hebrew
// Pattern Coach, and matters MORE here: this content would prepare a real
// student for a real matriculation exam. getReviewedSampleUnit() refuses to
// serve anything until a qualified English teacher has checked it against
// the current syllabus and flipped this flag — that hasn't happened yet.

import type { BagrutModuleCode } from "./moduleFormats";

export interface BagrutReadingQuestion {
  formatHe: string;
  promptEn: string;
  options?: string[];
  // Not shown to a learner even once reviewed — this is a reviewer/grading
  // aid, not part of the exercise itself.
  modelAnswerHe: string;
}

export interface BagrutWritingTask {
  promptEn: string;
  wordCountRange: [number, number];
}

export interface BagrutSampleUnit {
  moduleCode: BagrutModuleCode;
  titleHe: string;
  reviewed: boolean;
  readingBodyEn: string;
  readingQuestions: BagrutReadingQuestion[];
  writingTask: BagrutWritingTask;
}

const GREEN_CORNER_PASSAGE = `Two years ago, students at Neve Yosef High School decided to turn an empty piece of land behind the sports hall into something useful. The area had been full of old furniture and rubbish for as long as anyone could remember. A group of tenth-graders, led by a student named Dana, asked the principal for permission to clean it up and build a small garden.

At first, only twelve students joined the project. They spent every Thursday afternoon removing broken chairs, old tires, and plastic bottles. Local shops donated tools, and a nearby plant nursery gave the students seeds and young plants for free. By the end of the first year, the "Green Corner," as it became known, had vegetable beds, herb pots, and a small seating area where students could relax during breaks.

The garden quickly became more popular than anyone expected. Younger students started asking how they could help, and by the second year, more than fifty students were taking part. Some grew vegetables that were later used in the school cafeteria. Others learned simple skills, such as watering schedules and composting, which many said they had never thought about before.

Teachers noticed another change as well. Students who rarely spoke up in class began taking charge of small tasks in the garden, from organizing volunteers to keeping records of what had been planted. For many of them, the Green Corner became the first project where they truly felt responsible for something from start to finish.`;

export const BAGRUT_SAMPLE_UNITS: readonly BagrutSampleUnit[] = [
  {
    moduleCode: "B",
    titleHe: "דוגמה למודול B — הפינה הירוקה",
    reviewed: false,
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
] as const;

export function getSampleUnit(moduleCode: BagrutModuleCode): BagrutSampleUnit | undefined {
  return BAGRUT_SAMPLE_UNITS.find((u) => u.moduleCode === moduleCode);
}

export function getReviewedSampleUnit(moduleCode: BagrutModuleCode): BagrutSampleUnit | undefined {
  const unit = getSampleUnit(moduleCode);
  return unit?.reviewed ? unit : undefined;
}

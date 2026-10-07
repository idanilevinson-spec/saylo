// The Bagrut-format section of the placement test: one short passage per
// study-unit track with multiple-choice questions written the way the exam
// asks them (main idea, detail "according to the text", reference words,
// inference, vocabulary in context).
//
// Same rules as sampleUnits.ts: composed from scratch for this file, never
// adapted from a real exam, AI-written and disclosed as such
// (BAGRUT_AI_CONTENT_DISCLAIMER is shown above the section), and not
// reviewed by a teacher. The passages are deliberately SHORTER than a real
// module's reading text — this is a placement check that has to fit inside
// a ten-minute test, not a mock exam — and the screen says so.
//
// Multiple choice only: the placement test is graded instantly, without AI,
// so every item needs a single correct option.

import type { BagrutStudyUnits } from "./moduleFormats";

export interface BagrutPlacementQuestion {
  formatHe: string;
  promptEn: string;
  options: string[];
  correctOptionIndex: number;
}

export interface BagrutPlacementSection {
  units: BagrutStudyUnits;
  titleEn: string;
  passageEn: string;
  questions: BagrutPlacementQuestion[];
}

const THREE_UNITS_PASSAGE = `Every Friday morning, the small market in the center of Kfar Ruth is busy with people. But one stand is different from all the others. It doesn't sell fruit, bread or flowers. It "sells" broken things — and fixes them for free.

The stand belongs to Eli Mor, a retired electrician. Three years ago, his neighbor asked him to look at an old radio. Eli fixed it in ten minutes. "She was so happy," he remembers. "I thought, how many other things are sitting in people's homes because nobody knows how to fix them?"

The next Friday, Eli brought a table and some tools to the market. At first, only two people came. Today, there is often a line. People bring lamps, toasters, bicycles and even toys. Eli doesn't do the work alone anymore: four teenagers from the local high school help him every week, and he teaches them as they work.

"I don't want people to throw things away so quickly," Eli says. "And the kids learn that you can understand how something works if you are patient enough."`;

const FOUR_UNITS_PASSAGE = `When the town library in Givat Hadar announced it would close its second floor because of budget cuts, most residents expected the space to stay empty. Instead, a group of high-school students proposed an unusual plan: they would turn the empty floor into a "homework hub" where younger children could get free help after school.

The library's director was doubtful at first. The students had no experience running a program, and she worried that the idea would disappear after a few weeks. However, the students presented a detailed schedule, a list of thirty volunteers and a set of simple rules they had written themselves. She agreed to a two-month trial.

The trial was more successful than anyone had imagined. Within a month, around sixty children were coming every week, and parents began asking whether the hub could also open on Fridays. Teachers at the nearby elementary school noticed that homework was being handed in more regularly.

The volunteers also gained something. Several of them said that explaining a subject to a younger child forced them to understand it better themselves. When the trial ended, the town council voted to keep the second floor open — this time, with a small budget for the hub.`;

const FIVE_UNITS_PASSAGE = `For decades, urban planners measured a city's success largely by how quickly cars could move through it. Wider roads and larger intersections were considered signs of progress. In recent years, however, a growing number of cities have begun to question that assumption, asking instead how easily people can live their daily lives without needing a car at all.

One idea that has attracted considerable attention is the "fifteen-minute city": a neighborhood in which residents can reach most of what they need — schools, shops, clinics, parks — within a short walk or bicycle ride. Supporters argue that such neighborhoods reduce pollution, strengthen local businesses and give residents back time they would otherwise spend in traffic.

The concept is not without critics. Some argue that it is far easier to apply in dense, older city centers than in suburbs built around highways, where rebuilding would be enormously expensive. Others worry that improving a neighborhood may raise housing prices, eventually pushing out the very residents it was meant to serve.

Despite these concerns, the debate itself has shifted the conversation. Rather than asking how to move cars faster, many planners now ask a different question: what would it take for people not to need to travel so far in the first place?`;

export const BAGRUT_PLACEMENT_SECTIONS: Record<BagrutStudyUnits, BagrutPlacementSection> = {
  3: {
    units: 3,
    titleEn: "The Fixing Stand",
    passageEn: THREE_UNITS_PASSAGE,
    questions: [
      {
        formatHe: "רעיון מרכזי",
        promptEn: "What is the text mainly about?",
        options: [
          "A man who repairs people's things for free at a market",
          "A market that sells old radios and toys",
          "A high school that teaches electricity",
          "A neighbor who lost her radio",
        ],
        correctOptionIndex: 0,
      },
      {
        formatHe: "פרט מהטקסט",
        promptEn: "How did the idea for the stand begin?",
        options: [
          "Eli lost his job as an electrician",
          "Eli fixed his neighbor's old radio",
          "The market needed a new stand",
          "Teenagers asked Eli to teach them",
        ],
        correctOptionIndex: 1,
      },
      {
        formatHe: "פרט מהטקסט",
        promptEn: "How many people came to the stand on the first Friday?",
        options: ["Nobody", "Two", "Four", "There was a long line"],
        correctOptionIndex: 1,
      },
      {
        formatHe: "מילת הפניה",
        promptEn: 'In the last paragraph, the word "them" in "he teaches them" refers to ___.',
        options: ["the tools", "the toys", "the teenagers", "the people in the line"],
        correctOptionIndex: 2,
      },
      {
        formatHe: "הסקת מסקנות",
        promptEn: "What does Eli hope the teenagers will learn?",
        options: [
          "How to sell things at a market",
          "That new things are always better",
          "That patience helps you understand how things work",
          "How to become electricians quickly",
        ],
        correctOptionIndex: 2,
      },
    ],
  },
  4: {
    units: 4,
    titleEn: "The Homework Hub",
    passageEn: FOUR_UNITS_PASSAGE,
    questions: [
      {
        formatHe: "רעיון מרכזי",
        promptEn: "What is the main idea of the text?",
        options: [
          "A library closed because of budget cuts",
          "Students turned an empty library floor into a successful homework program",
          "Parents asked the library to open on Fridays",
          "Elementary-school teachers started a volunteer program",
        ],
        correctOptionIndex: 1,
      },
      {
        formatHe: "פרט מהטקסט",
        promptEn: "Why was the library director doubtful at first?",
        options: [
          "She did not like the students",
          "There was no space on the second floor",
          "The students had no experience and she feared the idea would not last",
          "The town council had already rejected the plan",
        ],
        correctOptionIndex: 2,
      },
      {
        formatHe: "פרט מהטקסט",
        promptEn: "What convinced the director to agree to a trial?",
        options: [
          "A detailed plan with a schedule, volunteers and rules",
          "A letter from the parents",
          "A new budget from the council",
          "A request from the elementary school",
        ],
        correctOptionIndex: 0,
      },
      {
        formatHe: "מילה בהקשר",
        promptEn: 'In paragraph 3, the word "regularly" is closest in meaning to ___.',
        options: ["late", "often and on time", "carefully", "with help"],
        correctOptionIndex: 1,
      },
      {
        formatHe: "הסקת מסקנות",
        promptEn: "What can be learned about the volunteers from the last paragraph?",
        options: [
          "They were paid by the town council",
          "Teaching younger children helped them understand subjects better",
          "Most of them stopped coming after the trial",
          "They preferred to study alone",
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  5: {
    units: 5,
    titleEn: "The Fifteen-Minute City",
    passageEn: FIVE_UNITS_PASSAGE,
    questions: [
      {
        formatHe: "רעיון מרכזי",
        promptEn: "What is the writer's main purpose in the text?",
        options: [
          "To argue that cars should be banned from city centers",
          "To describe a shift in how cities are planned and the debate around it",
          "To explain how to build wider roads",
          "To prove that suburbs are better than city centers",
        ],
        correctOptionIndex: 1,
      },
      {
        formatHe: "פרט מהטקסט",
        promptEn: "According to the text, how was a city's success traditionally measured?",
        options: [
          "By the number of parks",
          "By how fast cars could move through it",
          "By the price of housing",
          "By the number of local businesses",
        ],
        correctOptionIndex: 1,
      },
      {
        formatHe: "פרט מהטקסט",
        promptEn: "Which criticism of the idea is mentioned in the text?",
        options: [
          "It increases pollution",
          "It harms local businesses",
          "It may raise housing prices and push residents out",
          "It makes traffic in city centers worse",
        ],
        correctOptionIndex: 2,
      },
      {
        formatHe: "מילת הפניה",
        promptEn: 'In paragraph 3, "the very residents it was meant to serve" — "it" refers to ___.',
        options: ["the highway", "improving a neighborhood", "the suburb", "housing prices"],
        correctOptionIndex: 1,
      },
      {
        formatHe: "הסקת מסקנות",
        promptEn: "What does the last paragraph suggest?",
        options: [
          "The debate has already been settled in favor of cars",
          "Critics have convinced planners to abandon the idea",
          "Even with its problems, the idea changed the questions planners ask",
          "Most people now live in fifteen-minute cities",
        ],
        correctOptionIndex: 2,
      },
      {
        formatHe: "אוצר מילים — מילה בהקשר",
        promptEn: 'In paragraph 2, "considerable" is closest in meaning to ___.',
        options: ["little", "a lot of", "careful", "unexpected"],
        correctOptionIndex: 1,
      },
      {
        formatHe: "אוצר מילים — השלמת משפט",
        promptEn: "Rebuilding a suburb around walking instead of driving would be enormously ___.",
        options: ["expensive", "expense", "expensively", "expenses"],
        correctOptionIndex: 0,
      },
    ],
  },
};

export function gradeBagrutSection(units: BagrutStudyUnits, answers: (number | null)[]): { correct: number; total: number; percent: number } {
  const { questions } = BAGRUT_PLACEMENT_SECTIONS[units];
  const correct = questions.filter((q, i) => answers[i] === q.correctOptionIndex).length;
  return { correct, total: questions.length, percent: Math.round((correct / questions.length) * 100) };
}

export type BagrutReadiness = "foundation" | "building" | "ready";

// Deliberately coarse: a handful of questions can say "start with the
// basics" vs "go straight to exam-format practice", nothing finer, and it
// never predicts a grade.
export function bagrutReadiness(percent: number): BagrutReadiness {
  if (percent >= 80) return "ready";
  if (percent >= 50) return "building";
  return "foundation";
}

export const BAGRUT_READINESS_COPY: Record<BagrutReadiness, { titleHe: string; bodyHe: string }> = {
  foundation: {
    titleHe: "כדאי להתחיל מחיזוק הבסיס",
    bodyHe: "קטע בפורמט הבגרות עדיין מאתגר. מומלץ לשלב תרגול קריאה ואוצר מילים ברמה שלכם עם ערכת בגרות אחת בשבוע.",
  },
  building: {
    titleHe: "בדרך הנכונה",
    bodyHe: "רוב השאלות בפורמט הבגרות כבר מסתדרות. כדאי לעבוד על ערכות התרגול של המסלול שלכם ולשים לב לסוגי השאלות שבהם טעיתם.",
  },
  ready: {
    titleHe: "מוכנים לתרגול בפורמט מלא",
    bodyHe: "פורמט השאלות מוכר לכם. השלב הבא הוא ערכות מלאות עם קטעים ארוכים יותר ותרגול בזמן אמת, כמו בבחינה.",
  },
};

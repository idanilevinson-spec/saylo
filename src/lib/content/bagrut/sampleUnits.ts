// Original sample content demonstrating the verified module formats in
// moduleFormats.ts — see docs/specs/bagrut-track.md §2.2, §5, and §8.
//
// This content was composed from scratch for this file. Nothing here was
// copied, adapted, or even read from any actual Bagrut exam, past or
// present — the research behind moduleFormats.ts only ever looked at how
// exams are STRUCTURED (sections, point values, word counts), never at real
// exam text, specifically so there would be nothing to accidentally echo.
//
// Module C is a special case worth flagging too: its structure was finally
// confirmed (2026-10-02) by checking the real current official exam's own
// instructions page (duration, point split, essay word-count instruction) —
// not a third-party guide. The passage and questions in that real exam were
// NOT read, used, or adapted for anything below; "The Repair Café" is an
// unrelated, original topic composed independently, same discipline as
// every other module here.
//
// Module D is a special case worth flagging explicitly: the real exam tests
// specific literary works (a story and a poem) chosen by the Ministry and
// studied in advance — we don't know, and can't guess, which works are on
// the current official list. The module D sample below is an ORIGINAL short
// story, included only to practice the KIND of close-reading/analysis
// module D asks for — never presented as "the" assigned text. See the
// titleHe and the disclaimer rendering in BagrutPracticeUnit.tsx.
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

// Only module A currently needs this (30 of its 100 points), reusing the
// same Neural TTS engine as /listening (ListeningPlayer) rather than a new
// audio component.
export interface BagrutListeningTask {
  transcriptEn: string;
  questions: BagrutReadingQuestion[];
}

export interface BagrutSampleUnit {
  moduleCode: BagrutModuleCode;
  titleHe: string;
  teacherReviewed: boolean;
  aiContentDisclosed: boolean;
  // A module's own verified format (moduleFormats.ts) says how many
  // passages this should be and what each one's word-count range is — A has
  // two separate ~300–350 word passages, B/E/F/G have one, D has one
  // (literature) story. Always at least one entry.
  readingPassages: string[];
  readingQuestions: BagrutReadingQuestion[];
  listeningTask?: BagrutListeningTask;
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

const CAMPUS_VOICES_TRANSCRIPT = `Good morning, and welcome back to Campus Voices. Today we're talking to Noa Admon, a second-year engineering student who recently started a small project to help new students find their way around campus. Noa, thanks for joining us.

So, tell us, how did this project begin? Well, during my first week here, I got lost about four times a day. The campus map online was outdated, and none of the buildings were clearly numbered. I thought, there has to be a better way. So, together with two friends, I built a simple phone app that shows live directions between buildings, plus a short description of what's inside each one.

That's wonderful. How many students are using it so far? Right now, around six hundred students have downloaded it, mostly first-years. We're also getting messages from international students, who say it's especially useful for them, since a lot of the campus signs are only in Hebrew.

What's next for the project? We're hoping to add real-time information about which classrooms are free, so students can find a quiet place to study between classes.

That sounds incredibly useful. Thanks so much for talking with us, Noa. Thank you for having me.`;

const OUTDOOR_LESSONS_PASSAGE = `Two years ago, Hillside Middle School decided to try something unusual: instead of keeping every class inside a classroom, teachers began holding some lessons outdoors, in the school's courtyard and the small wooded area behind the gym.

The idea came from a science teacher, Mr. Doron, who noticed that students seemed more focused after spending time outside during breaks. He suggested that one lesson per week, in any subject, could be taught outdoors instead of in the usual classroom. At first, several teachers were doubtful. They worried that students would be distracted by noise, insects, or simply the novelty of sitting on the grass instead of at a desk.

The first few outdoor lessons were, admittedly, a little chaotic. Students had trouble staying quiet, and one math lesson had to be cut short because of unexpected rain. However, teachers slowly adjusted their methods, bringing portable whiteboards and preparing shorter, more interactive activities suited to the outdoor setting.

Within a few months, something changed. Students who rarely participated in regular classroom discussions began raising their hands outside. A geography teacher reported that her outdoor map-reading lesson led to the liveliest class discussion she'd had all year. Several students later said they simply felt calmer and less pressured outdoors, which made it easier to speak up.

By the end of the first year, the program had grown from one weekly lesson to three, and other schools in the district began asking Hillside for advice on starting similar programs of their own. Mr. Doron, who still teaches most of his science lessons outdoors, says the biggest lesson wasn't about plants or weather at all — it was about how much a change of environment can affect how comfortable students feel to speak up and take part. Teachers who were once skeptical now request the courtyard for their own lessons weeks in advance, and the program shows no sign of slowing down.`;

const BLACKOUT_PASSAGE = `At around eight o'clock on a Tuesday evening in March, the electricity suddenly went out across most of the Neve Dan neighborhood. For the first hour, nobody thought much of it — power cuts were rare, but not unheard of, and most residents assumed it would be fixed within minutes.

By nine o'clock, however, it became clear that this was no ordinary outage. The entire street was dark except for the headlights of parked cars and the occasional flashlight moving between windows. Rumors spread quickly: some neighbors said a transformer had exploded nearby, while others blamed the storm that had passed through earlier that day.

What happened next surprised many residents. Instead of everyone retreating indoors to wait it out alone, small groups began gathering outside their buildings. Someone brought out a portable speaker. A family on the ground floor set up a few folding chairs on the sidewalk and invited neighbors to sit. Within half an hour, nearly thirty people — many of whom had barely spoken to each other before — were standing or sitting together in the dark, sharing snacks and swapping stories by candlelight.

One elderly resident, who had lived on the street for over twenty years, later said it reminded her of neighborhood gatherings from decades earlier, before every building had its own security gate and every resident kept mostly to themselves. A teenager who lived two buildings down said it was the first time he had actually spoken to most of his neighbors, despite living there his whole life.

The power finally returned just after midnight, four hours after it first went out. Most residents went back inside fairly quickly, but something had shifted. In the weeks that followed, several neighbors who met that night began organizing a monthly outdoor gathering, power outage or not — proof, some said, that it sometimes takes losing something ordinary to notice what had been missing all along.`;

const REPAIR_CAFE_PASSAGE = `Every second Saturday of the month, the community hall in Oakdale fills up with an unusual kind of visitor. People arrive carrying broken toasters, torn jackets, wobbly chairs, and old radios that stopped working years ago. They are not there to sell these items or throw them away — they are there to fix them, with help from volunteers who call their gathering the Repair Café.

The idea started three years ago when a retired electrician, Mr. Harel, grew frustrated watching neighbors throw away appliances that needed only a small part replaced. He put up a notice offering free repairs one Saturday a month, expecting perhaps a handful of people to show up. Instead, over thirty people arrived on the very first day, many of them simply curious to watch rather than needing anything fixed themselves.

Word spread quickly, and other volunteers with different skills joined Mr. Harel: a seamstress who could mend torn clothing, a young engineering student who specialized in small electronics, and a carpenter who repaired wobbly furniture in exchange for nothing more than a cup of coffee. Visitors are never charged a fee, though many choose to leave a small donation toward the cost of tools and spare parts.

What surprised the organizers most was not how many items got fixed, but how many friendships formed between people who had lived on the same street for years without ever really speaking. Teenagers waiting for their turn would end up chatting with elderly visitors about appliances neither of them actually understood, and several regular volunteers now meet for coffee outside of the monthly event entirely.

Mr. Harel says the Repair Café was never really about the toasters. "People bring us their broken things," he says, "but what they actually leave with is time spent with a neighbor — something just as hard to find these days as a spare part for a thirty-year-old radio."`;

const LAST_LESSON_STORY = `Mrs. Avram had taught the same classroom for thirty-one years. On her last day before retirement, she arrived earlier than usual, carrying a small cardboard box she planned to fill before noon.

The students didn't know it was her final lesson. She had asked the principal not to announce it, afraid that a fuss would be made, flowers brought, speeches given — the kind of attention she had quietly avoided her entire career.

She taught the lesson exactly as she always did: writing neatly on the board, calling on students by name, pausing to let a slow learner finish a thought rather than rushing to the next hand raised. When the bell rang, the students gathered their bags and filed out, barely glancing back, the way students always do when a lesson is simply over, not ending anything larger.

Mrs. Avram sat alone for a moment. Then she began filling her box: a chipped mug, a stack of ungraded essays she would never return, a photograph of a class from many years earlier, their faces now unfamiliar to her. At the bottom of her desk drawer, she found a folded note a student had once passed her — "Thank you for not giving up on me" — unsigned, the ink faded almost to nothing.

She had forgotten the note existed. She did not remember which student had written it, or in which year. For a moment she considered that this, perhaps, was the only ending a thirty-one-year career truly needed: not a ceremony, but a quiet classroom, an ordinary Tuesday, and a single sentence she had kept without knowing why.`;

const LIBRARY_PASSAGE = `When the town council in Carmel Heights first proposed replacing the local library's front desk with a self-service kiosk, many residents worried the change would make the building feel cold and impersonal. Two years later, something unexpected happened: the library became busier than ever, not in spite of the change but partly because of it.

The renovation, completed with a modest municipal grant, allowed the library to stay open to card-holders around the clock, using an automated entry system instead of relying on staff to be present at all hours. Visitors could scan their library card at a side entrance, enter a smaller reading room equipped with security cameras, and borrow or return books using self-checkout machines, even at two in the morning.

At first, usage during the overnight hours was minimal — mostly a handful of university students preparing for exams. Within a few months, however, librarians noticed a clear pattern: parents of young children were showing up shortly after bedtime, finally finding time to browse quietly without interruption, something many said had become nearly impossible during the library's previous, more limited hours.

Shift workers made up another unexpected group of frequent late-night visitors. A nurse who works overnight hospital shifts said the extended hours meant she could finally visit the library on her way home at six in the morning, rather than having to choose between sleep and reading time on her rare days off.

Not everyone was pleased with the change. Some long-time staff members raised concerns about safety and about the loss of the personal guidance a librarian could once offer browsing visitors. In response, the library kept staffed hours during the traditional daytime schedule, reserving the unstaffed overnight access only for returning and borrowing, not for research help or children's programs.

Perhaps the most telling sign of the project's success came a year after launch, when the town's youth council voted to request a similar system for the local sports center, arguing that teenagers, much like night-shift nurses and sleep-deprived parents, often needed access to spaces at hours that did not match a traditional nine-to-five schedule. The library, it seemed, had quietly proven something broader than anyone first expected: that access, not just content, can determine whether a public service truly serves its community. Town officials now describe the extended-hours model less as an experiment and more as a correction — a recognition that a schedule built around a traditional workday had, for years, simply excluded anyone whose life didn't fit it.`;

const ALWAYS_REACHABLE_PASSAGE = `For most of human history, being unreachable was simply the default condition of being away from home. A traveler, once departed, might be out of contact with family and colleagues for days, weeks, or in earlier centuries, months at a time. Today, that condition has become not the default but the exception — carefully engineered through flight mode, remote cabins, or simply, increasingly rarely, the willpower to leave a phone behind.

Researchers studying workplace behavior have become particularly interested in what they call "the expectation of availability" — the unspoken assumption, common in many modern workplaces, that an employee ought to be reachable outside of official working hours, even if no policy explicitly requires it. A recent study following several hundred office workers found that the mere perception of being expected to respond quickly to messages, regardless of whether a reply was actually demanded, was strongly associated with elevated stress levels and reduced satisfaction with one's personal time, even among employees who received relatively few messages after hours.

What makes this phenomenon especially difficult to address, according to the researchers, is that it rarely stems from an explicit rule. Few managers formally instruct employees to answer emails at ten at night. Instead, the expectation tends to form gradually, through small, often unintentional signals: a manager who regularly sends messages late in the evening, even without expecting an immediate reply, can inadvertently create a culture in which employees feel obligated to at least appear responsive, lest they be perceived as uncommitted.

Some companies have attempted structural solutions. A handful of organizations have experimented with software that delays the delivery of emails sent outside working hours until the following morning, regardless of when they were actually written. Early results suggest this reduces the sense of obligation employees feel to respond immediately, though critics argue it treats a cultural problem as though it were merely a technical one, and does little to address managers who simply call instead.

Other voices in the debate take a different view entirely, arguing that the discomfort many employees feel is not evidence of a problem to be solved through policy, but a natural, perhaps even necessary, adjustment to a world that has genuinely changed. Work, they argue, has never been strictly confined to fixed hours for everyone, and the real task is not to recreate an imagined past of clean separation, but to build healthier individual habits within a connected present that is not going away.

Whichever view one takes, few dispute the underlying fact uncovered by the research: it is often not the message itself, but the quiet, half-conscious sense of being expected to answer it, that exacts the greater cost.`;

export const BAGRUT_SAMPLE_UNITS: readonly BagrutSampleUnit[] = [
  {
    moduleCode: "A",
    titleHe: "דוגמה למודול A — הדרכה בקמפוס",
    teacherReviewed: false,
    aiContentDisclosed: true,
    listeningTask: {
      transcriptEn: CAMPUS_VOICES_TRANSCRIPT,
      questions: [
        {
          formatHe: "רב-ברירה",
          promptEn: "Why did Noa decide to start the project?",
          options: [
            "Because she kept getting lost on campus during her first week",
            "Because her professor asked her to build an app",
            "Because she wanted to start a business",
            "Because the campus map was too expensive to print",
          ],
          correctOptionIndex: 0,
          modelAnswerHe: "תשובה נכונה: A.",
        },
        {
          formatHe: "השלמת משפט",
          promptEn: "According to Noa, international students find the app especially useful because many campus signs are ___.",
          modelAnswerHe: "תשובה: only in Hebrew.",
        },
        {
          formatHe: "רב-ברירה",
          promptEn: "How many students are currently using the app, according to Noa?",
          options: ["About sixty", "About six hundred", "About six thousand", "About sixteen hundred"],
          correctOptionIndex: 1,
          modelAnswerHe: "תשובה נכונה: B.",
        },
        {
          formatHe: "שאלה פתוחה",
          promptEn: "What does Noa hope to add to the app in the future? Explain in your own words.",
          modelAnswerHe:
            "תשובה מקובלת: מידע בזמן אמת על אילו כיתות פנויות, כדי שתלמידים ימצאו מקום שקט ללמוד בין שיעורים.",
        },
      ],
    },
    readingPassages: [OUTDOOR_LESSONS_PASSAGE, BLACKOUT_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why did Mr. Doron suggest holding lessons outdoors?",
        options: [
          "He noticed students seemed more focused after being outside",
          "He wanted to save money on classroom supplies",
          "The school building was being repaired",
          "Parents demanded a change",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "According to the text, one of the first outdoor lessons had to be cut short because of ___.",
        modelAnswerHe: "תשובה: unexpected rain.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn:
          "According to the text, why did some students who rarely spoke up in regular classrooms begin to participate outdoors? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: הם הרגישו רגועים יותר ופחות לחוצים בחוץ, מה שהקל עליהם להשתתף.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What did neighbors do once it became clear the power outage wasn't a quick fix?",
        options: [
          "They all went to a nearby hotel for the night",
          "They gathered outside together and spent time with each other",
          "They called the news to complain",
          "They left the neighborhood",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The elderly resident said the gathering reminded her of ___.",
        modelAnswerHe: "תשובה מקובלת: neighborhood gatherings from decades earlier, before every building had a security gate.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, what changed in the weeks after the blackout? Support your answer with information from the text.",
        modelAnswerHe:
          "תשובה מקובלת: כמה שכנים שנפגשו באותו ערב התחילו לארגן מפגש חודשי קבוע בחוץ, גם בלי הפסקת חשמל.",
      },
    ],
  },
  {
    moduleCode: "B",
    titleHe: "דוגמה למודול B — הפינה הירוקה",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [GREEN_CORNER_PASSAGE],
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
    moduleCode: "C",
    titleHe: "דוגמה למודול C — קפה התיקונים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [REPAIR_CAFE_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why did Mr. Harel start the Repair Café?",
        options: [
          "He wanted to start a business repairing appliances",
          "He was frustrated that neighbors threw away items that needed only small repairs",
          "He needed extra income after retiring",
          "A local company asked him to organize it",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn:
          "On the first day of the Repair Café, about thirty people showed up, and many of them came only to ___.",
        modelAnswerHe: "תשובה: watch, not because they needed anything fixed themselves.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, what different skills did the volunteers who joined Mr. Harel bring? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: תפירה ותיקון בגדים, תיקון מכשירים אלקטרוניים קטנים, ותיקון רהיטים.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "How much do visitors pay to have something fixed at the Repair Café?",
        options: [
          "A fixed fee set by the organizers",
          "Nothing, though many leave a small donation",
          "Only the cost of spare parts",
          "A membership fee paid once a year",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn:
          "According to Mr. Harel, what do people actually leave the Repair Café with, besides a fixed item? Support your answer with information from the text.",
        modelAnswerHe: "תשובה מקובלת: זמן שבילו עם שכן — חיבור חברתי, לא רק הפריט המתוקן עצמו.",
      },
    ],
    writingTask: {
      promptEn:
        "Describe a time when you helped someone or were helped by someone in your community. What happened, and how did it make you feel?",
      wordCountRange: [70, 90],
    },
  },
  {
    moduleCode: "D",
    titleHe: "דוגמה לתרגול ניתוח ספרותי בסגנון מודול D — \"השיעור האחרון\"",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [LAST_LESSON_STORY],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why did Mrs. Avram ask the principal not to announce that it was her last lesson?",
        options: [
          "She didn't want a fuss or attention made about it",
          "She was embarrassed about retiring",
          "She wasn't sure she wanted to retire",
          "She wanted to surprise the students later",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "שאלת ניתוח",
        promptEn:
          "What does the detail of the students 'barely glancing back' suggest about how ordinary the moment felt to them, compared to how it felt to Mrs. Avram? Answer in your own words, referring to the text.",
        modelAnswerHe:
          "תשובה מקובלת: בעוד שעבור התלמידים זה היה עוד שיעור רגיל שנגמר, עבור מורה אברם זה היה רגע משמעותי של סיום קריירה שלמה — הטקסט מדגיש את הפער בין איך שני הצדדים חוו את אותו רגע.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "At the bottom of her desk drawer, Mrs. Avram found ___.",
        modelAnswerHe: "תשובה: a folded, unsigned note from a former student.",
      },
      {
        formatHe: "שאלת ניתוח",
        promptEn:
          "In your opinion, why does the story end with the note rather than with a classroom ceremony? What does this suggest about the kind of ending the writer believes a long career 'truly needed'? Answer in your own words.",
        modelAnswerHe:
          "תשובה פתוחה — התלמיד צריך להתייחס לרעיון שהכרה אמיתית ותודה אישית, אפילו קטנה ואנונימית, משמעותית יותר מטקס רשמי; חשוב שהתשובה תתבסס על הטקסט עצמו.",
      },
    ],
    writingTask: {
      promptEn:
        "Write a short composition about a teacher, coach, or mentor who had an impact on you — even if they never knew it. Describe what they did and why it mattered to you.",
      wordCountRange: [100, 120],
    },
  },
  {
    moduleCode: "E",
    titleHe: "דוגמה למודול E — אופניים שיתופיים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [BIKE_SHARE_PASSAGE],
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
  {
    moduleCode: "F",
    titleHe: "דוגמה למודול F — הספרייה שלא נסגרת",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [LIBRARY_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why did some residents originally worry about replacing the front desk with a self-service kiosk?",
        options: [
          "They thought it would make the library feel cold and impersonal",
          "They thought it would be too expensive",
          "They thought it would increase theft immediately",
          "They thought it would reduce the number of books available",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "According to the text, parents of young children began visiting the library late at night because ___.",
        modelAnswerHe:
          "תשובה מקובלת: it finally gave them time to browse quietly without interruption, something that was nearly impossible during the library's previous, more limited hours.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, why was the extended-hours system especially useful for the nurse mentioned in the article? Answer in your own words.",
        modelAnswerHe:
          "תשובה מקובלת: היא עובדת במשמרות לילה בבית חולים, והשעות המורחבות אפשרו לה לבקר בספרייה בדרך הביתה בשש בבוקר, במקום לבחור בין שינה לקריאה בימי החופש הנדירים שלה.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What limitation did the library keep in place even after the change?",
        options: [
          "Overnight visitors could not borrow books at all",
          "Research help and children's programs were only available during staffed daytime hours",
          "Only university students were allowed overnight access",
          "The library closed completely on weekends",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What broader idea does the writer suggest the library's project proved, according to the text? Support your answer with information from the text.",
        modelAnswerHe:
          "תשובה מקובלת: שגישה (לא רק תוכן) יכולה לקבוע אם שירות ציבורי באמת משרת את הקהילה שלו — תושבים כמו אחיות במשמרת לילה או הורים עייפים זקוקים לגישה בשעות שלא תואמות יום עבודה רגיל.",
      },
    ],
    writingTask: {
      promptEn:
        "Describe a public place in your town or city (such as a library, park, or community center) that you think should be improved or changed. Explain what you would change and why.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "G",
    titleHe: "דוגמה למודול G — המחיר של זמינות מתמדת",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [ALWAYS_REACHABLE_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn:
          "According to the text, what did researchers find was strongly associated with elevated stress, even among employees who received few after-hours messages?",
        options: [
          "The actual number of messages received",
          "The perception of being expected to respond quickly",
          "The type of device used for work",
          "The length of the average workday",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, how can an 'expectation of availability' form without any explicit workplace rule? Explain in your own words.",
        modelAnswerHe:
          "תשובה מקובלת: דרך אותות עקיפים ולא מכוונים — למשל מנהל ששולח הודעות בשעות מאוחרות, גם בלי לצפות לתגובה מיידית, יוצר תחושה שהעובדים צריכים להיראות זמינים כדי לא להיתפס כלא מחויבים.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Critics of email-delay software argue that it treats a cultural problem as though it were merely ___.",
        modelAnswerHe: "תשובה: a technical one.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which of the following best describes the view of those who see the discomfort as a 'natural adjustment' rather than a problem?",
        options: [
          "They believe strict separation between work and personal time has always existed and should be restored",
          "They argue that some groups have always carried round-the-clock responsibilities, so building better habits matters more than recreating a clean separation",
          "They think companies should ban all after-hours communication entirely",
          "They believe the research findings are incorrect",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What is the 'underlying fact' the text says few people dispute, regardless of which side of the debate they take? Support your answer with information from the text.",
        modelAnswerHe:
          "תשובה מקובלת: שלא ההודעה עצמה היא הבעיה העיקרית, אלא התחושה החצי-מודעת של ציפייה להגיב אליה — זה מה שגובה את המחיר הגבוה יותר.",
      },
    ],
    writingTask: {
      promptEn:
        "Some people believe employees should have a legal 'right to disconnect' — meaning they cannot be contacted by their employer outside working hours. Do you agree or disagree with this idea? Give reasons and examples to support your opinion.",
      wordCountRange: [120, 140],
    },
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

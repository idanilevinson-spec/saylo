import type { CefrLevel } from "@/types/database";

// The course: every level cut into units, each unit one real-life theme
// that ties together content which already exists in the separate areas
// (a vocabulary topic, the grammar that theme needs, a text or a clip, a
// conversation with the teacher, a piece of writing). The areas stay for
// free practice; this is the order to learn them in.
//
// Steps point at content by a stable key, never by row id where a key
// exists: topic/grammar/scenario slug, reading/listening English title,
// writing prompt id (prompts have nothing else stable). The old
// hand-seeded learning_path_nodes went stale silently; this file can't,
// because scripts/course-audit.mjs checks every key against the database
// and lists published content that no unit uses yet. Run it after adding
// content.

export type CourseStepKind = "vocabulary" | "grammar" | "reading" | "listening" | "speaking" | "writing";

export interface CourseStep {
  kind: CourseStepKind;
  ref: string;
}

export interface CourseUnit {
  id: string;
  level: CefrLevel;
  titleHe: string;
  // What the learner can do after the unit, said to them (plural, as
  // everywhere in the app). Shown on the unit and on the course map.
  goalHe: string;
  steps: CourseStep[];
}

const v = (ref: string): CourseStep => ({ kind: "vocabulary", ref });
const g = (ref: string): CourseStep => ({ kind: "grammar", ref });
const r = (ref: string): CourseStep => ({ kind: "reading", ref });
const l = (ref: string): CourseStep => ({ kind: "listening", ref });
const s = (ref: string): CourseStep => ({ kind: "speaking", ref });
const w = (ref: string): CourseStep => ({ kind: "writing", ref });

type UnitDef = Omit<CourseUnit, "id" | "level">;

const LEVEL_UNITS: Record<CefrLevel, UnitDef[]> = {
  A1: [
    {
      titleHe: "נעים להכיר",
      goalHe: "להציג את עצמכם, להגיד מאיפה אתם ולשאול מה שלום מישהו",
      steps: [v("greetings"), v("school"), g("verb-to-be"), l("Meeting in the Park"), s("meeting-classmate"), w("669bd51a-db9f-4021-9363-e3c59424156a")],
    },
    {
      titleHe: "המשפחה שלי",
      goalHe: "לספר מי במשפחה שלכם, איך קוראים להם ומה הם עושים",
      steps: [v("family"), g("possessive-adjectives"), r("My Family"), s("talking-about-family"), w("c826c1c3-ee8d-4b77-8151-eee89fe2a791")],
    },
    {
      titleHe: "החדר שלי",
      goalHe: "לתאר מה יש בחדר שלכם ואיזה צבע יש לכל דבר",
      steps: [v("colors"), g("there-is-there-are"), r("My Room"), w("194631a4-64f9-4bad-96dd-5d5282b27cfc")],
    },
    {
      titleHe: "היום שלי",
      goalHe: "לספר מה אתם עושים בכל יום ובאיזו שעה",
      steps: [v("daily-routines"), v("time-days"), g("present-simple"), r("My School Day"), l("At School")],
    },
    {
      titleHe: "אוכל וקניות",
      goalHe: "להזמין משהו לאכול ולשתות ולשאול כמה זה עולה",
      steps: [v("food-drink"), v("numbers"), g("plurals"), r("At the Market"), l("Ordering Coffee"), s("coffee-shop-order"), w("607e7b70-f0e9-4724-af68-5bf4c6879e12")],
    },
    {
      titleHe: "בגדים",
      goalHe: "לבקש בגד בחנות ולתאר מה אתם לובשים",
      steps: [v("clothes"), g("articles"), l("At the Supermarket"), s("buying-clothes")],
    },
    {
      titleHe: "בעיר",
      goalHe: "לשאול איך מגיעים למקום ולהבין הוראות פשוטות",
      steps: [v("places-in-town"), g("imperatives"), r("A Day in the Park"), s("asking-directions"), w("c8a254c6-2ce6-4909-bacc-5952aaa3f936")],
    },
    {
      titleHe: "מזג אוויר וזמן פנוי",
      goalHe: "לדבר על מזג האוויר ועל מה שאתם אוהבים לעשות",
      steps: [v("weather"), v("hobbies"), g("object-pronouns"), r("My Favorite Season"), l("The Weather Today"), s("weather-smalltalk"), w("7d293775-cfe4-4f90-adeb-c8258968bda8")],
    },
    {
      titleHe: "אצל הרופא",
      goalHe: "להגיד מה כואב לכם ולשאול שאלות פשוטות",
      steps: [v("body-parts"), g("question-words"), l("A Phone Call"), s("doctor-visit-simple")],
    },
    {
      titleHe: "חיות וטבע",
      goalHe: "לתאר חיות ומקומות בחוץ במשפטים פשוטים",
      steps: [v("animals"), r("Animals on the Farm"), r("A Day at the Beach"), w("0f05ab9e-4b1e-40fc-b6fa-a6e48eb18154")],
    },
  ],
  A2: [
    {
      titleHe: "מה עשיתם בסוף השבוע",
      goalHe: "לספר מה עשיתם אתמול ובסוף השבוע",
      steps: [v("celebrations"), g("past-simple"), r("A Rainy Weekend"), l("Lost Keys"), s("small-talk"), w("352f1f83-d537-453f-b8e8-e00bbb1474f6")],
    },
    {
      titleHe: "מה קורה עכשיו",
      goalHe: "לתאר מה קורה סביבכם ברגע זה",
      steps: [v("sports-fitness"), g("present-continuous"), l("At the Train Station"), s("sports-talk")],
    },
    {
      titleHe: "הבית והשכנים",
      goalHe: "לתאר איפה דברים נמצאים ולדבר עם השכנים",
      steps: [v("house-furniture"), g("prepositions-time-place"), r("A New Neighbour"), l("A New Neighbour"), s("neighbor-chat")],
    },
    {
      titleHe: "במטבח",
      goalHe: "להסביר איך מכינים מנה פשוטה ומה צריך בשבילה",
      steps: [v("kitchen-cooking"), g("countable-uncountable"), r("Cooking Dinner"), l("Drive-Through Order"), w("dc881f7d-4d5b-4a92-9acb-c90794adcf9b")],
    },
    {
      titleHe: "קניות",
      goalHe: "להשוות בין מוצרים ולהסביר מה בחרתם ולמה",
      steps: [v("shopping"), g("comparatives-superlatives"), l("Buying a Birthday Present"), s("asking-for-recommendations"), w("2da38a67-04e9-48e1-af7e-07df6c172000")],
    },
    {
      titleHe: "בריאות",
      goalHe: "לתאר תסמינים ולהבין מה הרופא ממליץ לעשות",
      steps: [v("at-the-doctor"), g("modals-can-must-should"), r("A Visit to the Doctor"), l("Calling the Dentist"), s("doctor-visit")],
    },
    {
      titleHe: "תוכניות לטיול",
      goalHe: "לספר על תוכניות לטיול הבא ומה תעשו בו",
      steps: [v("nature-outdoors"), g("future-going-to"), r("Our Class Trip to the Desert"), s("weekend-plans"), w("8a50029f-f438-423b-9a69-61e2caf6667a")],
    },
    {
      titleHe: "הרגלים",
      goalHe: "לספר כמה פעמים אתם עושים דברים ומה ההרגלים שלכם",
      steps: [g("adverbs-of-frequency"), r("A Day Without a Phone"), s("healthy-habits"), w("f6d87799-d352-4f3a-8d4b-e28537860ea9")],
    },
    {
      titleHe: "בעבודה",
      goalHe: "לספר מה העבודה שלכם ומה צריך לעשות בה",
      steps: [v("jobs-professions"), g("have-to"), r("My First Job"), l("Scheduling a Meeting"), w("df3458db-6550-4ada-bca8-6a49e404f888")],
    },
    {
      titleHe: "חברים",
      goalHe: "לתאר חברים, מה הם מרגישים ומה שייך למי",
      steps: [v("emotions-feelings"), g("possessive-s"), l("A Message from School"), s("new-friend"), w("f7a9b470-c0c1-4331-a2a9-81e769c416d3")],
    },
    {
      titleHe: "בדרכים",
      goalHe: "להתמצא בשדה התעופה, ברכבת ובמונית",
      steps: [v("transportation"), r("Lost at the Airport"), r("A Trip to the City"), l("Booking a Taxi"), s("airport-checkin")],
    },
  ],
  B1: [
    {
      titleHe: "חוויות",
      goalHe: "לספר על דברים שעשיתם בחיים ועל מקומות שהייתם בהם",
      steps: [v("relationships"), g("present-perfect"), r("Learning a New Language"), s("reconnecting"), w("642a1f3f-8ced-4ca5-8fde-b194b5a65d26")],
    },
    {
      titleHe: "כשמשהו משתבש",
      goalHe: "לספר מה קרה כשמשהו השתבש ומה עשיתם",
      steps: [g("past-continuous"), l("Missed the Bus"), s("travel-problem"), w("f46bf85c-1034-4e47-9b22-0ac923c815ce")],
    },
    {
      titleHe: "ראיון עבודה",
      goalHe: "לדבר על הניסיון שלכם בראיון עבודה",
      steps: [v("work-office"), g("present-perfect-vs-past-simple"), r("Working From Home"), l("Instructions for a New Job"), s("job-interview"), w("b79bfec1-8baf-4169-918f-8ea0a02f05d5")],
    },
    {
      titleHe: "כסף",
      goalHe: "לדבר על כסף ועל מה יקרה אם תעשו בחירה מסוימת",
      steps: [v("money-banking"), g("first-conditional"), r("Saving Money as a Student"), l("Choosing a Phone Plan"), s("phone-plan-inquiry")],
    },
    {
      titleHe: "תכנון נסיעה",
      goalHe: "לתכנן נסיעה ולבקש מידע במייל",
      steps: [v("travel-planning"), g("future-will"), l("Planning a Vacation"), s("renting-a-car"), w("a47397a6-01a6-4277-b599-19f917f6cfb1")],
    },
    {
      titleHe: "דירה חדשה",
      goalHe: "להסביר כללים בבית ולפתור בעיה עם בעל הדירה",
      steps: [v("housing-renting"), g("zero-conditional"), r("Adjusting to a New City"), l("A Voice Message from the Landlord"), w("a48da4d1-fba0-4356-875d-17334cdc8306")],
    },
    {
      titleHe: "אוכלים בחוץ",
      goalHe: "להזמין, להמליץ על מקום ולהתלונן בנימוס",
      steps: [v("eating-out"), g("question-tags"), r("The Night Market"), l("A Complaint at a Restaurant"), s("customer-complaint"), w("4e6ff914-06fe-4c6c-a5e1-1c2889edec8d")],
    },
    {
      titleHe: "מה שאתם אוהבים",
      goalHe: "לדבר על תחביבים, על האופי שלכם ועל מה שהחלטתם לעשות",
      steps: [v("personality"), g("verb-gerund-or-infinitive"), r("Why I Started Running"), s("party-conversation"), w("4e52d6f9-556d-4cdb-a48d-9ada0f57801c")],
    },
    {
      titleHe: "מטרות ושינויים",
      goalHe: "לדבר על תוכניות שעוד לא בטוחות ועל מטרות לעתיד",
      steps: [g("may-might-possibility"), r("Learning to Cook at Thirty"), l("A Change of Plans"), s("future-goals"), w("f6d3c7ea-9800-43cf-90ea-43b1ea20972f")],
    },
    {
      titleHe: "טכנולוגיה וחדשות",
      goalHe: "להביע דעה על טכנולוגיה, רשתות חברתיות וחדשות",
      steps: [v("technology"), v("media-news"), g("so-such"), r("The Benefits of Reading Books"), s("group-project"), w("92b7a5c9-f141-41fe-93ad-ea5a693b1f45")],
    },
  ],
  B2: [
    {
      titleHe: "אילו",
      goalHe: "לדבר על מצבים דמיוניים ומה הייתם עושים בהם",
      steps: [v("society-issues"), g("second-conditional"), r("A Shorter Week?"), s("big-life-decision"), w("36c3d658-120e-4243-9531-b797ac1f6d0d")],
    },
    {
      titleHe: "הסביבה",
      goalHe: "להסביר תהליכים ובעיות סביבתיות",
      steps: [v("environment-climate"), g("passive-voice"), r("The Rise of Renewable Energy"), l("A Discussion About the Environment"), s("environmental-concerns")],
    },
    {
      titleHe: "חדשות ורשתות",
      goalHe: "לדווח מה אנשים אמרו ומה קרה",
      steps: [v("digital-life"), g("reported-speech"), r("The Impact of Social Media"), s("discussing-the-news"), w("a6ca42c7-72a0-4466-86ea-adc3a3ec1e7c")],
    },
    {
      titleHe: "אמנות ותרבות",
      goalHe: "לתאר יצירה בפירוט ולהמליץ עליה",
      steps: [v("arts-culture"), g("relative-clauses"), r("Why Songs Get Stuck in Our Heads"), s("cultural-differences"), w("04280a15-e45f-4770-855a-3a2a33020144")],
    },
    {
      titleHe: "להסיק מסקנות",
      goalHe: "להסיק מסקנות ממה שאתם רואים ושומעים",
      steps: [v("crime-law"), g("modals-of-deduction"), l("Weekend Plans, Kind Of"), s("disagreement")],
    },
    {
      titleHe: "לספר סיפור",
      goalHe: "לספר סיפור לפי סדר האירועים",
      steps: [g("past-perfect"), r("The Hidden Cost of Fast Fashion"), l("Running Late")],
    },
    {
      titleHe: "פעם",
      goalHe: "לספר איך דברים היו פעם ומה השתנה",
      steps: [v("education-learning"), g("used-to-would"), r("Are You a Morning Person?"), s("university-interview")],
    },
    {
      titleHe: "בריאות ושינה",
      goalHe: "לדבר על הרגלים ועל מה שאתם עושים כבר תקופה",
      steps: [v("health-wellness"), g("present-perfect-continuous"), r("The Science of Sleep"), l("A Podcast Opening: Screens and Sleep")],
    },
    {
      titleHe: "משאלות וחרטות",
      goalHe: "להביע חרטה ומשאלות ולדבר על מתח בקשרים",
      steps: [g("wish-if-only"), r("The Psychology of Procrastination"), s("family-conflict"), w("52888739-6a20-4e3f-ab05-a235f3d3bf31")],
    },
    {
      titleHe: "שירותים ותיקונים",
      goalHe: "להסביר מה צריך שיתקנו או יעשו בשבילכם, ולהתלונן",
      steps: [v("urban-life"), g("causative-have-get"), l("Returning a Faulty Laptop"), w("65db4d0b-e008-4dcb-81c1-77c6329c8c60")],
    },
    {
      titleHe: "קריירה",
      goalHe: "לדבר על מטרות מקצועיות ולנהל משא ומתן על תנאים",
      steps: [v("careers"), g("future-continuous-perfect"), r("The Future of Remote Work"), l("A Job Interview"), s("negotiating-salary"), w("5dcc5033-c9b4-40c5-9869-a45d6ef24b6e")],
    },
    {
      titleHe: "פגישות ומצגות",
      goalHe: "להציג רעיון בפגישה ולקבל משוב",
      steps: [v("careers"), r("How Bees Keep Food on Our Tables"), l("Feedback After a Presentation"), s("giving-a-presentation"), s("team-meeting"), w("591d440b-3a7f-4b7b-a34c-e45e891acc17")],
    },
  ],
  C1: [
    {
      titleHe: "מה היה קורה אילו",
      goalHe: "לדבר על החלטות מהעבר ועל ההשלכות שלהן",
      steps: [v("attitudes-opinions"), g("third-conditional"), l("An Interview About a Career Change"), s("ethics-dilemma")],
    },
    {
      titleHe: "סגנון רשמי",
      goalHe: "לכתוב ולדבר בסגנון רשמי ומשכנע",
      steps: [v("politics-government"), g("inversion"), s("policy-debate"), w("25d82704-f236-4cca-9f71-3e9b2597cb89")],
    },
    {
      titleHe: "להדגיש את העיקר",
      goalHe: "להדגיש את מה שחשוב באמת בדיון על תקשורת",
      steps: [v("media-communication"), g("cleft-sentences"), r("The Attention Economy"), s("podcast-guest")],
    },
    {
      titleHe: "משוב בעבודה",
      goalHe: "לדבר על מה שהיה צריך לקרות אחרת, ולתת משוב קשה",
      steps: [v("workplace-dynamics"), g("advanced-modals-past"), l("A Team Meeting About a Delay"), s("difficult-feedback")],
    },
    {
      titleHe: "מדע וטכנולוגיה",
      goalHe: "לכתוב משפטים מורכבים וקולחים על טכנולוגיה",
      steps: [v("science-technology"), g("participle-clauses"), r("The Ethics of Artificial Intelligence"), w("e8eac05d-7da4-4bab-adb0-561412b5e1db")],
    },
    {
      titleHe: "שני צדדים",
      goalHe: "להציג את שני הצדדים של ויכוח כלכלי",
      steps: [v("economy-finance"), g("concession-although-despite"), r("The Gig Economy and Job Security"), l("A Panel Discussion on Remote Work"), w("87703ed2-9e38-4eda-a95c-a17b9617a249")],
    },
    {
      titleHe: "לייעץ ולבחור",
      goalHe: "לייעץ, להביע העדפות ולשקול אפשרויות טיפול",
      steps: [v("medicine-healthcare"), g("would-rather-had-better"), r("The Placebo Effect and the Power of Belief"), s("treatment-options")],
    },
    {
      titleHe: "מחקר וממצאים",
      goalHe: "לדווח על מחקרים ועל מה שמצאו בהם",
      steps: [v("academic-writing"), g("passive-reporting"), l("A Lecture on Sleep and Memory"), s("research-presentation-qa"), w("a7047479-4fad-4617-bdf1-6213a3d1d07a")],
    },
    {
      titleHe: "תוכניות שהשתנו",
      goalHe: "לדבר על תוכניות שהשתנו ולנהל משא ומתן מתקדם",
      steps: [v("business-negotiation"), g("future-in-the-past"), l("A Product Launch Briefing"), s("job-offer-counter")],
    },
    {
      titleHe: "מקומות ותרבות",
      goalHe: "לתאר מקומות, מוסדות ותרבות בפירוט",
      steps: [v("culture-heritage"), g("advanced-relative-clauses"), r("What Libraries Are For Now"), l("A Museum Audio Guide"), w("bd002c96-fc11-4a37-b71f-fccba7a03fa6")],
    },
    {
      titleHe: "סיבה ותוצאה",
      goalHe: "להסביר סיבות ותוצאות בטיעון מסודר",
      steps: [g("cause-and-result-linkers"), r("Urban Migration and Its Consequences"), s("city-council-meeting"), w("569a6b13-cd17-460a-82cd-515d7fec8607")],
    },
  ],
  C2: [
    {
      titleHe: "חשיבה ובחירה",
      goalHe: "לחשוב על חלופות לעבר ולהווה ולבקר טיעון",
      steps: [v("psychology-cognition"), g("mixed-conditionals"), r("Survivorship Bias in Everyday Reasoning"), s("devils-advocate")],
    },
    {
      titleHe: "שפה דיפלומטית",
      goalHe: "לנסח דרישות והמלצות בשפה רשמית ודיפלומטית",
      steps: [v("formal-register"), g("subjunctive"), s("diplomatic-negotiation"), w("abebd611-0db6-47e4-b882-e94b5ef4eba7")],
    },
    {
      titleHe: "דיוק במשמעות",
      goalHe: "לבחור בדיוק בין מבנים שמשנים את המשמעות",
      steps: [v("abstract-concepts"), g("gerunds-infinitives-meaning"), r("On Being Wrong"), w("69ef3a04-d113-42c5-818d-e588cfd551c2")],
    },
    {
      titleHe: "כתיבה אקדמית",
      goalHe: "לכתוב ולהגן על טיעון בסגנון אקדמי דחוס",
      steps: [v("scientific-inquiry"), g("nominalisation"), r("When a Measure Becomes a Target"), s("thesis-defense"), w("97918359-e54f-422e-b51e-f3acd3799b66")],
    },
    {
      titleHe: "ספרות ותרגום",
      goalHe: "לדבר על ספרות בטבעיות, בלי לחזור על עצמכם",
      steps: [v("literary-analysis"), g("ellipsis-substitution"), l("A Talk on Translation"), s("literary-discussion")],
    },
    {
      titleHe: "עמדה זהירה",
      goalHe: "להביע עמדה בזהירות ובדיוק בשאלות פתוחות",
      steps: [v("philosophy-ethics"), g("hedging"), r("Does Language Shape Thought?"), l("An Interview on AI and Accountability"), s("philosophy-cafe")],
    },
    {
      titleHe: "טיעון כלכלי",
      goalHe: "להציג טיעון כלכלי ולשכנע בו בשפה מתוחכמת",
      steps: [v("advanced-economics"), g("conditionals-without-if"), l("A Debate on Economic Policy"), s("board-pitch"), w("29e5694a-543a-4d33-abdc-10421ebba497")],
    },
    {
      titleHe: "משפט וחברה",
      goalHe: "לדון בסוגיות משפטיות בדיוק לשוני",
      steps: [v("law-jurisprudence"), g("dependent-prepositions"), l("A Radio Debate on Rent Control"), s("investigative-interview"), w("c47bbe18-3042-4e14-9510-71c9a54d2515")],
    },
    {
      titleHe: "לשכנע קהל",
      goalHe: "לבנות נאום או מאמר משכנע ולעמוד מול שאלות קשות",
      steps: [v("rhetoric-persuasion"), g("discourse-markers"), r("The Paradox of Choice"), s("crisis-press-conference"), w("935221d3-48e4-4f4f-91ef-2a9ed7f5997a")],
    },
  ],
};

export const COURSE_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const COURSE_UNITS: CourseUnit[] = COURSE_LEVELS.flatMap((level) =>
  LEVEL_UNITS[level].map((unit, i) => ({ ...unit, id: `${level.toLowerCase()}-${i + 1}`, level })),
);

export function unitsForLevel(level: CefrLevel): CourseUnit[] {
  return COURSE_UNITS.filter((u) => u.level === level);
}

export function findUnit(id: string): CourseUnit | null {
  return COURSE_UNITS.find((u) => u.id === id) ?? null;
}

// The unit's number within its level, from 1.
export function unitNumber(unit: CourseUnit): number {
  return unitsForLevel(unit.level).indexOf(unit) + 1;
}

// The XP event that records a passed unit check, so completion needs no
// table of its own: "course_unit:a1-3".
export const UNIT_CHECK_XP_PREFIX = "course_unit:";
export const UNIT_CHECK_XP = 30;
export const UNIT_CHECK_PASS = 0.8;
export const UNIT_CHECK_QUESTIONS = 10;

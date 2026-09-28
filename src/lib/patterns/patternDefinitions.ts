// The closed list of Hebrew-transfer mistake patterns "Hebrew Pattern Coach"
// looks for — see docs/specs/hebrew-pattern-coach.md. Nothing outside this
// list is ever shown to a learner or stored with a label; a mistake that
// doesn't match one of these is only ever counted as "OTHER".
//
// Owner verified this list (and its Hebrew explanations) on 2026-09-21. The
// drill sentences in drills.ts are a SEPARATE approval gate — see there.

export type PatternCategory = "grammar" | "spelling";

// Where a pattern can legitimately be observed. Spelling patterns are
// writing-only: a voice conversation's transcript comes from a speech
// recognizer, not from the learner's own typing, so capitalization and
// apostrophes in it reflect the recognizer, not the learner. See spec §4.
export type PatternSource = "writing" | "conversation";

export interface PatternDefinition {
  code: string;
  category: PatternCategory;
  appliesTo: PatternSource[];
  labelHe: string;
  whyHe: string;
  exampleWrong: string;
  exampleRight: string;
  // Whether an external source was found for this being a documented
  // Hebrew-transfer pattern (vs. general linguistic knowledge the owner
  // separately verified on 2026-09-21 — see spec §4).
  hasExternalSource: boolean;
}

export const PATTERN_DEFINITIONS: readonly PatternDefinition[] = [
  {
    code: "MISSING_COPULA",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "השמטת \"להיות\" בהווה",
    whyHe: "בעברית אין פועל \"להיות\" בהווה — \"היא שמחה\" בלי מילה בין \"היא\" ל\"שמחה\". באנגלית הפועל חובה.",
    exampleWrong: "She happy today.",
    exampleRight: "She is happy today.",
    hasExternalSource: true,
  },
  {
    code: "OBJECT_GENDER",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "מגדר לחפצים",
    whyHe: "בעברית לכל שם עצם יש מגדר (מכונית, ספר). באנגלית חפצים הם תמיד \"it\".",
    exampleWrong: "I love my car, she is fast.",
    exampleRight: "I love my car, it is fast.",
    hasExternalSource: true,
  },
  {
    code: "INVITE_RESERVE_ORDER",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "\"להזמין\" — invite / reserve / order",
    whyHe: "בעברית מילה אחת, \"להזמין\", מכסה גם הזמנת אדם לאירוע, גם הזמנת מקום וגם הזמנת מוצר.",
    exampleWrong: "I invited a table at the restaurant.",
    exampleRight: "I reserved a table at the restaurant.",
    hasExternalSource: true,
  },
  {
    code: "INDEFINITE_ARTICLE",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "השמטת a / an",
    whyHe: "בעברית אין מילה מקבילה ל-\"a\" או \"an\" — \"היא רופאה\" בלי שום מילה לפני \"רופאה\".",
    exampleWrong: "She is doctor.",
    exampleRight: "She is a doctor.",
    hasExternalSource: true,
  },
  {
    code: "GENERIC_THE",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "\"the\" מיותר עם שם כללי",
    whyHe: "בעברית \"אני אוהב את המוזיקה\" משתמשת בה\' הידיעה גם כשמדברים על מוזיקה באופן כללי, לא על מוזיקה מסוימת.",
    exampleWrong: "I love the music.",
    exampleRight: "I love music.",
    hasExternalSource: false,
  },
  {
    code: "VERB_PREPOSITION",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "מילת יחס אחרי פועל",
    whyHe: "בעברית הפועל גורר מילת יחס אחרת: \"נכנס ל-\", \"הגיע ל-\", \"נשוי ל-\" — והתרגום המילולי לא תמיד עובד באנגלית.",
    exampleWrong: "I entered to the room.",
    exampleRight: "I entered the room.",
    hasExternalSource: false,
  },
  {
    code: "DO_SUPPORT",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "פועל עזר בשאלה ובשלילה",
    whyHe: "בעברית שואלים \"איפה אתה גר?\" ואומרים \"הוא לא אוהב את זה\" בלי שום פועל עזר. באנגלית צריך do / does / did.",
    exampleWrong: "Where you live? He not like it.",
    exampleRight: "Where do you live? He doesn't like it.",
    hasExternalSource: false,
  },
  {
    code: "MAKE_DO",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "\"לעשות\" — make / do",
    whyHe: "בעברית מילה אחת, \"לעשות\", מכסה גם make וגם do.",
    exampleWrong: "I did a mistake.",
    exampleRight: "I made a mistake.",
    hasExternalSource: false,
  },
  {
    code: "SAY_TELL",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "\"אמר\" — say / tell",
    whyHe: "בעברית אומרים \"הוא אמר לי\" עם \"ל-\". באנגלית tell לוקח את האדם ישירות, בלי מילת יחס.",
    exampleWrong: "He said me the truth.",
    exampleRight: "He told me the truth.",
    hasExternalSource: false,
  },
  {
    code: "PRESENT_PERFECT",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "הווה ממושך שלא קיים בעברית",
    whyHe: "בעברית ההווה מספיק כדי לתאר משהו שהתחיל בעבר וממשיך: \"אני גר כאן מאז 2020\". באנגלית צריך have + פועל.",
    exampleWrong: "I live here since 2020.",
    exampleRight: "I have lived here since 2020.",
    hasExternalSource: false,
  },
  {
    code: "SIMPLE_VS_CONTINUOUS",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "הווה פשוט במקום הווה מתמשך",
    whyHe: "בעברית אין הבדל צורני בין \"אני עובד בתל אביב\" (עובדה קבועה) ל\"אני עובד עכשיו\" (ממש עכשיו). באנגלית אלה שני זמנים שונים.",
    exampleWrong: "Right now I work on the report.",
    exampleRight: "Right now I'm working on the report.",
    hasExternalSource: false,
  },
  {
    code: "UNCOUNTABLE_PLURAL",
    category: "grammar",
    appliesTo: ["writing", "conversation"],
    labelHe: "רבים למילים שאין להן רבים",
    whyHe: "בעברית \"עצות\" ו\"מידעים\" הן צורות רבים תקינות. באנגלית advice ו-information הן bilti-ספירות ואין להן רבים.",
    exampleWrong: "I got a lot of advices.",
    exampleRight: "I got a lot of advice.",
    hasExternalSource: false,
  },
  {
    code: "DOUBLE_LETTERS",
    category: "spelling",
    appliesTo: ["writing"],
    labelHe: "כפילות אותיות",
    whyHe: "באיות העברי אין כפילות עיצורים. מילים אנגליות רבות כן דורשות אות כפולה.",
    exampleWrong: "I recomend this restaurant.",
    exampleRight: "I recommend this restaurant.",
    hasExternalSource: true,
  },
  {
    code: "CAPITALIZATION",
    category: "spelling",
    appliesTo: ["writing"],
    labelHe: "אותיות גדולות חסרות",
    whyHe: "בעברית אין אותיות גדולות בכלל. באנגלית חובה לפתוח משפט באות גדולה, ולכתוב \"I\" תמיד גדולה.",
    exampleWrong: "i am from israel.",
    exampleRight: "I am from Israel.",
    hasExternalSource: true,
  },
  {
    code: "APOSTROPHE",
    category: "spelling",
    appliesTo: ["writing"],
    labelHe: "גרש חסר בקיצורים",
    whyHe: "בעברית אין סימן מקביל לגרש האנגלי. קיצורים כמו don't ו-it's צריכים גרש כדי להיות תקינים.",
    exampleWrong: "I dont know if its ready.",
    exampleRight: "I don't know if it's ready.",
    hasExternalSource: true,
  },
] as const;

export type PatternCode = (typeof PATTERN_DEFINITIONS)[number]["code"];

export const PATTERN_CODES: readonly string[] = PATTERN_DEFINITIONS.map((p) => p.code);

// A "we saw a mistake but it isn't one of the 15" bucket — kept so we can
// later see, in aggregate, how often the closed list is missing something,
// without ever storing free text about what it actually was.
export const OTHER_PATTERN_CODE = "OTHER";

export function getPatternDefinition(code: string): PatternDefinition | undefined {
  return PATTERN_DEFINITIONS.find((p) => p.code === code);
}

export function patternsFor(source: PatternSource): readonly PatternDefinition[] {
  return PATTERN_DEFINITIONS.filter((p) => p.appliesTo.includes(source));
}

// A compact, model-friendly description of the AI-detectable patterns for a
// given source, used inside the writing-coach / conversation-scoring
// prompts. Spelling patterns picked up by deterministic rules elsewhere
// (CAPITALIZATION, APOSTROPHE) are excluded here even for "writing" — asking
// the model for them too would just double-count what the rules already
// catch reliably for free. DOUBLE_LETTERS stays AI-only: it needs real
// spelling knowledge that a simple rule can't approximate.
export function aiDetectablePatternsFor(source: PatternSource): readonly PatternDefinition[] {
  return patternsFor(source).filter((p) => !(p.category === "spelling" && p.code !== "DOUBLE_LETTERS"));
}

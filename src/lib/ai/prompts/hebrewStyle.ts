// Every Hebrew sentence the AI writes to a learner must read the same to a
// man and to a woman. Hebrew marks gender on second-person verbs
// (שימי / שים), adjectives (מוכנה / מוכן), and even on "you" itself, and a
// model left to its own devices picks one — which is how a female-form
// "שימי לב… המשיכי…" ended up in front of male learners. The site's own UI
// copy is already written in the plural ("התחילו", "נסו שוב"); this note
// makes the generated text follow the same convention.
//
// Written in English on purpose: it is appended to prompts that are mostly
// English, and the model follows a rule stated in the prompt's own language
// most reliably.
export const HEBREW_GENDER_NEUTRAL_NOTE = `Hebrew wording rule (applies to every Hebrew sentence you write): the learner's gender is unknown and must never show. Address the learner ONLY in the plural second person ("שימו לב", "נסו", "המשיכו", "אתם") or with impersonal, infinitive or noun phrasing ("כדאי לשים לב ל…", "מומלץ לתרגל…", "תרגול נוסף יעזור"). Never use a singular masculine or feminine form: no "שים" / "שימי", "נסה" / "נסי", "המשך" / "המשיכי" as commands, no "אתה" / "את", no gendered adjective or participle describing the learner (מוכן / מוכנה, מצליח / מצליחה), and no "התלמיד" / "התלמידה" — write "כדאי", "אפשר" or the plural instead. Past-tense second-person verbs ("כתבת", "ניסית") show no gender in writing and are fine.`;

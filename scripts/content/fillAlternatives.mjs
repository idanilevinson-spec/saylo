// Fill-in fixes after a pass over all 242 fill-in exercises. Keyed by the
// first 8 characters of the exercise id; `answer` is the current correct
// answer, checked against the database before anything is written.
//
// accepted: other answers that are just as right, so a learner who writes
//   "shows" for "suggests" isn't marked wrong.
// sentence: the blank had many right answers, so the word to use is added
//   in brackets, the way other items already do it.
// hint: an English hint, now in Hebrew like the rest.

export const FILL_FIXES = {
  // ---- other right answers ----
  "02cf0f59": { answer: "suggests", accepted: ["shows", "indicates", "implies"] },
  "0cebf698": { answer: "Moreover", accepted: ["Furthermore", "In addition", "What is more", "What's more", "Besides", "Also"] },
  "1386b299": { answer: "When", accepted: ["Whenever", "If"] },
  "19dd7619": { answer: "short", accepted: ["summary", "brief", "conclusion"] },
  "23ea5be4": { answer: "get", accepted: ["have"] },
  "259ef2a3": { answer: "get", accepted: ["become", "feel", "are"] },
  "2ccaf261": { answer: "Despite", accepted: ["In spite of"] },
  "34286587": { answer: "some", accepted: ["a"] },
  "3c781d5d": { answer: "so", accepted: ["and"] },
  "393b1541": { answer: "rarely", accepted: ["seldom", "hardly ever"] },
  "3ebaf504": { answer: "tend", accepted: ["seem", "appear"] },
  "4285b3d9": { answer: "seem", accepted: ["appear"] },
  "451b27e2": { answer: "Since", accepted: ["As", "Because"] },
  "459bf402": { answer: "would", accepted: ["could", "might"] },
  "475d613f": { answer: "usually", accepted: ["normally", "often", "always", "ever", "generally", "sometimes"] },
  "48c5de91": { answer: "should", accepted: ["ought to", "need to", "must"] },
  "3ae37040": { answer: "more", accepted: ["less"] },
  "72040e99": { answer: "where", accepted: ["in which"] },
  "73633e56": { answer: "may", accepted: ["might", "could"] },
  "73759a13": { answer: "could", accepted: ["might"] },
  "73c56459": { answer: "many", accepted: ["any"] },
  "796a839b": { answer: "However", accepted: ["Nevertheless", "Nonetheless", "Still", "Yet", "But", "Even so"] },
  "7ac06aee": { answer: "will", accepted: ["can"] },
  "7e2b7dab": { answer: "Consequently", accepted: ["As a result", "Therefore", "Thus", "Hence", "So", "As a consequence"] },
  "8551e2a7": { answer: "who", accepted: ["that"] },
  "9296224a": { answer: "might", accepted: ["may", "could", "must"] },
  "9ca794c2": { answer: "so", accepted: ["too", "very", "really"] },
  "9cf2adb7": { answer: "stops", accepted: ["starts"] },
  "a02d1ad0": { answer: "Although", accepted: ["Though", "Even though"] },
  "bf019140": { answer: "might", accepted: ["may", "could", "will"] },
  "ce2ed561": { answer: "Maybe", accepted: ["Perhaps"] },
  "d36cefcd": { answer: "Will", accepted: ["Can", "Could", "Would"] },
  "d96cf358": { answer: "do", accepted: ["can"] },
  "dd72a48d": { answer: "who", accepted: ["that"] },
  "eb6f1e9d": { answer: "arguably", accepted: ["probably", "possibly", "perhaps"] },
  "f34e60c7": { answer: "Nevertheless", accepted: ["Nonetheless", "However", "Still", "Even so"] },
  "f53a4e8c": { answer: "finishing", accepted: ["who finish", "who finished", "that finish", "that finished"] },
  "f787958a": { answer: "will", accepted: ["might", "may"] },
  "fafcc5fc": { answer: "Let's", accepted: ["Let us"] },
  "0c00b545": { answer: "Built", accepted: ["Completed", "Constructed"] },
  "51d46873": { answer: "can't", accepted: ["couldn't"] },
  "7e508b1c": { answer: "would", accepted: ["could"] },
  "76c10051": { answer: "would", accepted: ["could", "might"] },
  "ae3e2735": { answer: "would", accepted: ["might", "could"] },
  "9bec2b4a": { answer: "would", accepted: ["could"] },
  "9b00a9c9": { answer: "would", accepted: ["could"] },
  "3b72e8db": { answer: "likely", accepted: ["possible", "probable", "expected"] },
  "65606f5c": { answer: "provided", accepted: ["providing"] },
  "96a1719f": { answer: "due", accepted: ["owing"] },
  "033e5d55": { answer: "are going to", accepted: ["will", "are visiting"] },
  "4885d3fc": { answer: "was cooking", accepted: ["was making", "was having", "was eating"] },
  "c296731c": { answer: "was talking", accepted: ["was texting"] },
  "9b5e12c1": { answer: "didn't finish", accepted: ["didn't do"] },
  "fcb04918": { answer: "finished", accepted: ["did"] },
  "d50743df": { answer: "went", accepted: ["came"] },
  "186a73cb": { answer: "went", accepted: ["came", "traveled", "travelled", "flew", "drove"] },
  "4811c163": { answer: "has", accepted: ["had"] },
  "0f248abf": { answer: "read", accepted: ["finished"] },
  "b44cd692": { answer: "eaten", accepted: ["tried", "had"] },
  "30115403": { answer: "Do", accepted: ["Can"] },
  "644a0be0": { answer: "is", accepted: ["was", "has been"] },
  "f680317b": { answer: "Encouraged", accepted: ["Inspired", "Motivated"] },
  "51b17406": { answer: "does", accepted: ["did"] },
  "ba8a862b": { answer: "should", accepted: ["could", "ought to"] },
  "e3904047": { answer: "am", accepted: ["come"] },
  "744e252a": { answer: "are", accepted: ["look", "feel", "seem"] },
  "824e3942": { answer: "is", accepted: ["was"] },
  "4d839c7d": { answer: "are", accepted: ["were"] },
  "98980863": { answer: "must", accepted: ["have to", "should"] },
  "02ea5b55": { answer: "mustn't", accepted: ["can't", "cannot"] },
  "b5ae858f": { answer: "to bring", accepted: ["to take", "to pack"] },
  "f0654c8e": { answer: "locking", accepted: ["closing"] },
  "88eaf63d": { answer: "on", accepted: ["upon"] },
  "020abdb6": { answer: "would", accepted: ["used to"] },
  "332dc23e": { answer: "saw", accepted: ["met"] },
  "445d95a9": { answer: "such", accepted: ["quite"] },
  "b584b1f9": { answer: "such", accepted: ["quite"] },
  "48788c77": { answer: "study", accepted: ["work"] },
  "ca205cdb": { answer: "is", accepted: ["gets"] },
  "f88b54a3": { answer: "is going to", accepted: ["is about to"] },

  // ---- open-ended blanks get the word to use ----
  "5920a3e7": { answer: "smartest", sentence: "She is the ___ student in the class. (smart)" },
  "ad854888": { answer: "faster", sentence: "This car is ___ than that one. (fast)" },
  "997f0ae5": { answer: "books", sentence: "There are five ___ on the table. (book)" },
  "c4ea9d2b": { answer: "arrive", sentence: "I suggest that he ___ early. (arrive)" },

  // ---- English hints in Hebrew ----
  "01e4d86b": { answer: "do", hint: "משפט שלילי, זנב חיובי" },
  "17f0ffb2": { answer: "can't", hint: "חוזרים על הפועל המודאלי" },
  "1afe510b": { answer: "knowing", hint: "סיבה, בצורת ing" },
  "228fad02": { answer: "Having", hint: "הפעולה שקרתה קודם" },
  "24e98d1d": { answer: "didn't", hint: "עבר פשוט" },
  "3e84764b": { answer: "don't", hint: "שלילה בהווה פשוט" },
  "5899fac1": { answer: "going", hint: "תוכנית שכבר הוחלטה" },
  "7c71d686": { answer: "won't", hint: "השלילה של will" },
  "9b186206": { answer: "heat", hint: "הווה פשוט" },
  "9f70377c": { answer: "isn't", hint: "משפט חיובי, זנב שלילי" },
  "b0319102": { answer: "will", hint: "החלטה של הרגע" },
  "c19d470a": { answer: "doesn't", hint: "הווה פשוט, he/she" },
  "4b8cdc72": { answer: "ability", hint: "שם עצם מ-able" },
  "676cd0aa": { answer: "analysis", hint: "שם עצם מ-analyze" },
  "8d04c9c7": { answer: "refusal", hint: "שם עצם מ-refuse" },
  "e89b4509": { answer: "failure", hint: "שם עצם מ-fail" },
  "f7cef43a": { answer: "expansion", hint: "שם עצם מ-expand" },
};

// Items that get both a hint change and alternatives are merged here.
Object.assign(FILL_FIXES["0c00b545"], { hint: "משמעות סבילה" });
Object.assign(FILL_FIXES["1386b299"], { hint: "באותה משמעות כמו if" });
Object.assign(FILL_FIXES["259ef2a3"], { hint: "הווה פשוט" });
Object.assign(FILL_FIXES["7ac06aee"], { hint: "תחזית" });
Object.assign(FILL_FIXES["9cf2adb7"], { hint: "צורת he/she/it" });
Object.assign(FILL_FIXES["d36cefcd"], { hint: "בקשה" });
Object.assign(FILL_FIXES["f53a4e8c"], { hint: "במקום who finish" });
Object.assign(FILL_FIXES["f680317b"], { hint: "סביל: they were encouraged" });

// Listening, set 2. A1 had no listening comprehension questions at all
// (dictation only), and several C1/C2 clips are 30 to 40 words, too short
// for real listening at that level. All transcripts are original.
// A1 questions are in Hebrew so a beginner can follow them; the answers
// stay in simple English. Hebrew is gender-neutral, no long dash.

export const READING = [];

export const LISTENING = [
  // ---------------- A1 ----------------
  {
    level: "A1",
    title_en: "At the Bakery",
    title_he: "במאפייה",
    transcript: `Good morning! Can I help you? Yes, please. I want two rolls and one chocolate cake. Anything else? No, thank you. How much is it? It's twenty-two shekels. Here you are. Thank you! Have a nice day. You too, bye!`,
    mcq: [
      ["כמה לחמניות מבקשים?", ["One", "Two", "Three", "Four"], 1],
      ["כמה זה עולה?", ["Twelve shekels", "Twenty shekels", "Twenty-two shekels", "Thirty shekels"], 2],
      ["מה עוד קונים?", ["A coffee", "A chocolate cake", "Some milk", "A sandwich"], 1],
    ],
    dictation: "I want two rolls and one chocolate cake.",
  },
  {
    level: "A1",
    title_en: "Meeting in the Park",
    title_he: "היכרות בפארק",
    transcript: `Hi! My name is Tom. What's your name? I'm Maya. Nice to meet you, Maya. Are you from here? No, I'm from Eilat. I live in Tel Aviv now. Is that your dog? Yes, his name is Max. He is three years old. He loves the park!`,
    mcq: [
      ["מאיפה מאיה?", ["Tel Aviv", "Haifa", "Eilat", "Jerusalem"], 2],
      ["מה שם הכלב?", ["Tom", "Max", "Sam", "Ben"], 1],
      ["בן כמה הכלב?", ["Two", "Three", "Four", "Five"], 1],
    ],
    dictation: "He is three years old.",
  },
  {
    level: "A1",
    title_en: "The Weather Today",
    title_he: "מזג האוויר היום",
    transcript: `Good morning! Here is the weather for today. In the north, it is cold and rainy. In Tel Aviv, it is cloudy and twenty degrees. In the south, it is hot and sunny, thirty degrees. Take an umbrella if you go north!`,
    mcq: [
      ["איך מזג האוויר בצפון?", ["Hot and sunny", "Cold and rainy", "Cloudy and warm", "Snowy"], 1],
      ["כמה מעלות בתל אביב?", ["Ten", "Twenty", "Twenty-five", "Thirty"], 1],
      ["מה כדאי לקחת לצפון?", ["Sunglasses", "A swimsuit", "An umbrella", "A fan"], 2],
    ],
    dictation: "In the south, it is hot and sunny.",
  },
  {
    level: "A1",
    title_en: "After School",
    title_he: "נפגשים אחרי בית הספר",
    transcript: `Hi Dan! Do you want to play basketball after school? Yes! What time? At four o'clock. Where? At the park near my house. OK. Can my sister come too? Sure! See you at four.`,
    mcq: [
      ["מה רוצים לשחק?", ["Football", "Tennis", "Basketball", "Volleyball"], 2],
      ["באיזו שעה נפגשים?", ["At two", "At three", "At four", "At five"], 2],
      ["מי עוד מגיע?", ["Dan's brother", "Dan's sister", "Dan's mother", "Dan's teacher"], 1],
    ],
    dictation: "Do you want to play basketball after school?",
  },

  // ---------------- C1 ----------------
  {
    level: "C1",
    title_en: "A Product Launch Briefing",
    title_he: "תדריך לפני השקת מוצר",
    transcript: `Okay, everyone, thanks for joining at short notice. As you know, the launch has been moved forward by two weeks, which means we're now going live on the fourteenth rather than the twenty-eighth. I know that puts pressure on the support team in particular, so here's what we've agreed. First, we'll release to ten percent of users on day one, and only widen it once the error rate stays below one percent for forty-eight hours. Second, marketing will hold back the press release until that point, so we're not driving traffic to something that might wobble. Third, anyone on the support rota that week gets the following Friday off. I'd rather we under-promise and over-deliver here. If you can see a risk I haven't mentioned, flag it today, not on the fourteenth.`,
    mcq: [
      ["Why was the meeting called?", ["The launch has been delayed", "The launch date has been brought forward", "The product has been cancelled", "A new team has been formed"], 1],
      ["What must happen before the release is widened?", ["Marketing must publish a press release", "The error rate must stay low for two days", "The support team must vote on it", "Ten percent of users must give feedback"], 1],
      ["What does the speaker mean by \"under-promise and over-deliver\"?", ["Promise less than you expect to achieve, then do more", "Avoid making any promises at all", "Deliver the product later than planned", "Promise more to impress customers"], 0],
    ],
    dictation: "The launch has been moved forward by two weeks.",
  },
  {
    level: "C1",
    title_en: "A Lecture on Sleep and Memory",
    title_he: "הרצאה על שינה וזיכרון",
    transcript: `Let's start with a question most of you will have asked yourselves the night before an exam: is it better to stay up revising, or to sleep? The research is fairly consistent. During deep sleep, the brain replays what it learned during the day and gradually moves it from short-term to long-term storage. In one well-known type of study, two groups learn the same list of words; one group sleeps, the other stays awake, and both are tested twelve hours later. The group that slept typically remembers noticeably more. That doesn't mean sleep replaces studying, of course. It means the two work together. Cutting sleep to gain an extra hour of revision is, in most cases, a poor trade. So if there's one practical takeaway from today, it's this: protect your sleep most carefully in exactly the weeks you feel least able to afford it.`,
    mcq: [
      ["According to the lecture, what happens during deep sleep?", ["The brain deletes unimportant facts", "The brain moves new learning into long-term memory", "The brain rests completely", "Short-term memory gets stronger"], 1],
      ["In the studies described, which group remembers more?", ["The group that stayed awake", "The group that studied longer", "The group that slept", "Both groups equally"], 2],
      ["What is the speaker's main advice?", ["Study through the night before exams", "Sleep can replace studying", "Protect your sleep, especially in busy weeks", "Study only in the morning"], 2],
    ],
    dictation: "The group that slept typically remembers noticeably more.",
  },
  {
    level: "C1",
    title_en: "A Voicemail from a Contractor",
    title_he: "הודעה קולית מקבלן השיפוצים",
    transcript: `Hi, it's Ronen from the renovation company, calling about your kitchen. Bit of a mixed update, I'm afraid. The good news is the cabinets arrived this morning, and they look great. The not-so-good news is that when we took the old tiles off, we found some water damage behind the sink, probably from a slow leak that's been going on for years. We can't just tile over it, because it'll come back and you'll end up paying twice. So I'd suggest we bring in a plumber on Monday to find the source, and push the tiling back to Wednesday. It'll add roughly two days and a bit to the cost, but I'll send you a written quote first, so nothing goes ahead without your okay. Give me a call back when you get a chance.`,
    mcq: [
      ["What problem did the workers find?", ["The cabinets were damaged", "There was water damage behind the sink", "The tiles were the wrong color", "The plumber didn't come"], 1],
      ["Why can't they tile over the problem?", ["The new tiles haven't arrived", "It would be too expensive", "The damage would come back", "The customer refused"], 2],
      ["What will Ronen do before any extra work starts?", ["Start immediately", "Send a written quote for approval", "Ask for full payment", "Cancel the project"], 1],
    ],
    dictation: "The cabinets arrived this morning, and they look great.",
  },

  // ---------------- C2 ----------------
  {
    level: "C2",
    title_en: "A Radio Debate on Rent Control",
    title_he: "דיון ברדיו על פיקוח על שכר דירה",
    transcript: `Supporters of rent control tend to frame it as a matter of basic fairness, and I don't dismiss that. But we have to distinguish between what a policy intends and what it actually does. When rents are capped well below market levels, landlords have little incentive to maintain their buildings, let alone build new ones, and people who already hold a controlled lease rarely move, even when their circumstances change. The upshot is a market that protects insiders while making it harder for newcomers, often the young and the less well-off, to find anywhere at all. None of this means the state should simply step back. The more promising levers, in my view, are on the supply side: freeing up land, speeding up permits, and tying any subsidy to the person rather than to the apartment. Fairness, in other words, is better served by abundance than by rationing.`,
    mcq: [
      ["What distinction does the speaker insist on?", ["Between landlords and tenants", "Between a policy's aims and its actual effects", "Between old and new buildings", "Between renting and owning"], 1],
      ["Who, according to the speaker, loses out under strict rent control?", ["Tenants who already have controlled leases", "Landlords only", "Newcomers such as young people", "The state"], 2],
      ["What does \"fairness is better served by abundance than by rationing\" suggest?", ["Housing should be shared out equally", "Building more is fairer than capping prices", "Rents should be raised", "The state should own all housing"], 1],
    ],
    dictation: "We have to distinguish between what a policy intends and what it actually does.",
  },
  {
    level: "C2",
    title_en: "A Talk on Translation",
    title_he: "הרצאה על תרגום",
    transcript: `People often assume that a perfect translation is simply one that loses nothing. In practice, every translator is forced into a series of small betrayals. Take humor: a pun that works beautifully in Hebrew may have no equivalent in English at all, so the translator must decide whether to explain the joke, replace it with a different one, or let it quietly disappear. Each option sacrifices something, whether it's accuracy, rhythm or the reader's pleasure. The same is true of register. A character who speaks in a slightly old-fashioned way can sound charming in one language and merely stiff in another. What distinguishes a great translator, then, is not the absence of loss, but judgment about which losses the work can bear. The best translations are not invisible; they are honest about the choices they have made.`,
    mcq: [
      ["What does the speaker mean by \"small betrayals\"?", ["Translators often make careless mistakes", "Translators have to give up some features of the original", "Translators change the plot", "Translators ignore the author's wishes"], 1],
      ["Which options for translating a pun are mentioned?", ["Explain it, replace it, or let it disappear", "Translate it word for word", "Ask the author what to do", "Always add a footnote"], 0],
      ["According to the speaker, what makes a great translator?", ["Losing nothing from the original", "Good judgment about which losses to accept", "Speed and accuracy", "A modern, simple style"], 1],
    ],
    dictation: "Every translator is forced into a series of small betrayals.",
  },
  {
    level: "C2",
    title_en: "An Interview on AI and Accountability",
    title_he: "ראיון על בינה מלאכותית ואחריות",
    transcript: `Many people worry that AI systems will make decisions no one can explain. Is that fear justified? Partly. Some of the most capable systems are genuinely opaque, even to the people who built them. But I'd push back on the idea that human decisions are always transparent. A loan officer or a hiring manager can give you a reason, but it isn't necessarily the real one. What matters, I'd argue, is accountability rather than perfect explainability. If a system affects someone's life, there should be a named person or institution responsible for it, a way to challenge the outcome, and regular checks for bias. So you're not calling for a ban? Not across the board, no. Bans make sense in a few narrow areas. Elsewhere, the harder and more useful work is building institutions that can say no when a system gets it wrong.`,
    mcq: [
      ["What does the guest say about human decisions?", ["They are always fair", "They are not always as transparent as they seem", "They are easier to challenge than AI decisions", "They should be replaced by AI"], 1],
      ["What does the guest consider most important?", ["Perfect explainability", "Banning AI systems", "Accountability for systems that affect people", "Faster decisions"], 2],
      ["What is the guest's position on bans?", ["AI should be banned everywhere", "Bans are never justified", "Bans make sense only in a few narrow areas", "Companies should decide on bans"], 2],
    ],
    dictation: "What matters is accountability rather than perfect explainability.",
  },
];

// Comprehension questions for the A1 clips that only had a dictation.
// { clip title_en: [[prompt, options, correctIndex]] }
export const EXISTING_LISTENING_MCQ = {
  "Ordering Coffee": [
    ["מה מזמינים?", ["Tea", "Coffee", "Juice", "Water"], 1],
    ["מה רוצים בקפה?", ["Milk and sugar", "Only sugar", "Only milk", "Nothing"], 2],
  ],
  "A Phone Call": [
    ["מה השם של מי שמתקשרת?", ["Anna", "Maya", "Dana", "Sara"], 0],
    ["את מי אנה מחפשת?", ["The father", "The mother", "The brother", "The teacher"], 1],
  ],
  "Weekend Plans": [
    ["לאן הולכים בסוף השבוע?", ["To the beach", "To the market", "To the park", "To school"], 1],
    ["מה קונים?", ["Apples and bread", "Milk and eggs", "Fish and rice", "Cake and juice"], 0],
  ],
  "At School": [
    ["באיזה עמוד פותחים את הספר?", ["Page two", "Page five", "Page ten", "Page twelve"], 2],
    ["מה עושים כשיש שאלה?", ["Stand up", "Raise your hand", "Call the teacher", "Write it down"], 1],
  ],
  "At the Supermarket": [
    ["מה מחפשים?", ["Eggs", "Bread", "Milk", "Water"], 2],
    ["באיזה מעבר נמצא החלב?", ["Aisle one", "Aisle two", "Aisle three", "Aisle four"], 2],
  ],
};

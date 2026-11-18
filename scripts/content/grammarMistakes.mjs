// A second lesson for each short grammar topic: the mistakes Hebrew
// speakers actually make with it, each shown wrong, then right, with the
// reason in one line. Original content, written 2026-11-18. Hebrew is
// gender-neutral (plural or impersonal), no long dashes.
//
// Shape: slug -> { intro, mistakes: [[title, wrong, right, why], ...] }

export const GRAMMAR_MISTAKES = {
  "verb-to-be": {
    intro: "בעברית אומרים \"אני עייף\" בלי פועל. באנגלית אי אפשר לוותר עליו, ומכאן רוב הטעויות.",
    mistakes: [
      ["משמיטים את to be", "She happy today.", "She is happy today.", "באנגלית כל משפט צריך פועל, גם כשבעברית אין."],
      ["is עם רבים", "My parents is at home.", "My parents are at home.", "parents זה רבים, ולכן are."],
      ["have במקום be לגיל", "I have 25 years.", "I am 25 years old.", "באנגלית \"נמצאים\" בגיל, לא \"מחזיקים\" שנים."],
      ["שאלה בלי היפוך", "You are ready?", "Are you ready?", "בשאלה are עובר לפני הנושא."],
    ],
  },
  "articles": {
    intro: "בעברית יש ה' הידיעה ואין מילה ל-a. לכן קל לשכוח את a/an, ולשים the במקומות שבהם לא צריך.",
    mistakes: [
      ["שוכחים a לפני מקצוע", "I am teacher.", "I am a teacher.", "שם עצם ביחיד שאפשר לספור צריך a או the."],
      ["the לפני דברים כלליים", "The life is beautiful.", "Life is beautiful.", "כשמדברים על משהו באופן כללי, אין the."],
      ["a או an לפי הצליל", "a hour, an university", "an hour, a university", "בוחרים לפי הצליל הראשון: hour נשמע \"אַוּר\", university נשמע \"יוּ\"."],
      ["the לפני שפות וארוחות", "I speak the English after the breakfast.", "I speak English after breakfast.", "שפות, ארוחות וספורט באים בלי the."],
    ],
  },
  "present-simple": {
    intro: "בעברית הפועל משתנה לפי מין ומספר, באנגלית רק ה-s של he/she/it. דווקא בגלל שזה כל כך קטן, שוכחים אותו.",
    mistakes: [
      ["שוכחים s בגוף שלישי", "He work in Haifa.", "He works in Haifa.", "he, she ו-it תמיד מקבלים s בהווה פשוט."],
      ["doesn't ואחריו s", "She doesn't likes tea.", "She doesn't like tea.", "ה-s כבר נמצא ב-does, אז הפועל נשאר בצורת בסיס."],
      ["שאלה בלי do", "You like pizza?", "Do you like pizza?", "שאלה בהווה פשוט נפתחת ב-Do או Does."],
      ["הווה פשוט לפעולה שקורית עכשיו", "Look! It rains.", "Look! It's raining.", "למשהו שקורה ברגע זה משתמשים ב-ing."],
    ],
  },
  "plurals": {
    intro: "רוב הרבים באנגלית פשוטים, אבל יש כמה מילים שבעברית הן רבים ובאנגלית לא, וכמה רבים לא רגילים שחוזרים כל הזמן.",
    mistakes: [
      ["informations ו-advices", "Can you give me some informations?", "Can you give me some information?", "information, advice, furniture ו-news לא מקבלות s."],
      ["רבים לא רגילים", "two childs, three mans", "two children, three men", "את הרבים האלה פשוט זוכרים: men, women, children, people, feet, teeth."],
      ["s אחרי מספר בתואר", "a ten-years-old boy", "a ten-year-old boy", "כשהמספר והמילה באים לפני שם עצם, הם לא ברבים."],
      ["people עם is", "The people is nice here.", "The people are nice here.", "people זה כבר רבים."],
    ],
  },
  "possessive-adjectives": {
    intro: "בעברית השייכות נדבקת למילה (\"הספר שלה\", \"ספרה\"), ובאנגלית יש מילה נפרדת שבאה לפני שם העצם.",
    mistakes: [
      ["the במקום מילת שייכות", "I washed the hands.", "I washed my hands.", "על חלקי גוף ודברים אישיים מציינים של מי הם."],
      ["his ו-her לפי הדבר במקום לפי האדם", "Dana loves his brother.", "Dana loves her brother.", "בוחרים לפי מי שהדבר שייך לו: Dana, ולכן her."],
      ["its ו-it's", "The dog wagged it's tail.", "The dog wagged its tail.", "it's זה it is. לשייכות כותבים its בלי גרש."],
      ["their, there, they're", "There car is new.", "Their car is new.", "their זה \"שלהם\", there זה \"שם\", they're זה they are."],
    ],
  },
  "past-simple": {
    intro: "בעבר הפשוט מספיק לסמן את העבר פעם אחת. הטעויות מגיעות כשמסמנים פעמיים, או כשמנחשים צורה של פועל לא רגיל.",
    mistakes: [
      ["did ופועל בעבר", "Did you went to the party?", "Did you go to the party?", "did כבר אומר שזה עבר, אז הפועל חוזר לצורת בסיס."],
      ["ed על פועל לא רגיל", "I buyed a new phone.", "I bought a new phone.", "לפעלים לא רגילים יש צורת עבר משלהם שצריך לזכור."],
      ["didn't ואחריו עבר", "She didn't called me.", "She didn't call me.", "גם בשלילה, אחרי didn't באה צורת בסיס."],
      ["was עם פועל רגיל", "I was go to work yesterday.", "I went to work yesterday.", "was בא עם תואר או עם ing, לא עם פועל רגיל."],
    ],
  },
  "modals-can-must-should": {
    intro: "אחרי can, must ו-should בא פועל בצורת בסיס, תמיד. בעברית אומרים \"צריך ל...\", ואת ה\"ל\" הזה מתרגמים בטעות ל-to.",
    mistakes: [
      ["to אחרי מודל", "You should to rest.", "You should rest.", "אחרי can, must ו-should לא בא to."],
      ["s על המודל", "He cans swim.", "He can swim.", "מודלים לא משתנים לפי הגוף."],
      ["must not במקום don't have to", "You mustn't come tomorrow, it's optional.", "You don't have to come tomorrow, it's optional.", "mustn't זה אסור. don't have to זה לא חייבים."],
      ["שאלה עם do", "Do you can help me?", "Can you help me?", "בשאלה המודל עצמו עובר להתחלה."],
    ],
  },
  "past-continuous": {
    intro: "עבר מתמשך מתאר פעולה שהייתה באמצע. דוברי עברית, שאין להם זמן כזה, משתמשים בו או יותר מדי או פחות מדי.",
    mistakes: [
      ["עבר מתמשך לפעולה קצרה", "When I was arriving, he left.", "When I arrived, he was leaving.", "הפעולה הארוכה ב-ing, הקצרה שקטעה אותה בעבר פשוט."],
      ["פעלי מצב ב-ing", "I was knowing the answer.", "I knew the answer.", "know, want, like ו-believe בדרך כלל לא באים ב-ing."],
      ["was עם רבים", "They was watching TV.", "They were watching TV.", "they, we ו-you באים עם were."],
    ],
  },
  "first-conditional": {
    intro: "בעברית אומרים \"אם ירד גשם\", בעתיד. באנגלית אחרי if באה צורת הווה, וזו הטעות הכי נפוצה בנושא.",
    mistakes: [
      ["will אחרי if", "If it will rain, we will stay home.", "If it rains, we will stay home.", "בחלק של if משתמשים בהווה פשוט."],
      ["when במקום if לדבר לא בטוח", "When I win the lottery, I'll buy a boat.", "If I win the lottery, I'll buy a boat.", "when זה משהו שיקרה בטוח, if זה משהו שאולי יקרה."],
      ["unless עם not", "Unless you don't hurry, you'll be late.", "Unless you hurry, you'll be late.", "unless כבר אומר \"אם לא\"."],
    ],
  },
  "passive-voice": {
    intro: "בעברית יש בניינים סבילים (\"נבנה\", \"נכתב\"), ובאנגלית הסביל נבנה מ-be ועוד צורת פועל שלישית. כששוכחים את אחד החלקים, המשפט נשבר.",
    mistakes: [
      ["שוכחים את be", "The house built in 1990.", "The house was built in 1990.", "בלי was המשפט אומר שהבית בנה משהו."],
      ["צורת עבר במקום צורה שלישית", "The letter was wrote yesterday.", "The letter was written yesterday.", "בסביל באה הצורה השלישית: written ולא wrote."],
      ["from במקום by", "The book was written from a famous author.", "The book was written by a famous author.", "מי שעשה את הפעולה בא אחרי by."],
      ["סביל לפועל שלא מקבל מושא", "The accident was happened at night.", "The accident happened at night.", "happen, arrive ו-die לא יכולים להיות בסביל."],
    ],
  },
  "reported-speech": {
    intro: "בעברית מצטטים בלי לשנות זמנים: \"הוא אמר שהוא עייף\". באנגלית בדיבור עקיף הזמן בדרך כלל זז צעד אחד אחורה.",
    mistakes: [
      ["לא מזיזים את הזמן", "He said that he is tired.", "He said that he was tired.", "אחרי said הזמן זז אחורה, אלא אם זה עדיין נכון עכשיו."],
      ["say עם מושא", "She said me that she was busy.", "She told me that she was busy.", "tell בא עם מי ששומע, say בלי."],
      ["סדר של שאלה בדיבור עקיף", "He asked me where do I live.", "He asked me where I lived.", "בשאלה מדווחת הסדר הוא של משפט רגיל, בלי do."],
    ],
  },
  "relative-clauses": {
    intro: "בעברית \"ש\" מתאימה לכל דבר. באנגלית בוחרים בין who, which ו-that, ואסור להוסיף כינוי שחוזר על אותו דבר.",
    mistakes: [
      ["which על אנשים", "The man which called you is here.", "The man who called you is here.", "who לאנשים, which לדברים."],
      ["כינוי כפול", "The book that I read it was great.", "The book that I read was great.", "that כבר מחליף את it. בעברית אומרים \"שקראתי אותו\", באנגלית לא."],
      ["that אחרי פסיק", "My brother, that lives in Eilat, is a chef.", "My brother, who lives in Eilat, is a chef.", "אחרי פסיק (מידע נוסף) לא משתמשים ב-that."],
    ],
  },
  "modals-of-deduction": {
    intro: "must, might ו-can't משמשים גם להסקת מסקנות. בעברית אומרים \"בטח\" או \"אין מצב\", ובתרגום הישיר המודל הלא נכון נבחר.",
    mistakes: [
      ["mustn't במקום can't", "He mustn't be at home, his car is gone.", "He can't be at home, his car is gone.", "למסקנה שלילית בטוחה משתמשים ב-can't."],
      ["must + עבר רגיל", "She must forgot her keys.", "She must have forgotten her keys.", "למסקנה על העבר: must have + צורה שלישית."],
      ["can במקום might", "It can rain later.", "It might rain later.", "לאפשרות ספציפית עכשיו או בעתיד משתמשים ב-might או may."],
    ],
  },
  "past-perfect": {
    intro: "עבר מושלם מסמן מה קרה קודם, כששני דברים קרו בעבר. בעברית אין זמן כזה, ולכן משתמשים בו לפעמים בלי צורך.",
    mistakes: [
      ["עבר מושלם בלי נקודת זמן אחרת", "I had visited Paris last year.", "I visited Paris last year.", "צריך שתי נקודות בעבר. אם יש רק אחת, עבר פשוט."],
      ["עבר פשוט כשהסדר חשוב", "When I got to the station, the train left.", "When I got to the station, the train had left.", "בלי had נשמע שהרכבת יצאה ברגע שהגעתם."],
      ["צורת עבר במקום צורה שלישית", "She had went home.", "She had gone home.", "אחרי had באה הצורה השלישית."],
    ],
  },
  "used-to-would": {
    intro: "בעברית \"הייתי הולך\" מתאר הרגל בעבר. באנגלית יש used to ו-would, ולכל אחד מגבלה משלו.",
    mistakes: [
      ["use to בחיוב", "I use to play football.", "I used to play football.", "בחיוב כותבים used to, עם d."],
      ["used to בשאלה ובשלילה", "Did you used to live here?", "Did you use to live here?", "אחרי did חוזרים לצורת בסיס: use to."],
      ["would למצב", "I would have long hair.", "I used to have long hair.", "would רק לפעולות שחזרו. למצבים (have, be, live) רק used to."],
      ["used to להווה", "I used to drink coffee every morning, and I still do.", "I drink coffee every morning.", "used to אומר שזה כבר לא קורה."],
    ],
  },
  "inversion": {
    intro: "היפוך (Never have I...) נשמע רשמי ומרשים, אבל כמעט תמיד שוכחים את פועל העזר.",
    mistakes: [
      ["היפוך בלי פועל עזר", "Never I have seen such a mess.", "Never have I seen such a mess.", "אחרי מילה שלילית בהתחלה, פועל העזר בא לפני הנושא."],
      ["שוכחים do", "Rarely we go out these days.", "Rarely do we go out these days.", "כשאין פועל עזר, מוסיפים do, does או did."],
      ["היפוך כשהמילה לא בהתחלה", "I have never seen such a mess, have I.", "I have never seen such a mess.", "היפוך קורה רק כשהמילה השלילית פותחת את המשפט."],
    ],
  },
  "cleft-sentences": {
    intro: "משפטי הדגשה (It was... that, What I need is...) מקבילים ל\"מה שאני צריך זה\". הבעיה היא בעיקר בהתאם בין החלקים.",
    mistakes: [
      ["what ואחריו that", "What I need it is a break.", "What I need is a break.", "אין צורך ב-it. החלק של what הוא הנושא."],
      ["who במקום that במשפט It was", "It was in Rome who we met.", "It was in Rome that we met.", "כשמדגישים מקום או זמן, משתמשים ב-that."],
      ["היפוך מיותר", "What did she say was surprising.", "What she said was surprising.", "בחלק של what הסדר הוא של משפט רגיל."],
    ],
  },
  "subjunctive": {
    intro: "אחרי suggest, insist ו-it's essential that באה צורת בסיס, בלי s ובלי should. זה נשמע מוזר, ולכן מתקנים את זה בטעות.",
    mistakes: [
      ["s אחרי suggest that", "I suggest that he takes a break.", "I suggest that he take a break.", "בצורה הרשמית הפועל נשאר בצורת בסיס, גם עם he."],
      ["to אחרי suggest", "She suggested me to call.", "She suggested that I call.", "suggest לא בא עם מושא ו-to."],
      ["were ו-was", "If I was you, I'd ask.", "If I were you, I'd ask.", "בדיבור שומעים גם was, אבל בכתיבה ובבחינות כותבים If I were you."],
    ],
  },
  "zero-conditional": {
    intro: "משפט תנאי אפס מתאר עובדה קבועה. בעברית לפעמים משתמשים בעתיד, ובאנגלית שני החלקים בהווה.",
    mistakes: [
      ["will בעובדה קבועה", "If you heat ice, it will melt.", "If you heat ice, it melts.", "לעובדה שתמיד נכונה, שני החלקים בהווה פשוט."],
      ["s שנשכח בחלק השני", "If water reach 100 degrees, it boil.", "If water reaches 100 degrees, it boils.", "water ו-it הם יחיד, ולכן s."],
      ["when ו-if מתחלפים", "If I wake up, I always drink water.", "When I wake up, I always drink water.", "כשזה תמיד קורה, when טבעי יותר."],
    ],
  },
  "question-tags": {
    intro: "בעברית אומרים \"נכון?\" בסוף כל משפט. באנגלית התג משתנה לפי הפועל במשפט, ותמיד הפוך ממנו.",
    mistakes: [
      ["isn't it על כל משפט", "You live in Tel Aviv, isn't it?", "You live in Tel Aviv, don't you?", "התג משתמש בפועל העזר של המשפט ובנושא שלו."],
      ["חיובי אחרי חיובי", "She is nice, is she?", "She is nice, isn't she?", "משפט חיובי מקבל תג שלילי, ולהפך."],
      ["תג אחרי I am", "I'm late, amn't I?", "I'm late, aren't I?", "ל-I am התג הוא aren't I."],
    ],
  },
  "nominalisation": {
    intro: "הפיכת פועל לשם עצם (decide → decision) נותנת לכתיבה טון אקדמי. דוברי עברית לפעמים מגזימים, ולפעמים בוחרים סיומת לא קיימת.",
    mistakes: [
      ["סיומת לא קיימת", "The decidement was quick.", "The decision was quick.", "לכל פועל יש שם עצם משלו, וצריך לבדוק אותו."],
      ["יותר מדי שמות עצם", "The making of a decision about the improvement of the situation...", "Deciding how to improve the situation...", "שני שמות עצם במשפט זה אקדמי. חמישה זה כבד."],
      ["of ו-for", "The increase of prices worried people.", "The increase in prices worried people.", "increase ו-decrease באים עם in."],
    ],
  },
  "imperatives": {
    intro: "בעברית יש ציווי לכל מין ומספר. באנגלית יש צורה אחת, צורת הבסיס, וכמעט כל הטעויות הן בשלילה ובנימוס.",
    mistakes: [
      ["no במקום don't", "No touch the screen!", "Don't touch the screen!", "שלילה בציווי נבנית עם Don't."],
      ["you בהתחלה", "You sit down, please.", "Sit down, please.", "בציווי רגיל לא אומרים את you."],
      ["ציווי שנשמע קשוח", "Give me the salt.", "Could you pass me the salt?", "באנגלית ציווי ישיר יכול להישמע גס. בבקשה מנומסת משתמשים בשאלה."],
    ],
  },
  "object-pronouns": {
    intro: "בעברית אומרים \"אותו\", \"לה\" ו\"איתם\". באנגלית יש מילה אחת לכל מקום שבו האדם מקבל את הפעולה: me, him, her, us, them.",
    mistakes: [
      ["כינוי נושא במקום מושא", "She called I yesterday.", "She called me yesterday.", "אחרי פועל באים me, him, her, us, them."],
      ["אחרי מילת יחס", "This is for he.", "This is for him.", "אחרי for, with ו-to באה צורת המושא."],
      ["me and you בסדר הפוך", "Me and Dana went out.", "Dana and I went out.", "כנושא משתמשים ב-I, ובנימוס שמים את עצמנו בסוף."],
    ],
  },
  "question-words": {
    intro: "בעברית מספיקה מילת שאלה ואינטונציה: \"איפה אתם גרים?\". באנגלית צריך גם פועל עזר, ובסדר הנכון.",
    mistakes: [
      ["בלי פועל עזר", "Where you live?", "Where do you live?", "אחרי מילת השאלה בא do, does או did."],
      ["what במקום which", "What color do you prefer, red or blue?", "Which color do you prefer, red or blue?", "כשיש מספר אפשרויות ידוע, which."],
      ["how much ו-how many", "How much people came?", "How many people came?", "how many לדברים שסופרים, how much לדברים שלא."],
      ["do כשהשאלה על הנושא", "Who did call you?", "Who called you?", "כש-who הוא מי שעשה את הפעולה, אין do."],
    ],
  },
  "adverbs-of-frequency": {
    intro: "בעברית \"תמיד\" יכול לבוא כמעט בכל מקום. באנגלית ל-always, usually ו-never יש מקום קבוע במשפט.",
    mistakes: [
      ["אחרי הפועל", "I drink always coffee.", "I always drink coffee.", "מילת התדירות באה לפני פועל רגיל."],
      ["לפני be", "She always is late.", "She is always late.", "עם be היא באה אחרי הפועל."],
      ["never עם not", "I don't never eat meat.", "I never eat meat.", "never כבר שלילי. אין שלילה כפולה."],
    ],
  },
  "possessive-s": {
    intro: "בעברית אומרים \"האוטו של דני\". באנגלית מוסיפים 's לבעלים, והטעויות הן בעיקר בגרש.",
    mistakes: [
      ["of לאנשים", "the car of Danny", "Danny's car", "לאנשים ולבעלי חיים משתמשים ב-'s."],
      ["גרש ברבים", "my parents's house", "my parents' house", "לרבים שנגמר ב-s מוסיפים רק גרש."],
      ["גרש ברבים רגילים", "I have two cat's.", "I have two cats.", "גרש מסמן שייכות, לא רבים."],
    ],
  },
  "have-to": {
    intro: "\"צריך\" בעברית מתורגם לכמה דברים באנגלית. have to זה חובה, וההבדל החשוב באמת הוא בשלילה.",
    mistakes: [
      ["have to בלי do בשאלה", "Have you to work tomorrow?", "Do you have to work tomorrow?", "have to מתנהג כמו פועל רגיל ומקבל do."],
      ["has to עם he", "He have to leave.", "He has to leave.", "עם he, she ו-it כותבים has to."],
      ["don't have to ו-mustn't", "You don't have to smoke here. (אסור)", "You mustn't smoke here.", "don't have to זה לא חייבים. mustn't זה אסור."],
    ],
  },
  "verb-gerund-or-infinitive": {
    intro: "בעברית אחרי פועל בא שם פועל: \"נהנה לשחות\". באנגלית יש פעלים שאחריהם בא ing, ויש שאחריהם בא to.",
    mistakes: [
      ["to אחרי enjoy", "I enjoy to swim.", "I enjoy swimming.", "אחרי enjoy, finish, avoid ו-mind בא ing."],
      ["ing אחרי want", "I want going home.", "I want to go home.", "אחרי want, decide, hope ו-plan בא to."],
      ["look forward to + פועל בסיס", "I look forward to see you.", "I look forward to seeing you.", "כאן to היא מילת יחס, ולכן אחריה ing."],
      ["stop + to לעומת stop + ing", "I stopped to smoke. (הפסקתי לעשן)", "I stopped smoking.", "stop + to זה \"עצרתי כדי לעשן\"."],
    ],
  },
  "may-might-possibility": {
    intro: "\"אולי\" בעברית היא מילה שעומדת בצד. באנגלית האפשרות נכנסת לפועל עצמו עם may או might.",
    mistakes: [
      ["maybe במקום might", "Maybe I come later.", "I might come later.", "maybe פותח משפט שלם עם פועל: Maybe I will come later."],
      ["to אחרי might", "She might to call.", "She might call.", "אחרי might ו-may בא פועל בצורת בסיס."],
      ["might not בקיצור", "I mightn't go.", "I might not go.", "בדיבור יום יומי אומרים might not, בלי קיצור."],
    ],
  },
  "so-such": {
    intro: "בעברית \"כל כך\" מתאים לכל דבר. באנגלית בוחרים: so לפני תואר לבד, such לפני שם עצם.",
    mistakes: [
      ["so לפני שם עצם", "It was so a good movie.", "It was such a good movie.", "כשיש שם עצם אחרי התואר, such a."],
      ["such לפני תואר לבד", "The movie was such good.", "The movie was so good.", "תואר לבד מקבל so."],
      ["שוכחים את a", "She is such nice person.", "She is such a nice person.", "שם עצם ביחיד צריך a גם אחרי such."],
    ],
  },
  "causative-have-get": {
    intro: "בעברית אומרים \"תיקנתי את האוטו\" גם כשמוסך תיקן. באנגלית have something done אומר שמישהו אחר עשה את זה בשבילנו.",
    mistakes: [
      ["אומרים שעשינו בעצמנו", "I cut my hair yesterday. (במספרה)", "I had my hair cut yesterday.", "בלי had נשמע שהסתפרתם לבד."],
      ["סדר המילים", "I had cut my hair.", "I had my hair cut.", "הדבר בא באמצע, ואחריו הצורה השלישית."],
      ["צורת בסיס במקום צורה שלישית", "We got the car fix.", "We got the car fixed.", "אחרי הדבר באה צורה שלישית: fixed."],
    ],
  },
  "future-continuous-perfect": {
    intro: "בעברית יש עתיד אחד. באנגלית will be doing מתאר משהו באמצע, ו-will have done משהו שיהיה גמור עד נקודה מסוימת.",
    mistakes: [
      ["עתיד פשוט לפעולה באמצע", "At 8 tonight I will watch the game.", "At 8 tonight I will be watching the game.", "בשעה 8 המשחק כבר באמצע, ולכן be + ing."],
      ["by + עתיד פשוט", "By Friday I will finish the project.", "By Friday I will have finished the project.", "by + זמן אומר שעד אז זה כבר יהיה גמור."],
      ["צורת עבר במקום צורה שלישית", "I will have went home by then.", "I will have gone home by then.", "אחרי will have באה הצורה השלישית."],
    ],
  },
};

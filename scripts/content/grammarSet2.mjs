// Grammar set 2: the core structures the inventory showed were missing at
// each level. Same shape as GRAMMAR_TOPICS in levelExpansion.mjs:
// { slug, name_he, name_en, level, sort, title_he, body_md,
//   fill: [[sentence with one ___, answer, hint]], reorder: [[tokens]] }
// Hebrew is gender-neutral (plural address or impersonal) and has no long
// dash. All examples are original.

export const GRAMMAR_TOPICS = [
  // ---------------- A1 ----------------
  {
    slug: "there-is-there-are",
    name_he: "there is / there are",
    name_en: "There is / There are",
    level: "A1",
    sort: 35,
    title_he: "יש / אין: there is ו-there are",
    body_md: `כדי להגיד ש**יש** משהו במקום מסוים, משתמשים ב-**there is** וב-**there are**.

- **there is** + יחיד או בלתי ספיר: There is a cat in the garden. There is milk in the fridge.
- **there are** + רבים: There are three books on the table.

**בקיצור:** there is = **there's**. את there are בדרך כלל לא מקצרים בכתיבה.

**שלילה:**

- There **isn't** a bank near here.
- There **aren't any** chairs in the room.

**שאלה:** הופכים את הסדר.

- **Is there** a pharmacy on this street? Yes, there is. / No, there isn't.
- **Are there** any eggs? Yes, there are. / No, there aren't.

**שימו לב:** בעברית אומרים "יש לי" על משהו ששייך לנו. באנגלית זה **I have**, לא there is: I have a car (לא There is me a car).`,
    fill: [
      ["___ a big park near my house.", "There is", "יחיד: there is"],
      ["There ___ two cafés on this street.", "are", "רבים: are"],
      ["___ there a toilet on this floor?", "Is", "שאלה ביחיד"],
      ["There ___ any milk left. Can you buy some?", "isn't", "שלילה, milk הוא בלתי ספיר"],
      ["Are there any apples? No, there ___.", "aren't", "תשובה קצרה ברבים"],
    ],
    reorder: [
      ["There", "are", "four", "people", "in", "my", "family"],
      ["Is", "there", "a", "bus", "to", "the", "airport"],
    ],
  },
  {
    slug: "imperatives",
    name_he: "ציווי",
    name_en: "Imperatives",
    level: "A1",
    sort: 36,
    title_he: "ציווי: הוראות, בקשות ואזהרות",
    body_md: `צורת הציווי באנגלית היא פשוט **צורת הבסיס** של הפועל, בלי נושא. היא אותה צורה לאדם אחד ולכמה אנשים.

- **Open** the window, please.
- **Sit** down.
- **Turn** left at the lights.

**שלילה:** **Don't** + בסיס.

- **Don't** touch that. It's hot.
- **Don't** be late.

**ציווי שכולל גם אותנו:** **Let's** + בסיס.

- **Let's** go to the beach.
- **Let's not** wait for the bus. Let's walk.

**כדי שזה יישמע מנומס,** מוסיפים please בהתחלה או בסוף: Please close the door. / Close the door, please.

**שימו לב:** אין to אחרי don't ו-let's: Don't **run** (לא Don't to run).`,
    fill: [
      ["___ your books on page 12.", "Open", "צורת בסיס"],
      ["___ worry. Everything is fine.", "Don't", "ציווי בשלילה"],
      ["It's late. ___ go home.", "Let's", "הצעה שכוללת גם אותנו"],
      ["Please ___ quiet in the library.", "be", "ציווי של to be"],
      ["Don't ___ the door. It's cold outside.", "open", "אחרי don't: בסיס"],
    ],
    reorder: [
      ["Please", "turn", "off", "your", "phone"],
      ["Don't", "forget", "your", "keys"],
    ],
  },
  {
    slug: "object-pronouns",
    name_he: "כינויי מושא",
    name_en: "Object Pronouns",
    level: "A1",
    sort: 37,
    title_he: "כינויי מושא: me, him, her, us, them",
    body_md: `כשמישהו **מקבל** את הפעולה (אחרי הפועל או אחרי מילת יחס), משתמשים בכינוי מושא ולא בכינוי נושא.

| נושא | מושא |
|---|---|
| I | me |
| you | you |
| he | him |
| she | her |
| it | it |
| we | us |
| they | them |

- She loves **him**. (לא She loves he)
- Can you help **me**?
- I'm waiting for **them**.
- This present is for **you**.

**הכלל:** לפני הפועל (מי שעושה) = I, he, she, we, they. אחרי הפועל או אחרי for, with, to, at = me, him, her, us, them.

**שימו לב:** בעברית אומרים "אוהב אותה". באנגלית אין מילה ל"את": I love **her**.`,
    fill: [
      ["I don't know that man. Do you know ___?", "him", "מושא של he"],
      ["My sister is here. Do you want to talk to ___?", "her", "אחרי to"],
      ["We're lost. Can you help ___?", "us", "מושא של we"],
      ["These shoes are great. I want ___.", "them", "מושא ברבים"],
      ["Call ___ when you get home. I'll be awake.", "me", "מושא של I"],
    ],
    reorder: [
      ["Can", "you", "send", "me", "the", "photos"],
      ["We", "visit", "them", "every", "summer"],
    ],
  },
  {
    slug: "question-words",
    name_he: "מילות שאלה",
    name_en: "Question Words",
    level: "A1",
    sort: 38,
    title_he: "מילות שאלה: what, where, when, who, why, how",
    body_md: `שאלה עם מילת שאלה בנויה כך: **מילת שאלה + פועל עזר + נושא + פועל**.

- **What** do you do? (מה)
- **Where** do you live? (איפה)
- **When** does the film start? (מתי)
- **Who** is that woman? (מי)
- **Why** are you sad? (למה)
- **How** do you go to work? (איך)

**צירופים עם how:**

- **How old** are you? (בן או בת כמה)
- **How much** is this? (כמה זה עולה)
- **How many** brothers do you have? (כמה, עם רבים)
- **How often** do you swim? (באיזו תדירות)

**עם to be** אין פועל עזר נוסף: Where **is** the station? Who **are** they?

**שימו לב:** בעברית אפשר לשאול "איפה אתם גרים?" בלי מילה נוספת. באנגלית צריך do או does: Where **do** you live?`,
    fill: [
      ["___ is your birthday? In May.", "When", "שאלה על זמן"],
      ["___ do you live? In Haifa.", "Where", "שאלה על מקום"],
      ["How ___ brothers and sisters do you have?", "many", "כמה, עם רבים"],
      ["___ are you late? The bus didn't come.", "Why", "שאלה על סיבה"],
      ["What time ___ the shop open?", "does", "פועל עזר לגוף שלישי יחיד"],
    ],
    reorder: [
      ["Where", "do", "your", "parents", "work"],
      ["How", "much", "is", "this", "jacket"],
    ],
  },

  // ---------------- A2 ----------------
  {
    slug: "adverbs-of-frequency",
    name_he: "תדירות: always, usually, never",
    name_en: "Adverbs of Frequency",
    level: "A2",
    sort: 39,
    title_he: "כמה פעמים: always, usually, often, sometimes, never",
    body_md: `תארי פועל של תדירות אומרים **כמה פעמים** משהו קורה. מהגבוה לנמוך:

**always** (תמיד) > **usually** (בדרך כלל) > **often** (לעתים קרובות) > **sometimes** (לפעמים) > **rarely** (לעתים רחוקות) > **never** (אף פעם)

**איפה הם עומדים במשפט:**

- **לפני** פועל רגיל: I **usually** walk to work. She **never** eats meat.
- **אחרי** to be: He **is always** late. We **are often** tired on Sundays.
- **בין** פועל העזר לפועל: I **have never** been to Paris. Do you **often** cook?

**sometimes** יכול לבוא גם בתחילת המשפט: **Sometimes** I work from home.

**שימו לב:** never כבר שלילי, ולכן אין צורך ב-don't: I **never** drink coffee (לא I don't never drink).`,
    fill: [
      ["I ___ get up at 7. Every single day.", "always", "תמיד"],
      ["She is ___ late. She hates waiting.", "never", "אף פעם"],
      ["We ___ go to the cinema, maybe once a year.", "rarely", "לעתים רחוקות"],
      ["Do you ___ eat breakfast?", "usually", "בדרך כלל, בתוך שאלה"],
      ["He ___ always tired after work.", "is", "תדירות באה אחרי to be"],
    ],
    reorder: [
      ["I", "usually", "have", "lunch", "at", "one"],
      ["They", "are", "never", "at", "home", "on", "Fridays"],
    ],
  },
  {
    slug: "possessive-s",
    name_he: "שייכות: 's",
    name_en: "Possessive 's",
    level: "A2",
    sort: 40,
    title_he: "של מי זה? Dana's car",
    body_md: `כדי להגיד שמשהו **שייך** למישהו, מוסיפים **'s** לבעלים, ומה ששייך לו בא אחרי.

- **Dana's** car = המכונית של דנה
- my **brother's** room = החדר של אח שלי
- the **teacher's** desk = השולחן של המורה

**רבים שמסתיימים ב-s:** מוסיפים רק גרש.

- my **parents'** house = הבית של ההורים שלי
- the **students'** books

**רבים לא רגילים** (בלי s בסוף) מקבלים **'s** רגיל: the **children's** toys, **women's** shoes.

**לחפצים** משתמשים בדרך כלל ב-**of**: the end **of** the film, the door **of** the car.

**שימו לב:** הסדר הפוך מהעברית. בעברית "הכלב של תום", באנגלית **Tom's dog**.`,
    fill: [
      ["This is ___ phone. (Noa)", "Noa's", "בעלים ביחיד: 's"],
      ["My ___ house is very big. (parents)", "parents'", "רבים עם s: רק גרש"],
      ["The ___ toys are everywhere. (children)", "children's", "רבים בלי s: 's"],
      ["I don't like the end ___ the film.", "of", "לחפצים: of"],
      ["Is that your ___ car? (sister)", "sister's", "בעלים ביחיד"],
    ],
    reorder: [
      ["That", "is", "my", "friend's", "bike"],
      ["We", "stayed", "at", "my", "grandparents'", "house"],
    ],
  },
  {
    slug: "have-to",
    name_he: "have to / don't have to",
    name_en: "Have to / Don't have to",
    level: "A2",
    sort: 41,
    title_he: "חובה ובלי חובה: have to ו-don't have to",
    body_md: `**have to** + בסיס = **חייבים**, בדרך כלל בגלל חוק, כלל או נסיבות.

- I **have to** wear a uniform at work.
- She **has to** get up early tomorrow.
- We **had to** wait for an hour. (עבר)

**don't have to** = **לא חייבים** (אבל מותר):

- You **don't have to** pay. It's free.
- He **doesn't have to** work on Fridays.

**must או have to?** שניהם "חייבים". **must** נשמע יותר כמו החלטה של הדובר (I must call my mother), ו-**have to** כמו כלל מבחוץ. בעבר יש רק **had to**.

**שימו לב:** mustn't ו-don't have to **לא** אותו דבר.

- You **mustn't** smoke here. = אסור.
- You **don't have to** come. = לא חובה, אפשר לבחור.`,
    fill: [
      ["In Israel, you ___ to be 17 to drive.", "have", "חובה לפי חוק"],
      ["She ___ to take the bus because her car broke down.", "has", "גוף שלישי יחיד"],
      ["You ___ have to bring food. There's a lot here.", "don't", "לא חובה"],
      ["Yesterday we ___ to stay late at the office.", "had", "חובה בעבר"],
      ["You ___ park here. It's for ambulances only.", "mustn't", "אסור, לא רק לא חובה"],
    ],
    reorder: [
      ["Do", "we", "have", "to", "bring", "our", "passports"],
      ["He", "doesn't", "have", "to", "work", "tomorrow"],
    ],
  },

  // ---------------- B1 ----------------
  {
    slug: "present-perfect-vs-past-simple",
    name_he: "הווה מושלם מול עבר פשוט",
    name_en: "Present Perfect vs Past Simple",
    level: "B1",
    sort: 42,
    title_he: "I have seen או I saw? מתי כל אחד",
    body_md: `שני הזמנים מדברים על העבר. ההבדל הוא **אם הזמן חשוב ואם הוא נגמר**.

**עבר פשוט (I saw):** זמן מסוים שכבר נגמר. בדרך כלל יש מילת זמן: yesterday, last week, in 2019, two days ago, when I was a child.

- I **saw** that film **last week**.
- She **moved** to Tel Aviv **in 2020**.

**הווה מושלם (I have seen):** הזמן לא חשוב או עדיין לא נגמר. מילים שבאות איתו: ever, never, already, yet, just, so far, this week.

- I **have seen** that film. (מתי? לא חשוב)
- **Have** you **ever been** to Japan?
- She **has lived** here **since** 2020. (ועדיין גרה)

**ניסיון ואז פרטים:** פותחים בהווה מושלם ועוברים לעבר פשוט:

- **Have** you ever **eaten** sushi? Yes, I **ate** it in London last year.

**שימו לב:** אף פעם לא משתמשים בהווה מושלם עם זמן שנגמר: I **went** there yesterday (לא I have gone there yesterday).`,
    fill: [
      ["I ___ my keys. I can't find them anywhere.", "have lost", "תוצאה שקיימת עכשיו"],
      ["We ___ to Eilat last summer.", "went", "זמן שנגמר: last summer"],
      ["___ you ever tried Ethiopian food?", "Have", "ניסיון בחיים"],
      ["She ___ her homework two hours ago.", "finished", "ago: עבר פשוט"],
      ["I've already ___ that book. It was great.", "read", "צורה שלישית של read"],
    ],
    reorder: [
      ["Have", "you", "ever", "been", "to", "Rome"],
      ["I", "met", "him", "three", "years", "ago"],
    ],
  },
  {
    slug: "verb-gerund-or-infinitive",
    name_he: "פועל + ing או פועל + to",
    name_en: "Verb + -ing or to",
    level: "B1",
    sort: 43,
    title_he: "enjoy doing או want to do? פעלים שבאים אחרי פעלים",
    body_md: `כשפועל בא אחרי פועל אחר, הצורה שלו תלויה ב**פועל הראשון**. אין כלל אחד, אז לומדים את הנפוצים.

**פועל + ing:**

enjoy, finish, mind, avoid, suggest, keep, practise, miss

- I **enjoy cooking**.
- Have you **finished eating**?
- Do you **mind waiting** a minute?

**פועל + to:**

want, need, decide, hope, plan, agree, promise, learn, would like

- I **want to travel** next year.
- She **decided to leave** early.
- We **hope to see** you soon.

**שניהם, כמעט באותה משמעות:** like, love, hate, start, begin

- I **like swimming**. / I **like to swim**.
- It **started raining**. / It **started to rain**.

**אחרי מילת יחס תמיד ing:** I'm good **at drawing**. She's interested **in learning** Spanish.`,
    fill: [
      ["I really enjoy ___ in the sea. (swim)", "swimming", "enjoy + ing"],
      ["We decided ___ a new car. (buy)", "to buy", "decide + to"],
      ["Would you mind ___ the window? (close)", "closing", "mind + ing"],
      ["She hopes ___ a doctor one day. (become)", "to become", "hope + to"],
      ["He's very good at ___ jokes. (tell)", "telling", "אחרי מילת יחס: ing"],
    ],
    reorder: [
      ["I", "want", "to", "learn", "the", "guitar"],
      ["She", "finished", "writing", "the", "report"],
    ],
  },
  {
    slug: "may-might-possibility",
    name_he: "אולי: may ו-might",
    name_en: "May and Might (Possibility)",
    level: "B1",
    sort: 44,
    title_he: "אולי כן ואולי לא: may, might, could",
    body_md: `כשלא בטוחים אם משהו יקרה או נכון, משתמשים ב-**may**, **might** או **could** + בסיס.

- It **might** rain later. Take an umbrella.
- She **may** be at home. Her car is outside.
- This **could** be the answer.

בדיבור יומיומי **might** הוא הנפוץ ביותר. **may** קצת יותר רשמי ונשמע מעט יותר בטוח.

**שלילה:** **might not** / **may not** = אולי לא.

- I **might not** come tonight. I'm very tired.

**שימו לב:**

- אחרי may ו-might באה צורת בסיס, בלי to: It might **be** true (לא might to be).
- **could not** הוא לא "אולי לא". הוא אומר שמשהו **בלתי אפשרי**: He couldn't be there. I saw him in Haifa.
- **maybe** היא מילה, לא פועל, והיא באה בתחילת המשפט: **Maybe** she's busy. = She **might** be busy.`,
    fill: [
      ["Take a jacket. It ___ get cold tonight.", "might", "אפשרות בעתיד"],
      ["I'm not sure. He ___ be in a meeting.", "may", "אפשרות בהווה"],
      ["We might ___ go to the party. We'll see.", "not", "אולי לא"],
      ["___ she missed the bus. She's never late.", "Maybe", "מילה בתחילת משפט, לא פועל"],
      ["It might ___ a good idea to book a table. (be)", "be", "אחרי might: בסיס"],
    ],
    reorder: [
      ["I", "might", "visit", "my", "aunt", "this", "weekend"],
      ["They", "may", "not", "have", "time", "today"],
    ],
  },
  {
    slug: "so-such",
    name_he: "so ו-such",
    name_en: "So and Such",
    level: "B1",
    sort: 45,
    title_he: "כל כך: so tired, such a long day",
    body_md: `שתי המילים אומרות **"כל כך"**, וההבדל הוא מה בא אחריהן.

**so** + שם תואר או תואר פועל (בלי שם עצם):

- The film was **so boring**.
- You speak **so quickly**.

**such** + (שם תואר) + שם עצם:

- It was **such a boring film**.
- They are **such nice people**.
- We had **such fun**.

עם שם עצם ביחיד שאפשר לספור באים **such a** / **such an**: such **a** good idea, such **an** easy test.

**so ... that / such ... that** = כל כך ... ש...:

- I was **so tired that** I fell asleep on the sofa.
- It was **such a hot day that** we stayed inside.

**שימו לב:** לא אומרים so a good day. כשיש שם עצם, משתמשים ב-such: **such a** good day.`,
    fill: [
      ["The soup is ___ hot. Wait a minute.", "so", "so + שם תואר"],
      ["She is ___ a good teacher.", "such", "such + a + שם עצם"],
      ["It was ___ an easy question.", "such", "such an + שם עצם"],
      ["They were ___ happy that they started to dance.", "so", "so ... that"],
      ["We had ___ a good time in Eilat.", "such", "such + a good time"],
    ],
    reorder: [
      ["It", "was", "such", "a", "beautiful", "day"],
      ["I", "was", "so", "hungry", "that", "I", "ate", "everything"],
    ],
  },

  // ---------------- B2 ----------------
  {
    slug: "present-perfect-continuous",
    name_he: "הווה מושלם מתמשך",
    name_en: "Present Perfect Continuous",
    level: "B2",
    sort: 46,
    title_he: "I've been waiting: פעולה שנמשכת עד עכשיו",
    body_md: `**have / has been + ing** מתאר פעולה שהתחילה בעבר, נמשכה, ו**עדיין נמשכת** או הסתיימה ממש עכשיו. הדגש הוא על **משך הזמן** או על הפעולה עצמה.

- I**'ve been waiting** for you for an hour!
- She**'s been learning** French since September.
- How long **have** you **been living** here?

**תוצאה שרואים עכשיו:** You're wet. **Have** you **been running**?

**מול הווה מושלם רגיל:**

- I**'ve been reading** this book. (התהליך, אולי לא סיימתי)
- I**'ve read** this book. (סיימתי, התוצאה)
- I**'ve read** three chapters. (כמות, ולכן הווה מושלם רגיל)

**for / since:**

- **for** + משך: for two hours, for a long time
- **since** + נקודת התחלה: since Monday, since 2018, since I was a child

**שימו לב:** פעלים של מצב (know, like, believe, own) לא באים ב-ing: I've **known** her for years (לא I've been knowing).`,
    fill: [
      ["I've been ___ for the bus for 20 minutes. (wait)", "waiting", "been + ing"],
      ["How long ___ you been studying English?", "have", "שאלה: have + נושא + been"],
      ["She's been working here ___ 2021.", "since", "נקודת התחלה"],
      ["They've been talking ___ hours.", "for", "משך זמן"],
      ["I've ___ him since we were at school. (know)", "known", "פועל מצב: בלי ing"],
    ],
    reorder: [
      ["We", "have", "been", "living", "here", "for", "ten", "years"],
      ["What", "have", "you", "been", "doing", "all", "day"],
    ],
  },
  {
    slug: "wish-if-only",
    name_he: "wish ו-if only",
    name_en: "Wish and If only",
    level: "B2",
    sort: 47,
    title_he: "הלוואי: I wish I knew, if only I had",
    body_md: `**wish** ו-**if only** מביעים משאלה שהמצב יהיה אחרת. הזמן שבא אחריהם **זז צעד אחד אחורה**.

**על ההווה:** wish + עבר פשוט

- I **wish** I **knew** the answer. (אני לא יודע או יודעת)
- I **wish** I **had** more time.
- I **wish** I **were** taller. (ברשמי were לכל הגופים; בדיבור שומעים גם was)

**על העבר (חרטה):** wish + עבר מושלם

- I **wish** I **had studied** harder. (לא למדתי מספיק)
- She **wishes** she **hadn't said** that.

**על התנהגות של מישהו אחר שמעצבנת אותנו:** wish + would

- I **wish** you **would** stop talking.
- I **wish** it **would** stop raining.

**if only** זהה ל-wish, אבל חזק ורגשי יותר: **If only** I **had** listened to you!

**שימו לב:** לא אומרים I wish I would. על עצמנו משתמשים ב-could: I wish I **could** come.`,
    fill: [
      ["I wish I ___ how to swim. (know)", "knew", "משאלה על ההווה: עבר פשוט"],
      ["I wish I ___ gone to bed earlier last night.", "had", "חרטה על העבר"],
      ["If only I ___ more money!", "had", "משאלה על ההווה"],
      ["I wish you ___ stop interrupting me.", "would", "התנהגות של אחר"],
      ["I wish I ___ come to your party, but I'm abroad.", "could", "על עצמנו: could"],
    ],
    reorder: [
      ["I", "wish", "I", "had", "taken", "more", "photos"],
      ["If", "only", "we", "lived", "near", "the", "sea"],
    ],
  },
  {
    slug: "causative-have-get",
    name_he: "have something done",
    name_en: "Causative: have / get something done",
    level: "B2",
    sort: 48,
    title_he: "מישהו אחר עושה בשבילנו: I had my hair cut",
    body_md: `כשמישהו **אחר** עושה בשבילנו עבודה (בדרך כלל בתשלום), משתמשים ב-**have + חפץ + צורה שלישית**.

- I **had my hair cut** yesterday. (הספר או הספרית גזרו לי)
- We're **having the kitchen painted**.
- She **has her car washed** every week.

**get** במקום have נפוץ בדיבור:

- I need to **get my phone fixed**.
- Where did you **get your nails done**?

**השוו:**

- I **cut** my hair. = גזרתי לבד.
- I **had** my hair **cut**. = מישהו גזר לי.

**גם לדברים לא נעימים שקרו לנו:** She **had her bag stolen** on the train.

**שימו לב לסדר:** have + **מה** + צורה שלישית. לא I had cut my hair (זה עבר מושלם, ומשמעותו שגזרתי בעצמי).`,
    fill: [
      ["I'm going to have my eyes ___ tomorrow. (test)", "tested", "צורה שלישית"],
      ["We had the roof ___ after the storm. (repair)", "repaired", "צורה שלישית"],
      ["You should ___ that tooth checked by a dentist.", "get", "get במקום have"],
      ["She ___ her hair done for the wedding last week.", "had", "have בעבר"],
      ["He had his wallet ___ on the bus. (steal)", "stolen", "משהו לא נעים שקרה לנו"],
    ],
    reorder: [
      ["I", "need", "to", "get", "my", "car", "serviced"],
      ["They", "had", "their", "house", "painted", "last", "year"],
    ],
  },
  {
    slug: "future-continuous-perfect",
    name_he: "עתיד מתמשך ועתיד מושלם",
    name_en: "Future Continuous and Future Perfect",
    level: "B2",
    sort: 49,
    title_he: "This time tomorrow I'll be flying. By then I'll have finished.",
    body_md: `**עתיד מתמשך: will be + ing.** פעולה שתהיה **באמצע** ברגע מסוים בעתיד.

- **This time tomorrow** I**'ll be flying** to London.
- Don't call at 8. We**'ll be having** dinner.

גם כדי לשאול על תוכניות בנימוס: **Will** you **be using** the car tonight?

**עתיד מושלם: will have + צורה שלישית.** פעולה ש**תסתיים לפני** רגע מסוים בעתיד. הסימן הנפוץ: **by** (עד).

- **By** Friday I**'ll have finished** the project.
- **By the time** you arrive, the film **will have started**.
- She**'ll have worked** here for ten years next month.

**השוו:**

- At 9 I**'ll be writing** the report. (באמצע)
- By 9 I**'ll have written** the report. (כבר גמרתי)

**שימו לב:** אחרי by the time באה צורת הווה, לא will: By the time you **arrive** (לא will arrive).`,
    fill: [
      ["At 10 tomorrow I'll be ___ an exam. (take)", "taking", "באמצע פעולה"],
      ["By next June, I will ___ graduated.", "have", "will have + צורה שלישית"],
      ["Don't come at 7. We'll ___ eating dinner.", "be", "will be + ing"],
      ["By the time we ___, the shop will have closed. (arrive)", "arrive", "אחרי by the time: הווה"],
      ["She will have ___ the whole book by tonight. (read)", "read", "צורה שלישית של read"],
    ],
    reorder: [
      ["This", "time", "next", "week", "we'll", "be", "lying", "on", "the", "beach"],
      ["By", "Monday", "I'll", "have", "answered", "all", "the", "emails"],
    ],
  },

  // ---------------- C1 ----------------
  {
    slug: "concession-although-despite",
    name_he: "ניגוד: although ו-despite",
    name_en: "Concession: although, despite, however",
    level: "C1",
    sort: 50,
    title_he: "למרות ש...: although, even though, despite, in spite of",
    body_md: `כולן אומרות **"למרות"**, אבל כל אחת באה עם מבנה אחר.

**although / even though / though** + משפט שלם (נושא + פועל):

- **Although** it was raining, we went for a walk.
- **Even though** she was ill, she came to work. (חזק יותר)
- **Though** I like him, I don't trust him. (קצת פחות רשמי)

**despite / in spite of** + שם עצם או ing (לא משפט שלם):

- **Despite the rain**, we went for a walk.
- **In spite of being** ill, she came to work.
- **Despite the fact that** it was raining, ... (ככה מכניסים משפט שלם)

**however** מחבר בין **שני משפטים נפרדים**, ובא אחריו פסיק:

- The hotel was expensive. **However**, the service was excellent.

**שימו לב:** לא despite of (בלי of), ולא although + שם עצם. נכון: **Despite** the noise / **Although** it was noisy.`,
    fill: [
      ["___ the traffic, we arrived on time.", "Despite", "+ שם עצם"],
      ["___ she studied hard, she failed the test.", "Although", "+ משפט שלם"],
      ["In spite ___ feeling tired, he finished the race.", "of", "in spite of + ing"],
      ["The plan was risky. ___, it worked perfectly.", "However", "מחבר בין שני משפטים"],
      ["Despite the fact ___ it was late, nobody wanted to leave.", "that", "despite the fact that + משפט"],
    ],
    reorder: [
      ["Even", "though", "it", "was", "cold", "we", "swam", "in", "the", "sea"],
      ["Despite", "his", "injury", "he", "played", "the", "whole", "match"],
    ],
  },
  {
    slug: "would-rather-had-better",
    name_he: "would rather ו-had better",
    name_en: "Would rather and Had better",
    level: "C1",
    sort: 51,
    title_he: "העדפה ואזהרה: I'd rather stay, you'd better go",
    body_md: `**would rather** = **מעדיפים**. אחריו בא בסיס, בלי to.

- I**'d rather stay** at home tonight.
- **Would** you **rather** have tea or coffee?
- I**'d rather not** talk about it.
- I'd rather walk **than** take a taxi.

**כשאנחנו מעדיפים שמישהו אחר יעשה משהו,** אחרי would rather בא **עבר פשוט**, גם כשמדברים על ההווה או העתיד:

- I**'d rather you didn't tell** anyone.
- She'd rather we **came** tomorrow.

**had better** = **כדאי מאוד** (ואם לא, יהיו בעיות). חזק יותר מ-should. אחריו בא בסיס, בלי to.

- You**'d better hurry**, or you'll miss the train.
- We**'d better not** be late again.

**שימו לב:**

- had better מדבר על **עכשיו ועל העתיד**, למרות ה-had.
- בקיצור **'d** יכול להיות would וגם had: I**'d** rather = would, You**'d** better = had.`,
    fill: [
      ["I'd rather ___ at home than go out tonight. (stay)", "stay", "would rather + בסיס"],
      ["You'd ___ take an umbrella. It's going to pour.", "better", "had better"],
      ["I'd rather you ___ smoke in the car. (not)", "didn't", "מישהו אחר: עבר פשוט"],
      ["We'd better ___ be late for the interview.", "not", "had better not"],
      ["Would you rather live in the city ___ in the country?", "or", "בחירה בין שתי אפשרויות"],
    ],
    reorder: [
      ["I'd", "rather", "not", "discuss", "it", "now"],
      ["You'd", "better", "call", "her", "before", "she", "leaves"],
    ],
  },

  // ---------------- C2 ----------------
  {
    slug: "ellipsis-substitution",
    name_he: "השמטה והחלפה",
    name_en: "Ellipsis and Substitution",
    level: "C2",
    sort: 52,
    title_he: "לא לחזור על עצמנו: so, do, one, not",
    body_md: `דוברים מתקדמים לא חוזרים על מילים שכבר נאמרו. יש שתי דרכים: **להחליף** את החלק שחוזר במילה קצרה, או **להשמיט** אותו.

**החלפה:**

- **one / ones** במקום שם עצם: I don't like the red shirt. I prefer the blue **one**.
- **do / does / did** במקום פועל וכל מה שאחריו: She plays the piano better than I **do**.
- **so** במקום משפט שלם, אחרי think, hope, expect, suppose, be afraid: Will it rain? I think **so**. / I hope **not**.
- **do so** ברשמי: The minister promised to resign and **did so** the next day.

**השמטה:**

- אחרי פועל עזר: I can't swim, but my sister **can**. (swim הושמט)
- אחרי to: I didn't want to go, but I had **to**.
- **neither / so** + פועל עזר + נושא: I'm tired. **So am I.** / I don't eat meat. **Neither do I.**

**שימו לב:** I don't think so (נפוץ וטבעי) לעומת I think not (רשמי מאוד). ו-I hope not, לא I don't hope so.`,
    fill: [
      ["This cup is broken. Can I have another ___?", "one", "החלפת שם עצם"],
      ["Is the shop open on Saturday? I don't think ___.", "so", "החלפת משפט"],
      ["He speaks Arabic better than I ___.", "do", "החלפת פועל"],
      ["Will it be expensive? I hope ___.", "not", "I hope not"],
      ["I haven't seen that film. Neither ___ I.", "have", "השמטה עם פועל עזר"],
    ],
    reorder: [
      ["She", "wanted", "to", "leave", "but", "she", "couldn't"],
      ["I", "prefer", "the", "older", "photos", "to", "the", "new", "ones"],
    ],
  },
];

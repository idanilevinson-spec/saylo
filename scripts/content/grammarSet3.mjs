// Grammar set 3: C1 had 7 topics and C2 had 5. Same shape as grammarSet2.
// Hebrew is gender-neutral (plural address or impersonal), no long dash.
// All examples are original.

export const GRAMMAR_TOPICS = [
  // ---------------- C1 ----------------
  {
    slug: "passive-reporting",
    name_he: "סביל של דיווח",
    name_en: "Passive Reporting Structures",
    level: "C1",
    sort: 60,
    title_he: "It is said that... / He is believed to...",
    body_md: `בכתיבה רשמית ובחדשות מוסרים מידע בלי לומר מי אמר אותו. יש לזה שני מבנים, עם פעלים כמו say, believe, think, report, expect, consider, know.

**מבנה 1: It + is/was + צורה שלישית + that**

- **It is said that** the company will close two branches.
- **It was reported that** three people were injured.

**מבנה 2: נושא + is/was + צורה שלישית + to**

- The company **is said to be** in financial trouble.
- He **is believed to live** abroad.

**כשמדברים על העבר בתוך המשפט:** to have + צורה שלישית.

- The painting **is thought to have been** stolen in 1990.
- She **is said to have left** the country last year.

**השוו:**

- People say that he is very rich. (רגיל)
- **It is said that** he is very rich. (רשמי)
- **He is said to be** very rich. (רשמי ותמציתי)

**שימו לב:** אחרי מבנה 2 בא to, לא that: He is said **to be** rich (לא He is said that he is rich).`,
    fill: [
      ["It ___ reported that the minister will resign.", "is", "It is reported that"],
      ["The castle is believed ___ built in the 12th century.", "to have been", "עבר בתוך המשפט: to have been"],
      ["She is said ___ speak five languages.", "to", "נושא + is said + to"],
      ["It ___ expected that prices will rise next year.", "is", "It is expected that"],
      ["The suspect is thought ___ left the country.", "to have", "פעולה שכבר קרתה: to have + צורה שלישית"],
    ],
    reorder: [
      ["It", "is", "said", "that", "the", "film", "is", "excellent"],
      ["He", "is", "believed", "to", "have", "won", "the", "lottery"],
    ],
  },
  {
    slug: "future-in-the-past",
    name_he: "עתיד בתוך עבר",
    name_en: "Future in the Past",
    level: "C1",
    sort: 61,
    title_he: "I was going to call you: עתיד מנקודת מבט של עבר",
    body_md: `לפעמים מדברים על העבר, ובתוכו על משהו שעוד היה **לפניו**. במקרה כזה will הופך ל-**would**, ו-am going to הופך ל-**was going to**.

**would:** תחזית או הבטחה מנקודת מבט של עבר.

- I knew she **would** love the gift.
- He promised he **would** call, but he didn't.

**was / were going to:** תוכנית שהייתה, ולעתים קרובות לא יצאה לפועל.

- I **was going to** call you, but my phone died.
- We **were going to** move to Haifa, but we changed our minds.

**was / were about to:** משהו שעמד לקרות ממש באותו רגע.

- I **was about to** leave when the phone rang.

**was / were to:** בכתיבה וסיפור, מה שקרה בסוף, בדיעבד.

- It was a small café. Nobody knew it **was to** become the most famous restaurant in town.

**שימו לב:** אחרי כל המבנים האלה באה צורת בסיס: was going to **call**, would **love**, was about to **leave**.`,
    fill: [
      ["I ___ going to tell you, but I forgot.", "was", "תוכנית שלא יצאה לפועל"],
      ["She promised she ___ help us with the move.", "would", "will מנקודת מבט של עבר"],
      ["We were ___ to go out when it started to rain.", "about", "עמד לקרות באותו רגע"],
      ["They were going ___ buy a house, but prices went up.", "to", "was/were going to"],
      ["Nobody guessed that the young singer ___ to become a star.", "was", "was to: מה שקרה בסוף"],
    ],
    reorder: [
      ["I", "was", "about", "to", "call", "you"],
      ["He", "knew", "the", "test", "would", "be", "difficult"],
    ],
  },
  {
    slug: "advanced-relative-clauses",
    name_he: "פסוקיות זיקה מתקדמות",
    name_en: "Advanced Relative Clauses",
    level: "C1",
    sort: 62,
    title_he: "whom, whose, in which: זיקה בכתיבה רשמית",
    body_md: `מעבר ל-who, which ו-that, בכתיבה רשמית יש עוד כמה כלים.

**whom:** במקום who כשהאדם הוא המושא, בעיקר אחרי מילת יחס.

- The manager **to whom** I spoke was very helpful.
- She thanked everyone **with whom** she had worked.

**whose:** שייכות, לאנשים וגם לדברים.

- The writer **whose** book won the prize is only 25.
- It's a city **whose** history goes back 3,000 years.

**מילת יחס + which:** במקום להשאיר את מילת היחס בסוף.

- The house **in which** I grew up was sold. (רשמי)
- The house **which** I grew up **in** was sold. (פחות רשמי)

**כמות + of whom / of which:**

- I have three brothers, **two of whom** live abroad.
- She wrote ten books, **most of which** were translated.

**שימו לב:** אחרי מילת יחס לא משתמשים ב-that או ב-who: **to whom** (לא to who), **in which** (לא in that).`,
    fill: [
      ["The person ___ whom I sent the email never replied.", "to", "מילת יחס לפני whom"],
      ["That's the artist ___ paintings sold for millions.", "whose", "שייכות"],
      ["The village in ___ they live has no school.", "which", "מילת יחס + which"],
      ["He has many friends, most of ___ he met at university.", "whom", "כמות + of whom"],
      ["The reasons for ___ she left were never explained.", "which", "מילת יחס + which"],
    ],
    reorder: [
      ["The", "doctor", "with", "whom", "I", "spoke", "was", "very", "kind"],
      ["I", "read", "two", "reports", "both", "of", "which", "were", "useful"],
    ],
  },
  {
    slug: "cause-and-result-linkers",
    name_he: "מילות קישור של סיבה ותוצאה",
    name_en: "Linking Words: Cause and Result",
    level: "C1",
    sort: 63,
    title_he: "because of, owing to, consequently: סיבה ותוצאה בכתיבה",
    body_md: `כמו במילות הניגוד, גם כאן כל מילה באה עם מבנה אחר.

**סיבה + שם עצם (לא משפט שלם):**

- **because of / due to / owing to** + שם עצם
- The flight was cancelled **due to** the storm.
- **Owing to** a lack of funds, the project was stopped.

**סיבה + משפט שלם:**

- **because / since / as** + נושא + פועל
- **Since** it was late, we took a taxi.

**תוצאה, בין שני משפטים נפרדים** (באות בתחילת המשפט השני, ואחריהן פסיק):

- **Therefore / Consequently / As a result,**
- Sales fell sharply. **Consequently,** 200 workers lost their jobs.

**תוצאה, באותו משפט:** **so** + משפט.

- It was raining, **so** we stayed home.

**שימו לב:**

- לא due to the fact it was raining. נכון: **due to the fact that** it was raining (שם עצם + that).
- **therefore** לא מחבר שני משפטים עם פסיק בלבד. נכון: Prices rose; **therefore,** demand fell. או שני משפטים נפרדים.`,
    fill: [
      ["The match was postponed ___ to heavy rain.", "due", "due to + שם עצם"],
      ["___ it was a holiday, the shops were closed.", "Since", "סיבה + משפט שלם"],
      ["The company lost its biggest client. ___, it had to cut costs.", "Consequently", "תוצאה במשפט נפרד"],
      ["Owing ___ the strike, there were no trains.", "to", "owing to + שם עצם"],
      ["I was tired, ___ I went to bed early.", "so", "תוצאה באותו משפט"],
    ],
    reorder: [
      ["The", "road", "was", "closed", "because", "of", "the", "snow"],
      ["Prices", "rose", "and", "as", "a", "result", "sales", "fell"],
    ],
  },

  // ---------------- C2 ----------------
  {
    slug: "hedging",
    name_he: "הסתייגות וריכוך בכתיבה",
    name_en: "Hedging and Softening Claims",
    level: "C2",
    sort: 64,
    title_he: "It would seem that... : לטעון בזהירות",
    body_md: `בכתיבה אקדמית ומקצועית נמנעים מטענות מוחלטות כשהראיות לא מוחלטות. הריכוך הזה נקרא hedging, והוא סימן לכתיבה בוגרת ולא לחוסר ביטחון.

**פעלים מודליים:** may, might, could

- This **may** explain the drop in sales.

**פעלים מרככים:** seem, appear, suggest, tend to

- The results **suggest** that sleep affects memory.
- Young people **tend to** change jobs more often.

**מבנים עם it:**

- **It would seem that** the policy has failed.
- **It is likely / possible that** prices will rise.

**תארים ותארי פועל:** arguably, apparently, probably, to some extent, in most cases

- This is **arguably** the best novel of the decade.
- The plan worked **to some extent**.

**השוו:**

- Social media causes loneliness. (מוחלט, וקשה להוכיח)
- Social media **may contribute to** loneliness **in some cases**. (מדויק יותר)

**שימו לב:** לא לרכך כל משפט. עובדה ידועה נאמרת בפשטות: Water boils at 100°C.`,
    fill: [
      ["The data ___ that the treatment is effective, but more research is needed.", "suggests", "פועל מרכך"],
      ["It would ___ that the meeting has been cancelled.", "seem", "It would seem that"],
      ["This is ___ the most important discovery of the century.", "arguably", "תואר פועל מרכך"],
      ["Older drivers ___ to drive more carefully.", "tend", "tend to"],
      ["It is ___ that the company will announce layoffs.", "likely", "It is likely that"],
    ],
    reorder: [
      ["These", "findings", "may", "help", "explain", "the", "trend"],
      ["It", "would", "seem", "that", "the", "plan", "has", "failed"],
    ],
  },
  {
    slug: "conditionals-without-if",
    name_he: "תנאי בלי if",
    name_en: "Conditionals without If",
    level: "C2",
    sort: 65,
    title_he: "Were I, Had she, Should you: תנאי בהיפוך",
    body_md: `בכתיבה רשמית אפשר להשמיט את if ולהקדים את פועל העזר לפני הנושא. המשמעות לא משתנה.

**תנאי שני (were):**

- If I were in your position... → **Were I** in your position, I would accept.

**תנאי שלישי (had):**

- If she had known... → **Had she** known, she would have helped.

**תנאי ראשון רשמי (should):**

- If you have any questions... → **Should you** have any questions, please contact us.

**שלילה:** not בא אחרי הנושא, ולא מתקצרים.

- **Had we not** left early, we would have missed the train. (לא Hadn't we)

**חלופות ל-if:** provided (that), as long as, unless, in case, supposing

- You can borrow the car **provided that** you return it by six.
- **Unless** it rains, we'll eat outside. (= if it doesn't rain)

**שימו לב:** ההיפוך עובד רק עם were, had ו-should. לא Did you know..., would... בתור תנאי.`,
    fill: [
      ["___ I known about the problem, I would have told you.", "Had", "תנאי שלישי בהיפוך"],
      ["___ you need any help, do not hesitate to call.", "Should", "תנאי ראשון רשמי"],
      ["___ she the manager, she would change the rules.", "Were", "תנאי שני בהיפוך"],
      ["Had we ___ booked in advance, there would have been no tickets.", "not", "שלילה אחרי הנושא"],
      ["You can join the trip ___ that you bring your own equipment.", "provided", "provided that"],
    ],
    reorder: [
      ["Should", "you", "change", "your", "mind", "let", "us", "know"],
      ["Had", "I", "known", "I", "would", "have", "come", "earlier"],
    ],
  },
  {
    slug: "dependent-prepositions",
    name_he: "מילות יחס קבועות",
    name_en: "Dependent Prepositions",
    level: "C2",
    sort: 66,
    title_he: "interested in, dependent on: מילת היחס שבאה עם המילה",
    body_md: `הרבה פעלים, שמות תואר ושמות עצם באים עם מילת יחס קבועה. אין חוק שמסביר אותה, ולכן לומדים אותן יחד עם המילה. כאן בעיקר אלה שבהן דוברי עברית טועים, כי בעברית מילת היחס שונה.

**פעלים:**

- depend **on** (תלוי ב-, לא depend of)
- consist **of** (מורכב מ-)
- insist **on** (מתעקש על)
- object **to** + ing (מתנגד ל-): I object **to being** treated like this.
- succeed **in** + ing (מצליח ל-): She succeeded **in finding** a job.

**שמות תואר:**

- responsible **for** (אחראי על, לא on)
- aware **of** (מודע ל-)
- capable **of** (מסוגל ל-)
- keen **on** (מתלהב מ-)

**שמות עצם:**

- an increase **in** prices (עלייה ב-)
- a solution **to** the problem (פתרון ל-, לא for)
- a reason **for** the delay
- an advantage **of** / **over**

**שימו לב:** אחרי מילת יחס תמיד בא ing: interested in **learning**, capable of **doing**.`,
    fill: [
      ["The final decision depends ___ the budget.", "on", "depend on"],
      ["Who is responsible ___ this mistake?", "for", "responsible for"],
      ["We need a solution ___ the parking problem.", "to", "a solution to"],
      ["She succeeded ___ convincing the board.", "in", "succeed in + ing"],
      ["The team consists ___ eight engineers.", "of", "consist of"],
    ],
    reorder: [
      ["There", "has", "been", "a", "sharp", "increase", "in", "prices"],
      ["They", "insisted", "on", "paying", "for", "dinner"],
    ],
  },
  {
    slug: "discourse-markers",
    name_he: "סמני שיח בכתיבה רשמית",
    name_en: "Discourse Markers in Formal Writing",
    level: "C2",
    sort: 67,
    title_he: "Moreover, nevertheless, that said: לחבר טיעון",
    body_md: `סמני שיח מראים לקורא איך משפט קשור למשפט הקודם: מוסיף, מנגיד, מסכם או מדגים. בכתיבה טובה הם מדויקים ולא מופיעים בכל משפט.

**הוספה:** Moreover, Furthermore, In addition, What is more

- The plan is expensive. **Moreover,** it would take years.

**ניגוד:** However, Nevertheless, That said, On the other hand

- The results were promising. **That said,** the sample was small.
- **Nevertheless** מתאים כשהמסקנה נשארת למרות הקושי: It was risky. **Nevertheless,** they went ahead.

**הדגמה:** For instance, For example, To illustrate

**חיזוק וחידוד:** Indeed, In fact, In other words

- The policy failed. **Indeed,** unemployment rose.

**סיכום:** In short, Overall, To sum up, All in all

**שימו לב:**

- **On the other hand** בא אחרי טיעון בצד אחד (גם אם לא כתבו On the one hand).
- **Besides** פחות רשמי מ-Moreover.
- אחרי סמן שיח בתחילת משפט בא פסיק.`,
    fill: [
      ["The hotel was expensive. ___, the service was poor.", "Moreover", "הוספה"],
      ["The data looks convincing. That ___, the study was very small.", "said", "That said: ניגוד מרוכך"],
      ["It was a huge risk. ___, they decided to invest.", "Nevertheless", "המסקנה נשארת למרות הקושי"],
      ["The project was late and over budget. In ___, it was a failure.", "short", "סיכום"],
      ["Some cities have cut car use. ___ instance, Oslo banned cars from its centre.", "For", "הדגמה"],
    ],
    reorder: [
      ["The", "results", "were", "positive", "however", "the", "sample", "was", "small"],
      ["In", "other", "words", "the", "plan", "did", "not", "work"],
    ],
  },
];

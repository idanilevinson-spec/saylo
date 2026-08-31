-- Completes grammar coverage from "A1-B1" to a real A1->C2 progression,
-- matching the app's own marketing claim for the first time: 14 new
-- topics (7 at B2, 4 at C1, 3 at C2), each with a full lesson (same
-- depth/format as every prior batch) and 4 practice exercises (3
-- fill_blank + 1 reorder). Run this AFTER seed 008 has been applied.
-- Safe to re-run: topics/lessons are upserted by slug; exercises for
-- these topics are cleared and reinserted.

insert into public.grammar_topics (slug, name_he, name_en, cefr_level, sort_order) values
  ('second-conditional', 'משפט תנאי שני', 'Second Conditional', 'B2', 16),
  ('passive-voice', 'סביל', 'Passive Voice', 'B2', 17),
  ('reported-speech', 'דיבור עקיף', 'Reported Speech', 'B2', 18),
  ('relative-clauses', 'פסוקיות זיקה', 'Relative Clauses', 'B2', 19),
  ('modals-of-deduction', 'מודלים להסקת מסקנות', 'Modals of Deduction', 'B2', 20),
  ('past-perfect', 'עבר מושלם', 'Past Perfect', 'B2', 21),
  ('used-to-would', 'הרגלים בעבר', 'used to / would', 'B2', 22),
  ('third-conditional', 'משפט תנאי שלישי', 'Third Conditional', 'C1', 23),
  ('inversion', 'היפוך סדר מילים להדגשה', 'Inversion', 'C1', 24),
  ('cleft-sentences', 'משפטי הדגשה', 'Cleft Sentences', 'C1', 25),
  ('advanced-modals-past', 'מודלים מתקדמים בעבר', 'Advanced Past Modals', 'C1', 26),
  ('mixed-conditionals', 'תנאי מעורב', 'Mixed Conditionals', 'C2', 27),
  ('subjunctive', 'מצב משאלה/ציווי', 'The Subjunctive Mood', 'C2', 28),
  ('gerunds-infinitives-meaning', 'gerund או infinitive — שינוי משמעות', 'Gerunds vs Infinitives: Meaning Changes', 'C2', 29)
on conflict (slug) do update set
  name_he = excluded.name_he,
  name_en = excluded.name_en,
  cefr_level = excluded.cefr_level,
  sort_order = excluded.sort_order;

delete from public.grammar_lessons
where grammar_topic_id in (select id from public.grammar_topics where slug in
  ('second-conditional', 'passive-voice', 'reported-speech', 'relative-clauses',
   'modals-of-deduction', 'past-perfect', 'used-to-would',
   'third-conditional', 'inversion', 'cleft-sentences', 'advanced-modals-past',
   'mixed-conditionals', 'subjunctive', 'gerunds-infinitives-meaning'));

insert into public.grammar_lessons (grammar_topic_id, title_he, body_md, cefr_level, sort_order)
select gt.id, l.title_he, l.body_md, l.lvl::cefr_level, 1
from public.grammar_topics gt
join (values

  ('second-conditional', 'משפט תנאי שני — Second Conditional', 'B2',
$$משתמשים במשפט תנאי שני לתיאור מצבים **היפותטיים או לא ריאליים** בהווה או בעתיד — דברים שלא סביר שיקרו, או שלא נכונים עכשיו.

**מבנה:** If + עבר פשוט, ... **would** + צורת בסיס

- If I **had** more money, I **would travel** the world.
- If she **studied** harder, she **would pass** the exam.

**שימו לב ל-were:** ברישום פורמלי, עם I/he/she/it משתמשים ב-**were** ולא was: If I **were** you, I would apologize. (בשפה יומיומית "was" גם נשמע, אבל "were" נחשב לנכון יותר)

**ההבדל מתנאי ראשון:** תנאי ראשון (If it rains, I will stay home) הוא לדבר ריאלי וסביר. תנאי שני הוא להיפותטי, לא סביר, או פשוט לא נכון עכשיו: If I **won** the lottery, I **would buy** a house. (לא באמת קורה)

**דוגמאות נוספות:**

- If he had more time, he would learn a new language.
- What would you do if you saw a ghost?
- I wouldn't worry about it if I were you.$$),

  ('passive-voice', 'סביל — Passive Voice', 'B2',
$$משתמשים בסביל כשהדגש הוא על **הפעולה או האובייקט**, ולא על מי ביצע אותה — או כשלא ידוע/לא חשוב מי עשה זאת.

**מבנה:** נושא (מה שהיה האובייקט) + **be** (בזמן המתאים) + **צורה שלישית** (+ by + מבצע הפעולה, אופציונלי)

- פעיל: The chef **cooked** the meal.
- סביל: The meal **was cooked** (by the chef).

**הסביל בזמנים שונים:**

| זמן | דוגמה |
|---|---|
| הווה פשוט | The house **is cleaned** every week. |
| עבר פשוט | The house **was cleaned** yesterday. |
| הווה מושלם | The house **has been cleaned**. |
| עתיד | The house **will be cleaned** tomorrow. |

**מתי משתמשים בסביל:**

- כשמבצע הפעולה לא ידוע: My car was stolen.
- כשזה לא חשוב מי עשה: English is spoken here.
- בכתיבה מדעית/רשמית, בכותרות חדשות: The bridge was built in 1990.$$),

  ('reported-speech', 'דיבור עקיף — Reported Speech', 'B2',
$$משתמשים בדיבור עקיף כדי לדווח מה מישהו אמר, בלי לצטט אותו ישירות במרכאות.

**הזזת זמנים (backshift)** — כשהפועל המדווח (said, told) הוא בעבר, הזמן בתוך המשפט המדווח "זז" אחורה:

| ישיר | עקיף |
|---|---|
| "I **am** tired." | She said she **was** tired. |
| "I **will** call you." | He said he **would** call me. |
| "I **can** help." | She said she **could** help. |
| "I **have finished**." | He said he **had finished**. |

**שינויי זמן ומקום:** today → that day, tomorrow → the next day, here → there, this → that.

**שאלות בדיבור עקיף:** סדר המילים הופך למשפט חיובי, בלי do/does/did:

- "Where do you live?" → He asked where I **lived**.
- "Are you coming?" → She asked if/whether I **was coming**. (if/whether לשאלות כן/לא)

**דוגמה מלאה:** "I don't like coffee," she said. → She said (that) she didn't like coffee.$$),

  ('relative-clauses', 'פסוקיות זיקה — Relative Clauses', 'B2',
$$פסוקית זיקה נותנת מידע נוסף על שם עצם, בלי לפתוח משפט חדש.

**מילות הזיקה העיקריות:**

- **who** — לאנשים (כנושא): The man **who called** is my uncle.
- **which** — לדברים: The book **which I read** was great.
- **that** — לאנשים או דברים (לא רשמי, נפוץ מאוד): The car **that broke down** is mine.
- **whose** — שייכות: The woman **whose car broke down** called a mechanic.
- **where** — למקומות: The city **where I was born** is beautiful.

**דוגמאות נוספות:**

- She is the teacher who taught me English.
- This is the house where I grew up.
- I have a friend whose sister is a doctor.

**הערה:** אפשר להשמיט את מילת הזיקה כשהיא לא הנושא של הפסוקית: The book (which/that) I read was great. — אבל לא כשהיא כן הנושא: The man who called (אי אפשר להשמיט את who).$$),

  ('modals-of-deduction', 'מודלים להסקת מסקנות — Modals of Deduction', 'B2',
$$משתמשים במודלים האלה כדי להביע כמה בטוחים אנחנו במשהו, על סמך היגיון או ראיות.

**must** — ודאות חזקה, מסקנה הגיונית: She **must** be tired — she worked all day.

**might / could / may** — אפשרות, לא בטוחים: He **might** be at home. She **could** be right.

**can't** — ודאות חזקה ש**לא** נכון: That **can't** be true — I just saw her yesterday.

**מבנה:**

- להווה: מודל + צורת בסיס — He must be tired.
- לעבר: מודל + **have** + צורה שלישית — He **must have left** already. She **can't have known** about it.

**דוגמאות נוספות:**

- They aren't answering — they must be asleep.
- She might have forgotten about the meeting.
- He can't have finished already, it's only been five minutes.$$),

  ('past-perfect', 'עבר מושלם — Past Perfect', 'B2',
$$משתמשים בעבר מושלם לתיאור פעולה שקרתה **לפני** פעולה אחרת בעבר — "העבר של העבר".

**מבנה:** **had** + צורה שלישית

- When I arrived, she **had** already **left**. (היא עזבה לפני שהגעתי)
- I **had** never **seen** snow before that trip.

**ההבדל מעבר פשוט:** כשיש שתי פעולות בעבר, העבר המושלם הוא הפעולה **המוקדמת** יותר:

- By the time we got to the cinema, the film **had started**. (הסרט התחיל לפני שהגענו)

**מילים נפוצות:** before, after, when, by the time, already, just, never.

**דוגמאות נוספות:**

- She had finished her homework before dinner.
- I realized I had forgotten my keys.
- He was tired because he had worked all night.$$),

  ('used-to-would', 'הרגלים בעבר — used to / would', 'B2',
$$**used to** + צורת בסיס — הרגלים או מצבים בעבר שכבר לא נכונים היום:

- I **used to live** in Tel Aviv. (עכשיו אני לא גר שם)
- She **used to smoke**, but she quit.

**would** + צורת בסיס — הרגלים או פעולות חוזרות בעבר בלבד (לא למצבים):

- When I was young, I **would visit** my grandmother every summer.
- **שימו לב:** לא ניתן להגיד "I would live in Tel Aviv" למצב — would עובד רק לפעולות חוזרות, לא למצבים כמו live, have, know, be.

**שלילה ושאלה עם used to:**

- Did you **use to** play football? (בשאלה — use בלי -d)
- I **didn't use to** like vegetables.

**דוגמאות נוספות:**

- We used to go camping every summer.
- He would always bring flowers when he visited.$$),

  ('third-conditional', 'משפט תנאי שלישי — Third Conditional', 'C1',
$$משתמשים במשפט תנאי שלישי לתיאור מצבים היפותטיים **בעבר** שלא קרו, והתוצאה המדומיינת שלהם — לרוב מבטא חרטה או הרהור על העבר.

**מבנה:** If + **past perfect**, ... **would have** + צורה שלישית

- If I **had studied** harder, I **would have passed** the exam. (לא למדתי, לא עברתי)
- If she **had left** earlier, she **wouldn't have missed** the train.

**דוגמאות נוספות:**

- If we had known about the traffic, we would have left earlier.
- I would have called you if I had had your number.
- If he hadn't been so tired, he would have noticed the mistake.

**שימו לב:** אפשר גם להשתמש ב-could have / might have במקום would have, לשינוי גוון המשמעות: If I had trained harder, I **could have won**. (יכולתי לנצח, לא בטוח)$$),

  ('inversion', 'היפוך סדר מילים להדגשה — Inversion', 'C1',
$$בשפה רשמית או ספרותית, אפשר להפוך את סדר הנושא ופועל העזר כדי ליצור הדגשה — כשמתחילים משפט בפועל שלילה.

**מבנה:** מילת שלילה בתחילת המשפט + פועל עזר + נושא + פועל

- **Never have I seen** such a beautiful sunset.
- **Rarely does she complain** about her job.
- **Not only did he arrive late**, but he also forgot the documents.
- **Hardly had I sat down** when the phone rang.

**מילים נפוצות שמפעילות היפוך:** never, rarely, seldom, not only, no sooner, hardly, little.

**השוואה לסדר רגיל:**

- רגיל: I have never seen such a beautiful sunset.
- הדגשה: **Never have I seen** such a beautiful sunset.

**הערה:** זהו מבנה רשמי מאוד — נפוץ בכתיבה ספרותית ורטורית, פחות בשיחה יומיומית.$$),

  ('cleft-sentences', 'משפטי הדגשה — Cleft Sentences', 'C1',
$$משתמשים במשפטי הדגשה (cleft sentences) כדי להדגיש חלק ספציפי במשפט.

**It-cleft:** **It was/is** + החלק המודגש + **who/that** + שאר המשפט

- **It was John who** broke the window. (מדגישים שזה היה John, לא מישהו אחר)
- **It is money that** motivates him.

**What-cleft:** **What** + נושא + פועל + **is/was** + החלק המודגש

- **What I need is** a vacation. (מדגישים "a vacation")
- **What surprised me was** her honesty.

**דוגמאות נוספות:**

- It was in 2019 that they got married.
- What she really wants is more free time.
- It wasn't the price that bothered me, it was the quality.

**שימוש:** מבנה נפוץ בדיבור ובכתיבה כדי לכוון תשומת לב לחלק מסוים במידע, בלי צורך בהטעמה קולית בלבד.$$),

  ('advanced-modals-past', 'מודלים מתקדמים בעבר — should have, needn''t have, could have', 'C1',
$$מודלים אלה מתארים ביקורת, חרטה, או אפשרות שלא מומשה — הכל **בעבר**.

**should have** + צורה שלישית — ביקורת/חרטה על משהו שלא נעשה: You **should have called** me. (לא התקשרת, וזו טעות)

**shouldn't have** — עשית משהו שגוי: You **shouldn't have said** that. (אמרת, וזו הייתה טעות)

**needn't have** + צורה שלישית — עשית משהו שלא היה צריך (אבל עשית): You **needn't have brought** food, we had enough. (הבאת, אבל זה היה מיותר)

**could have** + צורה שלישית — היה אפשרי אבל לא קרה: I **could have helped** you, but you didn't ask.

**דוגמאות נוספות:**

- She shouldn't have quit her job so quickly.
- You needn't have worried, everything was fine.
- We could have taken a taxi, but we decided to walk.

**הבדל מרכזי:** didn't need to = לא היה צריך (ולא עשית); needn't have = עשית, אבל זה היה מיותר.$$),

  ('mixed-conditionals', 'תנאי מעורב — Mixed Conditionals', 'C2',
$$תנאי מעורב משלב **התייחסויות זמן שונות** — תנאי מזמן אחד ותוצאה מזמן אחר.

**עבר → הווה:** If + **past perfect**, ... **would** + צורת בסיס — תנאי בעבר, תוצאה בהווה:

- If I **had taken** that job, I **would be** rich now. (לא לקחתי את העבודה בעבר, ולכן אני לא עשיר עכשיו)

**הווה → עבר:** If + **past simple**, ... **would have** + צורה שלישית — מצב קבוע בהווה, תוצאה בעבר:

- If she **weren't** so shy, she **would have spoken up** at the meeting. (היא ביישנית באופן כללי — תכונה קבועה — ולכן לא דיברה באותה פגישה בעבר)

**דוגמאות נוספות:**

- If he were more organized, he wouldn't have missed the deadline.
- If we had moved to London, we would speak better English now.

**שימו לב:** זה לא מבנה נפרד עם כללים חדשים — זה פשוט שילוב הגיוני של תנאי שני ושלישי, לפי ההקשר הזמני האמיתי.$$),

  ('subjunctive', 'מצב משאלה/ציווי — The Subjunctive Mood', 'C2',
$$המצב הסובחונקטיבי (subjunctive) משמש אחרי פעלים וביטויים מסוימים של הצעה, דרישה, או חשיבות — הפועל נשאר **בצורת הבסיס**, גם עם he/she/it.

**דוגמאות:**

- I suggest that he **arrive** early. (לא "arrives")
- It's essential that she **be** there. (לא "is")
- The doctor recommended that he **stop** smoking.

**פעלים/ביטויים נפוצים שמפעילים סובחונקטיב:** suggest, recommend, demand, insist, require, it's important/essential/vital that.

**בביטויים קבועים:**

- **If I were you**, I would think twice. (לא "was")
- **I wish I were** taller. (משאלה על משהו לא נכון)

**דוגמאות נוספות:**

- She insisted that he pay for the damage.
- It's important that everyone be on time.
- If only she were here to see this.

**הערה:** זהו מבנה רשמי יחסית — בדיבור יומיומי לפעמים שומעים "he arrives" גם אחרי suggest, אבל בכתיבה רשמית ובמבחנים משתמשים בצורת הבסיס.$$),

  ('gerunds-infinitives-meaning', 'פועל + gerund או infinitive — כשהמשמעות משתנה', 'C2',
$$חלק מהפעלים משנים משמעות לגמרי בהתאם לכך שאחריהם בא **-ing** (gerund) או **to + פועל** (infinitive).

**remember:**

- remember + **-ing** = זוכרים שעשינו משהו (זיכרון מהעבר): I remember **locking** the door. (אני זוכר שנעלתי)
- remember + **to** = לא לשכוח לעשות משהו (לעתיד): **Remember to lock** the door! (אל תשכח לנעול)

**stop:**

- stop + **-ing** = מפסיקים לעשות משהו: He stopped **smoking**. (הפסיק לעשן)
- stop + **to** = עוצרים כדי לעשות משהו אחר: He stopped **to smoke**. (עצר כדי לעשן)

**try:**

- try + **-ing** = מנסים שיטה, כניסוי: **Try turning** it off and on again.
- try + **to** = מנסים לעשות משהו קשה, מאמץ: **Try to finish** on time.

**forget:** אותו הגיון כמו remember — forget + -ing (לשכוח שעשינו) לעומת forget + to (לשכוח לעשות).

**דוגמאות נוספות:**

- I'll never forget meeting her for the first time.
- Don't forget to bring your passport.
- We stopped to ask for directions.$$)

) as l(topic_slug, title_he, lvl, body_md)
  on gt.slug = l.topic_slug;

-- ============ EXERCISES (3 fill-blank + 1 reorder per topic) ============

delete from public.exercises
where grammar_topic_id in (select id from public.grammar_topics where slug in
  ('second-conditional', 'passive-voice', 'reported-speech', 'relative-clauses',
   'modals-of-deduction', 'past-perfect', 'used-to-would',
   'third-conditional', 'inversion', 'cleft-sentences', 'advanced-modals-past',
   'mixed-conditionals', 'subjunctive', 'gerunds-infinitives-meaning'));

insert into public.exercises (type, skill_area, grammar_topic_id, cefr_level, content, sort_order)
select 'fill_blank'::exercise_type, 'grammar'::skill_area, gt.id, gen.lvl::cefr_level, gen.content::jsonb, gen.sort_order
from public.grammar_topics gt
join (values
  ('second-conditional', '{"sentence":"If I had more time, I ___ learn Spanish.","correctAnswer":"would","hint":"result clause, hypothetical"}', 1, 'B2'),
  ('second-conditional', '{"sentence":"If I ___ you, I would apologize.","correctAnswer":"were","hint":"formal subjunctive-style if-clause"}', 2, 'B2'),
  ('second-conditional', '{"sentence":"What would you do if you ___ a ghost?","correctAnswer":"saw","hint":"if-clause, past simple"}', 3, 'B2'),

  ('passive-voice', '{"sentence":"The meal ___ cooked by the chef.","correctAnswer":"was","hint":"past simple passive"}', 1, 'B2'),
  ('passive-voice', '{"sentence":"English ___ spoken in many countries.","correctAnswer":"is","hint":"present simple passive"}', 2, 'B2'),
  ('passive-voice', '{"sentence":"My car ___ stolen last night.","correctAnswer":"was","hint":"past simple passive"}', 3, 'B2'),

  ('reported-speech', '{"sentence":"She said she ___ tired.","correctAnswer":"was","hint":"backshift from am"}', 1, 'B2'),
  ('reported-speech', '{"sentence":"He said he ___ call me.","correctAnswer":"would","hint":"backshift from will"}', 2, 'B2'),
  ('reported-speech', '{"sentence":"She asked if I ___ coming.","correctAnswer":"was","hint":"reported yes/no question"}', 3, 'B2'),

  ('relative-clauses', '{"sentence":"The man ___ called is my uncle.","correctAnswer":"who","hint":"relative pronoun for people"}', 1, 'B2'),
  ('relative-clauses', '{"sentence":"This is the house ___ I grew up.","correctAnswer":"where","hint":"relative pronoun for places"}', 2, 'B2'),
  ('relative-clauses', '{"sentence":"I have a friend ___ sister is a doctor.","correctAnswer":"whose","hint":"possessive relative pronoun"}', 3, 'B2'),

  ('modals-of-deduction', '{"sentence":"She ___ be tired — she worked all day.","correctAnswer":"must","hint":"strong certainty"}', 1, 'B2'),
  ('modals-of-deduction', '{"sentence":"That ___ be true — I just saw her yesterday.","correctAnswer":"can''t","hint":"strong certainty something is false"}', 2, 'B2'),
  ('modals-of-deduction', '{"sentence":"He ___ have forgotten about the meeting.","correctAnswer":"might","hint":"possibility, past"}', 3, 'B2'),

  ('past-perfect', '{"sentence":"When I arrived, she ___ already left.","correctAnswer":"had","hint":"past perfect, earlier action"}', 1, 'B2'),
  ('past-perfect', '{"sentence":"I realized I ___ forgotten my keys.","correctAnswer":"had","hint":"past perfect"}', 2, 'B2'),
  ('past-perfect', '{"sentence":"He was tired because he ___ worked all night.","correctAnswer":"had","hint":"past perfect, reason"}', 3, 'B2'),

  ('used-to-would', '{"sentence":"I ___ live in Tel Aviv, but I moved.","correctAnswer":"used to","hint":"past state, no longer true"}', 1, 'B2'),
  ('used-to-would', '{"sentence":"When I was young, I ___ visit my grandmother every summer.","correctAnswer":"would","hint":"repeated past action"}', 2, 'B2'),
  ('used-to-would', '{"sentence":"___ you use to play football?","correctAnswer":"Did","hint":"question form with used to"}', 3, 'B2'),

  ('third-conditional', '{"sentence":"If I had studied harder, I ___ have passed the exam.","correctAnswer":"would","hint":"third conditional result"}', 1, 'C1'),
  ('third-conditional', '{"sentence":"If she had left earlier, she wouldn''t ___ missed the train.","correctAnswer":"have","hint":"would + have + past participle"}', 2, 'C1'),
  ('third-conditional', '{"sentence":"If we had known, we ___ have left earlier.","correctAnswer":"would","hint":"third conditional result"}', 3, 'C1'),

  ('inversion', '{"sentence":"Never ___ I seen such a beautiful sunset.","correctAnswer":"have","hint":"inversion after Never"}', 1, 'C1'),
  ('inversion', '{"sentence":"Rarely ___ she complain about her job.","correctAnswer":"does","hint":"inversion after Rarely"}', 2, 'C1'),
  ('inversion', '{"sentence":"Not only ___ he arrive late, but he also forgot the documents.","correctAnswer":"did","hint":"inversion after Not only"}', 3, 'C1'),

  ('cleft-sentences', '{"sentence":"It was John ___ broke the window.","correctAnswer":"who","hint":"it-cleft sentence"}', 1, 'C1'),
  ('cleft-sentences', '{"sentence":"What I need ___ a vacation.","correctAnswer":"is","hint":"what-cleft sentence"}', 2, 'C1'),
  ('cleft-sentences', '{"sentence":"It ___ in 2019 that they got married.","correctAnswer":"was","hint":"it-cleft sentence, past"}', 3, 'C1'),

  ('advanced-modals-past', '{"sentence":"You ___ have called me — I was worried.","correctAnswer":"should","hint":"criticism about the past"}', 1, 'C1'),
  ('advanced-modals-past', '{"sentence":"You ___ have brought food, we had enough.","correctAnswer":"needn''t","hint":"unnecessary action that happened"}', 2, 'C1'),
  ('advanced-modals-past', '{"sentence":"We ___ have taken a taxi, but we decided to walk.","correctAnswer":"could","hint":"possible but didn''t happen"}', 3, 'C1'),

  ('mixed-conditionals', '{"sentence":"If I had taken that job, I ___ be rich now.","correctAnswer":"would","hint":"past condition, present result"}', 1, 'C2'),
  ('mixed-conditionals', '{"sentence":"If she weren''t so shy, she would ___ spoken up at the meeting.","correctAnswer":"have","hint":"present state, past result"}', 2, 'C2'),
  ('mixed-conditionals', '{"sentence":"If he were more organized, he wouldn''t have ___ the deadline.","correctAnswer":"missed","hint":"present state, past result"}', 3, 'C2'),

  ('subjunctive', '{"sentence":"I suggest that he ___ early.","correctAnswer":"arrive","hint":"subjunctive, base form"}', 1, 'C2'),
  ('subjunctive', '{"sentence":"It''s essential that she ___ there.","correctAnswer":"be","hint":"subjunctive, base form of be"}', 2, 'C2'),
  ('subjunctive', '{"sentence":"If I ___ you, I would think twice.","correctAnswer":"were","hint":"subjunctive in fixed expression"}', 3, 'C2'),

  ('gerunds-infinitives-meaning', '{"sentence":"I remember ___ the door.","correctAnswer":"locking","hint":"remember + -ing, past memory"}', 1, 'C2'),
  ('gerunds-infinitives-meaning', '{"sentence":"Remember ___ your passport.","correctAnswer":"to bring","hint":"remember + to, future reminder"}', 2, 'C2'),
  ('gerunds-infinitives-meaning', '{"sentence":"He stopped ___ for directions.","correctAnswer":"to ask","hint":"stop + to, purpose"}', 3, 'C2')
) as gen(topic_slug, content, sort_order, lvl)
  on gt.slug = gen.topic_slug;

insert into public.exercises (type, skill_area, grammar_topic_id, cefr_level, content, sort_order)
select 'reorder'::exercise_type, 'grammar'::skill_area, gt.id, gen.lvl::cefr_level, gen.content::jsonb, 100
from public.grammar_topics gt
join (values
  ('second-conditional', '{"tokens":["If","I","were","you","I","would","apologize"],"correctOrder":[0,1,2,3,4,5,6]}', 'B2'),
  ('passive-voice', '{"tokens":["The","meal","was","cooked","by","the","chef"],"correctOrder":[0,1,2,3,4,5,6]}', 'B2'),
  ('reported-speech', '{"tokens":["She","said","she","was","tired"],"correctOrder":[0,1,2,3,4]}', 'B2'),
  ('relative-clauses', '{"tokens":["The","man","who","called","is","my","uncle"],"correctOrder":[0,1,2,3,4,5,6]}', 'B2'),
  ('modals-of-deduction', '{"tokens":["She","must","be","tired"],"correctOrder":[0,1,2,3]}', 'B2'),
  ('past-perfect', '{"tokens":["She","had","already","left"],"correctOrder":[0,1,2,3]}', 'B2'),
  ('used-to-would', '{"tokens":["I","used","to","live","in","Tel","Aviv"],"correctOrder":[0,1,2,3,4,5,6]}', 'B2'),
  ('third-conditional', '{"tokens":["I","would","have","passed","the","exam"],"correctOrder":[0,1,2,3,4,5]}', 'C1'),
  ('inversion', '{"tokens":["Never","have","I","seen","such","a","sunset"],"correctOrder":[0,1,2,3,4,5,6]}', 'C1'),
  ('cleft-sentences', '{"tokens":["It","was","John","who","broke","the","window"],"correctOrder":[0,1,2,3,4,5,6]}', 'C1'),
  ('advanced-modals-past', '{"tokens":["You","should","have","called","me"],"correctOrder":[0,1,2,3,4]}', 'C1'),
  ('mixed-conditionals', '{"tokens":["I","would","be","rich","now"],"correctOrder":[0,1,2,3,4]}', 'C2'),
  ('subjunctive', '{"tokens":["I","suggest","that","he","arrive","early"],"correctOrder":[0,1,2,3,4,5]}', 'C2'),
  ('gerunds-infinitives-meaning', '{"tokens":["Remember","to","lock","the","door"],"correctOrder":[0,1,2,3,4]}', 'C2')
) as gen(topic_slug, content, lvl)
  on gt.slug = gen.topic_slug;

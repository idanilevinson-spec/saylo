-- Expands grammar coverage from "5 topics, all A1" to a real A1->A2->B1
-- progression: 10 new topics (7 at A2, 3 at B1), each with a full lesson
-- (matching the depth/format of the existing A1 lessons) and 4 practice
-- exercises (3 fill_blank + 1 reorder, matching the established density
-- from seed 003). Run this AFTER seed 001-003 have been applied.
-- Safe to re-run: topics/lessons are upserted by slug; exercises for
-- these topics are cleared and reinserted.

insert into public.grammar_topics (slug, name_he, name_en, cefr_level, sort_order) values
  ('past-simple', 'עבר פשוט', 'Past Simple', 'A2', 6),
  ('present-continuous', 'הווה מתמשך', 'Present Continuous', 'A2', 7),
  ('comparatives-superlatives', 'השוואה', 'Comparatives and Superlatives', 'A2', 8),
  ('countable-uncountable', 'שמות עצם ספירים ובלתי ספירים', 'Countable and Uncountable Nouns', 'A2', 9),
  ('prepositions-time-place', 'מילות יחס של זמן ומקום', 'Prepositions of Time and Place', 'A2', 10),
  ('modals-can-must-should', 'פעלי עזר מודליים', 'Modal Verbs: can, must, should', 'A2', 11),
  ('future-going-to', 'עתיד — going to', 'Future: going to', 'A2', 12),
  ('present-perfect', 'הווה מושלם', 'Present Perfect', 'B1', 13),
  ('past-continuous', 'עבר מתמשך', 'Past Continuous', 'B1', 14),
  ('first-conditional', 'משפט תנאי ראשון', 'First Conditional', 'B1', 15)
on conflict (slug) do update set
  name_he = excluded.name_he,
  name_en = excluded.name_en,
  cefr_level = excluded.cefr_level,
  sort_order = excluded.sort_order;

delete from public.grammar_lessons
where grammar_topic_id in (select id from public.grammar_topics where slug in
  ('past-simple', 'present-continuous', 'comparatives-superlatives', 'countable-uncountable',
   'prepositions-time-place', 'modals-can-must-should', 'future-going-to',
   'present-perfect', 'past-continuous', 'first-conditional'));

insert into public.grammar_lessons (grammar_topic_id, title_he, body_md, cefr_level, sort_order)
select gt.id, l.title_he, l.body_md, l.lvl::cefr_level, 1
from public.grammar_topics gt
join (values

  ('past-simple', 'עבר פשוט — Past Simple', 'A2',
$$משתמשים בעבר פשוט לתיאור פעולות שהסתיימו לגמרי בעבר.

**פעלים רגילים:** מוסיפים **-ed** לצורת הבסיס:

- work → worked
- play → played
- study → studi**ed** (עיצור + y — הופכים ל-ied)
- stop → stop**ped** (תנועה קצרה + עיצור אחד — מכפילים את העיצור)

**פעלים לא רגילים:** אין כלל — חייבים לשנן. הנפוצים ביותר:

| בסיס | עבר | בסיס | עבר |
|---|---|---|---|
| go | went | see | saw |
| have | had | eat | ate |
| do | did | come | came |
| be | was/were | make | made |
| get | got | say | said |

**דוגמאות:**

- I worked yesterday.
- She went to the party last week.
- They didn't have time.

**שלילה:** **did not** (בקיצור didn't) + צורת בסיס — I didn't go, she didn't see.

**שאלה:** **Did** + נושא + צורת בסיס — Did you go? Did she see it?

**מילות זמן נפוצות:** yesterday, last week/month/year, ago (two days ago), in 2020.$$),

  ('present-continuous', 'הווה מתמשך — Present Continuous', 'A2',
$$משתמשים בהווה מתמשך לתיאור פעולה שקורית **ממש עכשיו**, או מצב זמני/תוכנית לעתיד הקרוב.

**מבנה:** am / is / are + פועל + **-ing**

- I **am working**
- He / She / It **is working**
- You / We / They **are working**

**כללי איות ל--ing:**

- e שקטה בסוף — מורידים אותה: make → mak**ing**
- תנועה קצרה + עיצור אחד — מכפילים את העיצור: run → run**ning**
- ie בסוף — הופך ל-y: lie → ly**ing**

**דוגמאות:**

- I am studying right now. (ממש עכשיו)
- She is working in London this year. (זמני)
- We are meeting them tomorrow. (תוכנית לעתיד קרוב)

**שלילה:** am/is/are + **not** + פועל-ing — I'm not working, she isn't studying.

**שאלה:** Am/Is/Are + נושא + פועל-ing? — Are you working? Is she studying?

**שימו לב לבלבול נפוץ:** הווה פשוט (I work) הוא להרגל קבוע; הווה מתמשך (I am working) הוא לרגע הזה או למצב זמני.$$),

  ('comparatives-superlatives', 'השוואה — Comparative and Superlative', 'A2',
$$משתמשים בהשוואה כדי להשוות בין שני דברים (comparative) או להצביע על הכי קיצוני מתוך קבוצה (superlative).

**תארים קצרים (הברה אחת):** מוסיפים **-er / -est**

- tall → tall**er** → the tall**est**
- big → bi**gger** → the bi**ggest** (תנועה קצרה + עיצור — מכפילים)
- happy → happ**ier** → the happ**iest** (עיצור + y — הופך ל-i)

**תארים ארוכים (2+ הברות):** משתמשים ב-**more / most**

- beautiful → **more** beautiful → the **most** beautiful
- expensive → **more** expensive → the **most** expensive

**צורות לא רגילות (חובה לשנן):**

| תואר | comparative | superlative |
|---|---|---|
| good | better | the best |
| bad | worse | the worst |
| far | farther / further | the farthest / furthest |

**מבנה:**

- Comparative + **than**: She is taller than him.
- Superlative + **the**: She is the tallest in the class.

**דוגמאות:**

- This book is more interesting than that one.
- He is the smartest student in school.$$),

  ('countable-uncountable', 'שמות עצם ספירים ובלתי ספירים', 'A2',
$$**שמות עצם ספירים** (countable) — אפשר לספור אותם, יש להם יחיד ורבים: an apple / two apples, a book / three books.

**שמות עצם בלתי ספירים** (uncountable) — לא ניתן לספור אותם כיחידות בודדות, ואין להם צורת רבים: water, rice, money, information, advice, furniture.

**כמתים (quantifiers) — מתי משתמשים במה:**

- **some** — במשפטים חיוביים ובהצעות: I have some water. Would you like some coffee?
- **any** — בשאלות ובשלילה: Do you have any milk? I don't have any money.
- **much** — עם בלתי ספירים, בשאלות ובשלילה: How much time do you have? I don't have much time.
- **many** — עם ספירים, בשאלות ובשלילה: How many books do you have? I don't have many friends.
- **a lot of / lots of** — עם שניהם, במשפטים חיוביים: I have a lot of homework. She has lots of friends.
- **a few** — כמות קטנה, עם ספירים: I have a few questions.
- **a little** — כמות קטנה, עם בלתי ספירים: I have a little time.

**דוגמאות:**

- There isn't much sugar left.
- How many chairs do we need?
- I'd like some information, please.$$),

  ('prepositions-time-place', 'מילות יחס של זמן ומקום — in, on, at', 'A2',
$$מילות היחס **in, on, at** משמשות גם לזמן וגם למקום, אבל בכללים שונים.

**זמן:**

- **at** — שעה מדויקת או נקודת זמן: at 5 o'clock, at night, at Christmas, at the moment
- **on** — ימים ותאריכים: on Monday, on July 5th, on my birthday
- **in** — תקופות ארוכות יותר: in 2024, in the morning, in summer, in January

**מקום:**

- **at** — נקודה ספציפית: at the bus stop, at home, at the door
- **on** — משטח: on the table, on the wall, on the second floor
- **in** — מרחב סגור: in the box, in the room, in London, in my bag

**דוגמאות:**

- I'll see you at 8 o'clock on Monday.
- The keys are on the table, in the kitchen.
- We arrived in Israel in the morning.

**טעות נפוצה:** "in the bus stop" — לא נכון! זו נקודה, אז at the bus stop.$$),

  ('modals-can-must-should', 'פעלי עזר מודליים — can, must, should', 'A2',
$$פעלי עזר מודליים באים **לפני** צורת הבסיס של הפועל, בלי **to** ובלי **-s** בגוף שלישי יחיד.

**can** — יכולת, רשות, אפשרות:

- I can swim. (יכולת)
- Can I open the window? (בקשת רשות)
- It can be difficult sometimes. (אפשרות)

**must** — חובה חזקה / הכרח:

- You must wear a seatbelt. (חובה)
- **mustn't** = אסור: You mustn't smoke here.

**should** — עצה / המלצה (לא חובה, רק הצעה):

- You should see a doctor.
- She shouldn't work so hard.

**שימו לב:** "she can swim" ולא "she cans swim" — אין -s בגוף שלישי אחרי מודל.

**שלילה:** can't, mustn't, shouldn't (בלי do/does).

**שאלה:** מזיזים את המודל להתחלת המשפט — Can you help me? Should I call her?$$),

  ('future-going-to', 'עתיד — going to', 'A2',
$$משתמשים ב-**going to** לתיאור תוכניות שהוחלטו כבר לפני רגע הדיבור, או תחזיות שמבוססות על מה שרואים עכשיו.

**מבנה:** am / is / are + **going to** + צורת בסיס

- I **am going to** visit my grandmother tomorrow. (תוכנית)
- Look at those clouds — it**'s going to** rain! (תחזית לפי מה שרואים)

**שלילה:** am/is/are + **not** + going to — I'm not going to go, she isn't going to come.

**שאלה:** Am/Is/Are + נושא + going to + פועל? — Are you going to call her? Is he going to help?

**דוגמאות נוספות:**

- We are going to move to a new house next year.
- They aren't going to finish on time.
- Is it going to be sunny tomorrow?

**הבדל מ-will:** going to משמש לתוכניות שכבר הוחלטו; will (שנלמד בהמשך) משמש להחלטות ספונטניות ותחזיות כלליות.$$),

  ('present-perfect', 'הווה מושלם — Present Perfect', 'B1',
$$הווה מושלם מקשר בין העבר להווה — פעולה שקרתה בעבר אבל חשובה או רלוונטית עכשיו.

**מבנה:** have / has + **past participle** (צורה שלישית של הפועל)

- I **have finished** my homework.
- She **has lived** here for five years.

**צורה שלישית:** אצל פעלים רגילים — זהה לעבר פשוט (-ed). אצל פעלים לא רגילים — צריך לשנן:

| בסיס | עבר | צורה שלישית |
|---|---|---|
| be | was/were | been |
| go | went | gone / been |
| see | saw | seen |
| do | did | done |
| eat | ate | eaten |

**שימושים עיקריים:**

- **חוויות** (בלי לציין מתי): I have been to Paris. Have you ever eaten sushi?
- **תוצאה בהווה:** She has lost her keys. (ועכשיו אין לה אותם)
- **since / for:** since — נקודת זמן (since 2020), for — משך זמן (for three years)

**מילות מפתח:** ever, never, just, already, yet (בסוף משפט שלילה/שאלה).

**הבדל מעבר פשוט:** עבר פשוט = זמן ספציפי וגמור (I saw that movie last week). הווה מושלם = בלי זמן ספציפי, מתחבר להווה (I have seen that movie).$$),

  ('past-continuous', 'עבר מתמשך — Past Continuous', 'B1',
$$משתמשים בעבר מתמשך לתיאור פעולה שהייתה **בעיצומה** ברגע מסוים בעבר, או כרקע לפעולה אחרת שהפריעה לה.

**מבנה:** was / were + פועל + **-ing**

- I **was watching** TV at 8 o'clock.
- They **were sleeping** when the phone rang.

**המבנה הקלאסי — פעולה שהפריעה לפעולה אחרת:**

עבר מתמשך (רקע) + **when** + עבר פשוט (הפרעה):

- I was cooking dinner when she called.
- He was driving when it started to rain.

**שתי פעולות במקביל — with while:**

- I was cooking while he was cleaning.

**שלילה:** was/were + not + פועל-ing — I wasn't watching, they weren't sleeping.

**שאלה:** Was/Were + נושא + פועל-ing? — Was she working? Were you sleeping?

**שימו לב:** לא כל הפעלים מקבלים -ing (פעלי מצב כמו know, like, want בדרך כלל לא) — נלמד על כך בהמשך.$$),

  ('first-conditional', 'משפט תנאי ראשון — First Conditional', 'B1',
$$משתמשים במשפט תנאי ראשון לתיאור מצבים **ריאליים וסבירים** בעתיד, והתוצאה שלהם.

**מבנה:** If + הווה פשוט, ... **will** + צורת בסיס

- **If it rains**, I **will stay** home.
- I **will stay** home **if it rains**. (אפשר גם הפוך, בלי פסיק)

**שימו לב:** אחרי if משתמשים בהווה פשוט, לא ב-will — "if it will rain" זו טעות נפוצה!

**אפשר גם עם מודלים אחרים במקום will:**

- If you study, you **can** pass the exam.
- If you're tired, you **should** rest.

**דוגמאות נוספות:**

- If she calls, tell her I'm busy.
- We won't go to the beach if the weather is bad.
- If you don't hurry, you will miss the bus.

**מתי משתמשים:** כשהתנאי הוא ריאלי וסביר שיקרה — לא היפותטי (משפט תנאי שני, שנלמד בהמשך, הוא להיפותטי).$$)

) as l(topic_slug, title_he, lvl, body_md)
  on gt.slug = l.topic_slug;

-- ============ EXERCISES (3 fill-blank + 1 reorder per topic) ============

delete from public.exercises
where grammar_topic_id in (select id from public.grammar_topics where slug in
  ('past-simple', 'present-continuous', 'comparatives-superlatives', 'countable-uncountable',
   'prepositions-time-place', 'modals-can-must-should', 'future-going-to',
   'present-perfect', 'past-continuous', 'first-conditional'));

insert into public.exercises (type, skill_area, grammar_topic_id, cefr_level, content, sort_order)
select 'fill_blank'::exercise_type, 'grammar'::skill_area, gt.id, gen.lvl::cefr_level, gen.content::jsonb, gen.sort_order
from public.grammar_topics gt
join (values
  ('past-simple', '{"sentence":"She ___ to the party last week.","correctAnswer":"went","hint":"irregular past of go"}', 1, 'A2'),
  ('past-simple', '{"sentence":"I ___ my homework yesterday.","correctAnswer":"didn''t finish","hint":"negative, did not + base form"}', 2, 'A2'),
  ('past-simple', '{"sentence":"___ you see that movie last night?","correctAnswer":"Did","hint":"question form"}', 3, 'A2'),

  ('present-continuous', '{"sentence":"She ___ a book right now.","correctAnswer":"is reading","hint":"is + verb-ing"}', 1, 'A2'),
  ('present-continuous', '{"sentence":"They ___ TV at the moment.","correctAnswer":"are watching","hint":"are + verb-ing"}', 2, 'A2'),
  ('present-continuous', '{"sentence":"___ you working today?","correctAnswer":"Are","hint":"question form"}', 3, 'A2'),

  ('comparatives-superlatives', '{"sentence":"This car is ___ than that one.","correctAnswer":"faster","hint":"short adjective + er"}', 1, 'A2'),
  ('comparatives-superlatives', '{"sentence":"She is the ___ student in the class.","correctAnswer":"smartest","hint":"superlative, short adjective"}', 2, 'A2'),
  ('comparatives-superlatives', '{"sentence":"This film is ___ interesting than the book.","correctAnswer":"more","hint":"long adjective, comparative"}', 3, 'A2'),

  ('countable-uncountable', '{"sentence":"How ___ money do you have?","correctAnswer":"much","hint":"uncountable noun"}', 1, 'A2'),
  ('countable-uncountable', '{"sentence":"I don''t have ___ friends here.","correctAnswer":"many","hint":"countable noun, negative"}', 2, 'A2'),
  ('countable-uncountable', '{"sentence":"Would you like ___ coffee?","correctAnswer":"some","hint":"offer"}', 3, 'A2'),

  ('prepositions-time-place', '{"sentence":"I will see you ___ Monday.","correctAnswer":"on","hint":"day of the week"}', 1, 'A2'),
  ('prepositions-time-place', '{"sentence":"The meeting is ___ 9 o''clock.","correctAnswer":"at","hint":"exact time"}', 2, 'A2'),
  ('prepositions-time-place', '{"sentence":"She was born ___ 1998.","correctAnswer":"in","hint":"year"}', 3, 'A2'),

  ('modals-can-must-should', '{"sentence":"You ___ wear a seatbelt in the car.","correctAnswer":"must","hint":"strong obligation"}', 1, 'A2'),
  ('modals-can-must-should', '{"sentence":"You look tired — you ___ rest.","correctAnswer":"should","hint":"advice"}', 2, 'A2'),
  ('modals-can-must-should', '{"sentence":"___ you swim?","correctAnswer":"Can","hint":"ability, question"}', 3, 'A2'),

  ('future-going-to', '{"sentence":"Look at the sky — it ___ rain.","correctAnswer":"is going to","hint":"prediction from evidence"}', 1, 'A2'),
  ('future-going-to', '{"sentence":"We ___ visit my parents next weekend.","correctAnswer":"are going to","hint":"plan"}', 2, 'A2'),
  ('future-going-to', '{"sentence":"___ you going to call her?","correctAnswer":"Are","hint":"question form"}', 3, 'A2'),

  ('present-perfect', '{"sentence":"I have never ___ sushi.","correctAnswer":"eaten","hint":"past participle of eat"}', 1, 'B1'),
  ('present-perfect', '{"sentence":"She has lived here ___ 2015.","correctAnswer":"since","hint":"point in time"}', 2, 'B1'),
  ('present-perfect', '{"sentence":"They ___ already finished the project.","correctAnswer":"have","hint":"present perfect"}', 3, 'B1'),

  ('past-continuous', '{"sentence":"I ___ dinner when she called.","correctAnswer":"was cooking","hint":"background action"}', 1, 'B1'),
  ('past-continuous', '{"sentence":"___ you sleeping at midnight?","correctAnswer":"Were","hint":"question form"}', 2, 'B1'),
  ('past-continuous', '{"sentence":"He was driving while she ___ on her phone.","correctAnswer":"was talking","hint":"two actions at once"}', 3, 'B1'),

  ('first-conditional', '{"sentence":"If it rains, I ___ stay home.","correctAnswer":"will","hint":"result clause"}', 1, 'B1'),
  ('first-conditional', '{"sentence":"If you ___ hard, you will pass the exam.","correctAnswer":"study","hint":"if-clause, present simple"}', 2, 'B1'),
  ('first-conditional', '{"sentence":"We won''t go out if it ___ cold.","correctAnswer":"is","hint":"if-clause, present simple"}', 3, 'B1')
) as gen(topic_slug, content, sort_order, lvl)
  on gt.slug = gen.topic_slug;

insert into public.exercises (type, skill_area, grammar_topic_id, cefr_level, content, sort_order)
select 'reorder'::exercise_type, 'grammar'::skill_area, gt.id, gen.lvl::cefr_level, gen.content::jsonb, 100
from public.grammar_topics gt
join (values
  ('past-simple', '{"tokens":["She","went","to","the","party"],"correctOrder":[0,1,2,3,4]}', 'A2'),
  ('present-continuous', '{"tokens":["They","are","watching","TV"],"correctOrder":[0,1,2,3]}', 'A2'),
  ('comparatives-superlatives', '{"tokens":["This","car","is","faster","than","that","one"],"correctOrder":[0,1,2,3,4,5,6]}', 'A2'),
  ('countable-uncountable', '{"tokens":["I","don''t","have","much","time"],"correctOrder":[0,1,2,3,4]}', 'A2'),
  ('prepositions-time-place', '{"tokens":["The","meeting","is","at","9","o''clock"],"correctOrder":[0,1,2,3,4,5]}', 'A2'),
  ('modals-can-must-should', '{"tokens":["You","must","wear","a","seatbelt"],"correctOrder":[0,1,2,3,4]}', 'A2'),
  ('future-going-to', '{"tokens":["We","are","going","to","visit","my","parents"],"correctOrder":[0,1,2,3,4,5,6]}', 'A2'),
  ('present-perfect', '{"tokens":["I","have","never","eaten","sushi"],"correctOrder":[0,1,2,3,4]}', 'B1'),
  ('past-continuous', '{"tokens":["I","was","cooking","when","she","called"],"correctOrder":[0,1,2,3,4,5]}', 'B1'),
  ('first-conditional', '{"tokens":["If","it","rains","I","will","stay","home"],"correctOrder":[0,1,2,3,4,5,6]}', 'B1')
) as gen(topic_slug, content, lvl)
  on gt.slug = gen.topic_slug;

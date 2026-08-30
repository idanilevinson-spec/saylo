-- Hand-curated A1 core content (Phase 2). Run this AFTER
-- supabase/migrations/001_content_skeleton.sql has been applied.
-- Safe to re-run: topics/grammar_topics are upserted by slug; child rows are
-- cleared and reinserted so re-running never duplicates words/lessons.

-- ============ VOCABULARY TOPICS ============

insert into public.topics (slug, name_he, name_en, cefr_level, sort_order) values
  ('numbers', 'מספרים', 'Numbers', 'A1', 1),
  ('colors', 'צבעים', 'Colors', 'A1', 2),
  ('family', 'משפחה', 'Family', 'A1', 3),
  ('food-drink', 'אוכל ושתייה', 'Food & Drink', 'A1', 4),
  ('animals', 'חיות', 'Animals', 'A1', 5),
  ('greetings', 'ברכות ושיחת חולין', 'Greetings & Small Talk', 'A1', 6)
on conflict (slug) do update set
  name_he = excluded.name_he,
  name_en = excluded.name_en,
  cefr_level = excluded.cefr_level,
  sort_order = excluded.sort_order;

delete from public.vocabulary_items
where topic_id in (select id from public.topics where slug in
  ('numbers', 'colors', 'family', 'food-drink', 'animals', 'greetings'));

insert into public.vocabulary_items (topic_id, headword, ipa, part_of_speech, translation_he, example_en, cefr_level, sort_order)
select t.id, v.headword, v.ipa, v.part_of_speech, v.translation_he, v.example_en, 'A1', v.sort_order
from public.topics t
join (values
  ('numbers', 'one', '/wʌn/', 'number', 'אחת', 'I have one brother.', 1),
  ('numbers', 'two', '/tuː/', 'number', 'שתיים', 'She has two cats.', 2),
  ('numbers', 'three', '/θriː/', 'number', 'שלוש', 'We need three chairs.', 3),
  ('numbers', 'four', '/fɔːr/', 'number', 'ארבע', 'There are four seasons.', 4),
  ('numbers', 'five', '/faɪv/', 'number', 'חמש', 'I wake up at five.', 5),
  ('numbers', 'six', '/sɪks/', 'number', 'שש', 'The shop closes at six.', 6),
  ('numbers', 'seven', '/ˈsevən/', 'number', 'שבע', 'There are seven days in a week.', 7),
  ('numbers', 'eight', '/eɪt/', 'number', 'שמונה', 'School starts at eight.', 8),
  ('numbers', 'nine', '/naɪn/', 'number', 'תשע', 'The store opens at nine.', 9),
  ('numbers', 'ten', '/ten/', 'number', 'עשר', 'I have ten fingers.', 10),

  ('colors', 'red', '/red/', 'adjective', 'אדום', 'The apple is red.', 1),
  ('colors', 'blue', '/bluː/', 'adjective', 'כחול', 'The sky is blue.', 2),
  ('colors', 'green', '/ɡriːn/', 'adjective', 'ירוק', 'The grass is green.', 3),
  ('colors', 'yellow', '/ˈjeləʊ/', 'adjective', 'צהוב', 'The sun is yellow.', 4),
  ('colors', 'black', '/blæk/', 'adjective', 'שחור', 'My cat is black.', 5),
  ('colors', 'white', '/waɪt/', 'adjective', 'לבן', 'Snow is white.', 6),
  ('colors', 'orange', '/ˈɒrɪndʒ/', 'adjective', 'כתום', 'I like orange juice.', 7),
  ('colors', 'purple', '/ˈpɜːrpəl/', 'adjective', 'סגול', 'She has a purple bag.', 8),
  ('colors', 'pink', '/pɪŋk/', 'adjective', 'ורוד', 'The flower is pink.', 9),
  ('colors', 'brown', '/braʊn/', 'adjective', 'חום', 'The dog is brown.', 10),

  ('family', 'mother', '/ˈmʌðər/', 'noun', 'אמא', 'My mother is a teacher.', 1),
  ('family', 'father', '/ˈfɑːðər/', 'noun', 'אבא', 'My father works in the city.', 2),
  ('family', 'sister', '/ˈsɪstər/', 'noun', 'אחות', 'I have one sister.', 3),
  ('family', 'brother', '/ˈbrʌðər/', 'noun', 'אח', 'My brother is older than me.', 4),
  ('family', 'grandmother', '/ˈɡrænˌmʌðər/', 'noun', 'סבתא', 'My grandmother makes great soup.', 5),
  ('family', 'grandfather', '/ˈɡrænˌfɑːðər/', 'noun', 'סבא', 'My grandfather tells good stories.', 6),
  ('family', 'son', '/sʌn/', 'noun', 'בן', 'They have a young son.', 7),
  ('family', 'daughter', '/ˈdɔːtər/', 'noun', 'בת', 'Their daughter is five years old.', 8),
  ('family', 'baby', '/ˈbeɪbi/', 'noun', 'תינוק/ת', 'The baby is sleeping.', 9),
  ('family', 'family', '/ˈfæməli/', 'noun', 'משפחה', 'I love spending time with my family.', 10),

  ('food-drink', 'water', '/ˈwɔːtər/', 'noun', 'מים', 'Can I have a glass of water?', 1),
  ('food-drink', 'bread', '/bred/', 'noun', 'לחם', 'We need to buy bread.', 2),
  ('food-drink', 'milk', '/mɪlk/', 'noun', 'חלב', 'She drinks milk every morning.', 3),
  ('food-drink', 'apple', '/ˈæpəl/', 'noun', 'תפוח', 'An apple a day keeps the doctor away.', 4),
  ('food-drink', 'coffee', '/ˈkɒfi/', 'noun', 'קפה', 'He drinks coffee every morning.', 5),
  ('food-drink', 'tea', '/tiː/', 'noun', 'תה', 'Would you like some tea?', 6),
  ('food-drink', 'egg', '/eɡ/', 'noun', 'ביצה', 'I eat an egg for breakfast.', 7),
  ('food-drink', 'rice', '/raɪs/', 'noun', 'אורז', 'We had rice and chicken for dinner.', 8),
  ('food-drink', 'chicken', '/ˈtʃɪkɪn/', 'noun', 'עוף', 'The chicken smells great.', 9),
  ('food-drink', 'cheese', '/tʃiːz/', 'noun', 'גבינה', 'I like cheese on my sandwich.', 10),

  ('animals', 'dog', '/dɒɡ/', 'noun', 'כלב', 'My dog likes to run in the park.', 1),
  ('animals', 'cat', '/kæt/', 'noun', 'חתול', 'The cat is sleeping on the sofa.', 2),
  ('animals', 'bird', '/bɜːrd/', 'noun', 'ציפור', 'A bird is singing outside.', 3),
  ('animals', 'fish', '/fɪʃ/', 'noun', 'דג', 'We have three fish in a tank.', 4),
  ('animals', 'horse', '/hɔːrs/', 'noun', 'סוס', 'The horse runs very fast.', 5),
  ('animals', 'cow', '/kaʊ/', 'noun', 'פרה', 'The cow gives us milk.', 6),
  ('animals', 'lion', '/ˈlaɪən/', 'noun', 'אריה', 'The lion is the king of the jungle.', 7),
  ('animals', 'elephant', '/ˈelɪfənt/', 'noun', 'פיל', 'An elephant is a very big animal.', 8),
  ('animals', 'rabbit', '/ˈræbɪt/', 'noun', 'ארנב', 'The rabbit is eating a carrot.', 9),
  ('animals', 'mouse', '/maʊs/', 'noun', 'עכבר', 'A small mouse ran across the floor.', 10),

  ('greetings', 'hello', '/həˈləʊ/', 'expression', 'שלום', 'Hello! How are you?', 1),
  ('greetings', 'goodbye', '/ˌɡʊdˈbaɪ/', 'expression', 'להתראות', 'Goodbye, see you tomorrow!', 2),
  ('greetings', 'please', '/pliːz/', 'expression', 'בבקשה', 'Can you help me, please?', 3),
  ('greetings', 'thank you', '/θæŋk juː/', 'expression', 'תודה', 'Thank you for your help.', 4),
  ('greetings', 'sorry', '/ˈsɒri/', 'expression', 'סליחה', 'Sorry, I am late.', 5),
  ('greetings', 'yes', '/jes/', 'expression', 'כן', 'Yes, I would like some tea.', 6),
  ('greetings', 'no', '/nəʊ/', 'expression', 'לא', 'No, thank you.', 7),
  ('greetings', 'my name is', '/maɪ neɪm ɪz/', 'expression', 'קוראים לי', 'Hi, my name is Dana.', 8)
) as v(topic_slug, headword, ipa, part_of_speech, translation_he, example_en, sort_order)
  on t.slug = v.topic_slug;

-- ============ GRAMMAR TOPICS + LESSONS ============

insert into public.grammar_topics (slug, name_he, name_en, cefr_level, sort_order) values
  ('verb-to-be', 'הפועל to be', 'Verb "to be"', 'A1', 1),
  ('articles', 'a / an / the', 'Articles', 'A1', 2),
  ('present-simple', 'הווה פשוט', 'Present Simple', 'A1', 3),
  ('plurals', 'רבים של שמות עצם', 'Plurals', 'A1', 4),
  ('possessive-adjectives', 'שמות תואר קנייניים', 'Possessive Adjectives', 'A1', 5)
on conflict (slug) do update set
  name_he = excluded.name_he,
  name_en = excluded.name_en,
  cefr_level = excluded.cefr_level,
  sort_order = excluded.sort_order;

delete from public.grammar_lessons
where grammar_topic_id in (select id from public.grammar_topics where slug in
  ('verb-to-be', 'articles', 'present-simple', 'plurals', 'possessive-adjectives'));

insert into public.grammar_lessons (grammar_topic_id, title_he, body_md, cefr_level, sort_order)
select gt.id, l.title_he, l.body_md, 'A1', 1
from public.grammar_topics gt
join (values
  ('verb-to-be', 'הפועל to be — am, is, are',
$$הפועל **to be** הוא הפועל הכי חשוב באנגלית, ומשמש להצגת עצמכם, לתאר דברים ולומר איפה משהו נמצא.

**הצורות:**

- I **am** — עם "אני" (לרוב מתקצר ל-I'm)
- He / She / It **is** — עם יחיד (הוא/היא/זה, מתקצר ל-he's / she's / it's)
- You / We / They **are** — עם רבים או "אתה" (מתקצר ל-you're / we're / they're)

**דוגמאות:**

- I am a student. (אני תלמיד)
- She is happy. (היא שמחה)
- We are from Israel. (אנחנו מישראל)
- They are at home. (הם בבית)

**שלילה:** מוסיפים **not** אחרי הפועל — I am not (I'm not), he is not (he isn't / he's not), they are not (they aren't).

**שאלה:** מזיזים את הפועל להתחלת המשפט — Am I late? Is she home? Are you ready?$$),

  ('articles', 'a, an, the — מתי משתמשים במה',
$$באנגלית יש שלוש מילות יידוע: **a**, **an** ו-**the**.

**a / an** — משתמשים כשמדברים על משהו לא ספציפי, בפעם הראשונה שמזכירים אותו:

- **a** לפני עיצור: a dog, a book, a car
- **an** לפני תנועה (a, e, i, o, u בהגייה): an apple, an hour, an umbrella

**the** — משתמשים כשמדברים על משהו ספציפי, שכבר ידוע למי שמדברים איתו:

- I have a dog. The dog is very friendly. (מזכירים כלב בפעם הראשונה עם a, ואז מדברים עליו שוב עם the)
- The sun is hot today. (יש רק שמש אחת — תמיד עם the)

**בלי מילת יידוע** — עם שמות עצם ברבים כלליים או שמות עצם שלא ניתנים לספירה: I like dogs. I drink water.$$),

  ('present-simple', 'הווה פשוט — Present Simple',
$$משתמשים בהווה פשוט לתיאור עובדות, הרגלים ודברים שקורים באופן קבוע.

**מבנה חיובי:**

- I / You / We / They **work** (בלי סיומת)
- He / She / It **works** (מוסיפים -s ליחיד גוף שלישי)

**דוגמאות:**

- I study English every day.
- She works in a hospital.
- They live in Tel Aviv.

**שלילה:** משתמשים ב-**do not / does not** (בקיצור don't / doesn't) + צורת בסיס של הפועל:

- I don't like coffee.
- He doesn't play football.

**שאלה:** משתמשים ב-**Do / Does** בתחילת המשפט:

- Do you speak English?
- Does she live here?

**מילות זמן נפוצות:** always, usually, often, sometimes, never, every day.$$),

  ('plurals', 'רבים של שמות עצם — Plurals',
$$ברוב המקרים, כדי ליצור רבים באנגלית פשוט מוסיפים **-s** לסוף המילה:

- book → books
- car → cars
- dog → dogs

**כללים מיוחדים:**

- מילים שמסתיימות ב-s, x, ch, sh, ss — מוסיפים **-es**: bus → buses, box → boxes, watch → watches
- מילים שמסתיימות בעיצור + y — מחליפים את ה-y ב-**-ies**: baby → babies, city → cities
- מילים שמסתיימות בתנועה + y — פשוט מוסיפים -s: boy → boys, day → days

**צורות לא רגילות (חובה לשנן):**

- man → men
- woman → women
- child → children
- person → people
- foot → feet
- tooth → teeth$$),

  ('possessive-adjectives', 'שמות תואר קנייניים — my, your, his...',
$$שמות תואר קנייניים מראים למי שייך משהו. הם תמיד באים **לפני** שם העצם.

| גוף | שם תואר קנייני | דוגמה |
|---|---|---|
| I | my | This is my book. |
| you | your | Is this your bag? |
| he | his | His name is David. |
| she | her | Her car is red. |
| it | its | The dog wagged its tail. |
| we | our | This is our house. |
| they | their | Their children are at school. |

**שימו לב:** שם התואר הקנייני לא משתנה לפי המספר של שם העצם — my book, my books (לא "mys books").

**בלבול נפוץ:** its (קנייני, בלי אפוסטרוף) לעומת it's (קיצור של it is).$$)
) as l(topic_slug, title_he, body_md)
  on gt.slug = l.topic_slug;

-- ============ LEARNING PATH ============
-- Suggested A1 order: all vocabulary topics, then all grammar topics.

delete from public.learning_path_nodes;

insert into public.learning_path_nodes (node_type, ref_id, cefr_level, sort_order)
select 'vocabulary_topic'::learning_path_node_type, id, 'A1'::cefr_level, sort_order
from public.topics
where slug in ('numbers', 'colors', 'family', 'food-drink', 'animals', 'greetings')
union all
select 'grammar_topic'::learning_path_node_type, id, 'A1'::cefr_level, sort_order + 100
from public.grammar_topics
where slug in ('verb-to-be', 'articles', 'present-simple', 'plurals', 'possessive-adjectives');

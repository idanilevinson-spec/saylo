-- Reading texts, listening clips, idioms/phrasal verbs, and their
-- comprehension/dictation exercises (Phase 4).
-- Run this AFTER migration 003_reading_listening.sql has been applied and
-- committed (the 'dictation' enum value must exist before this runs).
-- Safe to re-run: existing rows for this content are cleared first.

-- ============ READING TEXTS ============

delete from public.reading_texts where title_en in ('My Family', 'At the Market', 'Animals on the Farm');

insert into public.reading_texts (title_he, title_en, body_en, cefr_level, sort_order) values
  ('המשפחה שלי', 'My Family',
   'Hello! My name is Anna. I have a big family. My mother and father live with me. I have one sister and one brother. My grandmother and grandfather live near us. We have a dog. His name is Max. Max is brown. We eat breakfast together every morning. We eat bread, eggs, and cheese. I love my family very much.',
   'A1', 1),
  ('בשוק', 'At the Market',
   'Today I go to the market. I want to buy food. I buy apples, bread, and cheese. I also buy milk and tea. The apples are red. The cheese is white. I say please and thank you to the seller. Then I go home. My family is happy. We eat dinner together. Thank you for reading!',
   'A1', 2),
  ('חיות בחווה', 'Animals on the Farm',
   'On the farm, there are many animals. There is a cow. The cow is brown. There is a horse. The horse runs very fast. There is a small mouse near the barn. A bird sings in a tree. The farmer has a dog too. The dog is black. Every day, the farmer says hello to all the animals. The animals are happy on the farm.',
   'A1', 3);

insert into public.exercises (type, skill_area, reading_text_id, cefr_level, content, sort_order)
select 'mcq'::exercise_type, 'reading'::skill_area, rt.id, 'A1'::cefr_level, gen.content::jsonb, gen.sort_order
from public.reading_texts rt
join (values
  ('My Family', '{"prompt":"What color is Max the dog?","options":["Black","White","Brown","Red"],"correctIndex":2}', 1),
  ('My Family', '{"prompt":"What does the family eat for breakfast?","options":["Rice and chicken","Bread, eggs, and cheese","Only coffee","Fish and milk"],"correctIndex":1}', 2),
  ('At the Market', '{"prompt":"What color are the apples?","options":["Green","Yellow","Red","Orange"],"correctIndex":2}', 1),
  ('At the Market', '{"prompt":"What does the writer say to the seller?","options":["Goodbye and sorry","Please and thank you","Yes and no","Hello only"],"correctIndex":1}', 2),
  ('Animals on the Farm', '{"prompt":"What color is the dog on the farm?","options":["Brown","White","Black","Pink"],"correctIndex":2}', 1),
  ('Animals on the Farm', '{"prompt":"What does the horse do?","options":["It sings","It runs very fast","It sleeps all day","It swims"],"correctIndex":1}', 2)
) as gen(title_en, content, sort_order)
  on rt.title_en = gen.title_en;

-- ============ LISTENING CLIPS ============

delete from public.listening_clips where title_en in ('Ordering Coffee', 'A Phone Call', 'Weekend Plans');

insert into public.listening_clips (title_he, title_en, transcript_en, cefr_level, sort_order) values
  ('הזמנת קפה', 'Ordering Coffee', 'Hello, can I have a coffee, please? Yes, of course. Do you want milk and sugar? Yes, milk please, no sugar. Thank you very much.', 'A1', 1),
  ('שיחת טלפון', 'A Phone Call', 'Hi, this is Anna. Is your mother home? Yes, one moment please. Thank you. See you soon, goodbye!', 'A1', 2),
  ('תוכניות לסוף השבוע', 'Weekend Plans', 'What are you doing this weekend? I am going to the market with my family. We are buying apples and bread. Then we are eating dinner together. Sounds great!', 'A1', 3);

insert into public.exercises (type, skill_area, listening_clip_id, cefr_level, content, sort_order)
select 'dictation'::exercise_type, 'listening'::skill_area, lc.id, 'A1'::cefr_level, gen.content::jsonb, 1
from public.listening_clips lc
join (values
  ('Ordering Coffee', '{"audioText":"Can I have a coffee, please?","correctAnswer":"Can I have a coffee, please?"}'),
  ('A Phone Call', '{"audioText":"Is your mother home?","correctAnswer":"Is your mother home?"}'),
  ('Weekend Plans', '{"audioText":"What are you doing this weekend?","correctAnswer":"What are you doing this weekend?"}')
) as gen(title_en, content)
  on lc.title_en = gen.title_en;

-- ============ IDIOMS & PHRASAL VERBS ============

delete from public.idioms_phrasal_verbs;

insert into public.idioms_phrasal_verbs (phrase, type, meaning_he, example_en, cefr_level, sort_order) values
  ('get up', 'phrasal_verb', 'לקום (מהמיטה)', 'I get up at seven every morning.', 'A1', 1),
  ('give up', 'phrasal_verb', 'לוותר', 'Don''t give up on your dreams.', 'A1', 2),
  ('find out', 'phrasal_verb', 'לגלות', 'I need to find out what happened.', 'A1', 3),
  ('look after', 'phrasal_verb', 'לטפל ב-, לשמור על', 'She looks after her little brother.', 'A1', 4),
  ('look for', 'phrasal_verb', 'לחפש', 'I''m looking for my keys.', 'A1', 5),
  ('run into', 'phrasal_verb', 'להיתקל ב-, לפגוש במקרה', 'I ran into my old friend at the store.', 'A2', 6),
  ('take off', 'phrasal_verb', 'להמריא / להסיר', 'The plane will take off soon.', 'A1', 7),
  ('put off', 'phrasal_verb', 'לדחות', 'Let''s not put off this decision.', 'A2', 8),
  ('break the ice', 'idiom', 'לשבור את הקרח (להתחיל שיחה)', 'He told a joke to break the ice.', 'A2', 9),
  ('piece of cake', 'idiom', 'קלי קלות', 'Don''t worry, the test was a piece of cake.', 'A1', 10),
  ('hit the road', 'idiom', 'לצאת לדרך', 'It''s getting late, let''s hit the road.', 'A2', 11),
  ('under the weather', 'idiom', 'לא מרגיש טוב', 'I''m feeling a bit under the weather today.', 'A2', 12),
  ('once in a blue moon', 'idiom', 'פעם באורח נדיר', 'We only meet once in a blue moon.', 'B1', 13),
  ('spill the beans', 'idiom', 'לגלות סוד', 'Come on, spill the beans! What happened?', 'B1', 14);

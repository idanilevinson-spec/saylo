-- Expands reading from "3 texts, all A1" and listening from "3 clips,
-- all A1" to a real A1-B2 progression (8 texts + 8 clips, 2 per level),
-- matching the density/format of the original seed 004 batch: 2 MCQ
-- comprehension questions per reading text, 1 dictation exercise per
-- listening clip (a short quotable line from its transcript).
-- Run this AFTER migration 003_reading_listening.sql has been applied.
-- Safe to re-run: deletes only the specific rows this file owns (by
-- title), and their exercises cascade-delete automatically via the
-- reading_text_id/listening_clip_id foreign keys.

-- ============ READING TEXTS ============

delete from public.reading_texts where title_en in (
  'A Day in the Park', 'My Room', 'A Day at Work', 'A Trip to the City',
  'Working From Home', 'Learning a New Language', 'The Impact of Social Media', 'The Future of Remote Work'
);

insert into public.reading_texts (title_he, title_en, body_en, cefr_level, sort_order) values
  ('יום בפארק', 'A Day in the Park',
   'On Saturday, Noa goes to the park with her mother. They see many dogs and children. Noa plays on the swing. Her mother reads a book under a tree. After one hour, they buy ice cream. Noa chooses chocolate. It is a happy day.',
   'A1', 4),
  ('החדר שלי', 'My Room',
   'This is my room. I have a bed, a desk, and a big window. My favorite toy is on the shelf. I keep my clothes in a closet. At night, I turn off the light and go to sleep. I like my room very much.',
   'A1', 5),
  ('יום בעבודה', 'A Day at Work',
   'Daniel works in an office in Tel Aviv. He starts work at eight thirty and finishes at five. During lunch, he usually eats a sandwich with his coworkers. On Fridays, the office closes early, and everyone goes home to prepare for the weekend.',
   'A2', 6),
  ('טיול בעיר', 'A Trip to the City',
   'Last month, my family visited a new city. We stayed in a small hotel near the old town. Every morning, we walked around and took photographs. In the evening, we tried different restaurants. It was one of the best trips we ever had.',
   'A2', 7),
  ('עבודה מהבית', 'Working From Home',
   'Since she started working from home, Yael has noticed both advantages and disadvantages. She saves time by not commuting, but she also misses talking to her colleagues in person. To stay motivated, she now takes a short walk every morning before starting work.',
   'B1', 8),
  ('לימוד שפה חדשה', 'Learning a New Language',
   'Learning a new language as an adult can be challenging, but it is not impossible. Experts suggest practicing a little every day rather than studying for hours once a week. Watching movies and listening to music in the target language can also make the process more enjoyable.',
   'B1', 9),
  ('השפעת הרשתות החברתיות', 'The Impact of Social Media',
   'Researchers continue to debate the overall effect of social media on mental health. While some studies suggest that excessive use can increase feelings of anxiety and isolation, others argue that these platforms also provide valuable opportunities for connection, particularly for people who struggle to socialize in person.',
   'B2', 10),
  ('עתיד העבודה מרחוק', 'The Future of Remote Work',
   'As more companies adopt flexible working arrangements, questions have emerged about how this shift will affect urban development and workplace culture. Some analysts predict that fewer people commuting daily could ease pressure on public transportation, while others worry that remote work may weaken team collaboration over time.',
   'B2', 11);

insert into public.exercises (type, skill_area, reading_text_id, cefr_level, content, sort_order)
select 'mcq'::exercise_type, 'reading'::skill_area, rt.id, rt.cefr_level, gen.content::jsonb, gen.sort_order
from public.reading_texts rt
join (values
  ('A Day in the Park', '{"prompt":"Who does Noa go to the park with?","options":["Her father","Her mother","Her friend","Her teacher"],"correctIndex":1}', 1),
  ('A Day in the Park', '{"prompt":"What flavor of ice cream does Noa choose?","options":["Vanilla","Strawberry","Chocolate","Mint"],"correctIndex":2}', 2),
  ('My Room', '{"prompt":"Where does the writer keep clothes?","options":["On the shelf","Under the bed","In a closet","On the desk"],"correctIndex":2}', 1),
  ('My Room', '{"prompt":"What is on the shelf?","options":["Books","A favorite toy","Clothes","A lamp"],"correctIndex":1}', 2),
  ('A Day at Work', '{"prompt":"What time does Daniel finish work?","options":["Four thirty","Five","Five thirty","Six"],"correctIndex":1}', 1),
  ('A Day at Work', '{"prompt":"What happens on Fridays at the office?","options":["It opens late","It closes early","It stays closed","Nothing changes"],"correctIndex":1}', 2),
  ('A Trip to the City', '{"prompt":"Where did the family stay?","options":["A big hotel downtown","A small hotel near the old town","With relatives","A campsite"],"correctIndex":1}', 1),
  ('A Trip to the City', '{"prompt":"What did they do every morning?","options":["Slept late","Walked around and took photographs","Went shopping","Visited museums only"],"correctIndex":1}', 2),
  ('Working From Home', '{"prompt":"What does Yael miss about the office?","options":["The commute","Talking to colleagues in person","The coffee machine","Her old desk"],"correctIndex":1}', 1),
  ('Working From Home', '{"prompt":"What does Yael do to stay motivated?","options":["She sleeps in","She takes a short walk every morning","She calls a friend","She works longer hours"],"correctIndex":1}', 2),
  ('Learning a New Language', '{"prompt":"What do experts suggest for practicing a language?","options":["Studying once a week for hours","Practicing a little every day","Only reading textbooks","Avoiding movies"],"correctIndex":1}', 1),
  ('Learning a New Language', '{"prompt":"What can make learning more enjoyable, according to the text?","options":["Taking tests","Watching movies and listening to music","Memorizing grammar rules","Studying alone in silence"],"correctIndex":1}', 2),
  ('The Impact of Social Media', '{"prompt":"What do some studies suggest about excessive social media use?","options":["It has no effect","It can increase anxiety and isolation","It always improves mood","It only affects children"],"correctIndex":1}', 1),
  ('The Impact of Social Media', '{"prompt":"What do other researchers argue?","options":["Social media should be banned","It offers valuable connection opportunities for some people","It has no benefits","It replaces in-person friendships completely"],"correctIndex":1}', 2),
  ('The Future of Remote Work', '{"prompt":"What do some analysts predict about commuting?","options":["It will increase","Fewer people commuting could ease pressure on transportation","It will stay the same","It will become mandatory"],"correctIndex":1}', 1),
  ('The Future of Remote Work', '{"prompt":"What concern do others raise about remote work?","options":["It''s too expensive","It may weaken team collaboration over time","It reduces productivity immediately","It''s illegal in most places"],"correctIndex":1}', 2)
) as gen(title_en, content, sort_order)
  on rt.title_en = gen.title_en;

-- ============ LISTENING CLIPS ============

delete from public.listening_clips where title_en in (
  'At School', 'At the Supermarket', 'Scheduling a Meeting', 'Booking a Taxi',
  'A Complaint at a Restaurant', 'Planning a Vacation', 'A Job Interview', 'A Discussion About the Environment'
);

insert into public.listening_clips (title_he, title_en, transcript_en, cefr_level, sort_order) values
  ('בבית הספר', 'At School',
   'Good morning, class! Please open your books to page ten. Today we will read a short story together. If you have any questions, please raise your hand.',
   'A1', 4),
  ('בסופרמרקט', 'At the Supermarket',
   'Excuse me, where can I find the milk? It is in aisle three, next to the eggs. Thank you very much! You are welcome, have a nice day.',
   'A1', 5),
  ('תזמון פגישה', 'Scheduling a Meeting',
   'Are you free tomorrow afternoon for a quick meeting? I have something at two, but I am free after three. Great, let''s meet at three thirty then.',
   'A2', 6),
  ('הזמנת מונית', 'Booking a Taxi',
   'Hi, I need a taxi to the airport, please. Sure, what time do you need it? Six in the morning, if possible. No problem, we will be there at six.',
   'A2', 7),
  ('תלונה במסעדה', 'A Complaint at a Restaurant',
   'Excuse me, I ordered this dish without onions, but there are onions in it. I am so sorry about that, let me bring you a new plate right away. Thank you, I appreciate it.',
   'B1', 8),
  ('תכנון חופשה', 'Planning a Vacation',
   'I was thinking we could go somewhere warm this winter. That sounds nice, but flights can be expensive during the holidays. True, maybe we should book early to get a better price.',
   'B1', 9),
  ('ראיון עבודה', 'A Job Interview',
   'Can you tell me about a challenge you faced at your previous job? Sure, we had a tight deadline on a project, and I had to reorganize the team''s priorities to make sure we finished on time.',
   'B2', 10),
  ('דיון על סביבה', 'A Discussion About the Environment',
   'Do you think individuals can really make a difference in fighting climate change? I believe small actions matter, but real change also requires policy shifts at the government level.',
   'B2', 11);

insert into public.exercises (type, skill_area, listening_clip_id, cefr_level, content, sort_order)
select 'dictation'::exercise_type, 'listening'::skill_area, lc.id, lc.cefr_level, gen.content::jsonb, 1
from public.listening_clips lc
join (values
  ('At School', '{"audioText":"Please open your books to page ten.","correctAnswer":"Please open your books to page ten."}'),
  ('At the Supermarket', '{"audioText":"It is in aisle three, next to the eggs.","correctAnswer":"It is in aisle three, next to the eggs."}'),
  ('Scheduling a Meeting', '{"audioText":"Are you free tomorrow afternoon for a quick meeting?","correctAnswer":"Are you free tomorrow afternoon for a quick meeting?"}'),
  ('Booking a Taxi', '{"audioText":"I need a taxi to the airport, please.","correctAnswer":"I need a taxi to the airport, please."}'),
  ('A Complaint at a Restaurant', '{"audioText":"I ordered this dish without onions.","correctAnswer":"I ordered this dish without onions."}'),
  ('Planning a Vacation', '{"audioText":"We could go somewhere warm this winter.","correctAnswer":"We could go somewhere warm this winter."}'),
  ('A Job Interview', '{"audioText":"Can you tell me about a challenge you faced?","correctAnswer":"Can you tell me about a challenge you faced?"}'),
  ('A Discussion About the Environment', '{"audioText":"Do you think individuals can really make a difference?","correctAnswer":"Do you think individuals can really make a difference?"}')
) as gen(title_en, content)
  on lc.title_en = gen.title_en;

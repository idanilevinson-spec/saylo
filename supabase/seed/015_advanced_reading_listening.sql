-- Extends reading and listening from "tops out at B2" to real C1/C2
-- coverage, matching grammar/vocabulary/idioms which already reach
-- C1/C2. Adds 4 reading texts (2 C1, 2 C2, 8 MCQ) and 4 listening
-- clips (2 C1, 2 C2, 4 dictation), same density/format as seed 012.
-- Run this AFTER seed 004 and 012 have been applied.
-- Safe to re-run: deletes only the specific rows this file owns (by
-- title); their exercises cascade-delete via reading_text_id/
-- listening_clip_id foreign keys.

-- ============ READING TEXTS ============

delete from public.reading_texts where title_en in (
  'The Ethics of Artificial Intelligence', 'Urban Migration and Its Consequences',
  'The Paradox of Choice', 'Reassessing Historical Narratives'
);

insert into public.reading_texts (title_he, title_en, body_en, cefr_level, sort_order) values
  ('האתיקה של בינה מלאכותית', 'The Ethics of Artificial Intelligence',
   'As artificial intelligence systems become increasingly integrated into decision-making processes, from hiring practices to criminal sentencing, questions about accountability have grown more urgent. Proponents argue that algorithms can reduce human bias by relying on consistent, data-driven criteria. Critics counter that these systems often inherit and even amplify the very biases present in the data they were trained on, while offering far less transparency than a human decision-maker would. Reconciling these competing perspectives may require not just better technology, but entirely new frameworks for oversight.',
   'C1', 12),
  ('הגירה עירונית והשלכותיה', 'Urban Migration and Its Consequences',
   'Over the past few decades, cities around the world have experienced unprecedented population growth, as people leave rural areas in search of better economic opportunities. While this migration has driven innovation and cultural exchange, it has also placed enormous strain on housing, infrastructure, and public services. Some urban planners argue that the solution lies not in limiting migration, but in rethinking how cities are designed to accommodate rapid growth sustainably.',
   'C1', 13),
  ('הפרדוקס של הבחירה', 'The Paradox of Choice',
   'Conventional wisdom holds that more choice inevitably leads to greater satisfaction, yet a growing body of research suggests the opposite may often be true. When confronted with an overwhelming array of options, consumers frequently experience heightened anxiety and are more prone to regret their decisions, even when the outcome is objectively favorable. This phenomenon, sometimes referred to as the paradox of choice, has prompted some businesses to deliberately curate smaller, more thoughtfully selected ranges of products in an effort to ease decision fatigue.',
   'C2', 14),
  ('בחינה מחדש של נרטיבים היסטוריים', 'Reassessing Historical Narratives',
   'Historical accounts are rarely as objective as they may first appear; they are shaped by the perspectives, priorities, and blind spots of those who write them. In recent years, historians have increasingly sought to revisit established narratives, incorporating voices and sources that were previously marginalized or overlooked entirely. This process of reassessment does not necessarily discredit earlier scholarship, but rather enriches our understanding by acknowledging its inherent limitations.',
   'C2', 15);

insert into public.exercises (type, skill_area, reading_text_id, cefr_level, content, sort_order)
select 'mcq'::exercise_type, 'reading'::skill_area, rt.id, rt.cefr_level, gen.content::jsonb, gen.sort_order
from public.reading_texts rt
join (values
  ('The Ethics of Artificial Intelligence', '{"prompt":"According to proponents of AI, what advantage do algorithms offer?","options":["They are always faster than humans","They can reduce bias through consistent criteria","They require no oversight","They are cheaper to run"],"correctIndex":1}', 1),
  ('The Ethics of Artificial Intelligence', '{"prompt":"What do critics argue about AI systems?","options":["They are too transparent","They can amplify existing biases in their training data","They are more accountable than humans","They eliminate the need for data"],"correctIndex":1}', 2),
  ('Urban Migration and Its Consequences', '{"prompt":"Why are people migrating to cities, according to the text?","options":["Better weather","Better economic opportunities","Government requirements","Lower cost of living"],"correctIndex":1}', 1),
  ('Urban Migration and Its Consequences', '{"prompt":"What do some urban planners suggest as a solution?","options":["Limiting migration completely","Rethinking sustainable city design","Building more rural areas","Ignoring the problem"],"correctIndex":1}', 2),
  ('The Paradox of Choice', '{"prompt":"What does research suggest about having many choices?","options":["It always increases satisfaction","It can increase anxiety and regret","It has no effect on consumers","It eliminates decision fatigue"],"correctIndex":1}', 1),
  ('The Paradox of Choice', '{"prompt":"How have some businesses responded to the paradox of choice?","options":["By offering more products","By curating smaller, more selective ranges","By raising prices","By removing customer choice entirely"],"correctIndex":1}', 2),
  ('Reassessing Historical Narratives', '{"prompt":"Why are historical accounts not fully objective, according to the text?","options":["They are always false","They are shaped by the perspectives of those who write them","They are written by machines","They never change over time"],"correctIndex":1}', 1),
  ('Reassessing Historical Narratives', '{"prompt":"What is the purpose of reassessing historical narratives?","options":["To discredit all previous scholarship","To enrich understanding by including overlooked voices","To remove history books entirely","To prove historians wrong"],"correctIndex":1}', 2)
) as gen(title_en, content, sort_order)
  on rt.title_en = gen.title_en;

-- ============ LISTENING CLIPS ============

delete from public.listening_clips where title_en in (
  'A Panel Discussion on Remote Work', 'An Interview About a Career Change',
  'A Debate on Economic Policy', 'A Lecture Excerpt on Philosophy'
);

insert into public.listening_clips (title_he, title_en, transcript_en, cefr_level, sort_order) values
  ('פאנל על עבודה מרחוק', 'A Panel Discussion on Remote Work',
   'Honestly, I think the biggest challenge isn''t productivity, it''s maintaining a sense of connection with your team when you rarely see them in person. Companies that ignore that tend to see higher turnover, even if the numbers look fine on paper.',
   'C1', 6),
  ('ראיון על שינוי קריירה', 'An Interview About a Career Change',
   'I''d been in finance for almost a decade before I realized it just wasn''t fulfilling anymore. Making the switch was terrifying, but looking back, it''s easily the best decision I''ve made professionally.',
   'C1', 7),
  ('דיון על מדיניות כלכלית', 'A Debate on Economic Policy',
   'The problem with that argument is that it assumes markets are perfectly rational, which, frankly, decades of behavioral economics have shown just isn''t the case. Any policy built on that assumption is bound to have unintended consequences.',
   'C2', 8),
  ('קטע הרצאה בפילוסופיה', 'A Lecture Excerpt on Philosophy',
   'What Kant is really getting at here isn''t that we should never lie, full stop, but that we can''t universalize a maxim that relies on everyone else not following it too. That''s the deeper point most people miss.',
   'C2', 9);

insert into public.exercises (type, skill_area, listening_clip_id, cefr_level, content, sort_order)
select 'dictation'::exercise_type, 'listening'::skill_area, lc.id, lc.cefr_level, gen.content::jsonb, 1
from public.listening_clips lc
join (values
  ('A Panel Discussion on Remote Work', '{"audioText":"The biggest challenge isn''t productivity, it''s maintaining a sense of connection.","correctAnswer":"The biggest challenge isn''t productivity, it''s maintaining a sense of connection."}'),
  ('An Interview About a Career Change', '{"audioText":"Making the switch was terrifying, but it''s the best decision I''ve made.","correctAnswer":"Making the switch was terrifying, but it''s the best decision I''ve made."}'),
  ('A Debate on Economic Policy', '{"audioText":"It assumes markets are perfectly rational, which just isn''t the case.","correctAnswer":"It assumes markets are perfectly rational, which just isn''t the case."}'),
  ('A Lecture Excerpt on Philosophy', '{"audioText":"We can''t universalize a maxim that relies on everyone else not following it.","correctAnswer":"We can''t universalize a maxim that relies on everyone else not following it."}')
) as gen(title_en, content)
  on lc.title_en = gen.title_en;

-- Expands idioms & phrasal verbs from 14 entries (all A1-B1) to 34,
-- adding coverage up through C1 to match the rest of the content's
-- CEFR range. Standalone reference list (no exercises attached, per
-- schema — idioms_phrasal_verbs has no exercises FK).
-- Run this AFTER seed 004_reading_listening_idioms.sql.
-- Safe to re-run: only deletes the specific phrases this file owns,
-- leaving the original 14 from seed 004 untouched.

delete from public.idioms_phrasal_verbs where phrase in (
  'come across', 'figure out', 'hold on', 'turn down', 'come up with', 'get along with',
  'carry out', 'bring up', 'look into', 'come across as',
  'cost an arm and a leg', 'hit the books', 'on the same page', 'call it a day', 'bite the bullet',
  'hit the nail on the head', 'see eye to eye', 'get the ball rolling', 'beat around the bush', 'a blessing in disguise'
);

insert into public.idioms_phrasal_verbs (phrase, type, meaning_he, example_en, cefr_level, sort_order) values
  ('hold on', 'phrasal_verb', 'לחכות רגע / להחזיק חזק', 'Hold on a second, I''ll be right back.', 'A1', 15),
  ('come across', 'phrasal_verb', 'להיתקל ב-, למצוא במקרה', 'I came across an old photo while cleaning.', 'A2', 16),
  ('figure out', 'phrasal_verb', 'להבין, לפענח', 'I can''t figure out how this machine works.', 'A2', 17),
  ('cost an arm and a leg', 'idiom', 'לעלות הון תועפות', 'That car cost an arm and a leg.', 'A2', 18),
  ('hit the books', 'idiom', 'לשבת ללמוד ברצינות', 'I need to hit the books before the exam.', 'A2', 19),
  ('turn down', 'phrasal_verb', 'לדחות, לסרב ל-', 'She turned down the job offer.', 'B1', 20),
  ('come up with', 'phrasal_verb', 'להעלות רעיון, למצוא פתרון', 'He came up with a great idea.', 'B1', 21),
  ('get along with', 'phrasal_verb', 'להסתדר טוב עם', 'I get along with my coworkers very well.', 'B1', 22),
  ('on the same page', 'idiom', 'באותה דעה, מסונכרנים', 'Let''s make sure we''re on the same page before we start.', 'B1', 23),
  ('call it a day', 'idiom', 'לסיים לעבוד להיום', 'We''ve done enough, let''s call it a day.', 'B1', 24),
  ('carry out', 'phrasal_verb', 'לבצע, להוציא לפועל', 'The team carried out the plan successfully.', 'B2', 25),
  ('bring up', 'phrasal_verb', 'להעלות נושא / לגדל (ילד)', 'She brought up an interesting point in the meeting.', 'B2', 26),
  ('look into', 'phrasal_verb', 'לבדוק, לחקור', 'The police are looking into the case.', 'B2', 27),
  ('bite the bullet', 'idiom', 'להתמודד עם משהו קשה באומץ', 'I finally bit the bullet and booked the dentist.', 'B2', 28),
  ('hit the nail on the head', 'idiom', 'לקלוע בדיוק', 'You hit the nail on the head with that comment.', 'B2', 29),
  ('see eye to eye', 'idiom', 'להסכים לחלוטין', 'We don''t always see eye to eye on politics.', 'B2', 30),
  ('get the ball rolling', 'idiom', 'להתחיל תהליך', 'Let''s get the ball rolling on this project.', 'B2', 31),
  ('come across as', 'phrasal_verb', 'להתרשם כ-, להיראות כ-', 'He came across as very confident in the interview.', 'C1', 32),
  ('beat around the bush', 'idiom', 'להתחמק, לדבר סחור סחור', 'Stop beating around the bush and tell me the truth.', 'C1', 33),
  ('a blessing in disguise', 'idiom', 'ברכה בתחפושת (דבר רע שמתגלה כטוב)', 'Losing that job was a blessing in disguise.', 'C1', 34);

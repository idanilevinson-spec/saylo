-- Fill-blank + reorder exercises for A1 grammar, plus starter badges (Phase 3).
-- Run this AFTER supabase/seed/002_a1_exercises_vocab.sql.
-- Safe to re-run: existing rows for these topics/badges are cleared first.

-- ============ FILL-BLANK EXERCISES (3 per grammar topic) ============

delete from public.exercises
where grammar_topic_id in (select id from public.grammar_topics where slug in
  ('verb-to-be', 'articles', 'present-simple', 'plurals', 'possessive-adjectives'));

insert into public.exercises (type, skill_area, grammar_topic_id, cefr_level, content, sort_order)
select 'fill_blank'::exercise_type, 'grammar'::skill_area, gt.id, 'A1'::cefr_level, gen.content::jsonb, gen.sort_order
from public.grammar_topics gt
join (values
  ('verb-to-be', '{"sentence":"She ___ a doctor.","correctAnswer":"is","hint":"he / she / it"}', 1),
  ('verb-to-be', '{"sentence":"I ___ from Israel.","correctAnswer":"am","hint":"I"}', 2),
  ('verb-to-be', '{"sentence":"They ___ happy.","correctAnswer":"are","hint":"you / we / they"}', 3),

  ('articles', '{"sentence":"I saw ___ elephant at the zoo.","correctAnswer":"an","hint":"before a vowel sound"}', 1),
  ('articles', '{"sentence":"She has ___ cat.","correctAnswer":"a","hint":"before a consonant sound"}', 2),
  ('articles', '{"sentence":"___ sun is very hot today.","correctAnswer":"The","hint":"there is only one"}', 3),

  ('present-simple', '{"sentence":"She ___ in a hospital.","correctAnswer":"works","hint":"work + s, he/she/it"}', 1),
  ('present-simple', '{"sentence":"I ___ like coffee.","correctAnswer":"don''t","hint":"do not, short form"}', 2),
  ('present-simple', '{"sentence":"___ you speak English?","correctAnswer":"Do","hint":"question form"}', 3),

  ('plurals', '{"sentence":"I have two ___.","correctAnswer":"children","hint":"irregular plural of child"}', 1),
  ('plurals', '{"sentence":"There are five ___ on the table.","correctAnswer":"books","hint":"regular plural"}', 2),
  ('plurals', '{"sentence":"I saw three ___ at the store.","correctAnswer":"women","hint":"irregular plural of woman"}', 3),

  ('possessive-adjectives', '{"sentence":"This is ___ book.","correctAnswer":"my","hint":"I"}', 1),
  ('possessive-adjectives', '{"sentence":"___ children are at school.","correctAnswer":"Their","hint":"they"}', 2),
  ('possessive-adjectives', '{"sentence":"The dog wagged ___ tail.","correctAnswer":"its","hint":"it, no apostrophe"}', 3)
) as gen(topic_slug, content, sort_order)
  on gt.slug = gen.topic_slug;

-- ============ REORDER EXERCISES (1 per grammar topic) ============

insert into public.exercises (type, skill_area, grammar_topic_id, cefr_level, content, sort_order)
select 'reorder'::exercise_type, 'grammar'::skill_area, gt.id, 'A1'::cefr_level, gen.content::jsonb, 100
from public.grammar_topics gt
join (values
  ('verb-to-be', '{"tokens":["We","are","from","Israel"],"correctOrder":[0,1,2,3]}'),
  ('articles', '{"tokens":["I","have","a","dog"],"correctOrder":[0,1,2,3]}'),
  ('present-simple', '{"tokens":["She","works","in","a","hospital"],"correctOrder":[0,1,2,3,4]}'),
  ('plurals', '{"tokens":["I","have","two","children"],"correctOrder":[0,1,2,3]}'),
  ('possessive-adjectives', '{"tokens":["This","is","my","book"],"correctOrder":[0,1,2,3]}')
) as gen(topic_slug, content)
  on gt.slug = gen.topic_slug;

-- ============ STARTER BADGES ============

insert into public.badges (slug, name_he, description_he, icon, criteria) values
  ('first-steps', 'צעדים ראשונים', 'השלמתם את התרגיל הראשון שלכם', '🌱', '{"type":"correct_attempts","value":1}'),
  ('ten-correct', 'על הדרך הנכונה', '10 תשובות נכונות', '✅', '{"type":"correct_attempts","value":10}'),
  ('fifty-correct', 'משנן רציני', '50 תשובות נכונות', '🏆', '{"type":"correct_attempts","value":50}'),
  ('streak-3', 'שלושה ימים ברצף', 'למדתם 3 ימים ברצף', '🔥', '{"type":"streak","value":3}'),
  ('streak-7', 'שבוע שלם', 'למדתם 7 ימים ברצף', '🔥', '{"type":"streak","value":7}'),
  ('xp-100', '100 נקודות ניסיון', 'צברתם 100 XP', '⭐', '{"type":"xp","value":100}')
on conflict (slug) do update set
  name_he = excluded.name_he,
  description_he = excluded.description_he,
  icon = excluded.icon,
  criteria = excluded.criteria;

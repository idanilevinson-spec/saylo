-- Auto-generated MCQ + match exercises for A1 vocabulary (Phase 3).
-- Run this AFTER supabase/seed/001_a1_core_content.sql and migration 002.
-- Safe to re-run: existing generated exercises for these topics are deleted first.

delete from public.exercises
where topic_id in (select id from public.topics where slug in ('numbers', 'colors', 'family', 'food-drink', 'animals', 'greetings'));

insert into public.exercises (type, skill_area, topic_id, vocabulary_item_id, cefr_level, content, sort_order)
select 'mcq'::exercise_type, 'vocabulary'::skill_area, t.id, v.id, 'A1'::cefr_level, gen.content, gen.sort_order
from (values
  ('numbers', 'one', '{"prompt":"מה המילה באנגלית עבור \"אחת\"?","options":["nine","one","five","six"],"correctIndex":1}'::jsonb, 1),
  ('numbers', 'two', '{"prompt":"מה המילה באנגלית עבור \"שתיים\"?","options":["one","two","four","ten"],"correctIndex":1}'::jsonb, 2),
  ('numbers', 'three', '{"prompt":"מה המילה באנגלית עבור \"שלוש\"?","options":["four","nine","six","three"],"correctIndex":3}'::jsonb, 3),
  ('numbers', 'four', '{"prompt":"מה המילה באנגלית עבור \"ארבע\"?","options":["four","one","six","nine"],"correctIndex":0}'::jsonb, 4),
  ('numbers', 'five', '{"prompt":"מה המילה באנגלית עבור \"חמש\"?","options":["nine","eight","two","five"],"correctIndex":3}'::jsonb, 5),
  ('numbers', 'six', '{"prompt":"מה המילה באנגלית עבור \"שש\"?","options":["one","four","two","six"],"correctIndex":3}'::jsonb, 6),
  ('numbers', 'seven', '{"prompt":"מה המילה באנגלית עבור \"שבע\"?","options":["seven","four","five","nine"],"correctIndex":0}'::jsonb, 7),
  ('numbers', 'eight', '{"prompt":"מה המילה באנגלית עבור \"שמונה\"?","options":["eight","ten","six","one"],"correctIndex":0}'::jsonb, 8),
  ('numbers', 'nine', '{"prompt":"מה המילה באנגלית עבור \"תשע\"?","options":["six","nine","four","two"],"correctIndex":1}'::jsonb, 9),
  ('numbers', 'ten', '{"prompt":"מה המילה באנגלית עבור \"עשר\"?","options":["three","seven","ten","nine"],"correctIndex":2}'::jsonb, 10),
  ('colors', 'red', '{"prompt":"מה המילה באנגלית עבור \"אדום\"?","options":["orange","black","yellow","red"],"correctIndex":3}'::jsonb, 1),
  ('colors', 'blue', '{"prompt":"מה המילה באנגלית עבור \"כחול\"?","options":["black","brown","blue","purple"],"correctIndex":2}'::jsonb, 2),
  ('colors', 'green', '{"prompt":"מה המילה באנגלית עבור \"ירוק\"?","options":["blue","black","green","purple"],"correctIndex":2}'::jsonb, 3),
  ('colors', 'yellow', '{"prompt":"מה המילה באנגלית עבור \"צהוב\"?","options":["blue","black","red","yellow"],"correctIndex":3}'::jsonb, 4),
  ('colors', 'black', '{"prompt":"מה המילה באנגלית עבור \"שחור\"?","options":["green","brown","black","purple"],"correctIndex":2}'::jsonb, 5),
  ('colors', 'white', '{"prompt":"מה המילה באנגלית עבור \"לבן\"?","options":["green","orange","pink","white"],"correctIndex":3}'::jsonb, 6),
  ('colors', 'orange', '{"prompt":"מה המילה באנגלית עבור \"כתום\"?","options":["orange","white","purple","black"],"correctIndex":0}'::jsonb, 7),
  ('colors', 'purple', '{"prompt":"מה המילה באנגלית עבור \"סגול\"?","options":["red","yellow","purple","black"],"correctIndex":2}'::jsonb, 8),
  ('colors', 'pink', '{"prompt":"מה המילה באנגלית עבור \"ורוד\"?","options":["pink","orange","red","black"],"correctIndex":0}'::jsonb, 9),
  ('colors', 'brown', '{"prompt":"מה המילה באנגלית עבור \"חום\"?","options":["brown","black","white","yellow"],"correctIndex":0}'::jsonb, 10),
  ('family', 'mother', '{"prompt":"מה המילה באנגלית עבור \"אמא\"?","options":["father","grandfather","brother","mother"],"correctIndex":3}'::jsonb, 1),
  ('family', 'father', '{"prompt":"מה המילה באנגלית עבור \"אבא\"?","options":["daughter","grandfather","mother","father"],"correctIndex":3}'::jsonb, 2),
  ('family', 'sister', '{"prompt":"מה המילה באנגלית עבור \"אחות\"?","options":["sister","grandmother","son","mother"],"correctIndex":0}'::jsonb, 3),
  ('family', 'brother', '{"prompt":"מה המילה באנגלית עבור \"אח\"?","options":["daughter","son","sister","brother"],"correctIndex":3}'::jsonb, 4),
  ('family', 'grandmother', '{"prompt":"מה המילה באנגלית עבור \"סבתא\"?","options":["grandfather","son","father","grandmother"],"correctIndex":3}'::jsonb, 5),
  ('family', 'grandfather', '{"prompt":"מה המילה באנגלית עבור \"סבא\"?","options":["grandfather","sister","family","son"],"correctIndex":0}'::jsonb, 6),
  ('family', 'son', '{"prompt":"מה המילה באנגלית עבור \"בן\"?","options":["daughter","sister","father","son"],"correctIndex":3}'::jsonb, 7),
  ('family', 'daughter', '{"prompt":"מה המילה באנגלית עבור \"בת\"?","options":["brother","baby","daughter","son"],"correctIndex":2}'::jsonb, 8),
  ('family', 'baby', '{"prompt":"מה המילה באנגלית עבור \"תינוק/ת\"?","options":["mother","baby","brother","sister"],"correctIndex":1}'::jsonb, 9),
  ('family', 'family', '{"prompt":"מה המילה באנגלית עבור \"משפחה\"?","options":["daughter","father","son","family"],"correctIndex":3}'::jsonb, 10),
  ('food-drink', 'water', '{"prompt":"מה המילה באנגלית עבור \"מים\"?","options":["cheese","tea","water","bread"],"correctIndex":2}'::jsonb, 1),
  ('food-drink', 'bread', '{"prompt":"מה המילה באנגלית עבור \"לחם\"?","options":["bread","coffee","chicken","cheese"],"correctIndex":0}'::jsonb, 2),
  ('food-drink', 'milk', '{"prompt":"מה המילה באנגלית עבור \"חלב\"?","options":["chicken","milk","rice","coffee"],"correctIndex":1}'::jsonb, 3),
  ('food-drink', 'apple', '{"prompt":"מה המילה באנגלית עבור \"תפוח\"?","options":["apple","egg","bread","chicken"],"correctIndex":0}'::jsonb, 4),
  ('food-drink', 'coffee', '{"prompt":"מה המילה באנגלית עבור \"קפה\"?","options":["bread","milk","chicken","coffee"],"correctIndex":3}'::jsonb, 5),
  ('food-drink', 'tea', '{"prompt":"מה המילה באנגלית עבור \"תה\"?","options":["cheese","rice","tea","apple"],"correctIndex":2}'::jsonb, 6),
  ('food-drink', 'egg', '{"prompt":"מה המילה באנגלית עבור \"ביצה\"?","options":["egg","rice","milk","cheese"],"correctIndex":0}'::jsonb, 7),
  ('food-drink', 'rice', '{"prompt":"מה המילה באנגלית עבור \"אורז\"?","options":["water","cheese","egg","rice"],"correctIndex":3}'::jsonb, 8),
  ('food-drink', 'chicken', '{"prompt":"מה המילה באנגלית עבור \"עוף\"?","options":["cheese","tea","chicken","coffee"],"correctIndex":2}'::jsonb, 9),
  ('food-drink', 'cheese', '{"prompt":"מה המילה באנגלית עבור \"גבינה\"?","options":["rice","water","tea","cheese"],"correctIndex":3}'::jsonb, 10),
  ('animals', 'dog', '{"prompt":"מה המילה באנגלית עבור \"כלב\"?","options":["dog","horse","lion","elephant"],"correctIndex":0}'::jsonb, 1),
  ('animals', 'cat', '{"prompt":"מה המילה באנגלית עבור \"חתול\"?","options":["cat","horse","dog","rabbit"],"correctIndex":0}'::jsonb, 2),
  ('animals', 'bird', '{"prompt":"מה המילה באנגלית עבור \"ציפור\"?","options":["mouse","bird","cow","dog"],"correctIndex":1}'::jsonb, 3),
  ('animals', 'fish', '{"prompt":"מה המילה באנגלית עבור \"דג\"?","options":["rabbit","mouse","cat","fish"],"correctIndex":3}'::jsonb, 4),
  ('animals', 'horse', '{"prompt":"מה המילה באנגלית עבור \"סוס\"?","options":["elephant","cow","fish","horse"],"correctIndex":3}'::jsonb, 5),
  ('animals', 'cow', '{"prompt":"מה המילה באנגלית עבור \"פרה\"?","options":["cow","elephant","horse","rabbit"],"correctIndex":0}'::jsonb, 6),
  ('animals', 'lion', '{"prompt":"מה המילה באנגלית עבור \"אריה\"?","options":["elephant","dog","lion","horse"],"correctIndex":2}'::jsonb, 7),
  ('animals', 'elephant', '{"prompt":"מה המילה באנגלית עבור \"פיל\"?","options":["bird","elephant","rabbit","lion"],"correctIndex":1}'::jsonb, 8),
  ('animals', 'rabbit', '{"prompt":"מה המילה באנגלית עבור \"ארנב\"?","options":["dog","rabbit","lion","fish"],"correctIndex":1}'::jsonb, 9),
  ('animals', 'mouse', '{"prompt":"מה המילה באנגלית עבור \"עכבר\"?","options":["rabbit","cow","mouse","bird"],"correctIndex":2}'::jsonb, 10),
  ('greetings', 'hello', '{"prompt":"מה המילה באנגלית עבור \"שלום\"?","options":["hello","yes","thank you","my name is"],"correctIndex":0}'::jsonb, 1),
  ('greetings', 'goodbye', '{"prompt":"מה המילה באנגלית עבור \"להתראות\"?","options":["thank you","sorry","yes","goodbye"],"correctIndex":3}'::jsonb, 2),
  ('greetings', 'please', '{"prompt":"מה המילה באנגלית עבור \"בבקשה\"?","options":["please","goodbye","yes","hello"],"correctIndex":0}'::jsonb, 3),
  ('greetings', 'thank you', '{"prompt":"מה המילה באנגלית עבור \"תודה\"?","options":["thank you","no","my name is","yes"],"correctIndex":0}'::jsonb, 4),
  ('greetings', 'sorry', '{"prompt":"מה המילה באנגלית עבור \"סליחה\"?","options":["hello","sorry","yes","my name is"],"correctIndex":1}'::jsonb, 5),
  ('greetings', 'yes', '{"prompt":"מה המילה באנגלית עבור \"כן\"?","options":["yes","please","sorry","no"],"correctIndex":0}'::jsonb, 6),
  ('greetings', 'no', '{"prompt":"מה המילה באנגלית עבור \"לא\"?","options":["my name is","hello","thank you","no"],"correctIndex":3}'::jsonb, 7),
  ('greetings', 'my name is', '{"prompt":"מה המילה באנגלית עבור \"קוראים לי\"?","options":["thank you","yes","my name is","hello"],"correctIndex":2}'::jsonb, 8)
) as gen(topic_slug, headword, content, sort_order)
join public.topics t on t.slug = gen.topic_slug
join public.vocabulary_items v on v.topic_id = t.id and v.headword = gen.headword;

insert into public.exercises (type, skill_area, topic_id, cefr_level, content, sort_order)
select 'match'::exercise_type, 'vocabulary'::skill_area, t.id, 'A1'::cefr_level, gen.content, 100
from (values
  ('numbers', '{"pairs":[{"left":"three","right":"שלוש"},{"left":"four","right":"ארבע"},{"left":"ten","right":"עשר"},{"left":"one","right":"אחת"}]}'::jsonb),
  ('colors', '{"pairs":[{"left":"orange","right":"כתום"},{"left":"blue","right":"כחול"},{"left":"brown","right":"חום"},{"left":"yellow","right":"צהוב"}]}'::jsonb),
  ('family', '{"pairs":[{"left":"grandmother","right":"סבתא"},{"left":"mother","right":"אמא"},{"left":"family","right":"משפחה"},{"left":"daughter","right":"בת"}]}'::jsonb),
  ('food-drink', '{"pairs":[{"left":"apple","right":"תפוח"},{"left":"water","right":"מים"},{"left":"coffee","right":"קפה"},{"left":"milk","right":"חלב"}]}'::jsonb),
  ('animals', '{"pairs":[{"left":"dog","right":"כלב"},{"left":"mouse","right":"עכבר"},{"left":"lion","right":"אריה"},{"left":"elephant","right":"פיל"}]}'::jsonb),
  ('greetings', '{"pairs":[{"left":"please","right":"בבקשה"},{"left":"no","right":"לא"},{"left":"hello","right":"שלום"},{"left":"sorry","right":"סליחה"}]}'::jsonb)
) as gen(topic_slug, content)
join public.topics t on t.slug = gen.topic_slug;

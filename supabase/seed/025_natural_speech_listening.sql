-- Connected-speech ("natural speech") listening clips — see
-- docs/specs/connected-speech-listening.md. Five original dialogues written
-- like real conversation (fillers, contractions, unfinished sentences),
-- distinguished from regular listening clips via `style = 'natural_speech'`
-- (migration 039), shown as an additive section on /listening, not a
-- replacement for existing clips.
--
-- Exercises focus on recognizing what a reduced/connected phrase actually
-- means ("what does 'kinda swamped' mean here?"), not just plot recall —
-- the gap this content targets is reading English fine but losing fast,
-- casual speech.
--
-- Run this AFTER migration 039_listening_clip_style.sql has been applied.
-- Safe to re-run: existing rows for these titles are cleared first.

delete from public.listening_clips where title_en in (
  'Grabbing Lunch', 'Missed the Bus', 'Weekend Plans, Kind Of', 'Drive-Through Order', 'Running Late'
);

insert into public.listening_clips (title_he, title_en, transcript_en, cefr_level, style, sort_order) values
  ('יוצאים לארוחת צהריים', 'Grabbing Lunch',
   'Hey, you wanna grab lunch or what? Um, I don''t know, I''m kinda swamped right now. Come on, it''s just gonna take like twenty minutes. Yeah... okay, fine. Where are we going, though? I was thinking that new place on Main Street, the one with the... actually, never mind, let''s just go to the usual spot. Sounds good. Gimme five minutes.',
   'B1', 'natural_speech', 1),
  ('פספסתי את האוטובוס', 'Missed the Bus',
   'You look stressed. What''s wrong? I totally missed my bus this morning. I was gonna be there by nine, but now I don''t know. That sucks. Did you call them? Yeah, I did, and they were like, "no big deal, just come when you can." So I guess it''s fine. See, I told you they''re pretty chill about that stuff. Yeah, I guess you''re right.',
   'B1', 'natural_speech', 2),
  ('תוכניות לסוף שבוע, איכשהו', 'Weekend Plans, Kind Of',
   'So, what are you up to this weekend? Honestly? Not much. Maybe gonna catch up on sleep, watch a movie or something. That''s it? I thought you were gonna go hiking with your brother. Oh, right, yeah, that too — I kinda forgot about that, actually. He wants to leave super early, like six a.m., which is... not ideal. Ha, good luck with that.',
   'B2', 'natural_speech', 3),
  ('הזמנה מהמכונית', 'Drive-Through Order',
   'Hi, welcome to Sunny Burger, whaddya like to order? Uh, yeah, can I get a cheeseburger and, um, a small fries? You want a drink with that? Sure, I''ll have a... actually, no, I''m good, just the burger and fries. No problem, that''ll be seven fifty at the window.',
   'A2', 'natural_speech', 4),
  ('מאחרים', 'Running Late',
   'Where are you? We''re supposed to start in like two minutes. I know, I know, I''m so sorry, traffic''s insane right now. I''m gonna be there in ten, fifteen tops. Ugh, okay, I''ll try to stall them. You''re the best, I owe you one. You owe me like five by now.',
   'B2', 'natural_speech', 5);

insert into public.exercises (type, skill_area, listening_clip_id, cefr_level, content, sort_order)
select 'mcq'::exercise_type, 'listening'::skill_area, lc.id, lc.cefr_level, gen.content::jsonb, gen.sort_order
from public.listening_clips lc
join (values
  ('Grabbing Lunch', '{"prompt":"מה המשמעות של \"I''m kinda swamped\" בהקשר הזה?","options":["אני קצת עסוק/ה","אני קצת רעב/ה","אני קצת מבולבל/ת","אני קצת מאוחר/ת"],"correctIndex":0}', 1),
  ('Grabbing Lunch', '{"prompt":"מה באמת מבקש הדובר כשהוא אומר \"gimme five minutes\"?","options":["לתת לו חמישה דולר","לחכות לו חמש דקות","ללכת עוד חמש פעמים","חמש דקות פנויות בלוח הזמנים"],"correctIndex":1}', 2),
  ('Missed the Bus', '{"prompt":"מה המשמעות של \"that sucks\" בשיחה הזאת?","options":["איזה כיף","זה ממש לא נעים","זה לא משנה","בואו נלך"],"correctIndex":1}', 1),
  ('Missed the Bus', '{"prompt":"איך הגיב מקום העבודה למי שאיחר, לפי מה שנאמר?","options":["כעסו עליו/ה","אמרו שזה בסדר, שיגיע/תגיע כשאפשר","ביקשו ממנו/ה לא לבוא","לא ענו לטלפון"],"correctIndex":1}', 2),
  ('Weekend Plans, Kind Of', '{"prompt":"מה המשמעות של \"I kinda forgot about that\"?","options":["שכחתי מזה לגמרי, כבר הרבה זמן","כאילו שכחתי מזה, לא לגמרי","אף פעם לא ידעתי על זה","אני זוכר/ת את זה מצוין"],"correctIndex":1}', 1),
  ('Weekend Plans, Kind Of', '{"prompt":"באיזו שעה האח רוצה לצאת לטיול?","options":["שש בבוקר","תשע בבוקר","שתיים־עשרה בצהריים","שש בערב"],"correctIndex":0}', 2),
  ('Drive-Through Order', '{"prompt":"\"whaddya like to order\" הוא בעצם קיצור מדובר של איזה משפט?","options":["what do you like to order","what would you order","when did you order","what are you ordering"],"correctIndex":0}', 1),
  ('Drive-Through Order', '{"prompt":"מה הלקוח הזמין בסוף?","options":["צ''יזבורגר, צ''יפס קטן ומשקה","צ''יזבורגר וצ''יפס קטן בלבד, בלי משקה","רק משקה","צ''יזבורגר גדול ומשקה"],"correctIndex":1}', 2),
  ('Running Late', '{"prompt":"מה המשמעות של \"traffic''s insane right now\"?","options":["אין כלל תנועה בכביש","יש פקק נוראי בכביש","הרמזור מקולקל","הדובר נוהג מהר מדי"],"correctIndex":1}', 1),
  ('Running Late', '{"prompt":"\"ten, fifteen tops\" הכי קרוב במשמעות ל...","options":["בדיוק עשר דקות","לכל היותר חמש עשרה דקות","לפחות עשרים דקות","חמישה עשר ימים"],"correctIndex":1}', 2)
) as gen(title_en, content, sort_order)
  on lc.title_en = gen.title_en;

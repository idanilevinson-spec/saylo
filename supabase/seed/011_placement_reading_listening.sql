-- Extends the placement test from 2 skills (grammar, vocabulary) to 4
-- objectively-gradable skills by adding reading and listening questions,
-- and extends grammar/vocabulary coverage up to C1/C2 (previously topped
-- out at B2) to match the C1/C2 grammar content added in seed 009.
-- Writing is scored separately, inline, when the learner completes the
-- optional writing-sample step at the end of the test (see
-- src/app/api/ai/placement-summary/route.ts) — no seed content needed
-- for it. Speaking is scored from the learner's first graded AI
-- conversation, not from the placement test.
-- Run this AFTER migration 012_full_skill_diagnostics.sql has been
-- applied (adds placement_questions.audio_text).
-- Safe to re-run: only deletes the specific rows this file owns
-- (reading/listening entirely, grammar/vocabulary at C1/C2 only) —
-- leaves the original A1-B2 grammar/vocabulary questions from seed 005
-- untouched.

delete from public.placement_questions where skill_area in ('reading', 'listening');
delete from public.placement_questions where skill_area in ('grammar', 'vocabulary') and cefr_level in ('C1', 'C2');

insert into public.placement_questions (prompt, options, correct_index, skill_area, cefr_level, audio_text, sort_order) values
  ('Read: "Tom has a small dog. The dog is white and black. Tom takes the dog for a walk every morning." Question: What color is Tom''s dog?',
   '["Brown", "White and black", "Black only", "Grey"]', 1, 'reading', 'A1', null, 17),
  ('Read: "Maria works in a small shop in the city center. She opens the shop at nine and closes it at six. On Sundays, the shop is closed." Question: When is Maria''s shop closed?',
   '["Every day", "On Sundays", "In the morning", "At nine"]', 1, 'reading', 'A2', null, 18),
  ('Read: "Although it was raining heavily, David decided to go for his usual run. He believes that exercise, even in bad weather, helps him stay focused during the day." Question: Why did David go running despite the rain?',
   '["He didn''t notice the rain", "He thinks exercise helps him focus", "Someone told him to", "He had no choice"]', 1, 'reading', 'B1', null, 19),
  ('Read: "The committee has postponed its decision until further research can be conducted, as several members expressed concerns that the current data was insufficient to justify such a significant policy change." Question: Why did the committee postpone its decision?',
   '["They ran out of time", "Members felt the data was not enough", "The policy was rejected", "They agreed unanimously"]', 1, 'reading', 'B2', null, 20),
  ('Listen and answer: What is the girl''s name?',
   '["Sara", "Anna", "Maria", "Dana"]', 0, 'listening', 'A1', 'My name is Sara. I am ten years old.', 21),
  ('Listen and answer: Where are they going this weekend?',
   '["To the mountains", "To the beach", "To school", "To a restaurant"]', 1, 'listening', 'A2', 'We are going to the beach this weekend if the weather is nice.', 22),
  ('Listen and answer: What does the speaker say about tennis?',
   '["They still play every week", "They never played it", "They used to play but don''t anymore", "They are learning to play now"]', 2, 'listening', 'B1', 'I used to play tennis every week, but now I don''t have enough free time.', 23),
  ('Listen and answer: What happened despite the traffic?',
   '["They missed their flight", "They arrived on time for their flight", "They cancelled the trip", "They took a different flight"]', 1, 'listening', 'B2', 'Despite the traffic, we managed to arrive at the airport just in time to catch our flight.', 24),
  ('Not only ___ late, but he also forgot the documents.',
   '["he was", "was he", "he is", "is he"]', 1, 'grammar', 'C1', null, 25),
  ('I wish I ___ harder when I was younger; I might have a different career now.',
   '["studied", "had studied", "would study", "have studied"]', 1, 'grammar', 'C2', null, 26),
  ('Choose the word closest in meaning to "meticulous":',
   '["Careless", "Extremely careful and precise", "Very fast", "Somewhat lazy"]', 1, 'vocabulary', 'C1', null, 27),
  ('What does the idiom "to read between the lines" mean?',
   '["To read very slowly", "To understand the hidden meaning", "To skip parts of a text", "To read out loud"]', 1, 'vocabulary', 'C2', null, 28);

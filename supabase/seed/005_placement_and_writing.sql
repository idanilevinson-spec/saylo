-- Placement test questions + writing prompts (Phase 5).
-- Run this AFTER migration 004_ai_features.sql has been applied.
-- Safe to re-run: existing rows for this content are cleared first.

-- ============ PLACEMENT QUESTIONS (16, spanning A1-B2) ============

delete from public.placement_questions;

insert into public.placement_questions (prompt, options, correct_index, skill_area, cefr_level, sort_order) values
  ('She ___ a teacher.', '["am", "is", "are", "be"]', 1, 'grammar', 'A1', 1),
  ('They ___ from Israel.', '["is", "am", "are", "be"]', 2, 'grammar', 'A1', 2),
  ('What is the English word for "כלב"?', '["cat", "dog", "bird", "fish"]', 1, 'vocabulary', 'A1', 3),
  ('Choose the correct color: The sky is ___.', '["red", "blue", "brown", "black"]', 1, 'vocabulary', 'A1', 4),
  ('I ___ to the market yesterday.', '["go", "went", "goes", "going"]', 1, 'grammar', 'A2', 5),
  ('She ___ like coffee.', '["don''t", "doesn''t", "isn''t", "not"]', 1, 'grammar', 'A2', 6),
  ('She is looking ___ her keys.', '["for", "at", "up", "after"]', 0, 'vocabulary', 'A2', 7),
  ('What is the opposite of "big"?', '["tall", "small", "fast", "heavy"]', 1, 'vocabulary', 'A2', 8),
  ('I ___ never been to London.', '["have", "has", "had", "having"]', 0, 'grammar', 'B1', 9),
  ('This book was written ___ a famous author.', '["by", "from", "with", "at"]', 0, 'grammar', 'B1', 10),
  ('Choose the correct synonym for "happy":', '["sad", "joyful", "angry", "tired"]', 1, 'vocabulary', 'B1', 11),
  ('What does "give up" mean?', '["to start", "to continue", "to stop trying", "to celebrate"]', 2, 'vocabulary', 'B1', 12),
  ('If I ___ more time, I would travel the world.', '["have", "had", "has", "will have"]', 1, 'grammar', 'B2', 13),
  ('By next year, she ___ her degree.', '["will finish", "will have finished", "finishes", "finished"]', 1, 'grammar', 'B2', 14),
  ('What does "break the ice" mean?', '["to be very cold", "to start a conversation", "to break something", "to finish a task"]', 1, 'vocabulary', 'B2', 15),
  ('Choose the correct word: The meeting was ___ due to bad weather.', '["put off", "put on", "put up", "put in"]', 0, 'vocabulary', 'B2', 16);

-- ============ WRITING PROMPTS ============

delete from public.writing_prompts;

insert into public.writing_prompts (title_he, prompt_en, cefr_level, sort_order) values
  ('הציגו את עצמכם', 'Write 3-4 sentences about yourself: your name, where you are from, and what you like.', 'A1', 1),
  ('היום שלי', 'Describe your typical day. What time do you wake up? What do you do during the day?', 'A2', 2),
  ('המקום האהוב עליי', 'Write a short paragraph about your favorite place. Explain why you like it.', 'B1', 3),
  ('דעה אישית', 'Do you think technology makes life better or worse? Write a short paragraph explaining your opinion with reasons.', 'B2', 4);

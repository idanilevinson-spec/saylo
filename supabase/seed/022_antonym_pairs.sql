-- Content for the new "Match" arcade game's opposites round.
-- Run this AFTER migration 017_match_game.sql has been applied.
-- Safe to re-run: existing rows for this content are cleared first.

delete from public.vocabulary_antonym_pairs;

insert into public.vocabulary_antonym_pairs (word_en, opposite_en, cefr_level, sort_order) values
  ('hot', 'cold', 'A1', 1),
  ('big', 'small', 'A1', 2),
  ('happy', 'sad', 'A1', 3),
  ('fast', 'slow', 'A1', 4),
  ('day', 'night', 'A1', 5),
  ('up', 'down', 'A1', 6),
  ('open', 'closed', 'A1', 7),
  ('new', 'old', 'A1', 8),
  ('clean', 'dirty', 'A1', 9),
  ('easy', 'difficult', 'A2', 10),
  ('early', 'late', 'A2', 11),
  ('full', 'empty', 'A2', 12),
  ('loud', 'quiet', 'A2', 13),
  ('cheap', 'expensive', 'A2', 14),
  ('near', 'far', 'A2', 15),
  ('strong', 'weak', 'A2', 16),
  ('wide', 'narrow', 'A2', 17),
  ('safe', 'dangerous', 'A2', 18),
  ('polite', 'rude', 'B1', 19),
  ('generous', 'selfish', 'B1', 20),
  ('accept', 'refuse', 'B1', 21),
  ('increase', 'decrease', 'B1', 22),
  ('borrow', 'lend', 'B1', 23),
  ('victory', 'defeat', 'B1', 24),
  ('permanent', 'temporary', 'B1', 25),
  ('confident', 'insecure', 'B1', 26),
  ('flexible', 'rigid', 'B2', 27),
  ('optimistic', 'pessimistic', 'B2', 28),
  ('genuine', 'fake', 'B2', 29),
  ('reluctant', 'eager', 'B2', 30),
  ('ancient', 'modern', 'B2', 31),
  ('humble', 'arrogant', 'B2', 32),
  ('reveal', 'conceal', 'C1', 33),
  ('scarce', 'abundant', 'C1', 34),
  ('meticulous', 'careless', 'C1', 35),
  ('reject', 'endorse', 'C1', 36);

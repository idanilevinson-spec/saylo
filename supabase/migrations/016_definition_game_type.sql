-- Adds 'definition' as a valid vocabulary_game_sessions.game_type,
-- for the new "identify the word by its definition" game.

alter table public.vocabulary_game_sessions drop constraint if exists vocabulary_game_sessions_game_type_check;
alter table public.vocabulary_game_sessions add constraint vocabulary_game_sessions_game_type_check
  check (game_type in ('speed_round', 'spelling', 'daily_challenge', 'definition'));

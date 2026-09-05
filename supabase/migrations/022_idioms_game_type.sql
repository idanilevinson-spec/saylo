alter table public.vocabulary_game_sessions drop constraint if exists vocabulary_game_sessions_game_type_check;
alter table public.vocabulary_game_sessions add constraint vocabulary_game_sessions_game_type_check
  check (game_type in ('speed_round', 'spelling', 'daily_challenge', 'definition', 'match', 'word_catch', 'memory', 'learn', 'test', 'idioms'));

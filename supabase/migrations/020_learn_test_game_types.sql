-- Adds 'learn' and 'test' as valid vocabulary_game_sessions.game_type
-- values for the two new study modes, and a per-session `answers` jsonb
-- column so Test Mode can persist its per-question review data (what was
-- asked, what was answered, what was correct) without a new child table
-- — it's small, bounded (~12 entries), and owned 1:1 by the session row.
-- Learn Mode leaves this column null: its "what was learned" state is
-- already fully captured in srs_items, which is the point of building
-- Learn on top of SRS rather than a parallel structure.
--
-- 'match', 'word_catch', and 'memory' were already valid in this
-- constraint since migrations 017/018 — src/types/database.ts's
-- VocabularyGameType had drifted out of sync with it (missing all
-- three), fixed alongside this same change.

alter table public.vocabulary_game_sessions drop constraint if exists vocabulary_game_sessions_game_type_check;
alter table public.vocabulary_game_sessions add constraint vocabulary_game_sessions_game_type_check
  check (game_type in ('speed_round', 'spelling', 'daily_challenge', 'definition', 'match', 'word_catch', 'memory', 'learn', 'test'));

alter table public.vocabulary_game_sessions add column if not exists answers jsonb;

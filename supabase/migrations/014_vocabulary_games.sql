-- Session-level tracking for the new vocabulary arcade (Speed Round,
-- Spelling Challenge, Daily Challenge) — per-word correctness still
-- flows through the existing srs_items/exercise_attempts machinery via
-- updateSrsForVocabularyItem and recordAttempt; this table only tracks
-- the session summary (score, accuracy) for the arcade's own stats view.

create table public.vocabulary_game_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  game_type text not null check (game_type in ('speed_round', 'spelling', 'daily_challenge')),
  total_questions int not null,
  correct_count int not null,
  xp_awarded int not null default 0,
  created_at timestamptz not null default now()
);

create index vocabulary_game_sessions_profile_idx on public.vocabulary_game_sessions (profile_id, created_at);

alter table public.vocabulary_game_sessions enable row level security;

create policy "users manage their own game sessions"
  on public.vocabulary_game_sessions for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

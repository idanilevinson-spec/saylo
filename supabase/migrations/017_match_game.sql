-- Adds the "Match" arcade game: drag one word onto its pair to draw a
-- connecting line between them. Three round types share this one game —
-- translation and sentences reuse existing vocabulary_items content,
-- but "opposites" (antonym pairs) has no equivalent data anywhere yet,
-- so this migration also adds a small dedicated table for it.

create table public.vocabulary_antonym_pairs (
  id uuid primary key default gen_random_uuid(),
  word_en text not null,
  opposite_en text not null,
  cefr_level cefr_level not null,
  sort_order int not null default 0,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

alter table public.vocabulary_antonym_pairs enable row level security;

create policy "published antonym pairs are viewable by authenticated users"
  on public.vocabulary_antonym_pairs for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

alter table public.vocabulary_game_sessions drop constraint if exists vocabulary_game_sessions_game_type_check;
alter table public.vocabulary_game_sessions add constraint vocabulary_game_sessions_game_type_check
  check (game_type in ('speed_round', 'spelling', 'daily_challenge', 'definition', 'match'));

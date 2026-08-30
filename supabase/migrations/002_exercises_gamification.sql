-- Phase 3: exercises, SRS, gamification.
-- Run this against a project that already has migration 001 applied.

-- ============ ENUMS ============

create type exercise_type as enum ('mcq', 'fill_blank', 'match', 'reorder');

-- ============ EXERCISES ============
-- Polymorphic content: shape of `content` depends on `type`.
--   mcq        -> { prompt, options: string[], correctIndex }
--   fill_blank -> { sentence (contains "___"), correctAnswer, hint? }
--   match      -> { pairs: { left, right }[] }
--   reorder    -> { tokens: string[], correctOrder: number[] }
-- Validated by a Zod discriminated union in src/types/exercises.ts at every
-- write path — Postgres can't enforce this shape itself.

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  type exercise_type not null,
  skill_area skill_area not null,
  topic_id uuid references public.topics(id) on delete cascade,
  grammar_topic_id uuid references public.grammar_topics(id) on delete cascade,
  vocabulary_item_id uuid references public.vocabulary_items(id) on delete cascade,
  cefr_level cefr_level not null,
  content jsonb not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index exercises_topic_idx on public.exercises (topic_id, sort_order);
create index exercises_grammar_topic_idx on public.exercises (grammar_topic_id, sort_order);
create index exercises_vocabulary_item_idx on public.exercises (vocabulary_item_id);

create table public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  response jsonb not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create index exercise_attempts_profile_idx on public.exercise_attempts (profile_id, created_at);

-- ============ SPACED REPETITION (SM-2) ============
-- Scoped to vocabulary for now — the spec's "Daily Review" is a vocabulary
-- feature; other item types can extend this later if needed.

create table public.srs_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  vocabulary_item_id uuid not null references public.vocabulary_items(id) on delete cascade,
  ease_factor real not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  due_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, vocabulary_item_id)
);

create index srs_items_due_idx on public.srs_items (profile_id, due_at);

create table public.srs_review_log (
  id uuid primary key default gen_random_uuid(),
  srs_item_id uuid not null references public.srs_items(id) on delete cascade,
  grade smallint not null check (grade between 0 and 5),
  reviewed_at timestamptz not null default now()
);

-- ============ GAMIFICATION ============

create table public.user_xp (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  total_xp int not null default 0,
  current_level int not null default 1,
  updated_at timestamptz not null default now()
);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source text not null,
  amount int not null,
  created_at timestamptz not null default now()
);

create index xp_events_profile_idx on public.xp_events (profile_id, created_at);

create table public.streaks (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_he text not null,
  description_he text not null,
  icon text not null,
  criteria jsonb not null,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (profile_id, badge_id)
);

-- ============ ROW LEVEL SECURITY ============

alter table public.exercises enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.srs_items enable row level security;
alter table public.srs_review_log enable row level security;
alter table public.user_xp enable row level security;
alter table public.xp_events enable row level security;
alter table public.streaks enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

create policy "published exercises are viewable by authenticated users"
  on public.exercises for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "users manage their own exercise attempts"
  on public.exercise_attempts for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users manage their own srs items"
  on public.srs_items for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users manage their own srs review log"
  on public.srs_review_log for all
  to authenticated
  using (
    exists (select 1 from public.srs_items s where s.id = srs_item_id and s.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.srs_items s where s.id = srs_item_id and s.profile_id = auth.uid())
  );

create policy "users manage their own xp"
  on public.user_xp for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users manage their own xp events"
  on public.xp_events for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users manage their own streak"
  on public.streaks for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "badges are viewable by authenticated users"
  on public.badges for select
  to authenticated
  using (true);

create policy "users manage their own badges"
  on public.user_badges for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

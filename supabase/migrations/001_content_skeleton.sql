-- Phase 2: content skeleton — vocabulary, grammar, learning path, skill levels.
-- Run this against a project that already has schema.sql (Phase 1) applied.

-- ============ ENUMS ============

create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

create type content_status as enum ('draft', 'ai_generated_pending_review', 'published');

create type skill_area as enum ('vocabulary', 'grammar', 'listening', 'reading', 'writing', 'speaking');

create type learning_path_node_type as enum ('vocabulary_topic', 'grammar_topic');

-- ============ VOCABULARY ============

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_he text not null,
  name_en text not null,
  cefr_level cefr_level not null,
  sort_order int not null default 0,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

create index topics_cefr_level_idx on public.topics (cefr_level);

create table public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  headword text not null,
  ipa text,
  part_of_speech text,
  translation_he text not null,
  example_en text not null,
  cefr_level cefr_level not null,
  sort_order int not null default 0,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

create index vocabulary_items_topic_idx on public.vocabulary_items (topic_id, sort_order);

-- ============ GRAMMAR ============

create table public.grammar_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_he text not null,
  name_en text not null,
  cefr_level cefr_level not null,
  sort_order int not null default 0,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

create index grammar_topics_cefr_level_idx on public.grammar_topics (cefr_level);

create table public.grammar_lessons (
  id uuid primary key default gen_random_uuid(),
  grammar_topic_id uuid not null references public.grammar_topics(id) on delete cascade,
  title_he text not null,
  body_md text not null,
  cefr_level cefr_level not null,
  sort_order int not null default 0,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

create index grammar_lessons_topic_idx on public.grammar_lessons (grammar_topic_id, sort_order);

-- ============ LEARNING PATH ============
-- Polymorphic: node_type + ref_id point at either topics.id or
-- grammar_topics.id. No FK constraint is possible across the two target
-- tables, so app code must validate ref_id against the right table for
-- node_type when writing (admin CMS, later phase).

create table public.learning_path_nodes (
  id uuid primary key default gen_random_uuid(),
  node_type learning_path_node_type not null,
  ref_id uuid not null,
  cefr_level cefr_level not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index learning_path_nodes_sort_idx on public.learning_path_nodes (sort_order);

create table public.user_learning_path_progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  node_id uuid not null references public.learning_path_nodes(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  primary key (profile_id, node_id)
);

-- ============ SKILL LEVELS ============

create table public.skill_levels (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill skill_area not null,
  cefr_level cefr_level not null default 'A1',
  updated_at timestamptz not null default now(),
  primary key (profile_id, skill)
);

-- ============ ROW LEVEL SECURITY ============

alter table public.topics enable row level security;
alter table public.vocabulary_items enable row level security;
alter table public.grammar_topics enable row level security;
alter table public.grammar_lessons enable row level security;
alter table public.learning_path_nodes enable row level security;
alter table public.user_learning_path_progress enable row level security;
alter table public.skill_levels enable row level security;

-- content tables: published rows are readable by any signed-in user;
-- admins can also see draft/pending rows for review. Writes go through the
-- service-role admin client (bypasses RLS), so no write policies exist yet.
create policy "published topics are viewable by authenticated users"
  on public.topics for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "published vocabulary is viewable by authenticated users"
  on public.vocabulary_items for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "published grammar topics are viewable by authenticated users"
  on public.grammar_topics for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "published grammar lessons are viewable by authenticated users"
  on public.grammar_lessons for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "learning path nodes are viewable by authenticated users"
  on public.learning_path_nodes for select
  to authenticated
  using (true);

-- user-owned tables
create policy "users manage their own learning path progress"
  on public.user_learning_path_progress for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users manage their own skill levels"
  on public.skill_levels for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

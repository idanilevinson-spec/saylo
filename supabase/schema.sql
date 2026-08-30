-- English Environment schema for Supabase (Postgres + RLS)
-- Phase 1: profiles + guardian links (guardian_links is schema-only for now —
-- the real parental-consent flow ships alongside mic/Speaking features later).
--
-- How to apply: paste this whole file into the Supabase SQL Editor and run it
-- (Project -> SQL Editor -> New query). Also requires: enabling Email auth
-- and, if desired, the Google provider under Authentication -> Providers.

-- ============ ENUMS ============

create type age_band as enum ('child', 'teen', 'adult');

create type parental_consent_status as enum ('not_required', 'pending', 'granted', 'denied');

-- ============ USERS ============
-- Extends Supabase's built-in auth.users (id matches auth.users.id)

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  age smallint not null check (age >= 4 and age < 120),
  age_band age_band not null,
  native_language text not null default 'he',
  parental_consent_status parental_consent_status not null default 'not_required',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ HELPERS ============
-- is_admin runs as the table owner so it can be safely called from other RLS
-- policies (e.g. profiles select below) without recursive-policy issues —
-- same pattern as blocked_user_ids() in the sibling FOMO project's schema.

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = uid), false)
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- ============ GUARDIAN LINKS ============
-- Schema only for now — no app code writes to this table yet.

create table public.guardian_links (
  id uuid primary key default gen_random_uuid(),
  minor_profile_id uuid not null references public.profiles(id) on delete cascade,
  guardian_email text not null,
  consent_token text,
  status parental_consent_status not null default 'pending',
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index guardian_links_minor_idx on public.guardian_links (minor_profile_id);

-- ============ ROW LEVEL SECURITY ============

alter table public.profiles enable row level security;
alter table public.guardian_links enable row level security;

-- profiles: users manage only their own row; admins can view all
create policy "users can view their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- guardian_links: only the linked minor (via their profile) or an admin can view
create policy "minors and admins can view guardian links"
  on public.guardian_links for select
  to authenticated
  using (auth.uid() = minor_profile_id or public.is_admin(auth.uid()));

-- ============================================================
-- Phase 2: content skeleton (see supabase/migrations/001_content_skeleton.sql
-- for the version to run against a project that already has the above)
-- ============================================================

create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

create type content_status as enum ('draft', 'ai_generated_pending_review', 'published');

create type skill_area as enum ('vocabulary', 'grammar', 'listening', 'reading', 'writing', 'speaking');

create type conversation_topic_category as enum (
  'daily_life',
  'social',
  'travel',
  'work_professional',
  'academic',
  'health_wellbeing',
  'serious_topics',
  'entertainment_culture'
);

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

-- ============ ROW LEVEL SECURITY (Phase 2) ============

alter table public.topics enable row level security;
alter table public.vocabulary_items enable row level security;
alter table public.grammar_topics enable row level security;
alter table public.grammar_lessons enable row level security;
alter table public.learning_path_nodes enable row level security;
alter table public.user_learning_path_progress enable row level security;
alter table public.skill_levels enable row level security;

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

-- ============================================================
-- Phase 3: exercises, SRS, gamification (see
-- supabase/migrations/002_exercises_gamification.sql for the version to run
-- against a project that already has the above)
-- ============================================================

create type exercise_type as enum ('mcq', 'fill_blank', 'match', 'reorder');

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

-- ============================================================
-- Phase 4: reading, listening, idioms/phrasal verbs (see
-- supabase/migrations/003_reading_listening.sql for the version to run
-- against a project that already has the above). Audio is synthesized
-- client-side via the Web Speech API — no audio_url/storage needed.
-- ============================================================

create type idiom_type as enum ('idiom', 'phrasal_verb');

alter type exercise_type add value 'dictation';

create table public.reading_texts (
  id uuid primary key default gen_random_uuid(),
  title_he text not null,
  title_en text not null,
  body_en text not null,
  cefr_level cefr_level not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.listening_clips (
  id uuid primary key default gen_random_uuid(),
  title_he text not null,
  title_en text not null,
  transcript_en text not null,
  cefr_level cefr_level not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.idioms_phrasal_verbs (
  id uuid primary key default gen_random_uuid(),
  phrase text not null,
  type idiom_type not null,
  meaning_he text not null,
  example_en text not null,
  cefr_level cefr_level not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.exercises add column reading_text_id uuid references public.reading_texts(id) on delete cascade;
alter table public.exercises add column listening_clip_id uuid references public.listening_clips(id) on delete cascade;

create index exercises_reading_text_idx on public.exercises (reading_text_id, sort_order);
create index exercises_listening_clip_idx on public.exercises (listening_clip_id, sort_order);

alter table public.reading_texts enable row level security;
alter table public.listening_clips enable row level security;
alter table public.idioms_phrasal_verbs enable row level security;

create policy "published reading texts are viewable by authenticated users"
  on public.reading_texts for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "published listening clips are viewable by authenticated users"
  on public.listening_clips for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "published idioms are viewable by authenticated users"
  on public.idioms_phrasal_verbs for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

-- ============================================================
-- Phase 5: placement test, writing coach, AI usage log (see
-- supabase/migrations/004_ai_features.sql for the version to run against a
-- project that already has the above). AI Teacher suggestions call Claude
-- on demand and aren't persisted — no table needed for that part.
-- ============================================================

create table public.placement_questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  options jsonb not null,
  correct_index int not null,
  skill_area skill_area not null,
  cefr_level cefr_level not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.placement_tests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  result_cefr_overall cefr_level,
  result_summary_he text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.placement_test_responses (
  id uuid primary key default gen_random_uuid(),
  placement_test_id uuid not null references public.placement_tests(id) on delete cascade,
  question_id uuid not null references public.placement_questions(id),
  selected_index int not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create table public.writing_prompts (
  id uuid primary key default gen_random_uuid(),
  title_he text not null,
  prompt_en text not null,
  cefr_level cefr_level not null,
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  writing_prompt_id uuid not null references public.writing_prompts(id),
  submitted_text text not null,
  created_at timestamptz not null default now()
);

create table public.writing_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.writing_submissions(id) on delete cascade,
  overall_score int not null check (overall_score between 0 and 100),
  feedback_he text not null,
  improved_version text not null,
  created_at timestamptz not null default now()
);

create table public.ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  search_requests int not null default 0,
  created_at timestamptz not null default now()
);

create index ai_usage_log_profile_idx on public.ai_usage_log (profile_id, created_at);

alter table public.placement_questions enable row level security;
alter table public.placement_tests enable row level security;
alter table public.placement_test_responses enable row level security;
alter table public.writing_prompts enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.writing_feedback enable row level security;
alter table public.ai_usage_log enable row level security;

create policy "published placement questions are viewable by authenticated users"
  on public.placement_questions for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "users manage their own placement tests"
  on public.placement_tests for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users manage their own placement test responses"
  on public.placement_test_responses for all
  to authenticated
  using (
    exists (select 1 from public.placement_tests t where t.id = placement_test_id and t.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.placement_tests t where t.id = placement_test_id and t.profile_id = auth.uid())
  );

create policy "published writing prompts are viewable by authenticated users"
  on public.writing_prompts for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "users manage their own writing submissions"
  on public.writing_submissions for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users manage their own writing feedback"
  on public.writing_feedback for all
  to authenticated
  using (
    exists (select 1 from public.writing_submissions s where s.id = submission_id and s.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.writing_submissions s where s.id = submission_id and s.profile_id = auth.uid())
  );

create policy "users manage their own ai usage log"
  on public.ai_usage_log for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ============================================================
-- Phase 6: AI speaking, pronunciation schema, and the real parental-consent
-- flow (see supabase/migrations/005_speaking.sql for the version to run
-- against a project that already has the above).
-- ============================================================

create table public.conversation_scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_he text not null,
  title_en text not null,
  system_prompt text not null,
  cefr_level cefr_level not null,
  category conversation_topic_category not null default 'daily_life',
  status content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  scenario_id uuid references public.conversation_scenarios(id),
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index conversations_profile_idx on public.conversations (profile_id, created_at);

create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index conversation_messages_conversation_idx on public.conversation_messages (conversation_id, created_at);

create table public.conversation_scores (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references public.conversations(id) on delete cascade,
  fluency_score int not null check (fluency_score between 0 and 100),
  grammar_score int not null check (grammar_score between 0 and 100),
  vocabulary_score int not null check (vocabulary_score between 0 and 100),
  overall_score int not null check (overall_score between 0 and 100),
  feedback jsonb not null,
  created_at timestamptz not null default now()
);

create table public.pronunciation_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  target_phrase text not null,
  audio_url text,
  provider text,
  score jsonb,
  created_at timestamptz not null default now()
);

alter table public.guardian_links alter column consent_token set default gen_random_uuid()::text;

create policy "minors can request consent for themselves"
  on public.guardian_links for insert
  to authenticated
  with check (auth.uid() = minor_profile_id);

create or replace function public.get_guardian_consent_info(p_token text)
returns table (minor_display_name text, minor_age smallint, guardian_email text, status text)
language sql
security definer
set search_path = public
stable
as $$
  select p.display_name, p.age, gl.guardian_email, gl.status
  from public.guardian_links gl
  join public.profiles p on p.id = gl.minor_profile_id
  where gl.consent_token = p_token
$$;

grant execute on function public.get_guardian_consent_info(text) to anon, authenticated;

create or replace function public.resolve_guardian_consent(p_token text, p_approve boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link record;
begin
  select * into v_link from public.guardian_links where consent_token = p_token and status = 'pending';
  if not found then
    return false;
  end if;

  update public.guardian_links
  set status = case when p_approve then 'granted' else 'denied' end::parental_consent_status,
      resolved_at = now()
  where id = v_link.id;

  update public.profiles
  set parental_consent_status = case when p_approve then 'granted' else 'denied' end::parental_consent_status
  where id = v_link.minor_profile_id;

  return true;
end;
$$;

grant execute on function public.resolve_guardian_consent(text, boolean) to anon, authenticated;

alter table public.conversation_scenarios enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.conversation_scores enable row level security;
alter table public.pronunciation_attempts enable row level security;

create policy "published scenarios are viewable by authenticated users"
  on public.conversation_scenarios for select
  to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

create policy "users manage their own conversations"
  on public.conversations for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users manage their own conversation messages"
  on public.conversation_messages for all
  to authenticated
  using (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.profile_id = auth.uid())
  );

create policy "users manage their own conversation scores"
  on public.conversation_scores for all
  to authenticated
  using (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.profile_id = auth.uid())
  );

create policy "users manage their own pronunciation attempts"
  on public.pronunciation_attempts for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ============================================================
-- Phase 7: subscriptions, hearts (see
-- supabase/migrations/006_subscriptions.sql for the version to run against
-- a project that already has the above).
-- ============================================================

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  months int not null,
  price_ils numeric(10, 2) not null,
  stripe_price_id text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'canceled', 'past_due', 'expired')),
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hearts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  current_hearts int not null default 5,
  max_hearts int not null default 5,
  last_regen_at timestamptz not null default now()
);

alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.hearts enable row level security;

create policy "subscription plans are viewable by authenticated users"
  on public.subscription_plans for select
  to authenticated
  using (true);

create policy "users view their own subscription"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "users manage their own hearts"
  on public.hearts for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ============================================================
-- Phase 8: admin CMS — content moderation reports, admin audit trail, and
-- the write/read RLS policies the admin screens need (see
-- supabase/migrations/007_admin.sql for the version to run against a
-- project that already has the above).
-- ============================================================

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index content_reports_status_idx on public.content_reports (status, created_at);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_profile_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_admin_idx on public.admin_audit_log (admin_profile_id, created_at);

alter table public.content_reports enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "admins manage content reports"
  on public.content_reports for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "admins manage audit log"
  on public.admin_audit_log for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "admins manage topics"
  on public.topics for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage vocabulary items"
  on public.vocabulary_items for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage grammar topics"
  on public.grammar_topics for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage grammar lessons"
  on public.grammar_lessons for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage exercises"
  on public.exercises for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage reading texts"
  on public.reading_texts for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage listening clips"
  on public.listening_clips for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage idioms"
  on public.idioms_phrasal_verbs for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage placement questions"
  on public.placement_questions for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage writing prompts"
  on public.writing_prompts for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage conversation scenarios"
  on public.conversation_scenarios for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins can view all subscriptions"
  on public.subscriptions for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins can view all user_xp"
  on public.user_xp for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins can view all streaks"
  on public.streaks for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins can view all hearts"
  on public.hearts for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins can view all xp_events"
  on public.xp_events for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins can view all exercise_attempts"
  on public.exercise_attempts for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins can view all placement_tests"
  on public.placement_tests for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins can view all conversations"
  on public.conversations for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins can view all conversation_messages"
  on public.conversation_messages for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "admins can view all conversation_scores"
  on public.conversation_scores for select to authenticated
  using (public.is_admin(auth.uid()));

-- ============================================================
-- Phase 9: notifications — web push subscriptions and per-user
-- notification preferences (see supabase/migrations/008_notifications.sql
-- for the version to run against a project that already has the above).
-- ============================================================

alter table public.profiles add column email_reminders_enabled boolean not null default true;
alter table public.profiles add column push_reminders_enabled boolean not null default true;

alter table public.streaks add column last_reminder_sent_at timestamptz;

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_profile_idx on public.push_subscriptions (profile_id);

alter table public.push_subscriptions enable row level security;

create policy "users manage their own push subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

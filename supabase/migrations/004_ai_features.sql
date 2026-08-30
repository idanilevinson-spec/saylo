-- Phase 5: placement test, writing coach, AI usage log.
-- Run this against a project that already has migration 003 applied.
-- AI Teacher suggestions (dashboard) call Claude on demand and aren't
-- persisted — no table needed for that part.

-- ============ PLACEMENT TEST ============
-- Standalone question bank (not the exercises table): a placement test is a
-- linear one-shot assessment, not a topic-linked practice session, and
-- answering it doesn't award XP/SRS like normal exercises do.

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

-- ============ WRITING COACH ============

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

-- ============ AI USAGE LOG ============
-- Per-user cost visibility for every Claude call made on their behalf.

create table public.ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  created_at timestamptz not null default now()
);

create index ai_usage_log_profile_idx on public.ai_usage_log (profile_id, created_at);

-- ============ ROW LEVEL SECURITY ============

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

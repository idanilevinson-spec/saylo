-- Phase 8: Admin CMS — content moderation reports, an admin audit trail, and
-- the write/read RLS policies the admin screens need that earlier phases
-- didn't add (content tables had select-only policies; user-owned tables
-- like subscriptions/streaks/conversations had no admin-visibility bypass).
-- Run this against a project that already has migration 006 applied.

-- ============ CONTENT REPORTS (moderation queue) ============
-- reporter_profile_id is nullable so a report survives the reporter's
-- account being deleted; admins are the only reporters for now (no
-- end-user "report" button exists yet), but the shape allows one later.

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

-- ============ ADMIN AUDIT LOG ============

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

drop policy if exists "admins manage content reports" on public.content_reports;
create policy "admins manage content reports"
  on public.content_reports for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage audit log" on public.admin_audit_log;
create policy "admins manage audit log"
  on public.admin_audit_log for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============ ADMIN WRITE ACCESS ON CONTENT TABLES ============
-- These tables only had a select policy (published-or-admin) — nobody could
-- insert/update/delete at all. Add an admin-only "for all" policy alongside
-- the existing select policy; regular users are unaffected.

drop policy if exists "admins manage topics" on public.topics;
create policy "admins manage topics"
  on public.topics for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage vocabulary items" on public.vocabulary_items;
create policy "admins manage vocabulary items"
  on public.vocabulary_items for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage grammar topics" on public.grammar_topics;
create policy "admins manage grammar topics"
  on public.grammar_topics for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage grammar lessons" on public.grammar_lessons;
create policy "admins manage grammar lessons"
  on public.grammar_lessons for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage exercises" on public.exercises;
create policy "admins manage exercises"
  on public.exercises for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage reading texts" on public.reading_texts;
create policy "admins manage reading texts"
  on public.reading_texts for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage listening clips" on public.listening_clips;
create policy "admins manage listening clips"
  on public.listening_clips for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage idioms" on public.idioms_phrasal_verbs;
create policy "admins manage idioms"
  on public.idioms_phrasal_verbs for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage placement questions" on public.placement_questions;
create policy "admins manage placement questions"
  on public.placement_questions for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage writing prompts" on public.writing_prompts;
create policy "admins manage writing prompts"
  on public.writing_prompts for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins manage conversation scenarios" on public.conversation_scenarios;
create policy "admins manage conversation scenarios"
  on public.conversation_scenarios for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============ ADMIN READ VISIBILITY ON USER-OWNED TABLES ============
-- Additive select-only policies so the admin dashboard/users/analytics/
-- moderation screens can see across all users. Existing owner policies are
-- untouched, so regular users keep exactly the access they had before.

drop policy if exists "admins can view all subscriptions" on public.subscriptions;
create policy "admins can view all subscriptions"
  on public.subscriptions for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can view all user_xp" on public.user_xp;
create policy "admins can view all user_xp"
  on public.user_xp for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can view all streaks" on public.streaks;
create policy "admins can view all streaks"
  on public.streaks for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can view all hearts" on public.hearts;
create policy "admins can view all hearts"
  on public.hearts for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can view all xp_events" on public.xp_events;
create policy "admins can view all xp_events"
  on public.xp_events for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can view all exercise_attempts" on public.exercise_attempts;
create policy "admins can view all exercise_attempts"
  on public.exercise_attempts for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can view all placement_tests" on public.placement_tests;
create policy "admins can view all placement_tests"
  on public.placement_tests for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can view all conversations" on public.conversations;
create policy "admins can view all conversations"
  on public.conversations for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can view all conversation_messages" on public.conversation_messages;
create policy "admins can view all conversation_messages"
  on public.conversation_messages for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can view all conversation_scores" on public.conversation_scores;
create policy "admins can view all conversation_scores"
  on public.conversation_scores for select to authenticated
  using (public.is_admin(auth.uid()));

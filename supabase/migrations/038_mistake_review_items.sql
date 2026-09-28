-- "Mistake notebook" (docs/specs/mistake-notebook.md): one spaced-repetition
-- queue across mistake sources beyond vocabulary (which keeps living in the
-- existing srs_items — deliberately not touched here, see the spec's §2 for
-- why). item_type/item_ref follows the same generic pattern
-- content_reports (migration 007) and learner_pattern_observations
-- (migration 033) already established in this codebase.
--
-- 'pattern' is in the check constraint for when Pattern Coach's drills are
-- eventually teacher-reviewed or owner-disclosed (see
-- docs/specs/hebrew-pattern-coach.md), but nothing writes that item_type
-- yet — only 'grammar_topic' does, per the spec's phased rollout (§7.3).
--
-- RLS: client-writable, per the spec's own §6 decision — this is cosmetic
-- review-scheduling data (like XP, streaks, srs_items itself), not a
-- security boundary, so it gets the same trust level as those rather than
-- the service-role-only lockdown that guardian consent or subscription
-- fields need.

create table public.mistake_review_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('grammar_topic', 'pattern')),
  item_ref text not null,
  ease_factor numeric not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  due_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, item_type, item_ref)
);

create index mistake_review_items_due_idx on public.mistake_review_items (profile_id, due_at);

alter table public.mistake_review_items enable row level security;

create policy "users manage their own mistake review items"
  on public.mistake_review_items for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

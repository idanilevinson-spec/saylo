-- Bagrut track: which study-unit level (3/4/5 יח"ל) a learner is preparing
-- for, the Bagrut-format section of the placement test, and per-practice-set
-- progress in /bagrut.

-- null = not preparing for the Bagrut (or hasn't said). Asked at the start of
-- the placement test, changeable on /bagrut. Ordinary learner preference, so
-- the "update own row" policy covers it (migration 031's guard only blocks
-- is_admin / age_band / parental_consent_status).
alter table public.profiles
  add column bagrut_units smallint check (bagrut_units in (3, 4, 5));

-- The placement test's optional Bagrut-format section. Kept apart from the
-- CEFR skill scores on purpose: it's a different question ("how ready for
-- this exam's format") and mixing it in would shift the CEFR calibration.
alter table public.placement_tests
  add column bagrut_units smallint check (bagrut_units in (3, 4, 5)),
  add column bagrut_percent smallint check (bagrut_percent between 0 and 100);

-- One row per practice set a learner has worked through. Only the
-- multiple-choice questions are counted — open questions and the writing
-- task are self-checked against a model answer, not graded.
create table public.bagrut_unit_progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  module_code text not null check (module_code in ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  unit_slug text not null,
  mc_correct smallint not null check (mc_correct >= 0),
  mc_total smallint not null check (mc_total > 0 and mc_correct <= mc_total),
  best_percent smallint not null check (best_percent between 0 and 100),
  attempts int not null default 1,
  completed_at timestamptz not null default now(),
  primary key (profile_id, module_code, unit_slug)
);

alter table public.bagrut_unit_progress enable row level security;

create policy "own bagrut progress"
  on public.bagrut_unit_progress for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "admins read bagrut progress"
  on public.bagrut_unit_progress for select
  to authenticated
  using (public.is_admin(auth.uid()));

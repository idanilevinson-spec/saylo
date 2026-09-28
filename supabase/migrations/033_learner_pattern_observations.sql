-- "Hebrew Pattern Coach" (docs/specs/hebrew-pattern-coach.md): counts of
-- which of the 15 closed Hebrew-transfer mistake patterns show up in a
-- learner's writing and conversations, so "My Patterns" can show what
-- actually keeps recurring for them — and whether it's improving.
--
-- No submitted text is stored here, only codes and counts (the text itself
-- already lives in writing_submissions / conversation_messages). Following
-- the guardian_links lesson (migration 031): a client that could insert its
-- own rows here could fabricate "improvement", so writes only ever happen
-- through the service role (src/lib/patterns/recordObservations.ts) —
-- authenticated users get select on their own rows and nothing else.

create table public.learner_pattern_observations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('writing', 'conversation')),
  source_id uuid not null,
  pattern_code text not null,
  occurrences int not null check (occurrences between 1 and 20),
  sample_words int not null check (sample_words > 0),
  created_at timestamptz not null default now(),
  unique (source, source_id, pattern_code)
);

create index learner_pattern_observations_profile_created_idx
  on public.learner_pattern_observations (profile_id, created_at desc);

alter table public.learner_pattern_observations enable row level security;

create policy "users view their own pattern observations"
  on public.learner_pattern_observations for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "admins view all pattern observations"
  on public.learner_pattern_observations for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Deliberately no insert/update/delete policy for authenticated or anon:
-- every write goes through the service role.
revoke all on public.learner_pattern_observations from anon, authenticated;
grant select on public.learner_pattern_observations to authenticated;

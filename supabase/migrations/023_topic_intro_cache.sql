-- Shared cache for AI-generated "teacher explains the topic" intros shown
-- before a learner starts practicing a vocabulary topic. One row per topic,
-- shared by every user (not per-profile like teacher_suggestion_cache) —
-- the explanation is the same for everyone studying that topic.

create table public.topic_intro_cache (
  topic_id uuid primary key references public.topics(id) on delete cascade,
  intro_he text not null,
  created_at timestamptz not null default now()
);

alter table public.topic_intro_cache enable row level security;

create policy "authenticated users can read topic intro cache"
  on public.topic_intro_cache for select
  to authenticated
  using (true);

-- Any signed-in user may populate the shared cache (whoever is first to view
-- a topic generates it for everyone after). The content is derived only from
-- public topic/vocabulary metadata, so this is safe to leave open.
create policy "authenticated users can write topic intro cache"
  on public.topic_intro_cache for insert
  to authenticated
  with check (true);

create policy "authenticated users can update topic intro cache"
  on public.topic_intro_cache for update
  to authenticated
  using (true)
  with check (true);

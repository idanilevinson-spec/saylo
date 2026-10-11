-- 038: (1) create teacher_suggestion_cache, which migration 011 defines but
-- never reached production (checked: it is the only migration table
-- missing). Without it the dashboard tip was never cached, so every
-- dashboard visit made a new paid AI call. Only the table part of 011 is
-- repeated here: 011's writing-limit function was later replaced by 013,
-- and re-running all of 011 would revert that.
-- (2) clear the cached vocabulary topic intros written under the old "warm
-- and encouraging" prompt, so they regenerate in the new plain voice.
-- Safe to re-run. Touches only cached AI text, nothing a learner wrote.

create table if not exists public.teacher_suggestion_cache (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  suggestion text not null,
  created_at timestamptz not null default now()
);

alter table public.teacher_suggestion_cache enable row level security;

drop policy if exists "users manage their own teacher suggestion cache" on public.teacher_suggestion_cache;

create policy "users manage their own teacher suggestion cache"
  on public.teacher_suggestion_cache for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

delete from public.topic_intro_cache;

-- Check: the table exists now (0 rows), and no old intros are left (0).
select
  (select count(*) from public.teacher_suggestion_cache) as tips_cached,
  (select count(*) from public.topic_intro_cache) as topic_intros_left;

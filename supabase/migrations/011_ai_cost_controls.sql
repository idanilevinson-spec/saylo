-- Extends the cost controls added for conversations to the other two AI
-- features that had none: writing coach submissions get the same
-- rolling-24h daily-limit trigger pattern, and teacher suggestions get a
-- cache table so the dashboard (visited far more often than any other
-- page) stops calling Claude on every single page load.
-- Run this against a project that already has migration 010 applied.
-- Safe to re-run.

create or replace function public.enforce_daily_writing_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  if public.is_admin(new.profile_id) then
    return new;
  end if;

  select count(*) into recent_count
  from public.writing_submissions
  where profile_id = new.profile_id
    and created_at >= now() - interval '24 hours';

  if recent_count >= 15 then
    raise exception 'daily_writing_limit_reached';
  end if;

  return new;
end;
$$;

drop trigger if exists writing_submissions_daily_limit on public.writing_submissions;

create trigger writing_submissions_daily_limit
  before insert on public.writing_submissions
  for each row
  execute function public.enforce_daily_writing_limit();

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

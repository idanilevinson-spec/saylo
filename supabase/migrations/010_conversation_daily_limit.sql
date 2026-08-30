-- Caps AI conversation practice (text or voice) at 5 new conversations per
-- profile in any rolling 24-hour window, so a single premium user can't
-- run up Claude/Azure costs unbounded. Enforced in the database (a
-- trigger, not just client/API code) so it holds regardless of insert
-- path. Admins are exempt, so QA/testing isn't rate-limited.
-- Run this against a project that already has migration 009 applied.
-- Safe to re-run.

create or replace function public.enforce_daily_conversation_limit()
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
  from public.conversations
  where profile_id = new.profile_id
    and created_at >= now() - interval '24 hours';

  if recent_count >= 5 then
    raise exception 'daily_conversation_limit_reached';
  end if;

  return new;
end;
$$;

drop trigger if exists conversations_daily_limit on public.conversations;

create trigger conversations_daily_limit
  before insert on public.conversations
  for each row
  execute function public.enforce_daily_conversation_limit();

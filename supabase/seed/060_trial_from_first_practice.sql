-- 060_trial_from_first_practice.sql: the free trial counts from the first
-- practice, not from sign-up.
--
-- Why: by 19.11.2026, 7 of 10 real sign-ups never practised, and their
-- trial ran out unused (trial_ends_at is set at sign-up by migration 032).
-- Now the learner's FIRST xp_event restarts a running or unused trial to
-- a full 3 days from that moment. It only ever extends: a later end date
-- is kept. Only rows still in status 'trialing' are touched; paid
-- ('active') and ended paid ('expired') rows are left alone.
--
-- Keep '3 days' in step with TRIAL_DAYS in src/lib/subscriptions/plans.ts
-- (the same rule as migration 032). Safe to run twice.

create or replace function public.start_trial_on_first_practice()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.xp_events
    where profile_id = new.profile_id and id <> new.id
  ) then
    return new;
  end if;

  update public.subscriptions
     set trial_ends_at = greatest(coalesce(trial_ends_at, now()), now() + interval '3 days'),
         updated_at = now()
   where profile_id = new.profile_id
     and status = 'trialing';
  return new;
end;
$$;

revoke all on function public.start_trial_on_first_practice() from public, anon, authenticated;

drop trigger if exists start_trial_on_first_practice on public.xp_events;
create trigger start_trial_on_first_practice
  after insert on public.xp_events
  for each row execute function public.start_trial_on_first_practice();

-- Check: should return one row, the trigger on xp_events.
select tgname, tgrelid::regclass from pg_trigger where tgname = 'start_trial_on_first_practice';

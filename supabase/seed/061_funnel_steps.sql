-- 061_funnel_steps.sql: anonymous counts of the steps between arriving on
-- the site and having an account (visit → trial lesson → signup form →
-- account), so we can see where people stop. Everything after signup is
-- already in the learner tables.
--
-- Anonymous on purpose, like marketing_visits (055): no IP, no cookie, no
-- user id. "flow" is a random id made in the visitor's page memory for one
-- page load and never stored on the device, so the steps of one visit can
-- be counted together and nothing else. Only the server writes (service
-- role through /api/funnel) and only the service role reads; RLS is on with
-- no policies. Rows older than 12 months are deleted by the daily
-- support-cleanup job, as the privacy page says.

create table if not exists public.funnel_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  flow text not null check (char_length(flow) between 8 and 32),
  step text not null check (step in (
    'visit', 'try_view', 'try_start', 'try_finish', 'try_signup_click',
    'signup_view', 'signup_terms_blocked', 'signup_submit', 'signup_error',
    'signup_email_sent', 'signup_done'
  )),
  source text not null check (char_length(source) <= 40),
  detail text check (char_length(detail) <= 80),
  device text not null check (device in ('mobile', 'tablet', 'desktop'))
);

create unique index if not exists funnel_events_flow_step_idx on public.funnel_events (flow, step);
create index if not exists funnel_events_created_at_idx on public.funnel_events (created_at);

alter table public.funnel_events enable row level security;
revoke all on public.funnel_events from anon, authenticated;

-- Check: should return one row with rowsecurity = true and 0 policies.
select c.relrowsecurity as rowsecurity,
       (select count(*) from pg_policies where schemaname = 'public' and tablename = 'funnel_events') as policies
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'funnel_events';

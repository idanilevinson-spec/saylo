-- 055_marketing_visits.sql: one row for every visit that arrives from a
-- marketing link (a utm_* tag) or straight from a social app, so the
-- social agent can see how many people each post brings in and when.
--
-- Anonymous on purpose: no IP, no cookie, no user id, nothing kept in the
-- browser. Only the server writes (service role through /api/visit), and
-- only the service role reads; RLS is on with no policies, so the anon and
-- authenticated keys see nothing. Rows older than 12 months are deleted by
-- the daily support-cleanup job, as the privacy page says.

create table if not exists public.marketing_visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  utm_content text check (char_length(utm_content) <= 100),
  utm_term text check (char_length(utm_term) <= 100),
  landing_path text not null check (char_length(landing_path) <= 200),
  referrer_host text check (char_length(referrer_host) <= 100),
  device text not null check (device in ('mobile', 'tablet', 'desktop'))
);

create index if not exists marketing_visits_created_at_idx on public.marketing_visits (created_at);

alter table public.marketing_visits enable row level security;
revoke all on public.marketing_visits from anon, authenticated;

-- Check: should return one row with rowsecurity = true and 0 policies.
select c.relrowsecurity as rowsecurity,
       (select count(*) from pg_policies where schemaname = 'public' and tablename = 'marketing_visits') as policies
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'marketing_visits';

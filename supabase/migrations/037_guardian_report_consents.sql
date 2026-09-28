-- "Ongoing parent report" (docs/specs/guardian-ongoing-report.md): a
-- SEPARATE, narrower consent from the existing voice-feature one
-- (guardian_links) — this one covers only a periodic, coarse activity
-- summary (days practiced, streak, XP, general CEFR level; never
-- conversation content or Pattern Coach data) sent to a consenting minor's
-- guardian. Kept in its own table rather than reusing guardian_links so
-- this feature's lifecycle (a parent or the minor can revoke it any time,
-- independent of the voice-feature consent) never touches the
-- security-hardened voice-consent flow from migration 031.
--
-- Same lesson as guardian_links: a minor's own session must never be able
-- to write this table directly (they could otherwise grant "consent" to
-- themselves) or read the token. All writes go through the service role
-- (src/app/api/guardian-report/*).

create table public.guardian_report_consents (
  id uuid primary key default gen_random_uuid(),
  minor_profile_id uuid not null references public.profiles(id) on delete cascade,
  guardian_email text not null,
  consent_token text not null default gen_random_uuid()::text,
  status text not null default 'pending' check (status in ('pending', 'granted', 'denied', 'revoked')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  -- One row per minor: a new request overwrites the previous one (new
  -- token, status back to 'pending') rather than accumulating history.
  unique (minor_profile_id)
);

create index guardian_report_consents_status_idx on public.guardian_report_consents (status);

alter table public.guardian_report_consents enable row level security;

create policy "minors and admins can view their own guardian report consent"
  on public.guardian_report_consents for select
  to authenticated
  using (auth.uid() = minor_profile_id or public.is_admin(auth.uid()));

-- No insert/update/delete policy for authenticated or anon: every write
-- goes through the service role. consent_token is never selectable by a
-- signed-in user — only the security-definer functions below can read it,
-- exactly like guardian_links' consent_token.
revoke all on public.guardian_report_consents from anon, authenticated;
grant select (id, minor_profile_id, guardian_email, status, created_at, resolved_at)
  on public.guardian_report_consents to authenticated;

-- The guardian isn't an app user — they act through a one-time-mailed
-- token link, not a session. Mirrors get_guardian_consent_info /
-- resolve_guardian_consent (migration 005/031) exactly.

create or replace function public.get_guardian_report_consent_info(p_token text)
returns table (minor_display_name text, guardian_email text, status text)
language sql
security definer
set search_path = public
stable
as $$
  select p.display_name, c.guardian_email, c.status
  from public.guardian_report_consents c
  join public.profiles p on p.id = c.minor_profile_id
  where c.consent_token = p_token
$$;

grant execute on function public.get_guardian_report_consent_info(text) to anon, authenticated;

create or replace function public.resolve_guardian_report_consent(p_token text, p_approve boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_consent record;
begin
  select * into v_consent from public.guardian_report_consents where consent_token = p_token and status = 'pending';
  if not found then
    return false;
  end if;

  update public.guardian_report_consents
  set status = case when p_approve then 'granted' else 'denied' end,
      resolved_at = now()
  where id = v_consent.id;

  return true;
end;
$$;

grant execute on function public.resolve_guardian_report_consent(text, boolean) to anon, authenticated;

-- Separate from resolve: unsubscribing after having already granted isn't
-- "deciding" a pending request, it's withdrawing a standing one — the
-- unsubscribe link in every report email uses this, and it works only
-- from 'granted' so it can't be used to interfere with a still-pending or
-- already-denied request.
create or replace function public.revoke_guardian_report_consent(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_consent record;
begin
  select * into v_consent from public.guardian_report_consents where consent_token = p_token and status = 'granted';
  if not found then
    return false;
  end if;

  update public.guardian_report_consents
  set status = 'revoked', resolved_at = now()
  where id = v_consent.id;

  return true;
end;
$$;

grant execute on function public.revoke_guardian_report_consent(text) to anon, authenticated;

-- Closes two ways a signed-in minor could grant their own parental consent
-- (or make themselves an admin) straight from the browser with their own
-- session. Deploy the matching app change first: /api/consent/request now
-- does its writes with the service role.
--
-- 1. profiles: the "update own row" policy let a user change any column of
--    their row, including is_admin, age_band and parental_consent_status.
--    A trigger now refuses those changes for direct client statements.
--    Service-role code, the SQL editor and SECURITY DEFINER functions such as
--    resolve_guardian_consent run as other roles and are unaffected. Admins
--    keep the ability to edit these fields (the admin panel toggles is_admin).
--
-- 2. guardian_links: a minor could insert a row with a token of their choosing
--    and approve it through resolve_guardian_consent, or read the token of
--    their own request. Clients lose all write access, and the token column
--    stops being readable to them.

-- ============ 1. profiles ============

create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
as $$
begin
  -- Not SECURITY DEFINER on purpose: current_user is the role that issued the
  -- statement, so only direct client requests (authenticated/anon) are checked.
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if public.is_admin(auth.uid()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_admin := false;
    new.parental_consent_status := 'not_required';
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin
     or new.age_band is distinct from old.age_band
     or new.parental_consent_status is distinct from old.parental_consent_status then
    raise exception 'is_admin, age_band and parental_consent_status cannot be changed directly'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_privileged_columns on public.profiles;
create trigger guard_profile_privileged_columns
  before insert or update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- ============ 2. guardian_links ============

drop policy if exists "minors can request consent for themselves" on public.guardian_links;

revoke all on public.guardian_links from anon, authenticated;

-- Read-only, and never the token. The existing select policy still limits
-- rows to the minor themselves or an admin.
grant select (id, minor_profile_id, guardian_email, status, resolved_at, created_at)
  on public.guardian_links to authenticated;

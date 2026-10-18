-- Marks the owner's own test/demo accounts so the admin dashboard leaves
-- them out of user, activity and revenue counts. Set from the admin user
-- screen ("סימון כחשבון בדיקה"); nothing else reads it.

alter table public.profiles
  add column if not exists is_test_account boolean not null default false;

-- Same guard as is_admin (migration 031): only admins or server-side code
-- may set it, so a learner can't hide themselves from the numbers.
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
    new.is_test_account := false;
    new.parental_consent_status := 'not_required';
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin
     or new.is_test_account is distinct from old.is_test_account
     or new.age_band is distinct from old.age_band
     or new.parental_consent_status is distinct from old.parental_consent_status then
    raise exception 'is_admin, is_test_account, age_band and parental_consent_status cannot be changed directly'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

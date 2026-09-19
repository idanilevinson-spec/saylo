-- Streak-reminder emails must be opt-in: Israel's Communications Law (s.30A)
-- requires prior explicit consent for this kind of message, and migration 008
-- created the column with `default true`. New profiles now start with it off
-- (the sign-up and profile-setup code also sets it explicitly), matching the
-- weekly/monthly report columns from migration 025.
-- Safe to re-run.

alter table public.profiles alter column email_reminders_enabled set default false;

-- Existing users never gave explicit consent, so switch them off too. They can
-- turn reminders back on from their profile settings. Deliberately one-way:
-- the previous per-user values are not preserved.
update public.profiles set email_reminders_enabled = false where email_reminders_enabled;

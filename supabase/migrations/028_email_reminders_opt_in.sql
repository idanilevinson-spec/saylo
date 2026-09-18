-- Streak-reminder emails must be opt-in: Israel's Communications Law (s.30A)
-- requires prior explicit consent for this kind of message, and migration 008
-- created the column with `default true`. New profiles now start with it off
-- (the sign-up and profile-setup code also sets it explicitly), matching the
-- weekly/monthly report columns from migration 025.
-- Safe to re-run.

alter table public.profiles alter column email_reminders_enabled set default false;

-- Existing rows are deliberately NOT changed here: whether people who never
-- touched the toggle should be switched off (or re-asked) is a decision for
-- the site owner. To switch everyone off until they opt in from their
-- profile, run manually:
--   update public.profiles set email_reminders_enabled = false;

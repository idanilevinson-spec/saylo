-- When the daily reminders job last sent this learner a "come back" email
-- (a placement test left half done, a finished placement with no learning
-- after it, or a few quiet days). Keeps those emails at most one every few
-- days. Only learners who turned email reminders on ever get one.
--
-- The job skips come-back emails until this column exists, so the code can
-- deploy before or after this runs.

alter table public.profiles
  add column if not exists last_comeback_email_at timestamptz;

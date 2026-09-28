-- Opens the existing admin moderation queue (content_reports, migration
-- 007) to learners themselves. That table's own comment already noted this
-- was the plan: "admins are the only reporters for now (no end-user
-- 'report' button exists yet), but the shape allows one later."
--
-- Scoped to target_type = 'exercise' for now, matching the one place a
-- report button actually exists today (ExercisePlayer). Extending the
-- learner-facing report button to reading texts, grammar lessons, etc.
-- only needs this list widened — the table, the RLS shape, and the whole
-- admin review UI are already generic.
--
-- Numbered 036 rather than 035 to avoid colliding with the pending
-- feat/streak-freeze branch's 035_streak_freeze.sql, which was not yet on
-- main when this was written.

create policy "learners report a content problem"
  on public.content_reports for insert
  to authenticated
  with check (
    auth.uid() = reporter_profile_id
    and target_type in ('exercise')
    and char_length(reason) between 1 and 500
  );

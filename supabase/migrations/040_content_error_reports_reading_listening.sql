-- Widens the learner "report a content problem" button (migration 036) from
-- exercises only to the reading and listening content pages themselves —
-- the passage/clip a learner reads or hears, not the exercises attached to
-- it. Same table, same RLS shape, same admin moderation queue; only the
-- allowed target_type list grows.

drop policy "learners report a content problem" on public.content_reports;

create policy "learners report a content problem"
  on public.content_reports for insert
  to authenticated
  with check (
    auth.uid() = reporter_profile_id
    and target_type in ('exercise', 'reading_text', 'listening_clip')
    and char_length(reason) between 1 and 500
  );

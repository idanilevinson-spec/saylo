-- Widens the learner "report a content problem" button (migrations 036,
-- 040) to grammar topic pages — the topic's lesson explanation, not its
-- attached exercises. Same table, same RLS shape, same admin moderation
-- queue; only the allowed target_type list grows.

drop policy "learners report a content problem" on public.content_reports;

create policy "learners report a content problem"
  on public.content_reports for insert
  to authenticated
  with check (
    auth.uid() = reporter_profile_id
    and target_type in ('exercise', 'reading_text', 'listening_clip', 'grammar_topic')
    and char_length(reason) between 1 and 500
  );

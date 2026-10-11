-- 038: clear AI texts written under the old "warm and encouraging" prompts.
-- The vocabulary topic intro and the dashboard tip are generated once and
-- cached; with the prompts rewritten (plain, specific, no stock phrases),
-- deleting the cached rows makes the next visit generate them again in the
-- new voice. Only cached AI text is deleted, nothing a learner wrote.

delete from public.topic_intro_cache;
delete from public.teacher_suggestion_cache;

-- Check: both should return 0.
select
  (select count(*) from public.topic_intro_cache) as topic_intros_left,
  (select count(*) from public.teacher_suggestion_cache) as tips_left;

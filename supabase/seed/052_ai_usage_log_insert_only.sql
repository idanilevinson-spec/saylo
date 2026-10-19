-- 052_ai_usage_log_insert_only.sql: learners could update and delete their
-- own rows in ai_usage_log (the policy was "for all"). That log is the
-- record of what every AI call cost, and the daily AI limits are counted
-- from it, so a learner must be able to add to it and read it, never to
-- change or erase it. No app code updates or deletes these rows. Admins
-- keep their read-all policy from migration 026.

drop policy if exists "users manage their own ai usage log" on public.ai_usage_log;

drop policy if exists "users read their own ai usage log" on public.ai_usage_log;
create policy "users read their own ai usage log"
  on public.ai_usage_log for select
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "users add to their own ai usage log" on public.ai_usage_log;
create policy "users add to their own ai usage log"
  on public.ai_usage_log for insert
  to authenticated
  with check (auth.uid() = profile_id);

-- Check: should list exactly three policies: the admin read-all, and the
-- two above (select, insert).
select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'ai_usage_log' order by policyname;

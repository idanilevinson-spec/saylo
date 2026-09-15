-- ai_usage_log was left out of 007_admin.sql's batch of "admins can view
-- all X" policies, even though it's exactly the kind of table an admin
-- dashboard needs — every AI call in the app already writes here via
-- logAiUsage(), but with only the "users manage their own ai usage log"
-- policy, an admin querying it (even via the browser client under their
-- own RLS-scoped session) could only ever see their own rows.

create policy "admins can view all ai_usage_log"
  on public.ai_usage_log for select
  to authenticated
  using (public.is_admin(auth.uid()));

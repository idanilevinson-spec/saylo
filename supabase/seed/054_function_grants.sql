-- 054_function_grants.sql: close what Supabase's security check flagged.
--
-- Trigger functions run whenever their trigger fires, whoever the caller
-- is; nobody needs to call them directly through /rest/v1/rpc. Revoking
-- EXECUTE removes that door without changing what the triggers do.
revoke execute on function public.enforce_daily_conversation_limit() from public, anon, authenticated;
revoke execute on function public.enforce_daily_reading_response_limit() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- A fixed search_path, so the two guards can't be pointed at look-alike
-- objects. Everything inside them is already schema-qualified.
alter function public.set_trial_period_on_client_insert() set search_path = public;
alter function public.guard_profile_privileged_columns() set search_path = public;

-- Left as is on purpose: is_admin() is used inside RLS policies, and the
-- guardian consent functions are the token-based pages a parent opens
-- without an account.

-- Check: should return 0 rows.
select p.proname from pg_proc p
where p.proname in ('enforce_daily_conversation_limit', 'enforce_daily_reading_response_limit', 'rls_auto_enable')
  and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'));

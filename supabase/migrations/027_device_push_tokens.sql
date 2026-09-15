-- Native push (APNs) device tokens, parallel to push_subscriptions (which
-- is Web Push only and doesn't work inside the iOS app's WKWebView shell —
-- iOS doesn't support the Push API there). Same RLS shape as
-- push_subscriptions: 008_notifications.sql.

create table public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null default 'ios',
  token text not null unique,
  created_at timestamptz not null default now()
);

create index device_push_tokens_profile_idx on public.device_push_tokens (profile_id);

alter table public.device_push_tokens enable row level security;

create policy "users manage their own device push tokens"
  on public.device_push_tokens for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- The daily reminder cron job runs with the service-role key (bypasses RLS
-- entirely), same as push_subscriptions — no admin-read policy needed here.

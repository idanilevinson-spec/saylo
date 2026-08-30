-- Phase 9 — notifications: web push subscriptions, per-user notification
-- preferences, and a de-dupe timestamp so the daily reminder job never
-- emails/pushes the same person twice in one day.
-- Run this against a project that already has migration 007 applied.

alter table public.profiles add column email_reminders_enabled boolean not null default true;
alter table public.profiles add column push_reminders_enabled boolean not null default true;

alter table public.streaks add column last_reminder_sent_at timestamptz;

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_profile_idx on public.push_subscriptions (profile_id);

alter table public.push_subscriptions enable row level security;

create policy "users manage their own push subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- The daily reminder cron job runs with the service-role key (bypasses
-- RLS entirely), so no admin-read policy is needed here.

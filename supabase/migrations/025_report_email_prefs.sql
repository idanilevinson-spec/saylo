-- Opt-in weekly/monthly progress report emails, built on buildScoreSummary
-- (src/lib/reports/buildScoreSummary.ts). Unlike the streak reminder
-- toggles (008_notifications.sql), which default to on, these default to
-- off — a digest of scores is a bigger ask than a same-day nudge, and
-- shouldn't show up in someone's inbox before they've asked for it.

alter table public.profiles add column weekly_report_enabled boolean not null default false;
alter table public.profiles add column monthly_report_enabled boolean not null default false;

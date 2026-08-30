-- Expands AI conversation practice: topic categories for a much larger
-- scenario library (browsable "talk to an AI" hub), and search-tool cost
-- tracking now that conversations can call Claude's live web search tool.
-- Run this against a project that already has migration 008 applied.
-- Safe to re-run.

do $$ begin
  create type conversation_topic_category as enum (
    'daily_life',
    'social',
    'travel',
    'work_professional',
    'academic',
    'health_wellbeing',
    'serious_topics',
    'entertainment_culture'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.conversation_scenarios
  add column if not exists category conversation_topic_category not null default 'daily_life';

alter table public.ai_usage_log
  add column if not exists search_requests int not null default 0;

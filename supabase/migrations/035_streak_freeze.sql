-- Streak freeze: protects a learner's streak across exactly one missed day
-- once they've earned a freeze (touchStreak() in
-- src/lib/gamification/streaks.ts awards one every 7-day stretch, capped at
-- 2 held at once). Client-writable like the rest of this table (XP, streak
-- count) — low-stakes gamification data, not a security boundary, same as
-- everything else already in `streaks`.

alter table public.streaks
  add column freeze_count int not null default 0,
  add column last_freeze_award_streak int not null default 0;

comment on column public.streaks.freeze_count is
  'How many streak-freeze tokens this learner currently holds (max 2, see MAX_FREEZES in streaks.ts).';
comment on column public.streaks.last_freeze_award_streak is
  'current_streak value at which a freeze was last awarded, so the next one is only granted after another full 7-day stretch.';

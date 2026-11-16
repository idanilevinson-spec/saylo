-- 056_bagrut_exam_date.sql: the learner's next English Bagrut exam, so
-- /bagrut can count down to it and show this week's plan.
--
-- The learner types the date themselves; Saylo never states official exam
-- dates. Both columns are an ordinary learning preference, like
-- bagrut_units (migration 045), so the existing "update own row" policy
-- covers them. null = no date set. Safe to run twice.

alter table public.profiles
  add column if not exists bagrut_exam_date date,
  add column if not exists bagrut_exam_kind text
    check (bagrut_exam_kind in ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'oral'));

-- Check: should list both columns.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles' and column_name like 'bagrut_exam_%'
order by column_name;

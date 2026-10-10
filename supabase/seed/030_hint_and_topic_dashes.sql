-- 030: the last long dashes in learner-facing Hebrew (style rule: no "—" in
-- Hebrew UI copy). 8 fill-in-the-blank hints and 4 grammar topic names, e.g.
-- "עתיד — will" becomes "עתיד: will". Only the dash changes; English
-- sentences keep their dashes. Safe to run more than once.

update exercises
set content = jsonb_set(content, '{hint}', to_jsonb(replace(content->>'hint', ' — ', ': ')))
where content ? 'hint'
  and content->>'hint' like '% — %';

update grammar_topics
set name_he = replace(name_he, ' — ', ': ')
where name_he like '% — %';

-- Check: both should return 0.
select
  (select count(*) from exercises where content->>'hint' like '%—%') as hints_left,
  (select count(*) from grammar_topics where name_he like '%—%') as topic_names_left;

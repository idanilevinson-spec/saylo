-- Grammar lesson bodies used the long dash as a separator ("**some** —
-- במשפטים חיוביים"). In Hebrew it reads as machine-written; a colon is the
-- natural textbook separator and fits every case in the lessons.
-- Safe to re-run.
update public.grammar_lessons
set body_md = replace(body_md, ' — ', ': ')
where body_md like '% — %';

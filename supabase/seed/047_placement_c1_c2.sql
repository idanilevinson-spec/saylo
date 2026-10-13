-- 047_placement_c1_c2.sql: eight more placement questions so C1 and C2 have
-- six each, like A1 to B2 (grammar 2, vocabulary 2, reading 1, listening 1).
-- Before this, C1 and C2 had two questions each and no reading or
-- listening, so the test could barely tell B2, C1 and C2 apart. The level
-- cut-offs that go with the new balance are in placementLevelFromPercent
-- (src/lib/assessment/cefrScoring.ts). All items are original.
-- Safe to re-run: these prompts are deleted first.

delete from public.placement_questions where prompt in (
  'Had I known about the delay, I ___ earlier.',
  'Choose the word closest in meaning to "reluctant":',
  'Read: "Many companies now let employees work from home two days a week. Managers expected productivity to fall, but most teams delivered the same results. What changed was not output but communication: quick questions that once took a minute now waited hours for a reply." Question: According to the text, what was the main effect of working from home?',
  'Listen and answer: What does the speaker mean?',
  'Scarcely ___ the room when the lights went out.',
  'Choose the word closest in meaning to "ubiquitous":',
  'Read: "Critics of the reform argue that it merely shifts costs rather than reducing them. Yet even its supporters concede that the projected savings rest on assumptions that have rarely held in practice." Question: What do the reform''s supporters admit?',
  'Listen and answer: How does the speaker view the delay?'
);

insert into public.placement_questions (prompt, options, correct_index, skill_area, cefr_level, audio_text, status) values
  ('Had I known about the delay, I ___ earlier.',
   '["would leave", "would have left", "will leave", "had left"]', 1, 'grammar', 'C1', null, 'published'),
  ('Choose the word closest in meaning to "reluctant":',
   '["Unwilling", "Excited", "Confused", "Grateful"]', 0, 'vocabulary', 'C1', null, 'published'),
  ('Read: "Many companies now let employees work from home two days a week. Managers expected productivity to fall, but most teams delivered the same results. What changed was not output but communication: quick questions that once took a minute now waited hours for a reply." Question: According to the text, what was the main effect of working from home?',
   '["Productivity dropped sharply", "Results stayed similar, but communication became slower", "Employees worked fewer hours", "Managers stopped checking results"]', 1, 'reading', 'C1', null, 'published'),
  ('Listen and answer: What does the speaker mean?',
   '["They refuse to take on the project", "They will start the project immediately", "They can only commit after the budget review", "They have already finished the budget review"]', 2, 'listening', 'C1',
   'I''d love to take on the new project, but realistically, I can''t commit until the budget review is finished at the end of the month.', 'published'),
  ('Scarcely ___ the room when the lights went out.',
   '["had she entered", "she had entered", "did she enter", "she entered"]', 0, 'grammar', 'C2', null, 'published'),
  ('Choose the word closest in meaning to "ubiquitous":',
   '["Found everywhere", "Extremely rare", "Highly dangerous", "Difficult to understand"]', 0, 'vocabulary', 'C2', null, 'published'),
  ('Read: "Critics of the reform argue that it merely shifts costs rather than reducing them. Yet even its supporters concede that the projected savings rest on assumptions that have rarely held in practice." Question: What do the reform''s supporters admit?',
   '["The reform will certainly save money", "The expected savings depend on doubtful assumptions", "The critics have misunderstood the reform", "The costs will be moved to employers"]', 1, 'reading', 'C2', null, 'published'),
  ('Listen and answer: How does the speaker view the delay?',
   '["As a serious failure", "As something that ultimately improved the product", "As the design team''s fault", "As a reason to cancel the product"]', 1, 'listening', 'C2',
   'Far from being a setback, the delay gave us time to rethink the design, and frankly, the product is better for it.', 'published');

-- Order: grammar and vocabulary from A1 to C2, then reading A1 to C2, then
-- listening A1 to C2 (grammar before vocabulary within a level).
update public.placement_questions pq set sort_order = o.rn
from (
  select id, row_number() over (
    order by
      case skill_area when 'reading' then 1 when 'listening' then 2 else 0 end,
      cefr_level,
      case skill_area when 'grammar' then 0 else 1 end,
      sort_order,
      created_at
  ) as rn
  from public.placement_questions
  where status = 'published'
) o
where pq.id = o.id;

-- Check: published questions per level (should be 6 at every level, 36 in all).
select cefr_level, count(*) as questions
from public.placement_questions
where status = 'published'
group by cefr_level
order by cefr_level;

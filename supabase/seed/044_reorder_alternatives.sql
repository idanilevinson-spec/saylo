-- 044_reorder_alternatives.sql: other right word orders for 3 word-order
-- exercises (from scripts/content/reorderAlternatives.mjs). Safe to re-run.

update public.exercises set content = content || '{"acceptedSentences":["Prices rose and sales fell as a result"]}'::jsonb where id = '3274513f-bcb5-4de2-8827-d8152ca68608';
update public.exercises set content = content || '{"acceptedSentences":["I think tomorrow it will be sunny"]}'::jsonb where id = '557fd157-b673-41fa-9c9b-c30c6aa01ad1';
update public.exercises set content = content || '{"acceptedSentences":["Founded in 1998, the company employs thousands now"]}'::jsonb where id = 'bf4f1888-717d-4562-9dd3-dd533438570e';

-- Check: should be 3.
select count(*) as with_accepted_sentences from public.exercises where id in ('3274513f-bcb5-4de2-8827-d8152ca68608', '557fd157-b673-41fa-9c9b-c30c6aa01ad1', 'bf4f1888-717d-4562-9dd3-dd533438570e') and content ? 'acceptedSentences';

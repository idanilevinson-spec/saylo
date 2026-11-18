-- "come across as" means to seem / give an impression of, not "to be
-- impressed" (להתרשם). Found during the 2026-11-18 content-originality pass.
update public.idioms_phrasal_verbs
set meaning_he = 'להיראות כ-, לעשות רושם של'
where phrase = 'come across as' and meaning_he = 'להתרשם כ-, להיראות כ-';

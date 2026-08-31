-- Adds one open-ended, AI-graded comprehension question per existing
-- reading text (see migration 013_reading_open_response.sql for the
-- schema this depends on). Question depth scales with level: simple
-- factual+light-opinion prompts at A1/A2, analytical/opinion prompts
-- at B1/B2, evaluative prompts requiring synthesis at C1/C2.
-- Run this AFTER migration 013 has been applied.
-- Safe to re-run: plain UPDATE by title_en, idempotent.

update public.reading_texts set open_question_en = 'Who does Noa go to the park with, and what do you think makes her family happy?' where title_en = 'My Family';
update public.reading_texts set open_question_en = 'What did the writer buy at the market, and why do you think they said thank you to the seller?' where title_en = 'At the Market';
update public.reading_texts set open_question_en = 'Describe two animals on the farm and explain what makes each one different.' where title_en = 'Animals on the Farm';
update public.reading_texts set open_question_en = 'What did Noa do at the park, and why do you think it was a happy day for her?' where title_en = 'A Day in the Park';
update public.reading_texts set open_question_en = 'Describe your own room. How is it similar to or different from the writer''s room?' where title_en = 'My Room';
update public.reading_texts set open_question_en = 'Describe Daniel''s typical work day. What happens on Fridays that is different?' where title_en = 'A Day at Work';
update public.reading_texts set open_question_en = 'What did the family do during their trip, and why do you think they enjoyed it so much?' where title_en = 'A Trip to the City';
update public.reading_texts set open_question_en = 'What are the advantages and disadvantages of working from home, according to Yael''s experience?' where title_en = 'Working From Home';
update public.reading_texts set open_question_en = 'What advice does the text give for learning a language, and do you agree with it? Why or why not?' where title_en = 'Learning a New Language';
update public.reading_texts set open_question_en = 'Summarize both sides of the debate about social media''s effect on mental health. Which argument do you find more convincing?' where title_en = 'The Impact of Social Media';
update public.reading_texts set open_question_en = 'What are the potential positive and negative effects of remote work on cities, according to the text?' where title_en = 'The Future of Remote Work';
update public.reading_texts set open_question_en = 'Explain the tension between the benefits and risks of AI decision-making described in the passage. What kind of oversight framework do you think would address this?' where title_en = 'The Ethics of Artificial Intelligence';
update public.reading_texts set open_question_en = 'According to the passage, what are the costs and benefits of urban migration? Do you agree with the urban planners'' proposed solution?' where title_en = 'Urban Migration and Its Consequences';
update public.reading_texts set open_question_en = 'Explain the paradox of choice described in the passage, and evaluate whether you think businesses limiting options is a good solution.' where title_en = 'The Paradox of Choice';
update public.reading_texts set open_question_en = 'Discuss why the passage argues that historical accounts are inherently subjective, and consider what risks or benefits come from revisiting established narratives.' where title_en = 'Reassessing Historical Narratives';

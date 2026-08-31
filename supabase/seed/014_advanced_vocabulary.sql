-- Extends vocabulary from "tops out at B1" to real B2/C1/C2
-- coverage: 6 new topics (2 per level) — environment-climate,
-- health-wellness (B2), business-negotiation, academic-writing (C1),
-- abstract-concepts, formal-register (C2) — 60 words, matching the
-- exact density/format of seed 010. Generated programmatically so
-- every MCQ's options/correctIndex are guaranteed correct by
-- construction, same approach as seed 010.
-- Run this AFTER seed 001+002+010 have been applied.
-- Safe to re-run: topics are upserted by slug; vocabulary_items and
-- exercises for these topics are cleared and reinserted.

insert into public.topics (slug, name_he, name_en, cefr_level, sort_order) values
  ('environment-climate', 'סביבה ואקלים', 'Environment & Climate', 'B2', 17),
  ('health-wellness', 'בריאות ורווחה', 'Health & Wellness', 'B2', 18),
  ('business-negotiation', 'עסקים ומשא ומתן', 'Business & Negotiation', 'C1', 19),
  ('academic-writing', 'כתיבה אקדמית ומחקר', 'Academic & Research', 'C1', 20),
  ('abstract-concepts', 'מושגים מופשטים', 'Abstract Concepts', 'C2', 21),
  ('formal-register', 'שפה רשמית ודיפלומטית', 'Formal & Diplomatic Language', 'C2', 22)
on conflict (slug) do update set
  name_he = excluded.name_he,
  name_en = excluded.name_en,
  cefr_level = excluded.cefr_level,
  sort_order = excluded.sort_order;

delete from public.vocabulary_items
where topic_id in (select id from public.topics where slug in ('environment-climate', 'health-wellness', 'business-negotiation', 'academic-writing', 'abstract-concepts', 'formal-register'));

insert into public.vocabulary_items (topic_id, headword, ipa, part_of_speech, translation_he, example_en, cefr_level, sort_order)
select t.id, v.headword, v.ipa, v.part_of_speech, v.translation_he, v.example_en, t.cefr_level, v.sort_order
from public.topics t
join (values
  ('environment-climate', 'climate', '/ˈklaɪmət/', 'noun', 'אקלים', 'Scientists study how the climate is changing.', 1),
  ('environment-climate', 'pollution', '/pəˈluːʃən/', 'noun', 'זיהום', 'Air pollution is a serious problem in big cities.', 2),
  ('environment-climate', 'recycle', '/riːˈsaɪkəl/', 'verb', 'למחזר', 'We recycle paper, glass, and plastic at home.', 3),
  ('environment-climate', 'renewable', '/rɪˈnuːəbəl/', 'adjective', 'מתחדש', 'Solar power is a renewable source of energy.', 4),
  ('environment-climate', 'sustainability', '/səˌsteɪnəˈbɪləti/', 'noun', 'קיימות', 'The company published a report on sustainability.', 5),
  ('environment-climate', 'greenhouse', '/ˈɡriːnhaʊs/', 'noun', 'חממה (גז חממה)', 'Greenhouse gases trap heat in the atmosphere.', 6),
  ('environment-climate', 'drought', '/draʊt/', 'noun', 'בצורת', 'The region suffered a severe drought last summer.', 7),
  ('environment-climate', 'wildlife', '/ˈwaɪldlaɪf/', 'noun', 'חיות בר', 'The national park protects local wildlife.', 8),
  ('environment-climate', 'emission', '/ɪˈmɪʃən/', 'noun', 'פליטה', 'The new law will reduce carbon emissions.', 9),
  ('environment-climate', 'conservation', '/ˌkɒnsərˈveɪʃən/', 'noun', 'שימור', 'The organization works on wildlife conservation.', 10),
  ('health-wellness', 'symptom', '/ˈsɪmptəm/', 'noun', 'תסמין', 'A headache can be a symptom of stress.', 1),
  ('health-wellness', 'diagnosis', '/ˌdaɪəɡˈnoʊsɪs/', 'noun', 'אבחנה', 'The doctor gave her a clear diagnosis.', 2),
  ('health-wellness', 'treatment', '/ˈtriːtmənt/', 'noun', 'טיפול', 'The treatment lasted about three weeks.', 3),
  ('health-wellness', 'immune', '/ɪˈmjuːn/', 'adjective', 'חיסוני', 'A healthy diet supports your immune system.', 4),
  ('health-wellness', 'nutrition', '/nuːˈtrɪʃən/', 'noun', 'תזונה', 'Good nutrition is important for children''s growth.', 5),
  ('health-wellness', 'exercise', '/ˈeksərsaɪz/', 'noun', 'פעילות גופנית', 'Regular exercise improves your mood.', 6),
  ('health-wellness', 'stress', '/stres/', 'noun', 'לחץ נפשי', 'Too much stress can affect your sleep.', 7),
  ('health-wellness', 'recovery', '/rɪˈkʌvəri/', 'noun', 'החלמה', 'His recovery from the injury took months.', 8),
  ('health-wellness', 'therapy', '/ˈθerəpi/', 'noun', 'טיפול (רגשי/פיזי)', 'She started therapy after the accident.', 9),
  ('health-wellness', 'wellbeing', '/ˌwelˈbiːɪŋ/', 'noun', 'רווחה נפשית', 'The company invests in employee wellbeing.', 10),
  ('business-negotiation', 'negotiate', '/nɪˈɡoʊʃieɪt/', 'verb', 'לנהל משא ומתן', 'They negotiated a better price for the contract.', 1),
  ('business-negotiation', 'stakeholder', '/ˈsteɪkhoʊldər/', 'noun', 'בעל עניין', 'All stakeholders were invited to the meeting.', 2),
  ('business-negotiation', 'revenue', '/ˈrevənuː/', 'noun', 'הכנסות', 'The company''s revenue grew by ten percent.', 3),
  ('business-negotiation', 'merger', '/ˈmɜːrdʒər/', 'noun', 'מיזוג', 'The merger created one of the largest firms in the industry.', 4),
  ('business-negotiation', 'strategy', '/ˈstrætədʒi/', 'noun', 'אסטרטגיה', 'Our marketing strategy needs to change.', 5),
  ('business-negotiation', 'deadline', '/ˈdedlaɪn/', 'noun', 'מועד אחרון', 'We have to finish the report by the deadline.', 6),
  ('business-negotiation', 'budget', '/ˈbʌdʒɪt/', 'noun', 'תקציב', 'The project went over budget.', 7),
  ('business-negotiation', 'proposal', '/prəˈpoʊzəl/', 'noun', 'הצעה', 'The client accepted our proposal.', 8),
  ('business-negotiation', 'compromise', '/ˈkɒmprəmaɪz/', 'noun', 'פשרה', 'Both sides reached a compromise after hours of talks.', 9),
  ('business-negotiation', 'leverage', '/ˈlevərɪdʒ/', 'noun', 'מינוף / יתרון מיקוח', 'They used their market position as leverage in the deal.', 10),
  ('academic-writing', 'hypothesis', '/haɪˈpɒθəsɪs/', 'noun', 'השערה', 'The researchers tested their hypothesis in the lab.', 1),
  ('academic-writing', 'analyze', '/ˈænəlaɪz/', 'verb', 'לנתח', 'We need to analyze the results carefully.', 2),
  ('academic-writing', 'evidence', '/ˈevɪdəns/', 'noun', 'ראיות', 'There is strong evidence to support the theory.', 3),
  ('academic-writing', 'methodology', '/ˌmeθəˈdɒlədʒi/', 'noun', 'מתודולוגיה', 'The study explains its methodology in detail.', 4),
  ('academic-writing', 'conclude', '/kənˈkluːd/', 'verb', 'להסיק מסקנה', 'The researchers concluded that the treatment was effective.', 5),
  ('academic-writing', 'cite', '/saɪt/', 'verb', 'לצטט מקור', 'You must cite every source in your essay.', 6),
  ('academic-writing', 'critique', '/krɪˈtiːk/', 'noun', 'ביקורת אקדמית', 'The professor wrote a detailed critique of the paper.', 7),
  ('academic-writing', 'thesis', '/ˈθiːsɪs/', 'noun', 'תזה', 'She is writing her thesis on climate policy.', 8),
  ('academic-writing', 'peer-review', '/pɪər rɪˈvjuː/', 'noun', 'ביקורת עמיתים', 'The article went through peer-review before publication.', 9),
  ('academic-writing', 'correlation', '/ˌkɒrəˈleɪʃən/', 'noun', 'מתאם', 'There is a correlation between sleep and memory.', 10),
  ('abstract-concepts', 'ambiguous', '/æmˈbɪɡjuəs/', 'adjective', 'דו-משמעי', 'The instructions were ambiguous, so nobody knew what to do.', 1),
  ('abstract-concepts', 'paradox', '/ˈpærədɒks/', 'noun', 'פרדוקס', 'It''s a paradox that saving money can sometimes cost more later.', 2),
  ('abstract-concepts', 'nuance', '/ˈnuːɑːns/', 'noun', 'ניואנס', 'A good translator understands every nuance of meaning.', 3),
  ('abstract-concepts', 'subjective', '/səbˈdʒektɪv/', 'adjective', 'סובייקטיבי', 'Taste in art is highly subjective.', 4),
  ('abstract-concepts', 'inherent', '/ɪnˈhɪərənt/', 'adjective', 'מובנה, טבוע', 'There is an inherent risk in any investment.', 5),
  ('abstract-concepts', 'implicit', '/ɪmˈplɪsɪt/', 'adjective', 'משתמע', 'There was an implicit agreement between the two companies.', 6),
  ('abstract-concepts', 'conceptual', '/kənˈseptʃuəl/', 'adjective', 'מושגי', 'The artist took a more conceptual approach to the project.', 7),
  ('abstract-concepts', 'ambivalent', '/æmˈbɪvələnt/', 'adjective', 'אמביוולנטי', 'She felt ambivalent about moving to a new city.', 8),
  ('abstract-concepts', 'discern', '/dɪˈsɜːrn/', 'verb', 'להבחין', 'It was hard to discern any real difference between the two plans.', 9),
  ('abstract-concepts', 'ubiquitous', '/juːˈbɪkwɪtəs/', 'adjective', 'נמצא בכל מקום', 'Smartphones have become ubiquitous in modern life.', 10),
  ('formal-register', 'albeit', '/ɔːlˈbiːɪt/', 'conjunction', 'אף על פי ש-', 'The plan succeeded, albeit with some delays.', 1),
  ('formal-register', 'notwithstanding', '/ˌnɒtwɪθˈstændɪŋ/', 'preposition', 'על אף', 'Notwithstanding the criticism, the project moved forward.', 2),
  ('formal-register', 'henceforth', '/ˌhensˈfɔːrθ/', 'adverb', 'מכאן ואילך', 'Henceforth, all reports must be submitted by Friday.', 3),
  ('formal-register', 'aforementioned', '/əˈfɔːrmenʃənd/', 'adjective', 'הנזכר לעיל', 'The aforementioned policy will take effect next month.', 4),
  ('formal-register', 'pertinent', '/ˈpɜːrtɪnənt/', 'adjective', 'רלוונטי', 'Please include only pertinent information in the summary.', 5),
  ('formal-register', 'discretion', '/dɪˈskreʃən/', 'noun', 'שיקול דעת', 'Use your discretion when deciding how to respond.', 6),
  ('formal-register', 'candid', '/ˈkændɪd/', 'adjective', 'כן וגלוי', 'She gave a candid answer about the company''s challenges.', 7),
  ('formal-register', 'tacit', '/ˈtæsɪt/', 'adjective', 'משתמע, לא כתוב', 'There was tacit approval from management, though nothing was written.', 8),
  ('formal-register', 'mitigate', '/ˈmɪtɪɡeɪt/', 'verb', 'להקל, לצמצם נזק', 'New measures were introduced to mitigate the risk.', 9),
  ('formal-register', 'reconcile', '/ˈrekənsaɪl/', 'verb', 'ליישב, לפשר', 'It was difficult to reconcile the two conflicting reports.', 10)
) as v(topic_slug, headword, ipa, part_of_speech, translation_he, example_en, sort_order)
  on t.slug = v.topic_slug;

delete from public.exercises
where topic_id in (select id from public.topics where slug in ('environment-climate', 'health-wellness', 'business-negotiation', 'academic-writing', 'abstract-concepts', 'formal-register'));

insert into public.exercises (type, skill_area, topic_id, vocabulary_item_id, cefr_level, content, sort_order)
select 'mcq'::exercise_type, 'vocabulary'::skill_area, t.id, v.id, t.cefr_level, gen.content::jsonb, gen.sort_order
from (values
  ('environment-climate', 'climate', '{"prompt":"מה המילה באנגלית עבור \"אקלים\"?","options":["climate","renewable","pollution","drought"],"correctIndex":0}'::jsonb, 1),
  ('environment-climate', 'pollution', '{"prompt":"מה המילה באנגלית עבור \"זיהום\"?","options":["drought","pollution","emission","climate"],"correctIndex":1}'::jsonb, 2),
  ('environment-climate', 'recycle', '{"prompt":"מה המילה באנגלית עבור \"למחזר\"?","options":["pollution","sustainability","recycle","emission"],"correctIndex":2}'::jsonb, 3),
  ('environment-climate', 'renewable', '{"prompt":"מה המילה באנגלית עבור \"מתחדש\"?","options":["greenhouse","climate","conservation","renewable"],"correctIndex":3}'::jsonb, 4),
  ('environment-climate', 'sustainability', '{"prompt":"מה המילה באנגלית עבור \"קיימות\"?","options":["sustainability","greenhouse","recycle","renewable"],"correctIndex":0}'::jsonb, 5),
  ('environment-climate', 'greenhouse', '{"prompt":"מה המילה באנגלית עבור \"חממה (גז חממה)\"?","options":["emission","greenhouse","climate","drought"],"correctIndex":1}'::jsonb, 6),
  ('environment-climate', 'drought', '{"prompt":"מה המילה באנגלית עבור \"בצורת\"?","options":["sustainability","wildlife","drought","pollution"],"correctIndex":2}'::jsonb, 7),
  ('environment-climate', 'wildlife', '{"prompt":"מה המילה באנגלית עבור \"חיות בר\"?","options":["greenhouse","drought","renewable","wildlife"],"correctIndex":3}'::jsonb, 8),
  ('environment-climate', 'emission', '{"prompt":"מה המילה באנגלית עבור \"פליטה\"?","options":["emission","recycle","drought","climate"],"correctIndex":0}'::jsonb, 9),
  ('environment-climate', 'conservation', '{"prompt":"מה המילה באנגלית עבור \"שימור\"?","options":["climate","conservation","renewable","emission"],"correctIndex":1}'::jsonb, 10),
  ('health-wellness', 'symptom', '{"prompt":"מה המילה באנגלית עבור \"תסמין\"?","options":["symptom","immune","wellbeing","recovery"],"correctIndex":0}'::jsonb, 1),
  ('health-wellness', 'diagnosis', '{"prompt":"מה המילה באנגלית עבור \"אבחנה\"?","options":["stress","diagnosis","exercise","recovery"],"correctIndex":1}'::jsonb, 2),
  ('health-wellness', 'treatment', '{"prompt":"מה המילה באנגלית עבור \"טיפול\"?","options":["symptom","recovery","treatment","immune"],"correctIndex":2}'::jsonb, 3),
  ('health-wellness', 'immune', '{"prompt":"מה המילה באנגלית עבור \"חיסוני\"?","options":["symptom","wellbeing","nutrition","immune"],"correctIndex":3}'::jsonb, 4),
  ('health-wellness', 'nutrition', '{"prompt":"מה המילה באנגלית עבור \"תזונה\"?","options":["nutrition","exercise","diagnosis","symptom"],"correctIndex":0}'::jsonb, 5),
  ('health-wellness', 'exercise', '{"prompt":"מה המילה באנגלית עבור \"פעילות גופנית\"?","options":["immune","exercise","wellbeing","stress"],"correctIndex":1}'::jsonb, 6),
  ('health-wellness', 'stress', '{"prompt":"מה המילה באנגלית עבור \"לחץ נפשי\"?","options":["symptom","wellbeing","stress","diagnosis"],"correctIndex":2}'::jsonb, 7),
  ('health-wellness', 'recovery', '{"prompt":"מה המילה באנגלית עבור \"החלמה\"?","options":["nutrition","treatment","exercise","recovery"],"correctIndex":3}'::jsonb, 8),
  ('health-wellness', 'therapy', '{"prompt":"מה המילה באנגלית עבור \"טיפול (רגשי/פיזי)\"?","options":["therapy","diagnosis","nutrition","immune"],"correctIndex":0}'::jsonb, 9),
  ('health-wellness', 'wellbeing', '{"prompt":"מה המילה באנגלית עבור \"רווחה נפשית\"?","options":["therapy","wellbeing","symptom","diagnosis"],"correctIndex":1}'::jsonb, 10),
  ('business-negotiation', 'negotiate', '{"prompt":"מה המילה באנגלית עבור \"לנהל משא ומתן\"?","options":["negotiate","deadline","budget","merger"],"correctIndex":0}'::jsonb, 1),
  ('business-negotiation', 'stakeholder', '{"prompt":"מה המילה באנגלית עבור \"בעל עניין\"?","options":["compromise","stakeholder","proposal","deadline"],"correctIndex":1}'::jsonb, 2),
  ('business-negotiation', 'revenue', '{"prompt":"מה המילה באנגלית עבור \"הכנסות\"?","options":["merger","strategy","revenue","compromise"],"correctIndex":2}'::jsonb, 3),
  ('business-negotiation', 'merger', '{"prompt":"מה המילה באנגלית עבור \"מיזוג\"?","options":["proposal","deadline","negotiate","merger"],"correctIndex":3}'::jsonb, 4),
  ('business-negotiation', 'strategy', '{"prompt":"מה המילה באנגלית עבור \"אסטרטגיה\"?","options":["strategy","deadline","merger","revenue"],"correctIndex":0}'::jsonb, 5),
  ('business-negotiation', 'deadline', '{"prompt":"מה המילה באנגלית עבור \"מועד אחרון\"?","options":["compromise","deadline","negotiate","stakeholder"],"correctIndex":1}'::jsonb, 6),
  ('business-negotiation', 'budget', '{"prompt":"מה המילה באנגלית עבור \"תקציב\"?","options":["stakeholder","compromise","budget","deadline"],"correctIndex":2}'::jsonb, 7),
  ('business-negotiation', 'proposal', '{"prompt":"מה המילה באנגלית עבור \"הצעה\"?","options":["deadline","strategy","revenue","proposal"],"correctIndex":3}'::jsonb, 8),
  ('business-negotiation', 'compromise', '{"prompt":"מה המילה באנגלית עבור \"פשרה\"?","options":["compromise","leverage","deadline","proposal"],"correctIndex":0}'::jsonb, 9),
  ('business-negotiation', 'leverage', '{"prompt":"מה המילה באנגלית עבור \"מינוף / יתרון מיקוח\"?","options":["deadline","leverage","revenue","proposal"],"correctIndex":1}'::jsonb, 10),
  ('academic-writing', 'hypothesis', '{"prompt":"מה המילה באנגלית עבור \"השערה\"?","options":["hypothesis","conclude","critique","methodology"],"correctIndex":0}'::jsonb, 1),
  ('academic-writing', 'analyze', '{"prompt":"מה המילה באנגלית עבור \"לנתח\"?","options":["hypothesis","analyze","conclude","correlation"],"correctIndex":1}'::jsonb, 2),
  ('academic-writing', 'evidence', '{"prompt":"מה המילה באנגלית עבור \"ראיות\"?","options":["peer-review","cite","evidence","hypothesis"],"correctIndex":2}'::jsonb, 3),
  ('academic-writing', 'methodology', '{"prompt":"מה המילה באנגלית עבור \"מתודולוגיה\"?","options":["hypothesis","conclude","evidence","methodology"],"correctIndex":3}'::jsonb, 4),
  ('academic-writing', 'conclude', '{"prompt":"מה המילה באנגלית עבור \"להסיק מסקנה\"?","options":["conclude","hypothesis","cite","critique"],"correctIndex":0}'::jsonb, 5),
  ('academic-writing', 'cite', '{"prompt":"מה המילה באנגלית עבור \"לצטט מקור\"?","options":["critique","cite","peer-review","methodology"],"correctIndex":1}'::jsonb, 6),
  ('academic-writing', 'critique', '{"prompt":"מה המילה באנגלית עבור \"ביקורת אקדמית\"?","options":["thesis","cite","critique","hypothesis"],"correctIndex":2}'::jsonb, 7),
  ('academic-writing', 'thesis', '{"prompt":"מה המילה באנגלית עבור \"תזה\"?","options":["methodology","cite","evidence","thesis"],"correctIndex":3}'::jsonb, 8),
  ('academic-writing', 'peer-review', '{"prompt":"מה המילה באנגלית עבור \"ביקורת עמיתים\"?","options":["peer-review","correlation","methodology","critique"],"correctIndex":0}'::jsonb, 9),
  ('academic-writing', 'correlation', '{"prompt":"מה המילה באנגלית עבור \"מתאם\"?","options":["thesis","correlation","analyze","peer-review"],"correctIndex":1}'::jsonb, 10),
  ('abstract-concepts', 'ambiguous', '{"prompt":"מה המילה באנגלית עבור \"דו-משמעי\"?","options":["ambiguous","inherent","conceptual","nuance"],"correctIndex":0}'::jsonb, 1),
  ('abstract-concepts', 'paradox', '{"prompt":"מה המילה באנגלית עבור \"פרדוקס\"?","options":["inherent","paradox","ubiquitous","ambiguous"],"correctIndex":1}'::jsonb, 2),
  ('abstract-concepts', 'nuance', '{"prompt":"מה המילה באנגלית עבור \"ניואנס\"?","options":["inherent","ambivalent","nuance","conceptual"],"correctIndex":2}'::jsonb, 3),
  ('abstract-concepts', 'subjective', '{"prompt":"מה המילה באנגלית עבור \"סובייקטיבי\"?","options":["ambiguous","nuance","implicit","subjective"],"correctIndex":3}'::jsonb, 4),
  ('abstract-concepts', 'inherent', '{"prompt":"מה המילה באנגלית עבור \"מובנה, טבוע\"?","options":["inherent","implicit","paradox","ubiquitous"],"correctIndex":0}'::jsonb, 5),
  ('abstract-concepts', 'implicit', '{"prompt":"מה המילה באנגלית עבור \"משתמע\"?","options":["inherent","implicit","subjective","ubiquitous"],"correctIndex":1}'::jsonb, 6),
  ('abstract-concepts', 'conceptual', '{"prompt":"מה המילה באנגלית עבור \"מושגי\"?","options":["discern","ubiquitous","conceptual","paradox"],"correctIndex":2}'::jsonb, 7),
  ('abstract-concepts', 'ambivalent', '{"prompt":"מה המילה באנגלית עבור \"אמביוולנטי\"?","options":["nuance","inherent","subjective","ambivalent"],"correctIndex":3}'::jsonb, 8),
  ('abstract-concepts', 'discern', '{"prompt":"מה המילה באנגלית עבור \"להבחין\"?","options":["discern","ambiguous","ubiquitous","subjective"],"correctIndex":0}'::jsonb, 9),
  ('abstract-concepts', 'ubiquitous', '{"prompt":"מה המילה באנגלית עבור \"נמצא בכל מקום\"?","options":["discern","ubiquitous","conceptual","ambivalent"],"correctIndex":1}'::jsonb, 10),
  ('formal-register', 'albeit', '{"prompt":"מה המילה באנגלית עבור \"אף על פי ש-\"?","options":["albeit","aforementioned","reconcile","tacit"],"correctIndex":0}'::jsonb, 1),
  ('formal-register', 'notwithstanding', '{"prompt":"מה המילה באנגלית עבור \"על אף\"?","options":["candid","notwithstanding","discretion","tacit"],"correctIndex":1}'::jsonb, 2),
  ('formal-register', 'henceforth', '{"prompt":"מה המילה באנגלית עבור \"מכאן ואילך\"?","options":["albeit","tacit","henceforth","aforementioned"],"correctIndex":2}'::jsonb, 3),
  ('formal-register', 'aforementioned', '{"prompt":"מה המילה באנגלית עבור \"הנזכר לעיל\"?","options":["albeit","reconcile","pertinent","aforementioned"],"correctIndex":3}'::jsonb, 4),
  ('formal-register', 'pertinent', '{"prompt":"מה המילה באנגלית עבור \"רלוונטי\"?","options":["pertinent","discretion","notwithstanding","albeit"],"correctIndex":0}'::jsonb, 5),
  ('formal-register', 'discretion', '{"prompt":"מה המילה באנגלית עבור \"שיקול דעת\"?","options":["aforementioned","discretion","reconcile","candid"],"correctIndex":1}'::jsonb, 6),
  ('formal-register', 'candid', '{"prompt":"מה המילה באנגלית עבור \"כן וגלוי\"?","options":["albeit","reconcile","candid","notwithstanding"],"correctIndex":2}'::jsonb, 7),
  ('formal-register', 'tacit', '{"prompt":"מה המילה באנגלית עבור \"משתמע, לא כתוב\"?","options":["pertinent","henceforth","discretion","tacit"],"correctIndex":3}'::jsonb, 8),
  ('formal-register', 'mitigate', '{"prompt":"מה המילה באנגלית עבור \"להקל, לצמצם נזק\"?","options":["mitigate","notwithstanding","pertinent","aforementioned"],"correctIndex":0}'::jsonb, 9),
  ('formal-register', 'reconcile', '{"prompt":"מה המילה באנגלית עבור \"ליישב, לפשר\"?","options":["mitigate","reconcile","albeit","notwithstanding"],"correctIndex":1}'::jsonb, 10)
) as gen(topic_slug, headword, content, sort_order)
join public.topics t on t.slug = gen.topic_slug
join public.vocabulary_items v on v.topic_id = t.id and v.headword = gen.headword;

insert into public.exercises (type, skill_area, topic_id, cefr_level, content, sort_order)
select 'match'::exercise_type, 'vocabulary'::skill_area, t.id, t.cefr_level, gen.content, 100
from (values
  ('environment-climate', '{"pairs":[{"left":"emission","right":"פליטה"},{"left":"sustainability","right":"קיימות"},{"left":"recycle","right":"למחזר"},{"left":"wildlife","right":"חיות בר"}]}'::jsonb),
  ('health-wellness', '{"pairs":[{"left":"symptom","right":"תסמין"},{"left":"diagnosis","right":"אבחנה"},{"left":"immune","right":"חיסוני"},{"left":"therapy","right":"טיפול (רגשי/פיזי)"}]}'::jsonb),
  ('business-negotiation', '{"pairs":[{"left":"budget","right":"תקציב"},{"left":"stakeholder","right":"בעל עניין"},{"left":"compromise","right":"פשרה"},{"left":"proposal","right":"הצעה"}]}'::jsonb),
  ('academic-writing', '{"pairs":[{"left":"peer-review","right":"ביקורת עמיתים"},{"left":"evidence","right":"ראיות"},{"left":"thesis","right":"תזה"},{"left":"conclude","right":"להסיק מסקנה"}]}'::jsonb),
  ('abstract-concepts', '{"pairs":[{"left":"ambivalent","right":"אמביוולנטי"},{"left":"discern","right":"להבחין"},{"left":"subjective","right":"סובייקטיבי"},{"left":"conceptual","right":"מושגי"}]}'::jsonb),
  ('formal-register', '{"pairs":[{"left":"albeit","right":"אף על פי ש-"},{"left":"notwithstanding","right":"על אף"},{"left":"aforementioned","right":"הנזכר לעיל"},{"left":"mitigate","right":"להקל, לצמצם נזק"}]}'::jsonb)
) as gen(topic_slug, content)
join public.topics t on t.slug = gen.topic_slug;

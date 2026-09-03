-- Replaces the earlier, shorter version of these 18 texts (3 per CEFR
-- level, A1-C2) with genuinely longer, multi-paragraph stories/essays,
-- each now carrying a full exam: 7 MCQ comprehension questions (varied
-- types — main idea, detail, sequence, inference, vocabulary-in-context)
-- plus 3 open-ended questions (factual/summary, analytical/opinion,
-- personal-connection), via the new reading_open_questions table from
-- migration 019 rather than the old single open_question_en column.
-- Every MCQ's correctIndex was checked by hand against its passage
-- before writing this file.
-- Run this AFTER migration 019_multi_open_questions.sql has been applied.
-- Safe to re-run: deletes only the specific rows this file owns (by
-- title); their exercises/open questions cascade-delete via
-- reading_text_id.

delete from public.reading_texts where title_en in (
  'My School Day', 'A Birthday Party', 'My Favorite Season',
  'A Visit to the Doctor', 'Cooking Dinner', 'A Rainy Weekend',
  'Volunteering in the Community', 'Adjusting to a New City', 'The Benefits of Reading Books',
  'The Science of Sleep', 'The Rise of Renewable Energy', 'The Psychology of Procrastination',
  'The Attention Economy', 'The Gig Economy and Job Security', 'The Placebo Effect and the Power of Belief',
  'The Illusion of Multitasking', 'The Tragedy of the Commons Revisited', 'Survivorship Bias in Everyday Reasoning'
);

insert into public.reading_texts (title_he, title_en, body_en, cefr_level, sort_order) values
  -- A1
  ('יום הלימודים שלי', 'My School Day',
   'Every morning, I wake up at seven o''clock and eat a big breakfast with my family. Then I put on my blue school uniform and walk to school with my little brother. My school starts at eight o''clock, and my favorite subjects are math and art.

At lunchtime, I sit with my friends in the school yard and eat a sandwich. Today in art class, we painted pictures of animals. My picture was a green frog, and my teacher liked it very much. After art, we have a short break, and I like to play with a ball outside.

After school, I go home and do my homework before dinner. Then I play outside with my friends until it gets dark. On Fridays, there is no school, so I visit my grandparents. My grandmother always makes cookies for me. I love my school day, and I am happy every morning when I wake up.',
   'A1', 16),
  ('מסיבת יום הולדת', 'A Birthday Party',
   'Yesterday was my sister''s tenth birthday, and my family had a big party at our house. In the morning, my mother baked a large chocolate cake with pink flowers on top. My father blew up colorful balloons and hung them all around the living room.

In the afternoon, all our cousins and neighbors came to celebrate. We played fun games in the garden, like hide-and-seek and a treasure hunt. Everyone sang happy birthday when my sister blew out the candles on her cake. She closed her eyes and made a wish before blowing them out.

After the games, my sister opened her presents. She got a new bicycle from our parents, a book from our aunt, and a puzzle from me. She was very happy and hugged everyone. In the evening, we ate cake and ice cream together, and everyone said it was the best birthday party ever.',
   'A1', 17),
  ('העונה האהובה עלי', 'My Favorite Season',
   'My favorite season is summer. When summer comes, the weather is warm and sunny every day, and the sky is bright blue. School finishes in June, and I have a long vacation with no homework at all.

During the summer, my family goes to the beach almost every week. I love to swim in the sea with my little brother, and we build big sandcastles together. Sometimes we find seashells and small crabs near the water. In the evening, we sit on the sand and eat ice cream while we watch the beautiful sunset over the sea.

I also like winter, but for different reasons. In winter, it is cold, and I can wear my favorite warm sweaters. Sometimes it even snows, and my brother and I make a snowman in the garden. But when I think about the whole year, summer is still my favorite time, because of the sunshine, the beach, and the long, happy days with my family.',
   'A1', 18),
  -- A2
  ('ביקור אצל הרופא', 'A Visit to the Doctor',
   'Last week, I woke up feeling sick with a sore throat and a mild fever, so I decided to call my doctor''s clinic and make an appointment for the same afternoon. When I arrived at the clinic, I signed in at the front desk and sat in the waiting room with several other patients.

After waiting about ten minutes, a nurse called my name and led me to an examination room. Soon, the doctor came in, asked me several questions about my symptoms, and checked my temperature and throat carefully. She explained that I had a mild cold, which was common at that time of year, and that most people recover within a week.

The doctor told me to rest at home, drink plenty of water, and avoid cold drinks for a few days. She also wrote a prescription for some medicine to help with the sore throat. I thanked her and walked to the pharmacy nearby to get my medicine. After following her advice and resting for three days, I finally started to feel much better and returned to work the following Monday.',
   'A2', 19),
  ('בישול ארוחת ערב', 'Cooking Dinner',
   'Every Wednesday evening, Tom takes responsibility for cooking dinner for his whole family, since his parents both work late on that day. He usually starts preparing around five o''clock, right after he finishes his homework and puts his books away.

First, Tom washes the vegetables carefully and cuts them into small, even pieces on a wooden cutting board. Then he puts rice in a pot with water and lets it cook slowly while he heats some chicken in a pan with olive oil and his favorite spices. He always tastes the food while cooking to make sure the flavors are just right.

While the food finishes cooking, Tom sets the table with plates, forks, and glasses, and he calls his younger sisters to come and wash their hands. His sisters always ask for extra sauce, and Tom happily gives it to them because he enjoys seeing them smile. When everyone finishes eating, the whole family works together to clean the kitchen, washing dishes and wiping the counters. Tom says that cooking dinner is not just a chore for him; it is a way of bringing his family closer together at the end of a busy day.',
   'A2', 20),
  ('סוף שבוע גשום', 'A Rainy Weekend',
   'Last weekend, dark clouds filled the sky on Saturday morning, and it started raining heavily before we even had breakfast. My family had planned to go to the park and have a picnic, but of course, we had to change our plans and stay inside instead.

At first, I felt a little disappointed because I had been looking forward to playing outside all week. However, my mother suggested we make the best of it, so we decided to play board games together in the living room. My father taught me a new card game that he used to play when he was a child, and we all laughed a lot during the game.

In the afternoon, my mother baked chocolate chip cookies, and the warm, sweet smell filled the entire house. My brother and I built a large blanket fort using pillows and chairs, and we pretended it was a secret castle. We even watched our favorite movie inside the fort while eating the fresh cookies. By the end of the day, even though the rain never stopped, we all agreed that it had turned into one of the most fun and memorable weekends we had spent together in a long time.',
   'A2', 21),
  -- B1
  ('התנדבות בקהילה', 'Volunteering in the Community',
   'Two years ago, Maya made a decision that would change the way she spent her weekends and, in many ways, the way she saw herself. After noticing a flyer at her local library, she decided to volunteer at a community center that offered free after-school programs for children from low-income families in her neighborhood.

At first, Maya wasn''t entirely sure how much difference a single person could realistically make. She spent her first few sessions simply observing, unsure of her role and slightly intimidated by the energy of a room full of children. However, she quickly discovered that even small contributions mattered enormously to the people around her. Helping a child understand a difficult math problem, or simply listening patiently while a shy student practiced reading aloud, turned out to have a real and lasting impact that she hadn''t fully anticipated.

Beyond the benefits to the children, volunteering changed Maya herself in ways she hadn''t expected. She became noticeably more patient, both at the center and in her daily life. She also made new friends from backgrounds very different from her own, which broadened her perspective on the challenges many families in her city faced. Perhaps most importantly, she gained a stronger sense of purpose that had been missing from her routine office job.

Today, Maya still volunteers every Saturday morning, and she has even started encouraging her coworkers to try it themselves, even if only for an hour a week. She often tells people that she originally started volunteering to help others, but in the end, she is not entirely sure who benefited more from the experience — the children she taught, or herself.',
   'B1', 22),
  ('הסתגלות לעיר חדשה', 'Adjusting to a New City',
   'When Omar accepted a new job offer that required relocating to a large, unfamiliar city several hours from his hometown, he expected the hardest part of the transition to be practical: learning the layout of the streets, finding a good apartment, and figuring out the public transportation system. In reality, all of these logistical challenges turned out to be relatively manageable within his first few weeks.

The real difficulty, Omar soon discovered, was something he hadn''t fully anticipated: building an entirely new social life from scratch. For the first couple of months, he felt surprisingly isolated, even though he was surrounded by colleagues at work every single day. He would go home each evening to an empty apartment, and weekends often felt long and quiet compared to the busy social calendar he had left behind.

Things began to shift gradually after Omar decided to join a local recreational sports club, mostly out of boredom rather than any strong expectation. Through weekly games and casual conversations with teammates before and after matches, he slowly started meeting people who shared similar interests and, eventually, a similar sense of humor. Within a few months, what had started as a way to simply pass the time had become a genuine source of friendship and community.

Looking back on the experience now, roughly two years later, Omar strongly believes that joining a community — rather than simply living in a new place — is what actually transforms an unfamiliar city into somewhere that feels like home. He often advises friends who are relocating to actively seek out a shared activity or group as early as possible, rather than waiting for a social life to develop naturally on its own.',
   'B1', 23),
  ('היתרונות של קריאת ספרים', 'The Benefits of Reading Books',
   'In a world increasingly dominated by screens, notifications, and constant digital distractions, many people find it genuinely difficult to set aside dedicated time for reading books. Surveys consistently show that reading for pleasure has declined significantly over the past two decades, particularly among younger adults who report feeling too busy or too mentally exhausted after a long day to focus on a book.

However, a growing body of research suggests that the benefits of regular reading extend well beyond simple relaxation or entertainment. Reading fiction in particular has been closely linked to improved empathy, since following a story requires readers to actively imagine the thoughts, motivations, and emotions of characters whose lives and circumstances may be very different from their own. Over time, this mental exercise appears to strengthen a reader''s general ability to understand other people''s perspectives in real life as well.

Beyond empathy, several studies have found that reading also tends to reduce stress more effectively than many other common relaxation activities, including listening to music, taking a walk, or even drinking tea. Researchers believe this may be because reading fully absorbs a person''s attention, temporarily pulling their mind away from everyday worries in a way that few other activities manage to do quite as completely.

Given these compelling benefits, many experts recommend that people who want to read more should start small rather than setting overly ambitious goals. Reading for just ten minutes a day, consistently, tends to be far more sustainable and ultimately more effective than attempting to finish an entire book in one sitting and then abandoning the habit entirely a week later out of exhaustion.',
   'B1', 24),
  -- B2
  ('המדע של השינה', 'The Science of Sleep',
   'For much of modern history, sleep was widely regarded as a largely passive state, essentially a biological pause during which the body and mind simply shut down between more meaningful waking hours. This view treated sleep as something close to a necessary inconvenience, a period to be minimized whenever possible in favor of work, socializing, or entertainment.

Over the past few decades, however, neuroscience has dramatically overturned this assumption. Researchers have demonstrated that sleep is, in fact, an extraordinarily active and essential biological process. During deep sleep stages, the brain plays a critical role in memory consolidation, effectively transferring information from short-term to long-term storage and strengthening the neural connections associated with skills learned during the day. Sleep also appears to be essential for emotional regulation, with studies showing that sleep-deprived individuals struggle significantly more to manage stress and interpret emotional cues accurately. Perhaps most remarkably, researchers have discovered that the brain uses deep sleep to clear out metabolic waste products, including proteins associated with neurodegenerative diseases, through a specialized cleaning system that becomes far more active during sleep than during wakefulness.

The health consequences of chronic sleep deprivation are similarly striking. Large-scale studies consistently show that people who sleep fewer than six hours per night on a regular basis face measurably increased risks of impaired concentration, weakened immune function, and long-term cardiovascular problems. Some researchers have gone as far as comparing the cognitive effects of severe sleep deprivation to functioning while legally intoxicated, a comparison that has begun to influence workplace safety policies in certain industries, including transportation and healthcare.

Despite this growing body of compelling evidence, cultural attitudes toward sleep have been remarkably slow to change. Many people, particularly in fast-paced professional environments, continue to treat sleep as an optional luxury, something to be sacrificed whenever deadlines loom or social opportunities arise. Sleep researchers increasingly argue that shifting this deeply ingrained cultural attitude may ultimately prove just as important to public health as any specific medical treatment or intervention currently available.',
   'B2', 25),
  ('עליית האנרגיה המתחדשת', 'The Rise of Renewable Energy',
   'Over the past decade, the global energy landscape has undergone a transformation that few analysts predicted even fifteen years ago. The cost of renewable energy technologies, particularly solar photovoltaic panels and wind turbines, has fallen so dramatically that in many regions of the world, building new renewable capacity is now genuinely cheaper than continuing to operate existing fossil fuel power plants, let alone constructing new ones.

This remarkable shift has been driven by several interconnected factors. Continuous improvements in manufacturing efficiency, combined with genuine economies of scale as production has expanded globally, have steadily pushed down the price of solar panels year after year. At the same time, sustained public and private investment in research and development has led to meaningful gains in energy conversion efficiency, meaning that modern panels and turbines now generate substantially more electricity than earlier generations of similar size.

Despite this genuinely impressive progress, renewable energy still faces several significant structural challenges that cannot simply be solved through further cost reductions alone. Chief among these is the fundamentally intermittent nature of both sunlight and wind, which necessitates the development of far more sophisticated and affordable energy storage solutions than currently exist at scale. Without adequate storage, renewable sources alone struggle to reliably meet electricity demand during periods of low sun or calm wind, particularly during winter months in many regions. Additionally, much of the existing electrical grid infrastructure across the world was originally designed decades ago around large, centralized fossil fuel plants, meaning substantial and expensive modernization is required to accommodate a more distributed, variable renewable energy system.

Given the scale and complexity of these remaining obstacles, most energy analysts agree that overcoming them will require sustained, coordinated efforts between governments, private companies, and research institutions working together, rather than relying primarily on market forces alone to solve the problem gradually over time.',
   'B2', 26),
  ('הפסיכולוגיה של דחיינות', 'The Psychology of Procrastination',
   'Contrary to popular belief, procrastination is rarely a simple matter of laziness, poor time management, or a lack of willpower, despite how frequently it gets framed that way in casual conversation and even in some self-help literature. Psychologists who study the phenomenon closely have increasingly come to view chronic procrastination primarily as an emotional regulation problem rather than a productivity or organizational issue.

According to this perspective, people delay tasks not because they fail to understand their importance or their deadlines, but because those specific tasks have become closely associated, often unconsciously, with uncomfortable emotions such as anxiety, boredom, self-doubt, or even a fear of failure. Starting the task would require confronting these unpleasant feelings directly, whereas putting it off provides immediate, if temporary, emotional relief. Unfortunately, this short-term relief typically comes at a significant long-term cost, since the underlying stress associated with the task rarely disappears; instead, it tends to accumulate and often intensifies considerably as deadlines draw nearer.

This reframing has important practical implications for how people might more effectively address their own procrastination habits. If procrastination truly is primarily rooted in difficult emotions rather than simple scheduling failures, then strategies focused narrowly on stricter scheduling, productivity applications, or sheer willpower alone are unlikely to produce lasting change for most chronic procrastinators. Instead, researchers increasingly recommend emotion-focused strategies, such as deliberately breaking an intimidating task into much smaller, genuinely manageable steps, or practicing self-compassion and actively forgiving oneself for having procrastinated in the past rather than dwelling on it with harsh self-criticism.

Interestingly, some studies have found that excessive self-criticism after procrastinating tends to make the behavior noticeably worse over time rather than better, since it adds yet another layer of negative emotion, namely shame or guilt, to a task that a person already strongly associates with discomfort in the first place. Breaking this particular cycle, researchers suggest, may ultimately matter far more than any specific scheduling technique or productivity hack currently available.',
   'B2', 27),
  -- C1
  ('כלכלת תשומת הלב', 'The Attention Economy',
   'In an era where digital platforms compete relentlessly for user engagement, human attention has become one of the most valuable and heavily contested resources in the modern economy, arguably rivaling more traditional commodities in terms of the sophistication of the markets built around capturing and trading it. Unlike physical resources, however, attention is inherently finite for each individual, which has intensified competition among platforms to an extraordinary degree.

Technology companies now employ substantial teams of behavioral scientists, data analysts, and interface designers whose explicit professional goal is to design digital environments that maximize the amount of time users spend on a given platform, often through carefully engineered mechanisms such as infinite scrolling feeds that eliminate natural stopping points, variable reward notifications modeled deliberately on the psychological principles underlying slot machines, and algorithmically curated content specifically selected to provoke strong emotional reactions, since such content reliably generates disproportionately higher engagement than neutral material.

Critics of this business model argue that it creates a fundamental and largely unavoidable conflict of interest between platforms and their users. Because these companies generate revenue primarily through advertising tied directly to user engagement metrics, their financial success depends not on genuinely serving users'' long-term interests or wellbeing, but rather on capturing and monetizing their attention as efficiently as possible, regardless of the psychological cost this may impose. Some researchers have drawn explicit comparisons to the tobacco or gambling industries, arguing that certain platform design choices exploit well-documented cognitive vulnerabilities in ways that many users struggle to consciously resist, despite being intellectually aware of the mechanisms at work.

In response to mounting criticism and growing public awareness, a small but increasingly vocal group of technologists, many of them former employees of major platforms, have begun advocating for alternative design principles that explicitly prioritize user wellbeing over raw engagement metrics. Proposed changes include features such as natural stopping points built directly into interfaces, more transparent algorithmic recommendations that users can meaningfully understand and adjust, and default settings genuinely designed to minimize rather than maximize time spent on the platform.

However, such wellbeing-oriented approaches remain very much the exception rather than the norm across the industry as a whole, largely because they directly conflict with the dominant advertising-based revenue models that continue to fund the vast majority of major digital platforms. Whether meaningful, industry-wide change is achievable without significant external regulation, given these deeply entrenched financial incentives, remains a genuinely open and actively debated question among policymakers, technologists, and academic researchers alike.',
   'C1', 28),
  ('כלכלת הגיג וביטחון תעסוקתי', 'The Gig Economy and Job Security',
   'The rapid growth of the gig economy over the past fifteen years, in which workers increasingly take on short-term, flexible jobs mediated through digital platforms rather than pursuing traditional full-time employment with a single employer, has fundamentally altered conventional notions of job security that shaped labor markets throughout much of the twentieth century.

Proponents of this shift emphasize the considerable autonomy the gig model offers workers, who can typically set their own schedules, choose which jobs to accept or decline, and pursue multiple income streams simultaneously across different platforms rather than depending entirely on a single employer for their livelihood. For certain workers, particularly students, caregivers, and those seeking supplemental income around other commitments, this flexibility represents a genuine and meaningful improvement over the rigid scheduling demands typically imposed by traditional employment arrangements.

However, this newfound flexibility often comes at a considerable and, critics argue, frequently underappreciated cost. Gig workers typically lack access to employer-provided benefits that full-time employees have historically taken for granted, including health insurance, retirement contributions, paid sick leave, and unemployment protection, leaving them substantially more financially vulnerable during periods of illness, economic downturn, or simply reduced platform demand. Furthermore, because gig workers are frequently classified as independent contractors rather than employees under existing labor law in most jurisdictions, they generally lack access to fundamental legal protections such as minimum wage guarantees, overtime pay, and the right to collectively bargain for better conditions.

As policymakers around the world grapple with how best to classify and regulate this rapidly growing segment of the workforce, several jurisdictions have begun experimenting with hybrid legal categories specifically designed to extend certain worker protections, such as minimum earnings guarantees or portable benefits that travel with a worker between different gig platforms, without eliminating the scheduling flexibility that makes this type of work genuinely appealing to many workers in the first place.

Whether these emerging hybrid approaches ultimately succeed in striking an appropriate and durable balance between flexibility and meaningful worker protection, or whether more fundamental and far-reaching regulatory changes will eventually prove necessary as the gig economy continues expanding into new sectors, remains a matter of considerable ongoing debate among labor economists, policymakers, and platform companies themselves.',
   'C1', 29),
  ('אפקט הפלסבו וכוחה של האמונה', 'The Placebo Effect and the Power of Belief',
   'The placebo effect, in which patients experience genuine, measurable physiological improvement after receiving a treatment containing no active therapeutic ingredients whatsoever, remains one of the most consistently puzzling and scientifically fascinating phenomena in modern medicine, despite decades of dedicated research attempting to fully explain its underlying mechanisms.

Researchers have repeatedly found that placebos can measurably reduce reported pain levels, meaningfully alleviate symptoms of depression and anxiety in clinical trials, and even trigger observable, quantifiable changes in brain activity and certain biochemical markers, strongly suggesting that the effect involves genuine physiological processes rather than being merely imagined or reported inaccurately by participants eager to please researchers. In some carefully controlled clinical trials, the magnitude of the placebo response has proven substantial enough to seriously complicate efforts to demonstrate that an actual experimental drug is meaningfully more effective than an inert substitute, forcing researchers to design increasingly sophisticated studies to isolate a drug''s true effect.

Perhaps most surprisingly, and counterintuitively, researchers have discovered that placebos can still produce measurable clinical benefits even when patients are explicitly and honestly told beforehand that they are receiving an inactive treatment, a counterintuitive phenomenon researchers have termed the open-label placebo effect. This finding directly challenges earlier assumptions that deception was a strictly necessary component for the placebo response to occur at all, and it has opened up entirely new and ethically less complicated avenues for potential clinical applications going forward.

This body of accumulating research collectively suggests that the broader ritual surrounding medical treatment, including a patient''s genuine expectations, the quality and warmth of their relationship with a healthcare provider, and even the simple physical act of regularly taking a pill or attending a scheduled appointment, may play a considerably more significant role in the overall healing process than medical science has traditionally assumed or been willing to seriously acknowledge.

Some researchers now argue that rather than viewing the placebo effect merely as an inconvenient statistical nuisance to be carefully controlled for and effectively eliminated in clinical drug trials, the medical establishment should instead treat it as a genuinely legitimate and potentially powerful therapeutic tool in its own right, one that could potentially be deliberately harnessed, alongside conventional evidence-based treatments, to meaningfully improve patient outcomes across a range of conditions.',
   'C1', 30),
  -- C2
  ('האשליה של ריבוי המשימות', 'The Illusion of Multitasking',
   'Despite its widespread reputation as a hallmark of modern productivity and its frequent appearance as a desirable trait listed on resumes and job postings alike, multitasking, understood in the strict cognitive sense of simultaneously processing two or more demanding tasks, is largely a misnomer that obscures what is actually happening within the human brain during such activity.

Neuroscientific research indicates with considerable consistency that the human brain does not, in fact, process multiple demanding cognitive tasks in true parallel; rather, it rapidly toggles attention back and forth between them, incurring a measurable cognitive cost each time such a switch occurs, a phenomenon researchers have termed the switching penalty. This penalty manifests empirically as measurably slower overall task completion times, meaningfully increased error rates across both tasks, and diminished retention of information encountered during the divided-attention period, with these detrimental effects proving particularly pronounced when the tasks in question happen to require overlapping cognitive resources, such as two simultaneous tasks both involving language processing or verbal reasoning.

Paradoxically, and perhaps most concerning from a practical standpoint, individuals who confidently self-identify as proficient multitaskers, when tested under controlled laboratory conditions, frequently perform measurably worse on objective measures of task-switching ability and sustained attention than individuals who explicitly claim to avoid multitasking whenever reasonably possible. This counterintuitive and now well-replicated finding strongly suggests that subjective confidence in one''s own multitasking ability may be inversely, rather than positively, related to actual underlying cognitive competence in this specific domain, a pattern that bears intriguing resemblance to the broader psychological phenomenon known as illusory superiority.

The practical, real-world implications of this substantial body of research extend well beyond mere academic curiosity, particularly given the ubiquity of workplace environments and educational settings that implicitly, and sometimes explicitly, reward and even actively encourage constant task-switching behavior, from simultaneously juggling multiple browser tabs and instant messaging conversations to routinely fielding phone calls while attempting to compose emails or complete other demanding cognitive work. Organizational psychologists studying workplace productivity have increasingly begun to advocate for structural interventions specifically designed to protect genuinely focused, single-task work time, including scheduled blocks explicitly free from notifications, meetings, and other common sources of interruption, arguing that such deliberate protection may ultimately yield substantially greater net productivity gains than any amount of simultaneous task juggling ever could, however impressive such juggling might superficially appear to observers.

Some researchers go further still, suggesting that the cultural glorification of multitasking as an unambiguously desirable and impressive skill may itself constitute a significant and underappreciated contributing factor to widespread, chronic workplace stress and burnout, precisely because it implicitly and unfairly pathologizes the very cognitive limitations that are, in reality, an entirely normal and universal feature of human neurological architecture rather than a personal failing to be overcome through sufficient willpower or practice.',
   'C2', 31),
  ('הטרגדיה של הנחלה המשותפת מחדש', 'The Tragedy of the Commons Revisited',
   'First articulated in the specific context of shared grazing land used communally by multiple herders in pre-industrial agricultural communities, the tragedy of the commons describes a recurring and deeply structural situation in which individuals, each acting entirely rationally in pursuit of their own immediate self-interest, collectively deplete a shared, finite resource even when doing so proves demonstrably harmful to everyone involved in the long run, including, ultimately, themselves.

The underlying logic is deceptively straightforward, which perhaps partly explains its enduring analytical appeal across multiple academic disciplines: each individual herder captures the full, immediate benefit of adding one additional animal to graze on the shared land, while the resulting cost of that decision, in the form of gradual, incremental overgrazing and long-term pasture degradation, is instead distributed diffusely across the entire community of users. This fundamental asymmetry between concentrated individual benefit and widely dispersed collective cost creates a structural incentive for each rational actor to keep adding animals, even as the shared resource itself steadily and predictably deteriorates toward collapse for everyone involved.

Contemporary examples of this same underlying dynamic extend considerably beyond the original pastoral context, encompassing phenomena as varied as unsustainable overfishing in international waters that fall outside any single nation''s exclusive regulatory jurisdiction, the excessive depletion of shared groundwater reserves in agricultural regions facing water scarcity, and, more recently, the accumulation of greenhouse gases in Earth''s shared atmosphere as a consequence of individually rational, geographically dispersed economic decisions made by billions of separate actors across the globe.

For several decades following the concept''s initial formal articulation in the mid-twentieth century, the dominant policy prescription among economists remained essentially binary: either full privatization of the shared resource, thereby internalizing costs directly onto individual owners with clear incentives to manage responsibly, or strict, centrally imposed government regulation designed to limit individual usage through external enforcement mechanisms. However, subsequent field research, most notably the empirically grounded, Nobel Prize-winning work of economist Elinor Ostrom, convincingly demonstrated that neither privatization nor top-down government regulation was strictly necessary in many real-world cases; numerous communities around the world have, in practice, proven entirely capable of managing shared resources sustainably over long periods through locally developed governance rules, informal mutual monitoring systems, and graduated social sanctions for rule violators, all developed organically without requiring either extreme, externally imposed solution.

This substantial and still-growing body of empirical work collectively suggests that the tragedy of the commons, while analytically real and structurally significant as a description of a genuine incentive problem, is nevertheless far from an inevitable or predetermined outcome in every case; rather, it more accurately represents a genuine failure of appropriate governance design, one that thoughtfully structured local institutions, when permitted meaningful autonomy to develop organically, can in many documented instances successfully avoid or effectively mitigate over time.',
   'C2', 32),
  ('הטיית השורדים בחשיבה היומיומית', 'Survivorship Bias in Everyday Reasoning',
   'Survivorship bias occurs when conclusions are drawn systematically from a visible, accessible subset of successful cases while simultaneously and often unconsciously ignoring the far larger, but critically less visible, number of cases that failed and consequently left no trace for later observation or analysis, a pattern that reliably leads to significantly distorted reasoning across an unexpectedly wide range of everyday and professional contexts.

Perhaps the most frequently cited and pedagogically instructive illustration of this phenomenon comes from military operations research conducted during the Second World War, when engineers analyzing returning fighter aircraft initially proposed reinforcing precisely those areas of the aircraft that showed the heaviest concentration of bullet damage upon safe return to base. This seemingly intuitive recommendation was ultimately overturned by the statistician Abraham Wald, who pointed out a critical and easily overlooked flaw in the underlying data: the aircraft being carefully analyzed were, definitionally, precisely those that had successfully survived their combat damage and made it safely home. The areas genuinely most worth reinforcing, Wald correctly argued, were therefore the areas showing comparatively little damage on returning aircraft, since damage sustained in those particular locations had most likely caused the aircraft that failed to return at all, and which were consequently entirely absent from the analyzed sample by definition.

This same fundamental distortion recurs with remarkable regularity across numerous everyday and professional contexts that, superficially at least, appear to have little in common with wartime aircraft analysis. In business and entrepreneurship, for instance, popular narratives frequently attribute a successful entrepreneur''s eventual achievements entirely to specific, identifiable personal habits, unconventional decisions, or particular character traits, while simultaneously and almost entirely ignoring the substantially larger number of similarly determined entrepreneurs who adopted functionally identical habits, made comparably bold decisions, and possessed remarkably similar character traits, yet nevertheless failed, often for reasons that had comparatively little to do with any of those specific, celebrated attributes.

Similarly, casual observers frequently assume that older buildings still standing today were inherently and objectively built to substantially higher structural standards than typical contemporary construction, when in fact this common impression more plausibly reflects the simple, almost tautological fact that poorly constructed older buildings from the same historical period have already collapsed, been demolished, or otherwise been removed from view long ago, leaving only the comparatively well-built survivors from that era readily available for present-day casual observation and comparison.

Recognizing survivorship bias in one''s own everyday reasoning requires deliberately and consistently asking a specific, disciplined question whenever encountering any compelling success story or seemingly persuasive pattern: what does the invisible, unrecorded failure data that never made it into this particular sample actually look like, and how might its inclusion meaningfully change the conclusions one would otherwise be inclined to draw? This is a habit of thought that even trained researchers and experienced analysts, despite their formal statistical training, must consciously and deliberately cultivate rather than assume comes naturally through intuition alone.',
   'C2', 33);

-- ============ MCQ EXERCISES (7 per text) ============

insert into public.exercises (type, skill_area, reading_text_id, cefr_level, content, sort_order)
select 'mcq'::exercise_type, 'reading'::skill_area, rt.id, rt.cefr_level, gen.content::jsonb, gen.sort_order
from public.reading_texts rt
join (values
  ('My School Day', '{"prompt":"What time does the writer wake up?","options":["Six o''clock","Seven o''clock","Eight o''clock","Nine o''clock"],"correctIndex":1}', 1),
  ('My School Day', '{"prompt":"What are the writer''s favorite subjects?","options":["Science and history","Math and art","English and music","Sports and geography"],"correctIndex":1}', 2),
  ('My School Day', '{"prompt":"What did the writer paint in art class?","options":["A dog","A green frog","A red bird","A blue fish"],"correctIndex":1}', 3),
  ('My School Day', '{"prompt":"Who does the writer walk to school with?","options":["Alone","With a friend","With their little brother","With their mother"],"correctIndex":2}', 4),
  ('My School Day', '{"prompt":"What does the writer do after school before dinner?","options":["Watches TV","Does homework","Sleeps","Goes to a friend''s house"],"correctIndex":1}', 5),
  ('My School Day', '{"prompt":"Why does the writer visit their grandparents on Fridays?","options":["Because there is no school","Because it is a holiday","Because their parents are away","Because school ends early"],"correctIndex":0}', 6),
  ('My School Day', '{"prompt":"What does the grandmother make for the writer?","options":["Cake","Cookies","Bread","Soup"],"correctIndex":1}', 7),

  ('A Birthday Party', '{"prompt":"What did Mom make for the party?","options":["A big chocolate cake","Cookies","Pizza","Sandwiches"],"correctIndex":0}', 1),
  ('A Birthday Party', '{"prompt":"What present did the sister get from the parents?","options":["A new phone","A new bicycle","A new dress","A new toy"],"correctIndex":1}', 2),
  ('A Birthday Party', '{"prompt":"What games did they play in the garden?","options":["Chess and cards","Hide-and-seek and a treasure hunt","Football","Video games"],"correctIndex":1}', 3),
  ('A Birthday Party', '{"prompt":"What did the sister do before blowing out the candles?","options":["She cried","She closed her eyes and made a wish","She sang a song","She opened presents"],"correctIndex":1}', 4),
  ('A Birthday Party', '{"prompt":"What present did the writer give their sister?","options":["A bicycle","A book","A puzzle","A balloon"],"correctIndex":2}', 5),
  ('A Birthday Party', '{"prompt":"What happened right after the games?","options":["They ate cake","The sister opened her presents","Everyone went home","They watched a movie"],"correctIndex":1}', 6),
  ('A Birthday Party', '{"prompt":"How did the sister feel when she got her presents?","options":["Angry","Bored","Happy","Tired"],"correctIndex":2}', 7),

  ('My Favorite Season', '{"prompt":"What does the writer do at the beach?","options":["Reads books","Swims and builds sandcastles","Plays football","Sleeps"],"correctIndex":1}', 1),
  ('My Favorite Season', '{"prompt":"Why does the writer like winter?","options":["Because of the snow and warm sweaters","Because school is closed","Because of the rain","Because of the beach"],"correctIndex":0}', 2),
  ('My Favorite Season', '{"prompt":"What do they sometimes find near the water?","options":["Fish and turtles","Seashells and small crabs","Coins","Toys"],"correctIndex":1}', 3),
  ('My Favorite Season', '{"prompt":"What does the family do in the evening at the beach?","options":["Go home immediately","Eat ice cream and watch the sunset","Swim more","Build a fire"],"correctIndex":1}', 4),
  ('My Favorite Season', '{"prompt":"What do the writer and brother make in winter?","options":["A sandcastle","A snowman","A kite","A boat"],"correctIndex":1}', 5),
  ('My Favorite Season', '{"prompt":"What is the writer''s favorite season, and why?","options":["Winter, because of the snow","Summer, because of the sunshine, beach, and family time","Spring, because of the flowers","Autumn, because of school"],"correctIndex":1}', 6),
  ('My Favorite Season', '{"prompt":"What does \"vacation\" mean in this text?","options":["A type of food","A time away from school with no homework","A kind of weather","A game"],"correctIndex":1}', 7),

  ('A Visit to the Doctor', '{"prompt":"Why did the writer make an appointment?","options":["For a routine checkup","Because they felt sick with a sore throat and fever","To get a vaccine","To visit a friend"],"correctIndex":1}', 1),
  ('A Visit to the Doctor', '{"prompt":"What did the doctor tell the writer to do?","options":["Go to the hospital","Rest and drink plenty of water","Stop eating","Come back tomorrow"],"correctIndex":1}', 2),
  ('A Visit to the Doctor', '{"prompt":"Who called the writer''s name in the waiting room?","options":["The doctor","A nurse","The receptionist","Another patient"],"correctIndex":1}', 3),
  ('A Visit to the Doctor', '{"prompt":"What did the doctor give the writer?","options":["A vaccine","A prescription for medicine","A new appointment","Nothing"],"correctIndex":1}', 4),
  ('A Visit to the Doctor', '{"prompt":"What did the writer do after getting the prescription?","options":["Went home immediately","Went to the pharmacy nearby","Called another doctor","Went back to work"],"correctIndex":1}', 5),
  ('A Visit to the Doctor', '{"prompt":"How long did it take before the writer felt better?","options":["One day","Three days","One month","It never got better"],"correctIndex":1}', 6),
  ('A Visit to the Doctor', '{"prompt":"What can we infer about mild colds from this text?","options":["They are very rare","They are common and most people recover within about a week","They always need surgery","They cannot be treated"],"correctIndex":1}', 7),

  ('Cooking Dinner', '{"prompt":"What day does Tom cook dinner for his family?","options":["Monday","Wednesday","Friday","Sunday"],"correctIndex":1}', 1),
  ('Cooking Dinner', '{"prompt":"What happens after dinner?","options":["Everyone watches TV","Everyone helps clean the kitchen together","Tom goes to sleep","The children do homework"],"correctIndex":1}', 2),
  ('Cooking Dinner', '{"prompt":"Why does Tom cook on that specific day?","options":["He enjoys cooking more than his parents","His parents both work late that day","It''s a family tradition","His parents are away"],"correctIndex":1}', 3),
  ('Cooking Dinner', '{"prompt":"What does Tom do before he starts cooking?","options":["Washes dishes","Finishes his homework","Goes shopping","Calls his sisters"],"correctIndex":1}', 4),
  ('Cooking Dinner', '{"prompt":"What do Tom''s sisters always ask for?","options":["More rice","Extra sauce","A different meal","Dessert"],"correctIndex":1}', 5),
  ('Cooking Dinner', '{"prompt":"What does \"chore\" mean in the last sentence?","options":["A fun game","A task or job that needs to be done","A type of food","A family member"],"correctIndex":1}', 6),
  ('Cooking Dinner', '{"prompt":"According to Tom, what is cooking dinner really about?","options":["Just following a schedule","A way of bringing his family closer together","Something he dislikes","A competition"],"correctIndex":1}', 7),

  ('A Rainy Weekend', '{"prompt":"Why did the family stay inside?","options":["They were tired","It rained heavily all day","They had no money","It was too hot"],"correctIndex":1}', 1),
  ('A Rainy Weekend', '{"prompt":"What did the mother do that afternoon?","options":["She cleaned the house","She baked chocolate chip cookies","She went shopping","She read a book"],"correctIndex":1}', 2),
  ('A Rainy Weekend', '{"prompt":"What had the family originally planned to do?","options":["Go to the movies","Have a picnic at the park","Visit relatives","Go swimming"],"correctIndex":1}', 3),
  ('A Rainy Weekend', '{"prompt":"Who taught the writer a new card game?","options":["Mother","Father","Brother","A neighbor"],"correctIndex":1}', 4),
  ('A Rainy Weekend', '{"prompt":"What did the children build in the living room?","options":["A tent","A blanket fort","A tower of blocks","A puzzle"],"correctIndex":1}', 5),
  ('A Rainy Weekend', '{"prompt":"How did the writer feel at first about staying inside?","options":["Excited","A little disappointed","Angry","Indifferent"],"correctIndex":1}', 6),
  ('A Rainy Weekend', '{"prompt":"How did the family''s feelings change by the end of the day?","options":["They stayed disappointed","They agreed it became a fun and memorable weekend","They argued with each other","They fell asleep early"],"correctIndex":1}', 7),

  ('Volunteering in the Community', '{"prompt":"What kinds of activities did Maya do as a volunteer?","options":["Teaching adults to drive","Helping children with homework and listening to them read","Cooking meals for a restaurant","Building houses"],"correctIndex":1}', 1),
  ('Volunteering in the Community', '{"prompt":"How did volunteering change Maya?","options":["It made her more impatient","It made her more patient and gave her a sense of purpose","It made her want to quit her job","It had no effect on her"],"correctIndex":1}', 2),
  ('Volunteering in the Community', '{"prompt":"How did Maya first learn about the volunteer opportunity?","options":["A friend told her","A flyer at her local library","An advertisement on TV","Her employer required it"],"correctIndex":1}', 3),
  ('Volunteering in the Community', '{"prompt":"How did Maya feel during her first few sessions?","options":["Confident and excited","Unsure and slightly intimidated","Bored","Angry"],"correctIndex":1}', 4),
  ('Volunteering in the Community', '{"prompt":"What does the text suggest about the children Maya works with?","options":["They come from wealthy families","They come from low-income families","They don''t need any help","They dislike the program"],"correctIndex":1}', 5),
  ('Volunteering in the Community', '{"prompt":"What does Maya do now, according to the last paragraph?","options":["She stopped volunteering","She still volunteers and encourages coworkers to try it","She only volunteers once a year","She became a full-time volunteer coordinator"],"correctIndex":1}', 6),
  ('Volunteering in the Community', '{"prompt":"What is the text''s overall message about volunteering?","options":["It only benefits the people being helped","It can benefit the volunteer just as much as those they help","It is not worth the time","It is only for wealthy people"],"correctIndex":1}', 7),

  ('Adjusting to a New City', '{"prompt":"What did Omar initially expect to be the hardest part of moving?","options":["Finding a job","Learning his way around the city","Learning a new language","Buying a house"],"correctIndex":1}', 1),
  ('Adjusting to a New City', '{"prompt":"What actually turned out to be the biggest challenge?","options":["Building a new social life","Finding an apartment","Learning to cook","Traveling to work"],"correctIndex":0}', 2),
  ('Adjusting to a New City', '{"prompt":"What eventually helped Omar start meeting new people?","options":["His coworkers introduced him to friends","He joined a local recreational sports club","He moved back home","He hired a social coach"],"correctIndex":1}', 3),
  ('Adjusting to a New City', '{"prompt":"Why did Omar first join the sports club, according to the text?","options":["Because a friend convinced him","Mostly out of boredom","Because his company required it","Because he wanted to get fit"],"correctIndex":1}', 4),
  ('Adjusting to a New City', '{"prompt":"How long ago did Omar move to the new city, according to the last paragraph?","options":["A few weeks ago","About two years ago","Ten years ago","It doesn''t say"],"correctIndex":1}', 5),
  ('Adjusting to a New City', '{"prompt":"What does Omar believe actually makes a new city feel like home?","options":["Having a large apartment","Joining a community, not just living somewhere","Learning the public transportation system","Living there for a very long time"],"correctIndex":1}', 6),
  ('Adjusting to a New City', '{"prompt":"What advice does Omar now give to friends who are relocating?","options":["Wait for a social life to develop naturally","Actively seek out a shared activity or group early on","Avoid making new friends too quickly","Focus only on work"],"correctIndex":1}', 7),

  ('The Benefits of Reading Books', '{"prompt":"What has reading fiction been linked to, according to the text?","options":["Improved eyesight","Improved empathy","Faster typing skills","Better memory for numbers"],"correctIndex":1}', 1),
  ('The Benefits of Reading Books', '{"prompt":"What do experts recommend for people who want to start reading more?","options":["Reading for several hours immediately","Starting small, even just ten minutes a day","Only reading nonfiction","Setting very ambitious goals right away"],"correctIndex":1}', 2),
  ('The Benefits of Reading Books', '{"prompt":"According to surveys mentioned in the text, what has happened to reading for pleasure?","options":["It has increased significantly","It has declined significantly over the past two decades","It has stayed exactly the same","It only affects older adults"],"correctIndex":1}', 3),
  ('The Benefits of Reading Books', '{"prompt":"Why does reading fiction improve empathy, according to the text?","options":["Because it requires memorizing facts","Because it requires imagining characters'' thoughts and emotions","Because it improves vocabulary","Because it is done in silence"],"correctIndex":1}', 4),
  ('The Benefits of Reading Books', '{"prompt":"What does research say about reading compared to other relaxation activities?","options":["It is less effective at reducing stress","It reduces stress more effectively than many other activities","It has no effect on stress","It only works for certain people"],"correctIndex":1}', 5),
  ('The Benefits of Reading Books', '{"prompt":"Why might reading reduce stress more than other activities, according to the text?","options":["It requires no effort at all","It fully absorbs a person''s attention, pulling focus from worries","It is faster than other activities","It always has a happy ending"],"correctIndex":1}', 6),
  ('The Benefits of Reading Books', '{"prompt":"What is the main point of the last paragraph?","options":["People should read for hours every day","Starting with small, consistent reading goals is more sustainable","Reading is only for children","Books should always be finished in one sitting"],"correctIndex":1}', 7),

  ('The Science of Sleep', '{"prompt":"How was sleep traditionally viewed, according to the text?","options":["As an essential biological process","As simply a passive, largely inactive state","As more important than food","As a modern invention"],"correctIndex":1}', 1),
  ('The Science of Sleep', '{"prompt":"What do studies show about sleeping fewer than six hours a night?","options":["It improves concentration","It has no measurable effect","It increases risks like impaired concentration and weakened immunity","It only affects children"],"correctIndex":2}', 2),
  ('The Science of Sleep', '{"prompt":"What does the brain do during deep sleep, according to the text?","options":["Nothing at all","Memory consolidation, emotional regulation, and clearing waste products","Only emotional regulation","Only physical growth"],"correctIndex":1}', 3),
  ('The Science of Sleep', '{"prompt":"What comparison have some researchers made regarding severe sleep deprivation?","options":["To eating too much sugar","To functioning while legally intoxicated","To having a cold","To exercising too little"],"correctIndex":1}', 4),
  ('The Science of Sleep', '{"prompt":"Which industries does the text mention as being influenced by sleep research?","options":["Agriculture and construction","Transportation and healthcare","Retail and hospitality","Education and finance"],"correctIndex":1}', 5),
  ('The Science of Sleep', '{"prompt":"What does the text suggest about the \"cleaning system\" active during sleep?","options":["It has nothing to do with disease","It helps clear proteins associated with neurodegenerative diseases","It only works during the day","It was discovered centuries ago"],"correctIndex":1}', 6),
  ('The Science of Sleep', '{"prompt":"What is the overall argument of the passage?","options":["Sleep is optional and unimportant","Sleep is an active, essential process, and cultural attitudes toward it should change","Only athletes need to worry about sleep","Sleep has no connection to physical health"],"correctIndex":1}', 7),

  ('The Rise of Renewable Energy', '{"prompt":"What has driven the fall in cost of renewable energy technologies?","options":["Government bans on fossil fuels","Improvements in manufacturing efficiency and sustained investment","A decrease in global energy demand","Higher taxes on solar panels"],"correctIndex":1}', 1),
  ('The Rise of Renewable Energy', '{"prompt":"What challenge does the text mention regarding solar and wind power?","options":["They produce no energy at all","The intermittent nature of sunlight and wind requires better storage solutions","They are illegal in most countries","They are more expensive than they were fifty years ago"],"correctIndex":1}', 2),
  ('The Rise of Renewable Energy', '{"prompt":"According to the text, how does renewable energy compare to fossil fuels in many regions today?","options":["It is always more expensive","It is now often cheaper than operating existing fossil fuel plants","It is illegal to compare them","There is no meaningful difference"],"correctIndex":1}', 3),
  ('The Rise of Renewable Energy', '{"prompt":"Why is the existing electrical grid a challenge for renewable energy?","options":["It was designed for large, centralized fossil fuel plants","It was built too recently","It only exists in a few countries","It cannot carry any electricity"],"correctIndex":0}', 4),
  ('The Rise of Renewable Energy', '{"prompt":"What problem does a lack of storage cause for renewable energy?","options":["It makes panels too heavy","It makes it hard to meet demand during low sun or wind","It causes panels to break","It increases carbon emissions"],"correctIndex":1}', 5),
  ('The Rise of Renewable Energy', '{"prompt":"What can be inferred about solving renewable energy''s remaining challenges?","options":["They will resolve automatically through market forces alone","They require coordinated efforts from governments, companies, and researchers","They have already been completely solved","They are impossible to solve"],"correctIndex":1}', 6),
  ('The Rise of Renewable Energy', '{"prompt":"What is the overall message of the passage?","options":["Renewable energy has failed to become cost-competitive","Renewable energy has become far more cost-competitive but still faces real structural challenges","Renewable energy is no longer being developed","Fossil fuels are now cheaper in every region"],"correctIndex":1}', 7),

  ('The Psychology of Procrastination', '{"prompt":"How do psychologists increasingly view procrastination, according to the text?","options":["As simple laziness","As an emotional regulation problem","As a sign of high intelligence","As unrelated to emotions"],"correctIndex":1}', 1),
  ('The Psychology of Procrastination', '{"prompt":"What does the passage say is more effective than strategies based purely on willpower?","options":["Ignoring the task completely","Strategies focused on managing emotions","Working longer hours","Avoiding all breaks"],"correctIndex":1}', 2),
  ('The Psychology of Procrastination', '{"prompt":"What emotions does the text say tasks can become associated with?","options":["Only excitement","Anxiety, boredom, self-doubt, or fear of failure","Only boredom","Happiness and relief"],"correctIndex":1}', 3),
  ('The Psychology of Procrastination', '{"prompt":"What does putting off a task provide, according to the text?","options":["Long-term relief","Immediate but temporary emotional relief","No emotional effect at all","Increased motivation"],"correctIndex":1}', 4),
  ('The Psychology of Procrastination', '{"prompt":"What does research say about self-criticism after procrastinating?","options":["It always helps people improve","It tends to make the behavior worse over time","It has no effect","It only affects children"],"correctIndex":1}', 5),
  ('The Psychology of Procrastination', '{"prompt":"Why do strategies based purely on stricter scheduling often fail for chronic procrastinators?","options":["Because scheduling apps don''t work on phones","Because procrastination is rooted in emotions, not just poor scheduling","Because people don''t own calendars","Because deadlines are not real"],"correctIndex":1}', 6),
  ('The Psychology of Procrastination', '{"prompt":"What is the main argument of the passage?","options":["Procrastination is simple laziness that requires more willpower","Procrastination is an emotional issue best addressed with emotion-focused strategies","Procrastination cannot be helped at all","Procrastination only affects unsuccessful people"],"correctIndex":1}', 7),

  ('The Attention Economy', '{"prompt":"What is the explicit goal of the behavioral scientists and engineers described in the text?","options":["To reduce the time users spend on a platform","To design interfaces that maximize user engagement time","To eliminate notifications entirely","To lower advertising revenue"],"correctIndex":1}', 1),
  ('The Attention Economy', '{"prompt":"According to critics, what is the fundamental conflict of interest in this business model?","options":["Platforms profit from attention rather than users'' genuine interests","Platforms lose money regardless of user behavior","Users always benefit more than platforms do","There is no real conflict of interest"],"correctIndex":0}', 2),
  ('The Attention Economy', '{"prompt":"What mechanisms does the text mention that platforms use to maximize engagement?","options":["Only pop-up ads","Infinite scrolling, variable reward notifications, and emotionally provocative content","Only email reminders","Slower loading speeds"],"correctIndex":1}', 3),
  ('The Attention Economy', '{"prompt":"What industries do some researchers compare certain platform design choices to?","options":["Agriculture and farming","Tobacco or gambling industries","Education and publishing","Healthcare and insurance"],"correctIndex":1}', 4),
  ('The Attention Economy', '{"prompt":"Who is leading the push for wellbeing-oriented design principles, according to the text?","options":["Government regulators only","A small group of technologists, including former platform employees","Advertisers","Users with no technical background"],"correctIndex":1}', 5),
  ('The Attention Economy', '{"prompt":"Why do wellbeing-oriented design approaches remain the exception rather than the norm?","options":["They don''t work technically","They conflict with dominant advertising-based revenue models","No one has thought of them before","Users don''t want them"],"correctIndex":1}', 6),
  ('The Attention Economy', '{"prompt":"What open question does the passage end with?","options":["Whether attention can be measured at all","Whether meaningful industry change is achievable without external regulation","Whether platforms should be banned entirely","Whether users understand technology"],"correctIndex":1}', 7),

  ('The Gig Economy and Job Security', '{"prompt":"What do proponents of the gig economy emphasize?","options":["Guaranteed lifetime employment","The autonomy of setting one''s own schedule","Higher taxes for workers","Mandatory overtime"],"correctIndex":1}', 1),
  ('The Gig Economy and Job Security', '{"prompt":"What is a major drawback of gig work mentioned in the passage?","options":["Workers earn too much money","Gig workers typically lack access to benefits like health insurance","Gig work is illegal in most countries","There is too much job security"],"correctIndex":1}', 2),
  ('The Gig Economy and Job Security', '{"prompt":"Which groups does the text mention as particularly benefiting from gig work flexibility?","options":["Only retirees","Students, caregivers, and those seeking supplemental income","Only full-time executives","Only people over 60"],"correctIndex":1}', 3),
  ('The Gig Economy and Job Security', '{"prompt":"Why do gig workers typically lack legal protections like minimum wage?","options":["Because they choose not to have them","Because they are usually classified as independent contractors, not employees","Because the law doesn''t apply to any workers","Because they earn too much already"],"correctIndex":1}', 4),
  ('The Gig Economy and Job Security', '{"prompt":"What are some jurisdictions experimenting with, according to the text?","options":["Banning gig work entirely","Hybrid legal categories with some protections plus flexibility","Removing all worker protections","Requiring gig workers to become full-time employees immediately"],"correctIndex":1}', 5),
  ('The Gig Economy and Job Security', '{"prompt":"What tension does the passage describe regarding hybrid legal approaches?","options":["Balancing flexibility with meaningful worker protection","Balancing profit with advertising revenue","Balancing user attention with screen time","Balancing wages with taxes"],"correctIndex":0}', 6),
  ('The Gig Economy and Job Security', '{"prompt":"What is the overall question the passage leaves open at the end?","options":["Whether gig work will disappear entirely","Whether hybrid approaches can balance flexibility and protection, or if more change is needed","Whether robots will replace gig workers","Whether gig work should be taxed more"],"correctIndex":1}', 7),

  ('The Placebo Effect and the Power of Belief', '{"prompt":"What have researchers found placebos can do?","options":["Cure all diseases completely","Measurably reduce pain and alleviate symptoms of depression","Have no effect whatsoever","Only work on animals"],"correctIndex":1}', 1),
  ('The Placebo Effect and the Power of Belief', '{"prompt":"What is surprising about open-label placebos, according to the text?","options":["They only work on children","They can still produce benefits even when patients know the treatment is inactive","They are more expensive than real medicine","They are illegal in most countries"],"correctIndex":1}', 2),
  ('The Placebo Effect and the Power of Belief', '{"prompt":"How does the placebo effect sometimes complicate clinical drug trials?","options":["It makes drugs cheaper to produce","Its magnitude can make it hard to show a real drug is more effective than an inert substitute","It has no effect on trial design","It only affects trials in certain countries"],"correctIndex":1}', 3),
  ('The Placebo Effect and the Power of Belief', '{"prompt":"What did researchers previously assume was necessary for the placebo effect to work?","options":["A large dose","Deception, or the patient not knowing they received a placebo","A doctor''s signature","An expensive treatment"],"correctIndex":1}', 4),
  ('The Placebo Effect and the Power of Belief', '{"prompt":"What factors does the text say may play a role in the ritual of treatment?","options":["Only the price of the medicine","Patient expectations, provider relationship, and the act of taking a pill","Only the color of the pill","Only the location of the clinic"],"correctIndex":1}', 5),
  ('The Placebo Effect and the Power of Belief', '{"prompt":"What do some researchers now argue about the placebo effect''s role in medicine?","options":["It should be eliminated entirely from all trials","It could be deliberately harnessed as a legitimate therapeutic tool","It proves that medicine doesn''t work","It should be kept secret from doctors"],"correctIndex":1}', 6),
  ('The Placebo Effect and the Power of Belief', '{"prompt":"What is the overall argument of the passage?","options":["Placebos are fake and have no real effect","The placebo effect is a real, physiological phenomenon that may hold genuine therapeutic value","Only children respond to placebos","Doctors should always deceive patients"],"correctIndex":1}', 7),

  ('The Illusion of Multitasking', '{"prompt":"According to the passage, what actually happens in the brain during multitasking?","options":["It processes two tasks fully at the same time","It rapidly switches attention between tasks, incurring a cognitive cost","It shuts down one task completely","It improves memory retention"],"correctIndex":1}', 1),
  ('The Illusion of Multitasking', '{"prompt":"What paradox does the passage describe regarding self-identified multitaskers?","options":["They are always the most accurate","They often perform worse on task-switching measures than those who avoid multitasking","They never make errors","They have no measurable switching penalty"],"correctIndex":1}', 2),
  ('The Illusion of Multitasking', '{"prompt":"When is the switching penalty particularly pronounced, according to the text?","options":["When tasks are done in silence","When tasks require overlapping cognitive resources, like language processing","When tasks are done in the morning","When only one task is being performed"],"correctIndex":1}', 3),
  ('The Illusion of Multitasking', '{"prompt":"What psychological phenomenon does the text compare multitasking overconfidence to?","options":["Illusory superiority","Confirmation bias","Survivorship bias","The placebo effect"],"correctIndex":0}', 4),
  ('The Illusion of Multitasking', '{"prompt":"What do organizational psychologists increasingly advocate for?","options":["More meetings and notifications","Structural interventions that protect focused, single-task work time","Encouraging more task-switching","Eliminating all breaks"],"correctIndex":1}', 5),
  ('The Illusion of Multitasking', '{"prompt":"What does the passage suggest about the cultural glorification of multitasking?","options":["It has no negative consequences","It may contribute to workplace stress and burnout by pathologizing normal cognitive limits","It always improves productivity","It is scientifically accurate"],"correctIndex":1}', 6),
  ('The Illusion of Multitasking', '{"prompt":"What is the overall argument of the passage?","options":["Multitasking is a valuable skill everyone should develop","Multitasking is largely an illusion with real cognitive costs, and this matters for how we structure work","Multitasking has been proven impossible to study","Only certain people are capable of multitasking"],"correctIndex":1}', 7),

  ('The Tragedy of the Commons Revisited', '{"prompt":"What does the tragedy of the commons describe?","options":["Individuals depleting a shared resource by acting in self-interest, even when harmful to all","A story about medieval land disputes","A government policy that always succeeds","A resource that can never be shared"],"correctIndex":0}', 1),
  ('The Tragedy of the Commons Revisited', '{"prompt":"According to Elinor Ostrom''s research, how can communities manage shared resources?","options":["Only through strict government regulation","Only through privatization","Sustainably, through locally developed rules and mutual monitoring","They cannot be managed sustainably at all"],"correctIndex":2}', 2),
  ('The Tragedy of the Commons Revisited', '{"prompt":"What is the fundamental asymmetry the text describes?","options":["Concentrated individual benefit versus widely dispersed collective cost","Rich versus poor herders","Old versus new grazing techniques","Government versus private ownership"],"correctIndex":0}', 3),
  ('The Tragedy of the Commons Revisited', '{"prompt":"Which contemporary examples does the text mention?","options":["Only overfishing","Overfishing, groundwater depletion, and greenhouse gas accumulation","Only traffic congestion","Only internet bandwidth"],"correctIndex":1}', 4),
  ('The Tragedy of the Commons Revisited', '{"prompt":"What were the two dominant policy prescriptions before Ostrom''s research, according to the text?","options":["Taxation and subsidies","Privatization and strict government regulation","Education and advertising","Nothing — there were no prescriptions"],"correctIndex":1}', 5),
  ('The Tragedy of the Commons Revisited', '{"prompt":"What does the text suggest about whether the tragedy of the commons is inevitable?","options":["It is always inevitable and cannot be avoided","It is not inevitable — it represents a failure of governance that can often be avoided","It only applies to grazing land","It has been completely disproven"],"correctIndex":1}', 6),
  ('The Tragedy of the Commons Revisited', '{"prompt":"What is the overall argument of the passage?","options":["Only privatization can solve shared resource problems","Locally developed governance can often sustainably manage shared resources without extreme solutions","Shared resources should never be used by more than one person","Government regulation is always necessary"],"correctIndex":1}', 7),

  ('Survivorship Bias in Everyday Reasoning', '{"prompt":"In the aircraft example, why was reinforcing the most-damaged areas the wrong strategy?","options":["Those planes were too expensive to repair","The areas truly worth reinforcing were the undamaged areas of returning planes","The military had no more resources","The engineers made a calculation error unrelated to survivorship"],"correctIndex":1}', 1),
  ('Survivorship Bias in Everyday Reasoning', '{"prompt":"What does survivorship bias cause people to do, according to the passage?","options":["Accurately weigh both successes and failures equally","Draw conclusions from successful cases while ignoring cases that failed","Always predict failure correctly","Avoid making any conclusions at all"],"correctIndex":1}', 2),
  ('Survivorship Bias in Everyday Reasoning', '{"prompt":"Who identified the flaw in the aircraft engineers'' original reasoning?","options":["A military general","The statistician Abraham Wald","A pilot","An aircraft manufacturer"],"correctIndex":1}', 3),
  ('Survivorship Bias in Everyday Reasoning', '{"prompt":"What example does the text give from business and entrepreneurship?","options":["Attributing success entirely to habits while ignoring failed entrepreneurs with the same habits","Attributing success only to luck","Ignoring all successful entrepreneurs","Only studying failed companies"],"correctIndex":0}', 4),
  ('Survivorship Bias in Everyday Reasoning', '{"prompt":"Why do old buildings sometimes seem better built than modern ones, according to the text?","options":["They were genuinely built to higher standards in every case","Poorly built old buildings have already collapsed or been removed, leaving only survivors","Modern materials are always worse","There is no real explanation given"],"correctIndex":1}', 5),
  ('Survivorship Bias in Everyday Reasoning', '{"prompt":"What disciplined question does the text recommend asking to recognize survivorship bias?","options":["What does the invisible, unrecorded failure data look like, and how would it change the conclusion?","What is the exact cost of the visible data?","Who collected this data?","Is this data statistically significant?"],"correctIndex":0}', 6),
  ('Survivorship Bias in Everyday Reasoning', '{"prompt":"What is the overall argument of the passage?","options":["Survivorship bias only applies to military history","Survivorship bias is a common distortion that requires deliberately considering unseen failures","Success stories should never be trusted","Failure is always more informative than success"],"correctIndex":1}', 7)
) as gen(title_en, content, sort_order)
  on rt.title_en = gen.title_en;

-- ============ OPEN QUESTIONS (3 per text) ============

insert into public.reading_open_questions (reading_text_id, question_en, sort_order)
select rt.id, gen.question_en, gen.sort_order
from public.reading_texts rt
join (values
  ('My School Day', 'Describe the writer''s school day from morning to afternoon, in your own words.', 1),
  ('My School Day', 'Why do you think the writer loves their school day? Do you enjoy your own daily routine? Why or why not?', 2),
  ('My School Day', 'What did the writer paint in art class, and why do you think the teacher liked it? Describe something YOU have made or created that you were proud of.', 3),

  ('A Birthday Party', 'Describe what happened at the birthday party, from morning to evening.', 1),
  ('A Birthday Party', 'What is your favorite thing to do at a birthday party? Describe a birthday party you remember.', 2),
  ('A Birthday Party', 'Why do you think everyone said it was the best birthday party ever? What makes a party special, in your opinion?', 3),

  ('My Favorite Season', 'What is the writer''s favorite season, and what do they do during it?', 1),
  ('My Favorite Season', 'What is YOUR favorite season, and what do you like to do during it?', 2),
  ('My Favorite Season', 'The writer also likes winter, but summer is still their favorite. Do you have a favorite season that changes depending on what you compare it to? Explain.', 3),

  ('A Visit to the Doctor', 'Describe what happened when the writer visited the doctor, step by step.', 1),
  ('A Visit to the Doctor', 'What advice did the doctor give, and why do you think that advice helps someone recover from a cold?', 2),
  ('A Visit to the Doctor', 'Describe a time when you or someone you know was sick. What did you do to feel better?', 3),

  ('Cooking Dinner', 'Describe the steps Tom follows to cook dinner, from start to finish.', 1),
  ('Cooking Dinner', 'Why does Tom say that cooking dinner is not just a chore? Do you agree that cooking together can bring a family closer?', 2),
  ('Cooking Dinner', 'Do you or does someone in your family cook regularly? Describe that experience.', 3),

  ('A Rainy Weekend', 'What did the family do instead of going to the park? Describe their day.', 1),
  ('A Rainy Weekend', 'Why do you think the weekend turned into one of the most fun and memorable ones, even though it rained all day?', 2),
  ('A Rainy Weekend', 'Describe a time you had fun indoors on a rainy or difficult day, even though your original plans changed.', 3),

  ('Volunteering in the Community', 'According to the text, how did volunteering benefit Maya personally, beyond helping others?', 1),
  ('Volunteering in the Community', 'Would you consider volunteering yourself? Why or why not? What kind of volunteer work would interest you most?', 2),
  ('Volunteering in the Community', 'Maya says she isn''t sure who benefited more — the children or herself. What do you think this means, and do you agree that helping others can also help the helper?', 3),

  ('Adjusting to a New City', 'What helped Omar start to feel at home in his new city?', 1),
  ('Adjusting to a New City', 'Have you ever had to adjust to a new place — a new city, school, or job? What helped you feel more comfortable there?', 2),
  ('Adjusting to a New City', 'Omar advises relocating friends to seek out a shared activity early, rather than waiting for a social life to develop naturally. Do you agree with this advice? Why or why not?', 3),

  ('The Benefits of Reading Books', 'According to the passage, what benefits does reading offer beyond entertainment?', 1),
  ('The Benefits of Reading Books', 'Do you read regularly? Why or why not? What could help you (or someone you know) read more often?', 2),
  ('The Benefits of Reading Books', 'The text explains that reading fiction can improve empathy by making us imagine other people''s perspectives. Can you think of another activity that might have a similar effect on empathy? Explain your reasoning.', 3),

  ('The Science of Sleep', 'According to the passage, what functions does sleep serve beyond rest?', 1),
  ('The Science of Sleep', 'Why do sleep researchers believe changing cultural attitudes toward sleep is important? Do you think this change is realistic in modern work culture?', 2),
  ('The Science of Sleep', 'The text compares severe sleep deprivation to functioning while intoxicated. Do you think workplaces should treat lack of sleep as seriously as they treat other safety risks? Explain your view.', 3),

  ('The Rise of Renewable Energy', 'What challenges does renewable energy still face, according to the passage?', 1),
  ('The Rise of Renewable Energy', 'Do you think governments or private companies should take the lead in solving these remaining challenges? Explain your reasoning.', 2),
  ('The Rise of Renewable Energy', 'The text says the cost drop in renewable energy was not predicted fifteen years ago. What technology today do you think might surprise people in a similar way in the future?', 3),

  ('The Psychology of Procrastination', 'According to the passage, why do people procrastinate?', 1),
  ('The Psychology of Procrastination', 'Do you agree with this explanation of procrastination based on your own experience? Why or why not?', 2),
  ('The Psychology of Procrastination', 'The text suggests that self-criticism after procrastinating can make things worse. Have you noticed this pattern in yourself or others? What strategy from the text do you think would help most?', 3),

  ('The Attention Economy', 'Explain the conflict of interest the passage describes between technology platforms and their users.', 1),
  ('The Attention Economy', 'Do you think design principles that prioritize wellbeing over engagement could realistically become the norm without government regulation? Why or why not?', 2),
  ('The Attention Economy', 'The text compares certain platform design choices to the tobacco or gambling industries. Do you find this comparison persuasive? What similarities or differences do you see?', 3),

  ('The Gig Economy and Job Security', 'What tradeoff does the gig economy present, according to the passage?', 1),
  ('The Gig Economy and Job Security', 'What kind of policy solution does the passage suggest is being tried, and do you think it would work?', 2),
  ('The Gig Economy and Job Security', 'Would you personally prefer the flexibility of gig work or the security of traditional employment? Explain the tradeoffs that matter most to you.', 3),

  ('The Placebo Effect and the Power of Belief', 'What does the placebo effect suggest about the role of belief and expectation in healing?', 1),
  ('The Placebo Effect and the Power of Belief', 'Does this change how you think about medical treatment? Why or why not?', 2),
  ('The Placebo Effect and the Power of Belief', 'Some researchers argue the placebo effect should be used as a legitimate therapeutic tool rather than eliminated from trials. Do you think this raises any ethical concerns? Explain your view.', 3),

  ('The Illusion of Multitasking', 'Explain what the passage means by the switching penalty.', 1),
  ('The Illusion of Multitasking', 'Discuss the paradox involving people who consider themselves skilled multitaskers. Does this change how you think about your own multitasking habits?', 2),
  ('The Illusion of Multitasking', 'The passage argues that glorifying multitasking may contribute to workplace stress and burnout. Do you agree that treating a normal cognitive limitation as a personal failing could be harmful? Explain your reasoning.', 3),

  ('The Tragedy of the Commons Revisited', 'According to the passage, what alternative to privatization or government regulation did Elinor Ostrom''s research reveal?', 1),
  ('The Tragedy of the Commons Revisited', 'Do you think this alternative could work for a modern shared resource, such as the internet or the atmosphere? Explain your reasoning.', 2),
  ('The Tragedy of the Commons Revisited', 'The passage describes an asymmetry between concentrated individual benefit and dispersed collective cost. Can you think of a modern example, beyond those mentioned in the text, where this same dynamic applies?', 3),

  ('Survivorship Bias in Everyday Reasoning', 'Explain the aircraft example the passage uses to illustrate survivorship bias.', 1),
  ('Survivorship Bias in Everyday Reasoning', 'Can you think of another example of survivorship bias from everyday life or the media, beyond those mentioned in the text?', 2),
  ('Survivorship Bias in Everyday Reasoning', 'The passage says recognizing survivorship bias requires a deliberate habit of thought, even for trained researchers. Why do you think this bias is so difficult to notice, even when we know about it intellectually?', 3)
) as gen(title_en, question_en, sort_order)
  on rt.title_en = gen.title_en;

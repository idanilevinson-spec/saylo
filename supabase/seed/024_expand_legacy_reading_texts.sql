-- Expands the 15 original, much shorter reading texts (seeds 004/012/015,
-- 43-84 words each with only 2 MCQ and no real open-question support) to
-- match the same long-story + 7-MCQ + 3-open-question format as the 18
-- texts in seed 023. These were sitting first in the reading list
-- (sort_order 1-15) so users hit them before ever reaching the longer
-- content — this replaces them in place, keeping the same titles and
-- sort_order, so the list itself doesn't reshuffle.
-- Every MCQ's correctIndex was checked by hand against its passage
-- before writing this file.
-- Run this AFTER migration 019_multi_open_questions.sql has been applied
-- (same as seed 023).
-- Safe to re-run: deletes only the specific rows this file owns (by
-- title); their exercises/open questions cascade-delete via
-- reading_text_id.

delete from public.reading_texts where title_en in (
  'My Family', 'At the Market', 'Animals on the Farm', 'A Day in the Park', 'My Room',
  'A Day at Work', 'A Trip to the City',
  'Working From Home', 'Learning a New Language',
  'The Impact of Social Media', 'The Future of Remote Work',
  'The Ethics of Artificial Intelligence', 'Urban Migration and Its Consequences',
  'The Paradox of Choice', 'Reassessing Historical Narratives'
);

insert into public.reading_texts (title_he, title_en, body_en, cefr_level, sort_order) values
  -- A1
  ('המשפחה שלי', 'My Family',
   'I live with my family in a small house near the city center. My family has five people: my father, my mother, my older sister, my younger brother, and me. We also have a small brown dog named Max, who loves to play in the garden every afternoon.

My father works as a bus driver, and he wakes up very early every morning. My mother is a teacher at a primary school, and she teaches young children how to read and write. My older sister is seventeen years old, and she studies hard because she wants to become a doctor one day. My younger brother is only six, and he loves to draw pictures of animals and dinosaurs.

Every Sunday, my whole family eats lunch together at my grandmother''s house. She always cooks a big, delicious meal, and we all sit around the table and talk about our week. After lunch, my father and grandfather play chess while the rest of us watch a movie together. I love my family very much, and Sundays are always my favorite day of the week.',
   'A1', 1),
  ('בשוק', 'At the Market',
   'Every Friday morning, I go to the local market with my mother to buy fresh food for the weekend. The market is very busy and colorful, with many different stalls selling fruits, vegetables, cheese, and fresh bread.

First, we visit the vegetable stall, where my mother chooses bright red tomatoes, green cucumbers, and a bag of potatoes. The seller always gives me a free strawberry to eat while we shop, and I always say thank you with a big smile. Next, we walk to the bread stall, where the smell of fresh bread fills the whole street. My mother buys two loaves of bread and a small chocolate cake for dessert.

Before we go home, we stop at the flower stall so my mother can buy yellow flowers for our kitchen table. On the way home, we carry our heavy bags together, and my mother always says that shopping at the market is much more fun than shopping at a big supermarket. I agree with her, because at the market, everyone knows each other, and it feels like a small, friendly family.',
   'A1', 2),
  ('חיות בחווה', 'Animals on the Farm',
   'Last summer, my family visited my uncle''s farm in the countryside for a whole week. It was my first time seeing so many different animals up close, and I loved every single day of the trip.

Every morning, I woke up early with the sound of the rooster crowing loudly outside my window. My uncle taught me how to feed the chickens, and I collected fresh eggs from the henhouse with my cousin. In the afternoon, we visited the cows in the big green field, and my uncle showed me how to milk one of them, which was much harder than it looked. The cow''s name was Bella, and she was very gentle and calm.

My favorite animals on the farm were the baby goats, because they were small, playful, and always jumping around. I fed them with a bottle of milk, and one of them followed me everywhere I walked, like a little dog. In the evening, we sat outside and watched the horses run freely in the field while the sun went down. By the end of the week, I did not want to go home, and I asked my uncle if I could come back and visit again very soon.',
   'A1', 3),
  ('יום בפארק', 'A Day in the Park',
   'On Saturday morning, Noa wakes up early and feels excited because she is going to spend the whole day at the park with her mother. She quickly eats breakfast, puts on her favorite pink shoes, and grabs her small backpack with snacks and water.

When they arrive at the park, Noa runs straight to the playground, where she sees many other children and dogs playing happily together. She climbs up the tall slide first, and then she jumps on the swing, going higher and higher until she feels like she is almost flying. Her mother sits under a big shady tree nearby, reading her favorite book and watching Noa play with a warm smile.

After an hour of playing, Noa feels hungry, so she and her mother sit on a blanket and eat sandwiches together. A friendly dog comes over and sits beside them, hoping for a small piece of food, and Noa laughs and gently pets its soft fur. Before they leave, they walk to the small ice cream stand near the park entrance, and Noa chooses her favorite flavor: chocolate with sprinkles on top. It was, once again, a truly happy day at the park for both of them.',
   'A1', 4),
  ('החדר שלי', 'My Room',
   'This is my room, and it is my favorite place in the whole house. It is not very big, but it has everything I need: a comfortable bed with a blue blanket, a wooden desk where I do my homework, and a big window that looks out over our garden.

On the shelf above my desk, I keep my favorite toys, including a soft brown teddy bear that my grandmother gave me when I was very small. I also have a shelf full of books, and I like to read a new story every night before I go to sleep. My clothes are kept neatly in a closet next to my bed, and I try to keep my room clean and organized, even though it is sometimes difficult.

On the wall above my bed, I have several drawings that I made myself, along with a few photographs of my family and friends. At night, when it is time to sleep, I turn off the light, look out of my window at the stars, and think about all the fun things that happened during the day. I love my room very much, because it feels safe, comfortable, and truly like my own special little world.',
   'A1', 5),
  -- A2
  ('יום בעבודה', 'A Day at Work',
   'Daniel works as an accountant in a busy office located in the center of Tel Aviv, and his daily routine rarely changes, even though he sometimes wishes it would. He wakes up at seven o''clock every morning, eats a quick breakfast, and takes the bus to work because parking near the office is always difficult to find.

At the office, Daniel starts his day by checking his emails and preparing a short list of tasks that need his attention before lunch. He usually works closely with two other colleagues on financial reports for different clients, and they often discuss problems together over a cup of coffee in the small kitchen area. Around noon, Daniel takes a short lunch break, usually eating a sandwich with his coworkers at a nearby cafe, where they talk about anything except work for exactly thirty minutes.

In the afternoon, Daniel attends meetings, replies to more emails, and finishes any remaining tasks before his workday officially ends at five o''clock. On Fridays, however, the office closes much earlier, at around one in the afternoon, so that everyone can go home and properly prepare for the weekend. Daniel says that although his job can sometimes feel repetitive, he genuinely enjoys the people he works with, and that makes even the busiest days feel more manageable.',
   'A2', 6),
  ('טיול בעיר', 'A Trip to the City',
   'Last month, my family decided to take a short trip to a city we had never visited before, and it quickly became one of the most memorable trips we have taken together. We booked a small, cozy hotel near the old town, since we wanted to be within walking distance of the main historical sites.

On our first morning, we woke up early and walked through the narrow, cobblestone streets of the old town, stopping frequently to take photographs of the beautiful, colorful buildings. We visited a famous old church with a tall bell tower, and we climbed all the way to the top to see an incredible view of the entire city below us. In the afternoon, we found a small local market selling handmade crafts, and my sister bought a beautiful painted bowl as a souvenir to remember the trip.

Every evening, we tried a different restaurant recommended by our hotel receptionist, and we discovered several delicious local dishes that we had never tasted before. On our last day, we visited a large museum filled with interesting artifacts from the city''s long history, and we spent nearly three hours there without even noticing the time passing. By the time we returned home, we were tired but genuinely happy, and we all agreed that it had been one of the best trips our family had ever taken.',
   'A2', 7),
  -- B1
  ('עבודה מהבית', 'Working From Home',
   'Since transitioning to a fully remote position two years ago, Yael has come to appreciate both the genuine advantages and the less obvious drawbacks of working from home, a balance she is still actively learning to manage even now.

On the positive side, Yael no longer spends nearly an hour each day commuting to and from her office, which has given her considerably more time for exercise, hobbies, and simply relaxing before starting her workday. She also has far greater flexibility in structuring her schedule, allowing her to run errands during quieter hours or attend her children''s school events without needing special permission from her employer. However, Yael has also noticed some meaningful downsides that she did not fully anticipate before making the switch. She misses the casual, spontaneous conversations she used to have with colleagues throughout the day, the kind of small talk that often led to genuinely useful ideas or simply made the workday feel less isolating.

To address this sense of isolation, Yael has developed several small but consistent habits. She now takes a short walk every morning before officially starting work, which helps her mentally separate her personal time from her professional time, since without a commute, that boundary can otherwise disappear entirely. She also makes a deliberate effort to schedule occasional video calls with colleagues that are not strictly about work, just to maintain some of the social connection she used to have naturally in the office.

Reflecting on the past two years, Yael believes that remote work suits her well overall, but only because she has been intentional about building structure and social connection into her days, rather than assuming those things would simply happen on their own the way they once did at the office.',
   'B1', 8),
  ('לימוד שפה חדשה', 'Learning a New Language',
   'Learning a new language as an adult presents a genuinely different set of challenges compared to learning one as a child, but contrary to common belief, it is far from impossible, and many adults successfully become fluent later in life.

One of the biggest obstacles adults face is not cognitive ability, but rather a fear of making mistakes in front of others, a fear that children generally do not experience to the same degree. Language experts consistently emphasize that consistent, daily practice, even just fifteen or twenty minutes, tends to produce far better long-term results than occasional multi-hour study sessions once a week. This is because language learning relies heavily on repetition and gradual reinforcement, processes that work best when spaced out regularly rather than concentrated into infrequent bursts.

Beyond formal study methods like textbooks and grammar exercises, many experts also recommend incorporating the target language into everyday enjoyable activities. Watching movies or television shows with subtitles, listening to music, and following social media accounts in the new language can all make the learning process feel considerably less like a chore and more like a natural, gradually absorbed habit. Some learners also find real conversation practice, even with imperfect grammar, to be more valuable than months of silent, passive study, since actual conversation forces the brain to retrieve and use vocabulary under real, practical pressure.

Ultimately, most language learning experts agree that consistency, genuine enjoyment, and a reasonable tolerance for making mistakes along the way matter far more than any single teaching method, textbook, or app. Adults who accept that discomfort as a normal, unavoidable part of the process tend to progress considerably faster than those who wait until they feel fully ready before attempting to actually speak.',
   'B1', 9),
  -- B2
  ('השפעת הרשתות החברתיות', 'The Impact of Social Media',
   'Researchers continue to actively debate the overall psychological effect of social media use, and despite more than a decade of dedicated study, a genuine scientific consensus remains notably elusive, largely because the platforms themselves, and the ways people use them, keep evolving faster than research can reliably keep pace.

Several large-scale studies have found meaningful correlations between heavy social media use, particularly among adolescents, and increased rates of reported anxiety, poor sleep quality, and feelings of social isolation, even though these individuals are, in a technical sense, more digitally connected to others than any previous generation in human history. Some researchers attribute this apparent paradox to constant social comparison, arguing that carefully curated, idealized posts from peers can create unrealistic and ultimately unhealthy standards that are essentially impossible for anyone to consistently meet in their own actual daily life.

However, other researchers push back firmly against an overly simplistic, universally negative narrative. They point out that social media also provides genuinely valuable opportunities for connection, particularly for individuals who face significant barriers to socializing in person, including people with disabilities, those living in remote or rural areas, and members of marginalized communities who may struggle to find local support networks that share their specific experiences or identities. For these particular groups, online communities can provide a real and meaningful sense of belonging that might otherwise be extremely difficult, or even entirely impossible, for them to access in their immediate physical surroundings.

Given this considerable complexity, many researchers have increasingly moved away from asking whether social media is simply "good" or "bad" in some general sense, and have instead begun focusing more specifically on how it is used, arguing that passive scrolling and active, meaningful engagement appear to have measurably different psychological effects on the people using them.',
   'B2', 10),
  ('עתיד העבודה מרחוק', 'The Future of Remote Work',
   'As an increasing number of companies embrace flexible and hybrid working arrangements, often permanently rather than as a temporary pandemic-era measure, important questions have emerged about how this significant shift will ultimately reshape urban development, workplace culture, and even broader economic patterns over the coming decades.

Some urban analysts predict that a sustained reduction in daily commuting could meaningfully ease long-standing pressure on public transportation systems in major cities, while simultaneously reducing traffic congestion and associated carbon emissions on a genuinely significant scale. There is also growing speculation that fewer workers commuting into traditional downtown business districts every single day could gradually reshape city centers themselves, potentially prompting the conversion of underused office buildings into residential housing, a shift some cities have already begun actively exploring as a partial solution to persistent housing shortages.

At the same time, however, other researchers raise legitimate and carefully reasoned concerns about the potential long-term costs of this same widespread shift. They argue that spontaneous, informal interactions between colleagues, the kind of unplanned hallway conversations or shared coffee breaks that often quietly spark creative ideas or help build genuine trust within a team, are considerably more difficult to intentionally replicate in a fully remote or even hybrid setting, no matter how sophisticated the available digital collaboration tools eventually become. Some companies have also reported measurable challenges specifically with onboarding new employees remotely, since younger or less experienced workers often benefit disproportionately from close, informal, in-person mentorship that is genuinely harder to arrange and sustain across a screen.

Given these gradually emerging and sometimes conflicting trends, most workplace researchers now believe that some form of hybrid model, rather than either fully remote or fully in-office arrangements, is likely to become the dominant long-term standard for the majority of knowledge-based industries, even as the exact and optimal balance between the two continues to be actively and continuously debated.',
   'B2', 11),
  -- C1
  ('אתיקה של בינה מלאכותית', 'The Ethics of Artificial Intelligence',
   'As artificial intelligence systems become increasingly embedded in high-stakes decision-making processes, ranging from loan approvals and hiring recommendations to criminal sentencing guidelines and medical diagnoses, the ethical implications of delegating such consequential decisions to algorithmic systems have moved rapidly from a relatively niche academic concern to an urgent matter of genuine public policy debate.

A central and persistent challenge lies in the fact that many advanced AI systems, particularly those built on deep learning architectures, function as effective "black boxes," meaning that even the engineers who originally designed and trained them often cannot fully explain precisely why a given system produced one specific output rather than another equally plausible alternative. This profound lack of interpretability becomes especially troubling in contexts where individuals possess a legitimate right to understand, and potentially meaningfully contest, decisions that substantially affect their lives, such as being denied a loan, a job opportunity, or, in more serious cases, parole eligibility.

Compounding this interpretability problem considerably, AI systems are also frequently found to inherit and, in some documented cases, actively amplify existing societal biases present within their training data. Because these systems fundamentally learn statistical patterns from historical human decisions, and those past decisions were often themselves shaped by documented discriminatory practices, an AI system trained on such data can inadvertently perpetuate the very same inequities it was, in many cases, specifically intended to help eliminate or at least meaningfully reduce. Several well-documented and widely publicized cases have already demonstrated facial recognition systems performing measurably less accurately on darker-skinned faces, and hiring algorithms that quietly penalized resumes containing certain names or educational backgrounds associated with particular demographic groups.

In direct response to these mounting and increasingly well-documented concerns, a growing number of governments and prominent international organizations have begun actively developing regulatory frameworks specifically intended to mandate meaningful transparency, rigorous bias testing, and genuine human oversight for AI systems deployed in sufficiently high-stakes contexts. However, meaningful consensus on precisely how to effectively implement and enforce such regulations, particularly across different legal jurisdictions with genuinely differing cultural values and regulatory traditions, remains a considerable and largely unresolved challenge that policymakers continue to actively grapple with today.',
   'C1', 12),
  ('הגירה עירונית והשלכותיה', 'Urban Migration and Its Consequences',
   'Over the past several decades, an unprecedented and still-accelerating wave of internal migration has drawn hundreds of millions of people worldwide from rural agricultural communities toward rapidly expanding urban centers, fundamentally reshaping both the character of the cities receiving them and the increasingly depopulated rural regions being left behind in the process.

For many individual migrants, this significant move represents a genuinely rational and often carefully considered economic decision, since cities typically offer meaningfully higher wages, considerably greater educational opportunities, and substantially better access to healthcare and other essential public services compared to what remains available in many struggling rural areas. Manufacturing and service-sector jobs concentrated in urban economies frequently pay several times what comparable agricultural labor can realistically provide, creating a powerful and, for many families, genuinely difficult-to-resist economic pull that has proven remarkably consistent across vastly different countries and cultural contexts.

However, this same large-scale migration also generates substantial and often underappreciated strain on urban infrastructure that frequently struggles considerably to expand and adapt quickly enough to accommodate rapid, sustained population growth. Housing shortages, severe traffic congestion, overburdened public services, and the frequent, often rapid expansion of informal settlements lacking reliable access to clean water or proper sanitation are all extremely common and well-documented consequences of this pattern in cities worldwide, particularly across much of the rapidly urbanizing developing world. Meanwhile, the specific rural regions that migrants leave behind often face their own genuinely serious and compounding set of challenges, including a shrinking overall workforce, a rapidly aging remaining population, and the gradual, sometimes accelerating decline of local economies and community institutions that were once genuinely sustained by that same younger, working-age population that has since departed.

Urban planners and policymakers worldwide continue to actively experiment with a wide range of potential approaches intended to more effectively manage this ongoing and largely irreversible transition, ranging from ambitious large-scale affordable housing initiatives and substantial infrastructure investment in rapidly growing cities, to targeted rural development programs specifically designed to make staying in rural areas a genuinely more economically viable and attractive option for those who might otherwise choose, often reluctantly, to leave.',
   'C1', 13),
  -- C2
  ('הפרדוקס של הבחירה', 'The Paradox of Choice',
   'Conventional economic theory has long operated on the relatively straightforward assumption that expanding the range of available options invariably increases consumer welfare, since a strictly larger choice set can only, in principle, make it more likely that any given individual will locate an option that closely matches their particular preferences. Yet a substantial and steadily accumulating body of psychological research has increasingly complicated, and in certain well-documented contexts directly contradicted, this seemingly intuitive assumption.

The phenomenon now widely known as the paradox of choice describes empirical findings demonstrating that beyond a certain threshold, which appears to vary considerably depending on the specific decision context and the individual involved, additional options can actually diminish, rather than enhance, overall decision-making satisfaction. In an oft-cited and widely replicated series of experimental studies, researchers demonstrated that consumers presented with a smaller, carefully curated selection of jam varieties were, somewhat counterintuitively, both more likely to make an actual purchase and subsequently reported measurably higher satisfaction with their chosen selection than consumers who had instead been presented with a considerably larger, more extensive assortment of otherwise comparable options.

Several distinct but interconnected psychological mechanisms have been proposed to help explain this seemingly paradoxical effect. Excessive choice appears to meaningfully increase the cognitive burden associated with any given decision, since evaluating and directly comparing numerous alternatives demands considerably more sustained mental effort than most people are either willing or able to comfortably expend in typical everyday circumstances. Additionally, a larger set of available options tends to systematically raise individual expectations regarding the theoretically achievable outcome, which can subsequently amplify post-decision regret whenever the option ultimately selected, however objectively reasonable it might genuinely be, inevitably falls short of some idealized alternative that the decision-maker can now vividly and specifically imagine having chosen instead.

This growing body of research carries genuinely significant and practical implications across a remarkably wide range of real-world domains, from thoughtful retail product curation and the deliberate design of employee retirement savings plans, to broader public policy debates concerning the optimal number of health insurance options that should reasonably be offered to consumers navigating already-complex healthcare marketplaces. Rather than uncritically assuming that more choice is invariably and unconditionally better, an increasing number of researchers, designers, and policymakers alike now argue that thoughtfully curated, deliberately limited choice sets may, in many practical contexts, actually serve people''s genuine underlying interests considerably more effectively than unlimited, unstructured options ever realistically could.',
   'C2', 14),
  ('בחינה מחדש של נרטיבים היסטוריים', 'Reassessing Historical Narratives',
   'Historical narratives, once they become sufficiently embedded within a society''s collective memory and formal educational curricula, tend to acquire a deceptive and often unwarranted sense of permanence and settled objectivity, obscuring the reality that most widely accepted historical accounts are, in fact, the product of specific, often contested interpretive choices made by particular historians working within particular cultural, political, and institutional contexts, rather than being simple, neutral, self-evident records of what straightforwardly occurred.

Contemporary historiography, the specialized academic study of how history itself is researched, written, and subsequently revised over time, has increasingly emphasized that virtually every historical narrative reflects deliberate and consequential choices about which specific events, individuals, and broader social groups genuinely merit sustained scholarly attention, and, just as significantly, which ones are effectively marginalized, minimized, or omitted from the resulting account altogether. These consequential choices are rarely, if ever, entirely neutral; they are meaningfully and often substantially shaped by the available historical evidence and sources, by the particular methodological and theoretical assumptions historians bring to their research, and, perhaps most significantly of all, by the broader political and social climate prevailing at the specific time the historical account itself was originally being written and subsequently disseminated.

A particularly instructive and well-studied example involves the substantial historiographical shift regarding how the broader consequences of European colonialism have been documented, taught, and publicly discussed over the past several decades. Earlier generations of professional historians, often themselves writing from within the colonizing societies in question, frequently framed colonial expansion primarily in terms of technological progress, expanding trade networks, and the deliberate spread of supposedly superior governance structures and institutions. More recent historical scholarship, drawing substantially on previously underutilized indigenous sources, oral histories, and considerably more diverse archival materials, has meaningfully complicated this earlier narrative by giving far greater and more sustained attention to genuine resistance movements, the severe and often deliberately underreported economic exploitation involved, and the profound, frequently multigenerational cultural disruption experienced by colonized peoples and societies.

This ongoing and still-evolving process of historiographical revision does not necessarily imply that earlier historical accounts were simply and straightforwardly wrong in some crude, binary sense; rather, it more accurately illustrates that historical understanding is an inherently and permanently ongoing intellectual process, one that continues to evolve meaningfully as new evidence surfaces, as previously underrepresented and marginalized perspectives are finally and more fully incorporated, and as each successive generation of historians brings its own distinct set of legitimate questions, methodological tools, and interpretive concerns to the historical record left behind by those who came before them.',
   'C2', 15);

-- ============ MCQ EXERCISES (7 per text) ============

insert into public.exercises (type, skill_area, reading_text_id, cefr_level, content, sort_order)
select 'mcq'::exercise_type, 'reading'::skill_area, rt.id, rt.cefr_level, gen.content::jsonb, gen.sort_order
from public.reading_texts rt
join (values
  ('My Family', '{"prompt":"How many people are in the writer''s family?","options":["Three","Four","Five","Six"],"correctIndex":2}', 1),
  ('My Family', '{"prompt":"What is the dog''s name?","options":["Rex","Max","Buddy","Charlie"],"correctIndex":1}', 2),
  ('My Family', '{"prompt":"What does the writer''s father do?","options":["Teacher","Bus driver","Doctor","Chef"],"correctIndex":1}', 3),
  ('My Family', '{"prompt":"What does the writer''s mother teach?","options":["High school students","Young children how to read and write","University students","Music"],"correctIndex":1}', 4),
  ('My Family', '{"prompt":"What does the writer''s sister want to become?","options":["A teacher","A doctor","An artist","A driver"],"correctIndex":1}', 5),
  ('My Family', '{"prompt":"Where does the family eat lunch every Sunday?","options":["At a restaurant","At the grandmother''s house","At home","At the park"],"correctIndex":1}', 6),
  ('My Family', '{"prompt":"What do the father and grandfather do after lunch?","options":["Watch a movie","Play chess","Go for a walk","Cook dinner"],"correctIndex":1}', 7),

  ('At the Market', '{"prompt":"What day does the writer go to the market?","options":["Monday","Wednesday","Friday","Sunday"],"correctIndex":2}', 1),
  ('At the Market', '{"prompt":"What does the vegetable seller give the writer for free?","options":["An apple","A strawberry","A tomato","A cucumber"],"correctIndex":1}', 2),
  ('At the Market', '{"prompt":"What does the mother buy at the bread stall?","options":["Only bread","Two loaves of bread and a chocolate cake","Only cake","Cookies"],"correctIndex":1}', 3),
  ('At the Market', '{"prompt":"What color are the flowers the mother buys?","options":["Red","Blue","Yellow","White"],"correctIndex":2}', 4),
  ('At the Market', '{"prompt":"Where do they put the flowers?","options":["In the garden","On the kitchen table","In the bedroom","They don''t buy flowers"],"correctIndex":1}', 5),
  ('At the Market', '{"prompt":"Why does the mother prefer the market to the supermarket?","options":["It''s cheaper","It''s closer","It feels friendly, like everyone knows each other","It''s faster"],"correctIndex":2}', 6),
  ('At the Market', '{"prompt":"What does \"stall\" most likely mean in this text?","options":["A type of vegetable","A small shop or table selling goods","A kind of bread","A type of flower"],"correctIndex":1}', 7),

  ('Animals on the Farm', '{"prompt":"Where did the family go last summer?","options":["The beach","The uncle''s farm","The city","The mountains"],"correctIndex":1}', 1),
  ('Animals on the Farm', '{"prompt":"What woke the writer up every morning?","options":["An alarm clock","The rooster crowing","The cows","Their cousin"],"correctIndex":1}', 2),
  ('Animals on the Farm', '{"prompt":"What task did the writer do with their cousin?","options":["Milking cows","Collecting fresh eggs","Feeding horses","Cleaning the barn"],"correctIndex":1}', 3),
  ('Animals on the Farm', '{"prompt":"What was the cow''s name?","options":["Daisy","Bella","Molly","Rosie"],"correctIndex":1}', 4),
  ('Animals on the Farm', '{"prompt":"Which animals were the writer''s favorite?","options":["The chickens","The cows","The baby goats","The horses"],"correctIndex":2}', 5),
  ('Animals on the Farm', '{"prompt":"What did the writer do in the evening?","options":["Milked cows","Watched horses run in the field","Fed the goats","Went to sleep early"],"correctIndex":1}', 6),
  ('Animals on the Farm', '{"prompt":"How did the writer feel about the trip by the end of the week?","options":["Bored and ready to leave","Sad to leave and wanted to return","Scared of the animals","Indifferent"],"correctIndex":1}', 7),

  ('A Day in the Park', '{"prompt":"Who does Noa go to the park with?","options":["Her father","Her mother","Her friend","Her teacher"],"correctIndex":1}', 1),
  ('A Day in the Park', '{"prompt":"What flavor of ice cream does Noa choose?","options":["Vanilla","Strawberry","Chocolate with sprinkles","Mint"],"correctIndex":2}', 2),
  ('A Day in the Park', '{"prompt":"What does Noa do first at the playground?","options":["Swings","Climbs the slide","Eats a sandwich","Pets a dog"],"correctIndex":1}', 3),
  ('A Day in the Park', '{"prompt":"What does Noa''s mother do while Noa plays?","options":["Talks on the phone","Reads a book under a tree","Plays with Noa","Sleeps"],"correctIndex":1}', 4),
  ('A Day in the Park', '{"prompt":"What happens while they eat their sandwiches?","options":["It starts to rain","A friendly dog comes over","They meet another family","Noa falls asleep"],"correctIndex":1}', 5),
  ('A Day in the Park', '{"prompt":"What do they do right before leaving the park?","options":["Play on the swing","Buy ice cream","Eat sandwiches","Read a book"],"correctIndex":1}', 6),
  ('A Day in the Park', '{"prompt":"What does \"shady\" describe in this text?","options":["A tree that gives shade from the sun","A type of ice cream","A kind of dog","A playground toy"],"correctIndex":0}', 7),

  ('My Room', '{"prompt":"Where does the writer keep clothes?","options":["On the shelf","Under the bed","In a closet","On the desk"],"correctIndex":2}', 1),
  ('My Room', '{"prompt":"What is on the shelf above the desk?","options":["Books","Toys, including a teddy bear","Clothes","A lamp"],"correctIndex":1}', 2),
  ('My Room', '{"prompt":"Who gave the writer the teddy bear?","options":["Mother","Father","Grandmother","A friend"],"correctIndex":2}', 3),
  ('My Room', '{"prompt":"What color is the blanket on the bed?","options":["Red","Blue","Green","Yellow"],"correctIndex":1}', 4),
  ('My Room', '{"prompt":"What does the writer do every night before sleeping?","options":["Watches TV","Reads a new story","Does homework","Talks to friends"],"correctIndex":1}', 5),
  ('My Room', '{"prompt":"What is on the wall above the bed?","options":["Only photographs","Drawings and photographs","Only drawings","Nothing"],"correctIndex":1}', 6),
  ('My Room', '{"prompt":"Why does the writer love their room, according to the text?","options":["Because it is very big","Because it feels safe, comfortable, and like their own world","Because it has expensive furniture","Because it has a TV"],"correctIndex":1}', 7),

  ('A Day at Work', '{"prompt":"What time does Daniel finish work on a regular day?","options":["Four thirty","Five","Five thirty","Six"],"correctIndex":1}', 1),
  ('A Day at Work', '{"prompt":"What happens on Fridays at the office?","options":["It opens late","It closes early","It stays closed","Nothing changes"],"correctIndex":1}', 2),
  ('A Day at Work', '{"prompt":"How does Daniel get to work?","options":["He drives","He takes the bus","He walks","He rides a bike"],"correctIndex":1}', 3),
  ('A Day at Work', '{"prompt":"What does Daniel do first when he arrives at the office?","options":["Has lunch","Checks emails and prepares a task list","Attends a meeting","Calls a client"],"correctIndex":1}', 4),
  ('A Day at Work', '{"prompt":"Who does Daniel usually eat lunch with?","options":["Alone","His coworkers","His family","His boss"],"correctIndex":1}', 5),
  ('A Day at Work', '{"prompt":"Why does the office close early on Fridays?","options":["Because of low business","So everyone can prepare for the weekend","Because it''s a holiday","Because of the weather"],"correctIndex":1}', 6),
  ('A Day at Work', '{"prompt":"What does Daniel say makes even busy days feel manageable?","options":["His high salary","The people he works with","His short commute","His office view"],"correctIndex":1}', 7),

  ('A Trip to the City', '{"prompt":"Where did the family stay?","options":["A big hotel downtown","A small hotel near the old town","With relatives","A campsite"],"correctIndex":1}', 1),
  ('A Trip to the City', '{"prompt":"What did they do every morning?","options":["Slept late","Walked around and took photographs","Went shopping","Visited museums only"],"correctIndex":1}', 2),
  ('A Trip to the City', '{"prompt":"What did the family climb on the first morning?","options":["A mountain","A bell tower","A hill","A lighthouse"],"correctIndex":1}', 3),
  ('A Trip to the City', '{"prompt":"What souvenir did the sister buy?","options":["A postcard","A painted bowl","A T-shirt","A book"],"correctIndex":1}', 4),
  ('A Trip to the City', '{"prompt":"How did they choose restaurants to try?","options":["Randomly","Recommendations from the hotel receptionist","Online reviews","A guidebook"],"correctIndex":1}', 5),
  ('A Trip to the City', '{"prompt":"What did they do on their last day?","options":["Went shopping","Visited a museum","Went to the beach","Left immediately"],"correctIndex":1}', 6),
  ('A Trip to the City', '{"prompt":"How did the family feel about the trip overall?","options":["Disappointed","Tired but genuinely happy, calling it one of their best trips","Indifferent","Eager to go home early"],"correctIndex":1}', 7),

  ('Working From Home', '{"prompt":"What does Yael no longer spend nearly an hour on each day?","options":["Cooking","Commuting","Exercising","Reading"],"correctIndex":1}', 1),
  ('Working From Home', '{"prompt":"What does Yael do to separate personal and professional time?","options":["Nothing in particular","Takes a short walk before starting work","Works in bed","Ignores the boundary"],"correctIndex":1}', 2),
  ('Working From Home', '{"prompt":"What does Yael miss most about the office, according to the text?","options":["The commute","Casual, spontaneous conversations with colleagues","Her old desk","The coffee machine"],"correctIndex":1}', 3),
  ('Working From Home', '{"prompt":"What flexibility does Yael now have?","options":["None at all","Structuring her schedule around errands and school events","Working fewer hours total","Choosing her own salary"],"correctIndex":1}', 4),
  ('Working From Home', '{"prompt":"What does Yael do to maintain social connection with colleagues?","options":["She avoids all contact","She schedules video calls that aren''t strictly about work","She only emails them","She visits the office daily"],"correctIndex":1}', 5),
  ('Working From Home', '{"prompt":"What does the text suggest about why the personal/professional boundary can disappear when working from home?","options":["Because there''s no commute marking the transition","Because remote workers don''t have deadlines","Because there''s too much supervision","Because of technical issues"],"correctIndex":0}', 6),
  ('Working From Home', '{"prompt":"What is Yael''s overall conclusion about remote work?","options":["It doesn''t suit her at all","It suits her well, but only because she built structure and connection intentionally","It''s only good for the commute savings","She wants to return to the office full-time"],"correctIndex":1}', 7),

  ('Learning a New Language', '{"prompt":"What do experts suggest for practicing a language?","options":["Studying once a week for hours","Practicing a little every day","Only reading textbooks","Avoiding movies"],"correctIndex":1}', 1),
  ('Learning a New Language', '{"prompt":"What can make learning more enjoyable, according to the text?","options":["Taking tests","Watching movies and listening to music","Memorizing grammar rules","Studying alone in silence"],"correctIndex":1}', 2),
  ('Learning a New Language', '{"prompt":"What is one of the biggest obstacles adults face, according to the text?","options":["Lack of cognitive ability","Fear of making mistakes in front of others","Lack of good teachers","Lack of available apps"],"correctIndex":1}', 3),
  ('Learning a New Language', '{"prompt":"Why does consistent daily practice work better than occasional long sessions?","options":["It''s more fun","Language learning relies on repetition and regular reinforcement","It''s required by most courses","It''s cheaper"],"correctIndex":1}', 4),
  ('Learning a New Language', '{"prompt":"What do some learners find more valuable than months of silent study?","options":["Watching more movies","Real conversation practice, even with imperfect grammar","Memorizing vocabulary lists","Taking more tests"],"correctIndex":1}', 5),
  ('Learning a New Language', '{"prompt":"Why does real conversation help language learning, according to the text?","options":["It forces the brain to retrieve and use vocabulary under real pressure","It''s the only method that works","It avoids the need for grammar","It requires no effort"],"correctIndex":0}', 6),
  ('Learning a New Language', '{"prompt":"What do experts agree matters most in language learning, according to the passage?","options":["A single perfect textbook","Consistency, enjoyment, and tolerance for mistakes","Natural talent","Expensive private lessons"],"correctIndex":1}', 7),

  ('The Impact of Social Media', '{"prompt":"What do some studies suggest about excessive social media use?","options":["It has no effect","It can correlate with increased anxiety and isolation","It always improves mood","It only affects children"],"correctIndex":1}', 1),
  ('The Impact of Social Media', '{"prompt":"What do other researchers argue in defense of social media?","options":["It should be banned","It offers valuable connection opportunities for some groups","It has no benefits at all","It replaces in-person friendships completely"],"correctIndex":1}', 2),
  ('The Impact of Social Media', '{"prompt":"Why has scientific consensus on social media''s effects been hard to reach, according to the text?","options":["Researchers are not interested in the topic","Platforms and usage patterns keep evolving quickly","There is no funding for research","Social media has only existed for one year"],"correctIndex":1}', 3),
  ('The Impact of Social Media', '{"prompt":"What explanation do some researchers give for the anxiety-isolation paradox?","options":["Lack of internet access","Constant social comparison with idealized posts","Too much sleep","Lack of digital literacy"],"correctIndex":1}', 4),
  ('The Impact of Social Media', '{"prompt":"Which groups does the text say may particularly benefit from online communities?","options":["Only teenagers","People with disabilities, those in remote areas, and marginalized communities","Only wealthy people","Only professionals"],"correctIndex":1}', 5),
  ('The Impact of Social Media', '{"prompt":"What shift in research focus does the last paragraph describe?","options":["From \"is it good or bad\" to \"how is it being used\"","From qualitative to quantitative methods","From adults to children","From global to local studies"],"correctIndex":0}', 6),
  ('The Impact of Social Media', '{"prompt":"What is the overall argument of the passage?","options":["Social media is entirely harmful","Social media''s effects are complex and depend heavily on how it''s used","Social media should be studied less","Social media has no real effects"],"correctIndex":1}', 7),

  ('The Future of Remote Work', '{"prompt":"What do some analysts predict about commuting?","options":["It will increase","Fewer people commuting could ease pressure on transportation","It will stay the same","It will become mandatory"],"correctIndex":1}', 1),
  ('The Future of Remote Work', '{"prompt":"What concern do others raise about remote work?","options":["It''s too expensive","It may weaken team collaboration and spontaneous interaction over time","It reduces productivity immediately","It''s illegal in most places"],"correctIndex":1}', 2),
  ('The Future of Remote Work', '{"prompt":"What potential change to city centers does the text mention?","options":["Building more office towers","Converting underused office buildings into housing","Banning all commuting","Closing all downtown districts"],"correctIndex":1}', 3),
  ('The Future of Remote Work', '{"prompt":"What specific challenge do some companies report with remote work?","options":["Higher salaries","Onboarding new employees remotely","Too much office space","Lower profits"],"correctIndex":1}', 4),
  ('The Future of Remote Work', '{"prompt":"What kind of interactions does the text say are hard to replicate remotely?","options":["Formal scheduled meetings","Spontaneous, informal interactions like hallway conversations","Email exchanges","Video calls"],"correctIndex":1}', 5),
  ('The Future of Remote Work', '{"prompt":"Why might younger workers be more affected by remote onboarding, according to the text?","options":["They dislike using computers","They benefit disproportionately from close, informal, in-person mentorship","They prefer working alone","They are paid less"],"correctIndex":1}', 6),
  ('The Future of Remote Work', '{"prompt":"What do most workplace researchers now believe about the future, according to the passage?","options":["Fully remote work will dominate","Fully in-office work will return completely","Some hybrid model is likely to become the long-term standard","No one can predict the future at all"],"correctIndex":2}', 7),

  ('The Ethics of Artificial Intelligence', '{"prompt":"Why are many AI systems described as \"black boxes\"?","options":["They are physically black in color","Even their designers often cannot fully explain their specific outputs","They only work in the dark","They are kept secret by law"],"correctIndex":1}', 1),
  ('The Ethics of Artificial Intelligence', '{"prompt":"What problem does the text describe regarding AI and societal bias?","options":["AI systems are always perfectly neutral","AI can inherit and amplify biases present in training data","AI has no access to training data","Bias only affects human decisions, not AI"],"correctIndex":1}', 2),
  ('The Ethics of Artificial Intelligence', '{"prompt":"What examples of biased AI systems does the text mention?","options":["Only medical diagnosis errors","Facial recognition and hiring algorithms with documented bias","Only loan approval systems","Only criminal sentencing systems"],"correctIndex":1}', 3),
  ('The Ethics of Artificial Intelligence', '{"prompt":"Why is the lack of interpretability especially troubling in high-stakes decisions, according to the text?","options":["Because it makes AI systems slower","Because people have a legitimate right to understand and contest decisions affecting their lives","Because it increases costs","Because it violates copyright law"],"correctIndex":1}', 4),
  ('The Ethics of Artificial Intelligence', '{"prompt":"What are governments and organizations reportedly developing in response to these concerns?","options":["Complete bans on AI","Regulatory frameworks mandating transparency, bias testing, and human oversight","New AI systems to replace old ones","Nothing significant yet"],"correctIndex":1}', 5),
  ('The Ethics of Artificial Intelligence', '{"prompt":"Why does the text say AI can perpetuate the very inequities it was meant to reduce?","options":["Because it learns statistical patterns from biased historical human decisions","Because engineers intentionally programmed it that way","Because it lacks computing power","Because it is too expensive to fix"],"correctIndex":0}', 6),
  ('The Ethics of Artificial Intelligence', '{"prompt":"What is the overall argument of the passage?","options":["AI systems are entirely safe and require no oversight","AI''s growing role in high-stakes decisions raises serious ethical challenges around transparency and bias","AI should never be used in any decision-making","Bias in AI has already been completely solved"],"correctIndex":1}', 7),

  ('Urban Migration and Its Consequences', '{"prompt":"Why do many migrants move from rural areas to cities, according to the text?","options":["For better weather","For higher wages and greater opportunities","Because rural areas are illegal to live in","For no particular reason"],"correctIndex":1}', 1),
  ('Urban Migration and Its Consequences', '{"prompt":"What problem does the text mention regarding urban infrastructure?","options":["It always expands smoothly","It often struggles to keep up with rapid population growth","It never faces any strain","It only affects wealthy cities"],"correctIndex":1}', 2),
  ('Urban Migration and Its Consequences', '{"prompt":"What consequences of rapid urban migration does the text mention for cities?","options":["Only traffic congestion","Housing shortages, traffic congestion, and informal settlements","Only clean water shortages","Only economic growth"],"correctIndex":1}', 3),
  ('Urban Migration and Its Consequences', '{"prompt":"What challenges do rural areas face after people leave, according to the text?","options":["Population growth","A shrinking, aging population and declining local economies","Increased tourism","Lower unemployment"],"correctIndex":1}', 4),
  ('Urban Migration and Its Consequences', '{"prompt":"What kinds of jobs does the text say pay significantly more in urban economies?","options":["Agricultural labor","Manufacturing and service-sector jobs","Only government jobs","No jobs pay more"],"correctIndex":1}', 5),
  ('Urban Migration and Its Consequences', '{"prompt":"What is one approach policymakers use to address rural decline, according to the text?","options":["Banning migration entirely","Targeted rural development programs to make staying more viable","Ignoring the issue","Forcing people to return to rural areas"],"correctIndex":1}', 6),
  ('Urban Migration and Its Consequences', '{"prompt":"What is the overall argument of the passage?","options":["Urban migration has no real consequences","Urban migration brings real economic benefits to migrants but creates significant challenges for both cities and rural areas","Rural areas always benefit from migration","Cities should stop growing entirely"],"correctIndex":1}', 7),

  ('The Paradox of Choice', '{"prompt":"What does conventional economic theory traditionally assume about choice?","options":["Fewer options always increase welfare","More options always increase consumer welfare","Choice has no effect on welfare","Only price matters, not choice"],"correctIndex":1}', 1),
  ('The Paradox of Choice', '{"prompt":"What did the jam experiment find?","options":["More options led to more purchases and satisfaction","Fewer options led to more purchases and higher satisfaction","Options had no effect on purchases","People preferred not to buy jam at all"],"correctIndex":1}', 2),
  ('The Paradox of Choice', '{"prompt":"What psychological mechanism does the text mention regarding cognitive burden?","options":["Evaluating many options requires more mental effort than people want to expend","More options always reduce mental effort","Cognitive burden only affects experts","Choice has no cognitive cost"],"correctIndex":0}', 3),
  ('The Paradox of Choice', '{"prompt":"How does a larger set of options affect expectations, according to the text?","options":["It lowers expectations","It raises expectations, which can amplify post-decision regret","It has no effect on expectations","It eliminates regret entirely"],"correctIndex":1}', 4),
  ('The Paradox of Choice', '{"prompt":"What real-world domains does the text mention as relevant to this research?","options":["Only grocery shopping","Retail curation, retirement plans, and health insurance options","Only academic research","Only jam sales"],"correctIndex":1}', 5),
  ('The Paradox of Choice', '{"prompt":"What do researchers and designers increasingly argue based on this research?","options":["Unlimited choice is always best","Thoughtfully curated, limited choice sets may serve people''s interests better","Choice should be eliminated entirely","Only experts should make decisions for others"],"correctIndex":1}', 6),
  ('The Paradox of Choice', '{"prompt":"What is the overall argument of the passage?","options":["More choice always leads to better outcomes","Beyond a certain point, more choice can reduce satisfaction and decision-making quality","Choice has no psychological effects","Jam is the best example of consumer behavior"],"correctIndex":1}', 7),

  ('Reassessing Historical Narratives', '{"prompt":"What does the passage say about historical narratives?","options":["They are simple, neutral records of what happened","They reflect interpretive choices shaped by context, evidence, and the historian''s perspective","They never change once written","They are always completely accurate"],"correctIndex":1}', 1),
  ('Reassessing Historical Narratives', '{"prompt":"What example does the text use to illustrate historiographical shift?","options":["World War II","European colonialism","The Industrial Revolution","Ancient Egypt"],"correctIndex":1}', 2),
  ('Reassessing Historical Narratives', '{"prompt":"How did earlier historians often frame colonial expansion, according to the text?","options":["As purely exploitative","In terms of technological progress and spreading superior institutions","As a minor historical event","As entirely fictional"],"correctIndex":1}', 3),
  ('Reassessing Historical Narratives', '{"prompt":"What has more recent scholarship on colonialism emphasized, according to the text?","options":["Only economic statistics","Resistance movements, exploitation, and cultural disruption","Only technological advances","Nothing new"],"correctIndex":1}', 4),
  ('Reassessing Historical Narratives', '{"prompt":"What sources does the text say more recent scholarship draws on?","options":["Only official government records","Indigenous sources, oral histories, and diverse archival materials","Only newspaper archives","No new sources at all"],"correctIndex":1}', 5),
  ('Reassessing Historical Narratives', '{"prompt":"Does the passage suggest earlier historical accounts were simply \"wrong\"?","options":["Yes, completely wrong","No — it suggests historical understanding is an ongoing process that evolves with new evidence and perspectives","Yes, they were intentionally fabricated","The passage does not address this"],"correctIndex":1}', 6),
  ('Reassessing Historical Narratives', '{"prompt":"What is the overall argument of the passage?","options":["History is a fixed, objective record that never changes","Historical narratives reflect interpretive choices and continue to evolve as understanding deepens","Only recent historians are trustworthy","Historical revision is unnecessary"],"correctIndex":1}', 7)
) as gen(title_en, content, sort_order)
  on rt.title_en = gen.title_en;

-- ============ OPEN QUESTIONS (3 per text) ============

insert into public.reading_open_questions (reading_text_id, question_en, sort_order)
select rt.id, gen.question_en, gen.sort_order
from public.reading_texts rt
join (values
  ('My Family', 'Describe the writer''s family members and what each of them does.', 1),
  ('My Family', 'What do you and your family usually do together on weekends?', 2),
  ('My Family', 'Why do you think Sundays are the writer''s favorite day of the week? What is your favorite day, and why?', 3),

  ('At the Market', 'Describe the writer''s trip to the market, from start to finish.', 1),
  ('At the Market', 'Why does the writer''s mother prefer the market over a big supermarket? Do you agree with her reasons?', 2),
  ('At the Market', 'Describe a place you like to go shopping. What makes it special to you?', 3),

  ('Animals on the Farm', 'Describe the different animals the writer saw and interacted with on the farm.', 1),
  ('Animals on the Farm', 'Why do you think the baby goats were the writer''s favorite animals? What animal would you enjoy spending time with, and why?', 2),
  ('Animals on the Farm', 'Have you ever visited a farm or been close to farm animals? Describe what that experience was like, or what you imagine it would be like.', 3),

  ('A Day in the Park', 'Describe Noa''s day at the park, from morning until they leave.', 1),
  ('A Day in the Park', 'What do you like to do at a park? Describe your favorite outdoor activity.', 2),
  ('A Day in the Park', 'Why do you think Noa''s mother enjoys their days at the park too, even though she isn''t playing on the playground herself?', 3),

  ('My Room', 'Describe the writer''s room and what is in it.', 1),
  ('My Room', 'What does your own room (or favorite place at home) look like? Describe it.', 2),
  ('My Room', 'Why do you think having a personal space, like the writer''s room, is important to people? Explain your view.', 3),

  ('A Day at Work', 'Describe Daniel''s typical workday, from morning to the end of the day.', 1),
  ('A Day at Work', 'Daniel says his job can feel repetitive but he enjoys his coworkers. Do you think good colleagues can make a repetitive job better? Why or why not?', 2),
  ('A Day at Work', 'Describe your own daily routine, or a job you would like to have someday.', 3),

  ('A Trip to the City', 'Describe the family''s trip, day by day, based on the text.', 1),
  ('A Trip to the City', 'What kind of trip would you most like to take? Describe the place and what you would want to do there.', 2),
  ('A Trip to the City', 'The family says this was one of the best trips they had ever taken. What do you think makes a trip especially memorable?', 3),

  ('Working From Home', 'According to the text, what are the advantages and disadvantages Yael has experienced working from home?', 1),
  ('Working From Home', 'What habits has Yael developed to address the downsides of remote work, and why do you think they help?', 2),
  ('Working From Home', 'Would you personally prefer working from home or in an office? Explain the tradeoffs that matter most to you.', 3),

  ('Learning a New Language', 'According to the passage, what strategies help adults learn a new language more effectively?', 1),
  ('Learning a New Language', 'What do you think is the biggest challenge in learning a new language, based on your own experience or the text?', 2),
  ('Learning a New Language', 'The text says a fear of mistakes holds many adult learners back more than lack of ability. Do you agree? How might someone overcome that fear?', 3),

  ('The Impact of Social Media', 'According to the passage, what are the potential negative and positive effects of social media discussed by researchers?', 1),
  ('The Impact of Social Media', 'The text suggests that HOW social media is used matters more than whether it is used. Do you agree? What''s the difference between passive scrolling and meaningful engagement, in your view?', 2),
  ('The Impact of Social Media', 'Describe your own relationship with social media. Do you think it affects you more positively or negatively, and why?', 3),

  ('The Future of Remote Work', 'According to the passage, what are the potential benefits and drawbacks of the widespread shift to remote and hybrid work?', 1),
  ('The Future of Remote Work', 'Do you think a hybrid model is the best solution, or would you prefer fully remote or fully in-office work? Explain your reasoning.', 2),
  ('The Future of Remote Work', 'The text mentions that spontaneous, informal interactions are hard to replicate remotely. Can you think of a way companies might try to recreate that kind of interaction in a remote or hybrid setting?', 3),

  ('The Ethics of Artificial Intelligence', 'Explain the two main ethical challenges with AI decision-making described in the passage.', 1),
  ('The Ethics of Artificial Intelligence', 'Do you think AI should be used in high-stakes decisions like hiring or sentencing at all, given these challenges? Why or why not?', 2),
  ('The Ethics of Artificial Intelligence', 'The passage mentions that regulating AI across different countries with different values is difficult. What kind of regulation do you think would be most effective, and why?', 3),

  ('Urban Migration and Its Consequences', 'According to the passage, what are the benefits for individual migrants and the costs for both cities and rural areas?', 1),
  ('Urban Migration and Its Consequences', 'What approach do you think would be most effective for managing the challenges of urban migration — investing in cities, investing in rural areas, or both? Explain your reasoning.', 2),
  ('Urban Migration and Its Consequences', 'Have you or has someone you know ever moved from one place to another for better opportunities? Describe that experience or what you imagine it would be like.', 3),

  ('The Paradox of Choice', 'Explain the paradox of choice and the jam experiment that demonstrated it.', 1),
  ('The Paradox of Choice', 'Can you think of a time when having too many options made a decision harder or less satisfying for you? Describe that experience.', 2),
  ('The Paradox of Choice', 'The passage suggests that curated, limited choice sets might serve people better than unlimited options. Do you agree with this idea? Where do you think it applies, and where might it not?', 3),

  ('Reassessing Historical Narratives', 'Explain how the passage describes the shift in how European colonialism has been studied and discussed over time.', 1),
  ('Reassessing Historical Narratives', 'The passage argues that historical narratives reflect interpretive choices rather than neutral facts. Do you find this idea convincing? Why or why not?', 2),
  ('Reassessing Historical Narratives', 'Can you think of another historical topic, beyond colonialism, where our understanding has changed significantly over time? Describe what you know about that shift.', 3)
) as gen(title_en, question_en, sort_order)
  on rt.title_en = gen.title_en;

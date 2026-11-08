-- Rewrites 18 of the older reading texts (sort_order 8-15 and 24-33, B1-C2)
-- that read as padded AI prose: stacked adverbs (genuinely, actively,
-- considerably...), essay-style "remains a matter of ongoing debate"
-- endings. The new versions keep every fact, name and example that the
-- texts' 7 multiple-choice questions and 3 open questions rely on (each
-- checked by hand against its questions), and the same paragraph count.
--
-- Safe to run:
--  * UPDATE in place, by id: exercises, attempts, open questions and
--    progress all keep pointing at the same rows; nothing is deleted.
--  * Each UPDATE only applies if the text is still the exact original
--    (md5 guard), so an admin edit made since is never overwritten, and
--    running the file twice changes nothing the second time.
--  * The originals are copied to reading_texts_backup_20261108 first.
--    To undo:  update public.reading_texts r set body_en = b.body_en
--              from public.reading_texts_backup_20261108 b where b.id = r.id;

begin;

create table if not exists public.reading_texts_backup_20261108 as
  select id, title_en, body_en, now() as backed_up_at
  from public.reading_texts where false;
alter table public.reading_texts_backup_20261108 enable row level security;

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '079d24b6-083b-405b-b6b8-606b7edebf8f' and md5(body_en) = '5958c880a979927e3763aed02684f659'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '079d24b6-083b-405b-b6b8-606b7edebf8f');
update public.reading_texts set body_en = $body$Fifteen years ago, most people expected a job to mean one employer, fixed hours and a monthly salary. The gig economy has changed that expectation for millions. Through digital platforms, workers now take short-term, flexible jobs, driving one evening, delivering food the next, and the twentieth-century idea of job security looks very different as a result.

Supporters of the gig model point to the freedom it offers. Workers set their own hours, accept or turn down jobs as they like, and can earn from several platforms at once instead of depending on a single employer. For some people this is a real improvement on the fixed schedules of ordinary employment. Students can work around their classes, caregivers around the people they look after, and others use gig work to add a second income to a first.

That freedom has a price, and critics say it is often ignored. Gig workers usually receive none of the benefits that full-time employees have long taken for granted: no health insurance from an employer, no retirement contributions, no paid sick leave and no unemployment protection. If they fall ill, if the economy slows or if a platform simply has less work to offer, they are far more exposed. In most countries the law also treats them as independent contractors rather than employees, which means they usually have no right to a minimum wage, no overtime pay and no right to bargain collectively for better conditions.

Governments are still deciding how to classify and regulate this growing group of workers. Some have started to experiment with new, hybrid legal categories. These try to give gig workers certain protections, such as a guaranteed minimum level of earnings or portable benefits that move with a worker from one platform to another, without taking away the flexibility that attracts so many people to the work.

It is too early to know whether these hybrid categories will find a lasting balance between flexibility and real protection, or whether deeper changes to the law will be needed as gig work spreads into new industries. Economists, governments and the platforms themselves are still arguing about it.$body$
  where id = '079d24b6-083b-405b-b6b8-606b7edebf8f' and md5(body_en) = '5958c880a979927e3763aed02684f659';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '24c12f78-349b-4538-b735-487a3e6580db' and md5(body_en) = '19e85fe4e701845c22846213cc3c6ee5'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '24c12f78-349b-4538-b735-487a3e6580db');
update public.reading_texts set body_en = $body$In the last few decades, hundreds of millions of people around the world have left farming villages for cities, and the movement has not slowed. It has changed the cities that receive them, and it has emptied many of the places they left behind.

For the people who move, it is usually a sensible decision, and often a long-considered one. Cities pay more, offer more schooling and have better hospitals and public services than most struggling rural areas. A job in a factory or in the service sector can pay several times what the same person would earn working the land. That gap is hard for a family to ignore, and it pulls people in the same direction in very different countries and cultures.

Cities, however, rarely grow as fast as their populations. Housing runs short, roads clog, schools and clinics are overloaded, and informal settlements spread on the edges, often without clean water or proper sanitation. These are familiar sights in fast-growing cities everywhere, and especially in the developing world. The villages have problems of their own. When the young leave, the workforce shrinks, the people who stay grow older, and the shops, schools and local clubs that those younger workers once kept going begin to close.

Planners and governments are trying several things at once. Some build affordable housing on a large scale and invest in roads, water and transport in the growing cities. Others run targeted rural development programs, aimed at making it realistic to stay. If a decent living were possible at home, many of the people who leave, often reluctantly, might choose not to.$body$
  where id = '24c12f78-349b-4538-b735-487a3e6580db' and md5(body_en) = '19e85fe4e701845c22846213cc3c6ee5';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '32416c06-a685-43bc-8429-b1c3c0aa9420' and md5(body_en) = '9ed9c364b50dee71c5c78f2f0a245e37'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '32416c06-a685-43bc-8429-b1c3c0aa9420');
update public.reading_texts set body_en = $body$Fifteen years ago, few energy analysts would have predicted what happened next. The cost of renewable energy, above all solar panels and wind turbines, has fallen so far that in many parts of the world it is now cheaper to build new renewable capacity than to keep running existing fossil fuel power plants, never mind building new ones.

Several things pushed prices down at the same time. Factories got better at making solar panels, and as production grew around the world, every panel became cheaper to produce. Year after year, the price kept falling. Meanwhile, steady investment in research and development, from governments and from private companies, made the technology more efficient. A modern panel or turbine produces much more electricity than an older one of the same size.

Cheaper equipment, however, does not solve every problem. The biggest is that the sun and the wind are intermittent: the sun sets, and the wind drops. To keep the lights on, electricity has to be stored for those hours, and today's storage is still too expensive and too limited to do this on a large scale. Without enough storage, renewables alone cannot reliably meet demand on dark, still days, especially in winter in many countries. There is also the grid itself. Most electricity networks were designed decades ago around a few large, central fossil fuel plants. A system fed by thousands of smaller, variable sources needs a grid that has been rebuilt for it, and that is slow and costly work.

Most energy analysts agree that the market will not fix these problems quickly on its own. Storage and grid modernization will need governments, private companies and research institutions working together, with a shared plan.$body$
  where id = '32416c06-a685-43bc-8429-b1c3c0aa9420' and md5(body_en) = '9ed9c364b50dee71c5c78f2f0a245e37';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '343f4e34-7d6d-48dd-b869-3f12d92f9f2a' and md5(body_en) = '19e4e209041b7af50474bdcd06830097'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '343f4e34-7d6d-48dd-b869-3f12d92f9f2a');
update public.reading_texts set body_en = $body$A patient takes a pill with no active ingredient in it, a sugar pill, and gets better. Not imaginary better: measurably better. This is the placebo effect, and after decades of research it is still one of the most puzzling things in medicine.

The evidence is hard to argue with. In study after study, placebos have reduced the pain patients report and eased symptoms of depression and anxiety in clinical trials. They have also produced visible changes in brain activity and in certain chemical markers in the body. That last finding matters, because it shows the effect is physical, not just patients telling researchers what they want to hear. In some trials the placebo response is so large that it becomes difficult to show that a new drug works any better than an inert substitute, and researchers have had to design more and more careful studies to measure what the drug itself is doing.

Stranger still, placebos can work even when patients know exactly what they are getting. In studies of what is called the open-label placebo, patients were told honestly, before they started, that the pills contained nothing active, and many of them still improved. Doctors had long assumed that the effect depended on deception. If it does not, placebos could be used in treatment without the ethical problem of lying to patients.

Taken together, this research points to the ritual around treatment. A patient's expectations, a warm and trusting relationship with a doctor or nurse, even the simple routine of taking a pill each morning or turning up for an appointment, may all play a larger part in healing than medicine has usually been willing to admit.

For this reason, some researchers want the placebo effect to be seen differently. In drug trials, it is usually treated as noise, something to control for and remove. They argue that it should also be treated as a legitimate therapeutic tool in its own right, one that doctors could deliberately harness, alongside proven treatments, to help patients recover.$body$
  where id = '343f4e34-7d6d-48dd-b869-3f12d92f9f2a' and md5(body_en) = '19e4e209041b7af50474bdcd06830097';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '35a0848b-b032-4086-9f75-45fc0e3f1064' and md5(body_en) = '6bb3a8d931a9d96de970a9ebdf1b41a4'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '35a0848b-b032-4086-9f75-45fc0e3f1064');
update public.reading_texts set body_en = $body$We usually talk about procrastination as laziness, bad time management or a lack of willpower. Self-help books often say the same. Psychologists who study it closely see it differently. For them, chronic procrastination is mainly a problem of emotional regulation, not of productivity or organization.

The idea goes like this. People don't put tasks off because they forget how important they are or when they are due. They put them off because the task has become tied, often without their noticing, to an unpleasant feeling: anxiety, boredom, self-doubt, or a fear of failing. Starting the task means facing that feeling. Postponing it brings immediate, if temporary, relief. The trouble is that the relief does not last. The stress attached to the task stays where it is, and it usually grows as the deadline gets closer.

If this is right, it changes what helps. When the real problem is a difficult emotion rather than a bad schedule, a stricter timetable, another productivity app or more willpower will not fix it for most chronic procrastinators. Researchers suggest working on the feeling instead. One method is to cut a frightening task into much smaller steps, each one small enough to start without dread. Another is self-compassion: forgiving yourself for having procrastinated before, instead of attacking yourself for it.

That second point matters more than it sounds. Some studies have found that harsh self-criticism after procrastinating makes the habit worse, not better. It adds a new bad feeling, shame or guilt, to a task the person already finds uncomfortable, so the next attempt is even harder to begin. According to researchers, breaking that cycle is worth more than any scheduling trick.$body$
  where id = '35a0848b-b032-4086-9f75-45fc0e3f1064' and md5(body_en) = '6bb3a8d931a9d96de970a9ebdf1b41a4';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '46461a9b-6f4e-420f-a281-7d70fb015447' and md5(body_en) = '6e207c0da2cddd4ce1a435883be86678'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '46461a9b-6f4e-420f-a281-7d70fb015447');
update public.reading_texts set body_en = $body$Two years ago, Yael started working from home full time. She likes it, mostly. But it took her a while to see that working from home has costs as well as benefits, and she is still learning how to handle them.

The benefits came first. Yael no longer spends nearly an hour a day commuting to the office and back, so she has more time to exercise, to read, or just to drink her coffee slowly before she starts. Her schedule is also much more flexible. She can go to the bank when it is quiet, or leave in the afternoon for her children's school play, and she doesn't have to ask her manager first. The costs came more slowly. What she misses most are the small, unplanned conversations with colleagues: a joke by the coffee machine, a quick question in the corridor. Sometimes those chats turned into good ideas. Even when they didn't, they made the day feel less lonely.

So Yael has built a few habits. Every morning, before she opens her laptop, she goes for a short walk around the block. Without a commute, there is nothing to mark the line between home and work, and the walk gives her one. Once or twice a week she also arranges a video call with a colleague that has nothing to do with work. They talk about weekends, films, their kids. It is not the same as the office, but it helps.

Looking back, Yael thinks remote work suits her well. She is also sure that it works only because she planned it that way. At the office, routine and company simply happened. At home, she has had to build both herself.$body$
  where id = '46461a9b-6f4e-420f-a281-7d70fb015447' and md5(body_en) = '6e207c0da2cddd4ce1a435883be86678';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '52b07df6-f6a2-47c8-b488-b64ed395e146' and md5(body_en) = '184686db9a617535d3beb87faaad9317'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '52b07df6-f6a2-47c8-b488-b64ed395e146');
update public.reading_texts set body_en = $body$Phones buzz, screens glow, and there is always one more video to watch. For many people, finding time for a book has become hard. Surveys show that reading for pleasure has declined a lot over the past twenty years, especially among young adults. Many of them say they are too busy, or too tired after work, to concentrate on a book.

That is a pity, because reading seems to do more than help us relax. Reading fiction, in particular, has been linked to better empathy. To follow a story, you have to imagine what the characters think, want and feel, even when their lives are nothing like yours. Researchers believe that this exercise, repeated over many books, makes readers better at understanding other people's point of view in real life too.

Reading also seems to be one of the best ways to reduce stress. In several studies, it worked better than many other ways people relax, such as listening to music, going for a walk or having a cup of tea. One explanation is that a good book takes all of your attention. While you are inside the story, there is no room left for everyday worries, and few other activities pull the mind away from them so completely.

So how do you start reading more? Experts suggest starting small. Ten minutes a day, every day, is easier to keep up than a big plan to finish a whole novel in one weekend. People who try the big plan often feel exhausted after a week and stop completely. People who read a little every day tend to keep going.$body$
  where id = '52b07df6-f6a2-47c8-b488-b64ed395e146' and md5(body_en) = '184686db9a617535d3beb87faaad9317';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '5ce3718c-d05c-4a3d-ad55-00af29cd27d1' and md5(body_en) = '926b6b975a08839b38f2237588da62fd'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '5ce3718c-d05c-4a3d-ad55-00af29cd27d1');
update public.reading_texts set body_en = $body$A bank decides whether you get a loan. A company decides whether your résumé ever reaches a person. A court decides how long someone stays in prison, and a hospital decides what is wrong with a patient. More and more often, part of each decision is made by an AI system, and a question that once interested a handful of academics now sits on the desks of lawmakers.

The first difficulty is that many of these systems cannot explain themselves. Programs built on deep learning work as "black boxes": even the engineers who designed and trained them often cannot say why the system gave one answer rather than another that looked just as reasonable. That matters most where a person has a legitimate right to understand a decision and to contest it. If you are refused a loan, turned down for a job or denied parole, "the model said so" is not a reason anyone can argue with.

The second difficulty is bias. These systems learn statistical patterns from past human decisions, and many of those decisions were shaped by discrimination. A system trained on them can inherit that bias, and sometimes amplify it, repeating the very unfairness it was built to reduce. This has already happened in public. Facial recognition systems have proved less accurate on darker-skinned faces, and hiring algorithms have quietly marked down résumés that contained certain names, or schools associated with particular groups.

Governments and international organizations have started to respond with regulatory frameworks that require transparency, testing for bias and real human oversight wherever the stakes are high. Writing such rules has turned out to be easier than agreeing on how to enforce them. Countries differ in their legal traditions and in what they value, and a standard one of them accepts may be unworkable in another. For now, that problem has no agreed solution.$body$
  where id = '5ce3718c-d05c-4a3d-ad55-00af29cd27d1' and md5(body_en) = '926b6b975a08839b38f2237588da62fd';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '62766479-bcf7-4b19-b6d9-b4942ec10919' and md5(body_en) = '08e9f111fcef70a75757d492318ed9a8'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '62766479-bcf7-4b19-b6d9-b4942ec10919');
update public.reading_texts set body_en = $body$Every app on your phone wants the same thing from you: your time. Human attention has become one of the most valuable resources in the modern economy, and the markets built to capture and sell it are now as sophisticated as those for oil or grain. Unlike oil, though, attention cannot be extracted faster. Each of us has only so much of it in a day, and that limit makes the competition between platforms fiercer every year.

Technology companies employ large teams of behavioral scientists, data analysts and designers whose stated job is to keep people on the platform for as long as possible. Their tools are well known. Infinite scrolling feeds remove the natural moment at which you would put the phone down. Notifications arrive on an unpredictable schedule, borrowing the same principle that keeps people at slot machines. And recommendation algorithms favor content that provokes strong emotions, because anger and excitement reliably keep people watching longer than anything calm or neutral.

Critics say this creates a basic conflict of interest. Most platforms earn their money from advertising, and advertising pays according to engagement. Their income therefore depends on capturing attention as efficiently as possible, not on whether users end up better off, and certainly not on what that attention costs them. Some researchers compare certain design choices to the methods of the tobacco or gambling industries: they exploit known weaknesses in human thinking, and knowing how the trick works does not make it much easier to resist.

A small group of technologists, many of them former employees of the large platforms, now argue for a different approach. They want design that puts the user's wellbeing ahead of engagement figures: natural stopping points built into the interface, recommendation systems that users can see into and adjust, and default settings meant to reduce the time people spend on the app rather than increase it.

So far, such ideas are the exception. They cut directly against the advertising model that pays for almost every major platform. Whether the industry would change on its own, or only under serious outside regulation, is a question on which policymakers, engineers and researchers still disagree.$body$
  where id = '62766479-bcf7-4b19-b6d9-b4942ec10919' and md5(body_en) = '08e9f111fcef70a75757d492318ed9a8';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '63fffe49-ec2e-4d4e-a4de-eb4900e6f346' and md5(body_en) = 'e35be9bf53204cb84cc935b4eb96f6d8'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '63fffe49-ec2e-4d4e-a4de-eb4900e6f346');
update public.reading_texts set body_en = $body$Once a story about the past has settled into a country's textbooks and public memory, it starts to look permanent, as if it were simply a record of what happened. It rarely is. Most accepted accounts of history are the result of choices made by particular historians, working in particular places and times, and many of those choices were disputed when they were made.

Historiography, the study of how history is researched, written and revised, has made this point with increasing force. Every historical account decides which events, which people and which groups deserve attention, and, just as importantly, which are pushed to the margins or left out. Those decisions are almost never neutral. They depend on what evidence survives, on the methods and theories a historian brings to it, and, perhaps most of all, on the political and social mood of the moment in which the history is written and read.

The way European colonialism has been written about shows the process clearly. Earlier generations of historians, many of them writing from inside the colonizing countries, tended to tell the story as one of technological progress, growing trade and the spread of what they regarded as superior institutions and ways of governing. Over the past few decades, historians have turned to sources that were long neglected: indigenous records, oral histories and a much wider range of archives. Their work has given far more room to the people who resisted colonial rule, to the economic exploitation that was often played down at the time, and to the cultural damage that colonized societies carried for generations.

None of this means the older accounts were simply wrong, as if history were a test with one correct answer. What it shows is that understanding the past is never finished. New evidence appears. Voices that were missing are added. And each generation of historians arrives with its own questions and its own tools, and reads the same record differently from the one before.$body$
  where id = '63fffe49-ec2e-4d4e-a4de-eb4900e6f346' and md5(body_en) = 'e35be9bf53204cb84cc935b4eb96f6d8';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '666c0011-b152-4a3f-a914-8f107626a02a' and md5(body_en) = '09e16fa08f6e7bec6f5822854e645abc'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '666c0011-b152-4a3f-a914-8f107626a02a');
update public.reading_texts set body_en = $body$Survivorship bias is what happens when we study the cases that succeeded and forget the ones that failed, usually because the failures left nothing behind to study. The visible winners are a small, unrepresentative sample, and conclusions drawn from them alone can be badly wrong. The mistake turns up in a surprising number of places, from war to business to architecture.

The classic example comes from the Second World War. Engineers examining fighter planes that came back from missions noticed where the bullet holes were concentrated, and proposed adding armor to exactly those areas. The statistician Abraham Wald saw the flaw. Every plane they were looking at had, by definition, survived. Damage in the places they were studying was damage a plane could survive. The planes hit in other places, the engine for instance, had not come back at all, so they were missing from the data. The armor, Wald argued, belonged where the returning planes showed the least damage, because those were the hits that brought planes down.

The same error appears wherever success stories are told. Books and articles about business explain a famous entrepreneur's success through particular habits, bold decisions or personality traits. They rarely mention the much larger number of people who had the same habits, took the same risks, had the same character, and failed, often for reasons that had little to do with any of the qualities being celebrated.

Or consider old buildings. People often say they don't build them like they used to, pointing to the old houses still standing in a town. But the badly built houses from the same period are not there to compare. They fell down, were demolished or were replaced long ago. What remains is the best of that period, and it looks like the typical work of the time.

Spotting this bias takes a deliberate question, asked whenever a success story or a neat pattern seems convincing: what would the missing failures look like, and if they were included, would the conclusion still hold? It is not a question that comes naturally. Even trained researchers and experienced analysts, with all their statistics, have to make a habit of asking it.$body$
  where id = '666c0011-b152-4a3f-a914-8f107626a02a' and md5(body_en) = '09e16fa08f6e7bec6f5822854e645abc';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '795dfe73-cb75-4f7a-9d72-d14c3f6c6c19' and md5(body_en) = 'd3927c6216faa6a8679ef1122fb024d8'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '795dfe73-cb75-4f7a-9d72-d14c3f6c6c19');
update public.reading_texts set body_en = $body$"Excellent at multitasking" appears on countless résumés and job advertisements, as if it were a badge of the modern professional. Yet in the strict sense, handling two demanding mental tasks at the same moment, multitasking hardly exists. The word describes something the brain does not actually do.

What neuroscience finds, again and again, is switching. The brain does not run two demanding tasks in parallel; it moves its attention rapidly from one to the other and back, and every move has a price. Researchers call it the switching penalty. It shows up in the data as slower work overall, more mistakes in both tasks, and poorer memory for whatever was taken in while attention was divided. The penalty is heaviest when the two tasks draw on the same mental resources, for example when both involve language: writing an email while following a conversation is far harder than it feels.

Then comes the paradox. When people who describe themselves as skilled multitaskers are tested in the laboratory, they often do worse on objective measures of task-switching and sustained attention than people who say they avoid multitasking whenever they can. The finding has been repeated many times. Confidence in one's ability to multitask, it seems, may run opposite to the ability itself, a pattern that resembles the wider tendency psychologists call illusory superiority, our habit of rating ourselves above average.

None of this is merely academic. Many offices and classrooms reward constant switching, sometimes openly: a dozen browser tabs, three chat windows, a phone call taken while a report is half written. Organizational psychologists increasingly recommend structural interventions to protect focused, single-task work time, such as fixed blocks of the day with no notifications, no meetings and no interruptions. Their argument is that protected focus produces far more than juggling does, however busy the juggler looks.

Some researchers go further. By presenting multitasking as an impressive skill, they argue, our culture may be feeding workplace stress and burnout. It turns a normal limit of the human brain, one that everyone shares, into a personal weakness that people believe they should be able to overcome with enough effort.$body$
  where id = '795dfe73-cb75-4f7a-9d72-d14c3f6c6c19' and md5(body_en) = 'd3927c6216faa6a8679ef1122fb024d8';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = '7c916036-de25-4424-b98d-40c1d6898de1' and md5(body_en) = '0823b75314aa27decd09cc49c3ccc97d'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = '7c916036-de25-4424-b98d-40c1d6898de1');
update public.reading_texts set body_en = $body$Many people believe that if you didn't learn a language as a child, it is too late. It isn't. Adults learn differently from children, and they meet different problems, but plenty of people become fluent in their thirties, forties and later.

Surprisingly, the biggest problem for adults is usually not memory or intelligence. It is the fear of making mistakes in front of other people, something small children hardly worry about. The second problem is the way adults often study: one long session on the weekend and nothing during the week. Language experts say that a short practice every day, even fifteen or twenty minutes, works much better in the long run. A language is learned through repetition, and repetition works best when it comes regularly, not in big, rare bursts.

Textbooks and grammar exercises are useful, but they are only part of the picture. Experts also suggest bringing the new language into things you already enjoy. Watch films and series with subtitles. Listen to music. Follow a few social media accounts in the language. That way, learning feels less like homework and more like a habit. Some learners say that real conversation, even with bad grammar, taught them more than months of studying quietly alone. When you talk to someone, your brain has to find the right word now, under real pressure, and that is how words stay.

There is no perfect method, book or app. Most experts agree on three simpler things: practice regularly, enjoy it, and accept that you will make mistakes. Adults who see that discomfort as a normal part of learning move forward much faster than adults who wait to feel ready before they speak.$body$
  where id = '7c916036-de25-4424-b98d-40c1d6898de1' and md5(body_en) = '0823b75314aa27decd09cc49c3ccc97d';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = 'a8f83cad-1cee-48ed-b8fb-197890cf2004' and md5(body_en) = 'efd3dba2615a00106d87f9f93bd5656b'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = 'a8f83cad-1cee-48ed-b8fb-197890cf2004');
update public.reading_texts set body_en = $body$During the pandemic, many companies sent their staff home as an emergency measure. Plenty of them never fully called them back. Flexible and hybrid working has become permanent in many offices, and that raises bigger questions: how will it change our cities, our workplaces and the wider economy over the next twenty years?

Some urban analysts are optimistic. If fewer people travel to work every day, crowded trains and buses in big cities could get some relief, and there could be less traffic and lower carbon emissions as well. City centers might change too. When business districts are half empty on a Tuesday, office buildings stand unused, and some cities are already looking at turning those buildings into apartments to help with their housing shortages.

Other researchers are more cautious, and their arguments are hard to dismiss. Much of what makes a team work, they say, happens by accident: a conversation in the hallway, a coffee break that turns into a new idea, the slow building of trust between people who see each other every day. Those spontaneous, informal moments are difficult to create on purpose online, however good video tools become. Several companies also report a more specific problem: onboarding new employees remotely is hard. Young and inexperienced workers learn a great deal from sitting near someone more senior, watching and asking small questions. That kind of informal mentorship is much harder to arrange through a screen.

So where will it settle? Most workplace researchers now expect a hybrid model, some days at home and some in the office, to become the normal arrangement in most office-based industries. What they still disagree about is the right mix. Two days in the office, or three? For most companies, that question has no clear answer yet.$body$
  where id = 'a8f83cad-1cee-48ed-b8fb-197890cf2004' and md5(body_en) = 'efd3dba2615a00106d87f9f93bd5656b';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = 'b3d62140-f53d-43fb-97a3-a540d1bb5163' and md5(body_en) = '7a666434c4e8b03d3237d68f7165bf0a'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = 'b3d62140-f53d-43fb-97a3-a540d1bb5163');
update public.reading_texts set body_en = $body$Economists have long worked on a simple assumption: more options can only make consumers better off. If the menu gets longer, the logic goes, you are at least as likely to find something that suits you, and probably more likely. Over the past few decades, psychologists have collected a good deal of evidence that this is not always true.

The effect has a name, the paradox of choice. Past a certain point, which depends on the decision and on the person making it, extra options make people less satisfied with what they choose, not more. The best-known demonstration involved jam. Shoppers who were offered a small selection of flavors were more likely to buy a jar than shoppers offered a much larger range of similar ones, and they were happier with the jar they took home. The study has been repeated and argued over many times since, and the basic pattern keeps turning up.

Psychologists offer two main explanations. The first is effort. Comparing many alternatives properly takes more concentration than most people are willing, or able, to give an ordinary purchase, so they either give up or choose with a nagging sense of having guessed. The second is expectation. A long list raises our idea of how good the result could be. Whatever we end up with, however sensible, then has to compete with an ideal option we can now picture clearly, and regret follows more easily.

The findings matter well beyond the supermarket. Shops use them to decide how many products to stock. Employers use them when they design retirement savings plans, where too many funds can leave workers enrolled in none. Governments meet the same question when they decide how many health insurance options to put in front of people who already find the system confusing. A growing number of researchers, designers and policymakers now argue that a short, carefully chosen list often serves people better than an endless one. More choice, it turns out, is a benefit only up to a point, and that point comes sooner than economic theory once expected.$body$
  where id = 'b3d62140-f53d-43fb-97a3-a540d1bb5163' and md5(body_en) = '7a666434c4e8b03d3237d68f7165bf0a';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = 'b484e503-afbc-46a6-85ae-06b786446efd' and md5(body_en) = '3acdb8f8d108482250fe88a015a340f2'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = 'b484e503-afbc-46a6-85ae-06b786446efd');
update public.reading_texts set body_en = $body$For most of modern history, sleep was seen as a passive state: a pause during which the body and the brain simply switched off between the hours that mattered. On this view, sleep was a necessary inconvenience, something to cut short whenever there was work to finish, friends to see or something better to do.

Neuroscience has spent the last few decades taking that idea apart. Sleep, it turns out, is a busy and essential process. In the deep stages of sleep, the brain consolidates memory, moving information from short-term into long-term storage and strengthening the connections behind skills practiced during the day. Sleep also matters for emotional regulation: people who are short of it find stress much harder to manage and misread other people's emotions more often. The most surprising discovery concerns cleaning. During deep sleep, a special system in the brain becomes far more active than it is during the day and washes away waste products, including proteins linked to neurodegenerative diseases.

The effects of not sleeping enough are just as clear. Large studies show that people who regularly sleep less than six hours a night have a higher risk of poor concentration, a weaker immune system and, over the years, heart and blood vessel problems. Some researchers have compared the effect of severe sleep loss on the brain to functioning while legally intoxicated. That comparison has started to shape safety rules in some industries, including transportation and healthcare, where a tired mistake can cost lives.

Culture has been slow to catch up. In many demanding jobs, sleep is still treated as a luxury, the first thing to go when a deadline approaches or an invitation arrives. Sleep researchers argue that changing this attitude could do as much for public health as any medicine or treatment we have today.$body$
  where id = 'b484e503-afbc-46a6-85ae-06b786446efd' and md5(body_en) = '3acdb8f8d108482250fe88a015a340f2';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = 'e97732a0-884a-4d03-a67b-1e2a30ed0ce2' and md5(body_en) = '8087925125baaba54680613d49897c00'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = 'e97732a0-884a-4d03-a67b-1e2a30ed0ce2');
update public.reading_texts set body_en = $body$Is social media bad for our mental health? After more than ten years of research, scientists still don't agree. One reason is speed: the platforms, and the way people use them, change faster than studies can be designed, carried out and published.

Several large studies have found a link between heavy social media use, especially among teenagers, and higher levels of anxiety, poor sleep and loneliness. It is a strange result. These teenagers are, in one sense, more connected to other people than any generation before them. Some researchers explain the paradox with comparison. On a feed, everyone else's life is edited: the best photos, the holidays, the good news. Measured against that, an ordinary day can easily feel like failure, because no real life looks like a highlight reel.

Other researchers warn against a story in which social media is simply harmful. For some people, they point out, it opens doors that are otherwise closed. A person with a disability may find it hard to meet friends in person. Someone in a remote village may have no one nearby who shares their interests. Members of minority groups may not find local people who understand their experience. For all of them, an online community can offer a real sense of belonging that their immediate surroundings cannot.

Because the picture is so mixed, many researchers have stopped asking whether social media is good or bad. They ask how it is being used instead. The early evidence suggests the difference matters: scrolling passively through other people's posts seems to affect us in one way, while actively talking, sharing and taking part seems to affect us in another.$body$
  where id = 'e97732a0-884a-4d03-a67b-1e2a30ed0ce2' and md5(body_en) = '8087925125baaba54680613d49897c00';

insert into public.reading_texts_backup_20261108 (id, title_en, body_en, backed_up_at)
  select id, title_en, body_en, now() from public.reading_texts
  where id = 'fb273228-d3f9-4ce9-bb3d-51b086e336bb' and md5(body_en) = '3fdc09fb95c3d4da7d038355378d0041'
  and not exists (select 1 from public.reading_texts_backup_20261108 b where b.id = 'fb273228-d3f9-4ce9-bb3d-51b086e336bb');
update public.reading_texts set body_en = $body$Picture a village pasture that every herder may use. Each of them, acting in their own interest, adds one more animal, and then another. No single decision is foolish. Together, they strip the grass until the pasture can feed no one. This is the tragedy of the commons: individuals, each behaving rationally, exhaust a shared and limited resource, even though the result harms all of them, themselves included.

The logic is simple, which helps explain why economists, biologists and political scientists keep returning to it. The herder who adds an animal receives the whole benefit at once. The cost, a little more overgrazing and a slow decline in the pasture, is spread thinly across everyone who uses the land. That asymmetry, concentrated individual benefit against widely dispersed collective cost, gives every user a reason to keep adding animals while the shared resource moves steadily toward collapse.

The same pattern appears far from any pasture. Overfishing empties international waters that no single country controls. Farms in dry regions pump shared groundwater faster than rain can replace it. And billions of separate economic decisions, each sensible on its own, fill the shared atmosphere with greenhouse gases.

For decades after the idea was given its modern form in the mid-twentieth century, economists offered two remedies. One was privatization: give the resource an owner, who would then bear the costs and have a reason to manage it well. The other was strict government regulation, with limits on use enforced from above. Then came the field research of Elinor Ostrom, who later received the Nobel Prize for it. Ostrom studied communities around the world that had managed shared forests, fisheries and irrigation systems for generations without either remedy. They relied on locally developed rules, on mutual monitoring by the members themselves, and on penalties that grew step by step for those who broke the rules.

Her work, and the research that followed it, does not deny that the problem is real. The incentives Ostrom's predecessors described do exist. What it shows is that the tragedy is not inevitable. It is better understood as a failure of governance, and when local institutions are given the freedom to develop their own arrangements, it can often be avoided, or at least kept under control.$body$
  where id = 'fb273228-d3f9-4ce9-bb3d-51b086e336bb' and md5(body_en) = '3fdc09fb95c3d4da7d038355378d0041';

commit;

-- Expect 18 rows here after running:
select count(*) as rewritten from public.reading_texts r
  join public.reading_texts_backup_20261108 b on b.id = r.id where r.body_en <> b.body_en;

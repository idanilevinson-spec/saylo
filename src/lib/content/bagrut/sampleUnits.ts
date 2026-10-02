// Original sample content demonstrating the verified module formats in
// moduleFormats.ts — see docs/specs/bagrut-track.md §2.2, §5, and §8.
//
// This content was composed from scratch for this file. Nothing here was
// copied, adapted, or even read from any actual Bagrut exam, past or
// present — the research behind moduleFormats.ts only ever looked at how
// exams are STRUCTURED (sections, point values, word counts), never at real
// exam text, specifically so there would be nothing to accidentally echo.
//
// Module C is a special case worth flagging too: its structure was finally
// confirmed (2026-10-02) by checking the real current official exam's own
// instructions page (duration, point split, essay word-count instruction) —
// not a third-party guide. The passage and questions in that real exam were
// NOT read, used, or adapted for anything below; "The Repair Café" is an
// unrelated, original topic composed independently, same discipline as
// every other module here.
//
// Module D is a special case worth flagging explicitly: the real exam tests
// specific literary works (a story and a poem) chosen by the Ministry and
// studied in advance — we don't know, and can't guess, which works are on
// the current official list. The module D sample below is an ORIGINAL short
// story, included only to practice the KIND of close-reading/analysis
// module D asks for — never presented as "the" assigned text. See the
// titleHe and the disclaimer rendering in BagrutPracticeUnit.tsx.
//
// Two DIFFERENT, NEVER-MERGED gates (spec §5, updated 2026-09-28 at the
// owner's explicit request to proceed without a professional teacher):
//   - teacherReviewed: a qualified English teacher actually checked this
//     against the current syllabus. Still false on everything below — no
//     teacher has been involved yet.
//   - aiContentDisclosed: this is AI-written from a verified module format,
//     and the mandatory disclosure in BAGRUT_AI_CONTENT_DISCLAIMER will be
//     shown alongside it every single time. This does NOT mean "reviewed" —
//     it means "shown honestly for what it is."
// getPublishableSampleUnit() is the only function that should ever feed a
// learner-facing screen; it enforces that at least one of the two is true,
// and any future UI must render the disclaimer whenever aiContentDisclosed
// is what justified showing the content (teacherReviewed content doesn't
// strictly need it, but showing it anyway is never wrong).

import { BAGRUT_MODULE_FORMATS, type BagrutModuleCode } from "./moduleFormats";

export const BAGRUT_AI_CONTENT_DISCLAIMER =
  "החומר הזה נוצר על ידי AI, בהתבסס על מבנה הבחינה הרשמי — הוא לא נבדק על ידי מורה מוסמך ואינו רשמי או מטעם משרד החינוך. מומלץ להשתמש בו כתרגול נוסף, ולא כתחליף לחומר לימוד רשמי או להנחיית מורה.";

export interface BagrutReadingQuestion {
  formatHe: string;
  promptEn: string;
  options?: string[];
  // Only set (and only meaningful) when `options` is set — the UI uses this
  // to color a multiple-choice answer, rather than trying to infer
  // correctness by string-matching the option text against modelAnswerHe,
  // which isn't reliable (modelAnswerHe is free text like "תשובה נכונה: B.").
  correctOptionIndex?: number;
  // Not shown to a learner even once published — this is a reviewer/grading
  // aid, not part of the exercise itself.
  modelAnswerHe: string;
}

export interface BagrutWritingTask {
  promptEn: string;
  wordCountRange: [number, number];
}

export interface BagrutVocabularyQuestion {
  formatHe: string;
  promptEn: string;
  options?: string[];
  correctOptionIndex?: number;
  modelAnswerHe: string;
}

// Only module A currently needs this (30 of its 100 points), reusing the
// same Neural TTS engine as /listening (ListeningPlayer) rather than a new
// audio component.
export interface BagrutListeningTask {
  transcriptEn: string;
  questions: BagrutReadingQuestion[];
}

export interface BagrutSampleUnit {
  moduleCode: BagrutModuleCode;
  // Unique only within a module (not globally) — "1", "2", ... in the order
  // a learner would naturally want to work through them. Lets a module have
  // more than one practice set without changing the URL shape for modules
  // that still only have one.
  unitSlug: string;
  titleHe: string;
  teacherReviewed: boolean;
  aiContentDisclosed: boolean;
  // A module's own verified format (moduleFormats.ts) says how many
  // passages this should be and what each one's word-count range is — A has
  // two separate ~300–350 word passages, B/E/F/G have one, D has one
  // (literature) story. Always at least one entry.
  readingPassages: string[];
  readingQuestions: BagrutReadingQuestion[];
  listeningTask?: BagrutListeningTask;
  // Module E has no writing task (spec §2.2) — vocabulary instead.
  writingTask?: BagrutWritingTask;
  vocabularyQuestions?: BagrutVocabularyQuestion[];
}

const GREEN_CORNER_PASSAGE = `Two years ago, students at Neve Yosef High School decided to turn an empty piece of land behind the sports hall into something useful. The area had been full of old furniture and rubbish for as long as anyone could remember. A group of tenth-graders, led by a student named Dana, asked the principal for permission to clean it up and build a small garden.

At first, only twelve students joined the project. They spent every Thursday afternoon removing broken chairs, old tires, and plastic bottles. Local shops donated tools, and a nearby plant nursery gave the students seeds and young plants for free. By the end of the first year, the "Green Corner," as it became known, had vegetable beds, herb pots, and a small seating area where students could relax during breaks.

The garden quickly became more popular than anyone expected. Younger students started asking how they could help, and by the second year, more than fifty students were taking part. Some grew vegetables that were later used in the school cafeteria. Others learned simple skills, such as watering schedules and composting, which many said they had never thought about before.

Teachers noticed another change as well. Students who rarely spoke up in class began taking charge of small tasks in the garden, from organizing volunteers to keeping records of what had been planted. For many of them, the Green Corner became the first project where they truly felt responsible for something from start to finish.`;

const BIKE_SHARE_PASSAGE = `Ten years ago, getting across the city center of Ramat Sharon usually meant sitting in traffic or waiting for a bus that rarely arrived on time. Today, thousands of residents start their day differently: they unlock a bicycle from one of forty stations scattered around the city, ride to work or school, and leave it at another station near their destination.

The idea began almost by accident. A small group of engineers at the local transportation authority noticed that most car trips within the city center were shorter than three kilometers — distances that could easily be covered by bike in under fifteen minutes. Convincing the city council to invest in a shared bicycle network took nearly two years of meetings, pilot studies, and public debates. Many residents doubted that people would actually use the bikes, especially during the hot summer months.

The results surprised almost everyone. Within the first year, the number of daily bike trips crossed ten thousand, far beyond what planners had predicted. Local shop owners reported an unexpected benefit as well: cyclists, unlike drivers searching for parking, tended to stop more often along their route, which increased foot traffic to small businesses.

Not every part of the project succeeded immediately. Several stations ran out of available bikes during rush hour, forcing the authority to redesign its distribution system using data collected from every ride. Engineers now predict busy periods and move bicycles between stations overnight, a process that has cut shortages by more than half.

Perhaps the most significant change, according to a recent survey, is not environmental but social. Many residents said the shared bikes gave them a reason to notice parts of their own neighborhood they had never really looked at before. What started as a transportation experiment has slowly become something the city now considers part of its identity.`;

const CAMPUS_VOICES_TRANSCRIPT = `Good morning, and welcome back to Campus Voices. Today we're talking to Noa Admon, a second-year engineering student who recently started a small project to help new students find their way around campus. Noa, thanks for joining us.

So, tell us, how did this project begin? Well, during my first week here, I got lost about four times a day. The campus map online was outdated, and none of the buildings were clearly numbered. I thought, there has to be a better way. So, together with two friends, I built a simple phone app that shows live directions between buildings, plus a short description of what's inside each one.

That's wonderful. How many students are using it so far? Right now, around six hundred students have downloaded it, mostly first-years. We're also getting messages from international students, who say it's especially useful for them, since a lot of the campus signs are only in Hebrew.

What's next for the project? We're hoping to add real-time information about which classrooms are free, so students can find a quiet place to study between classes.

That sounds incredibly useful. Thanks so much for talking with us, Noa. Thank you for having me.`;

const OUTDOOR_LESSONS_PASSAGE = `Two years ago, Hillside Middle School decided to try something unusual: instead of keeping every class inside a classroom, teachers began holding some lessons outdoors, in the school's courtyard and the small wooded area behind the gym.

The idea came from a science teacher, Mr. Doron, who noticed that students seemed more focused after spending time outside during breaks. He suggested that one lesson per week, in any subject, could be taught outdoors instead of in the usual classroom. At first, several teachers were doubtful. They worried that students would be distracted by noise, insects, or simply the novelty of sitting on the grass instead of at a desk.

The first few outdoor lessons were, admittedly, a little chaotic. Students had trouble staying quiet, and one math lesson had to be cut short because of unexpected rain. However, teachers slowly adjusted their methods, bringing portable whiteboards and preparing shorter, more interactive activities suited to the outdoor setting.

Within a few months, something changed. Students who rarely participated in regular classroom discussions began raising their hands outside. A geography teacher reported that her outdoor map-reading lesson led to the liveliest class discussion she'd had all year. Several students later said they simply felt calmer and less pressured outdoors, which made it easier to speak up.

By the end of the first year, the program had grown from one weekly lesson to three, and other schools in the district began asking Hillside for advice on starting similar programs of their own. Mr. Doron, who still teaches most of his science lessons outdoors, says the biggest lesson wasn't about plants or weather at all — it was about how much a change of environment can affect how comfortable students feel to speak up and take part. Teachers who were once skeptical now request the courtyard for their own lessons weeks in advance, and the program shows no sign of slowing down.`;

const BLACKOUT_PASSAGE = `At around eight o'clock on a Tuesday evening in March, the electricity suddenly went out across most of the Neve Dan neighborhood. For the first hour, nobody thought much of it — power cuts were rare, but not unheard of, and most residents assumed it would be fixed within minutes.

By nine o'clock, however, it became clear that this was no ordinary outage. The entire street was dark except for the headlights of parked cars and the occasional flashlight moving between windows. Rumors spread quickly: some neighbors said a transformer had exploded nearby, while others blamed the storm that had passed through earlier that day.

What happened next surprised many residents. Instead of everyone retreating indoors to wait it out alone, small groups began gathering outside their buildings. Someone brought out a portable speaker. A family on the ground floor set up a few folding chairs on the sidewalk and invited neighbors to sit. Within half an hour, nearly thirty people — many of whom had barely spoken to each other before — were standing or sitting together in the dark, sharing snacks and swapping stories by candlelight.

One elderly resident, who had lived on the street for over twenty years, later said it reminded her of neighborhood gatherings from decades earlier, before every building had its own security gate and every resident kept mostly to themselves. A teenager who lived two buildings down said it was the first time he had actually spoken to most of his neighbors, despite living there his whole life.

The power finally returned just after midnight, four hours after it first went out. Most residents went back inside fairly quickly, but something had shifted. In the weeks that followed, several neighbors who met that night began organizing a monthly outdoor gathering, power outage or not — proof, some said, that it sometimes takes losing something ordinary to notice what had been missing all along.`;

const REPAIR_CAFE_PASSAGE = `Every second Saturday of the month, the community hall in Oakdale fills up with an unusual kind of visitor. People arrive carrying broken toasters, torn jackets, wobbly chairs, and old radios that stopped working years ago. They are not there to sell these items or throw them away — they are there to fix them, with help from volunteers who call their gathering the Repair Café.

The idea started three years ago when a retired electrician, Mr. Harel, grew frustrated watching neighbors throw away appliances that needed only a small part replaced. He put up a notice offering free repairs one Saturday a month, expecting perhaps a handful of people to show up. Instead, over thirty people arrived on the very first day, many of them simply curious to watch rather than needing anything fixed themselves.

Word spread quickly, and other volunteers with different skills joined Mr. Harel: a seamstress who could mend torn clothing, a young engineering student who specialized in small electronics, and a carpenter who repaired wobbly furniture in exchange for nothing more than a cup of coffee. Visitors are never charged a fee, though many choose to leave a small donation toward the cost of tools and spare parts.

What surprised the organizers most was not how many items got fixed, but how many friendships formed between people who had lived on the same street for years without ever really speaking. Teenagers waiting for their turn would end up chatting with elderly visitors about appliances neither of them actually understood, and several regular volunteers now meet for coffee outside of the monthly event entirely.

Mr. Harel says the Repair Café was never really about the toasters. "People bring us their broken things," he says, "but what they actually leave with is time spent with a neighbor — something just as hard to find these days as a spare part for a thirty-year-old radio."`;

const LAST_LESSON_STORY = `Mrs. Avram had taught the same classroom for thirty-one years. On her last day before retirement, she arrived earlier than usual, carrying a small cardboard box she planned to fill before noon.

The students didn't know it was her final lesson. She had asked the principal not to announce it, afraid that a fuss would be made, flowers brought, speeches given — the kind of attention she had quietly avoided her entire career.

She taught the lesson exactly as she always did: writing neatly on the board, calling on students by name, pausing to let a slow learner finish a thought rather than rushing to the next hand raised. When the bell rang, the students gathered their bags and filed out, barely glancing back, the way students always do when a lesson is simply over, not ending anything larger.

Mrs. Avram sat alone for a moment. Then she began filling her box: a chipped mug, a stack of ungraded essays she would never return, a photograph of a class from many years earlier, their faces now unfamiliar to her. At the bottom of her desk drawer, she found a folded note a student had once passed her — "Thank you for not giving up on me" — unsigned, the ink faded almost to nothing.

She had forgotten the note existed. She did not remember which student had written it, or in which year. For a moment she considered that this, perhaps, was the only ending a thirty-one-year career truly needed: not a ceremony, but a quiet classroom, an ordinary Tuesday, and a single sentence she had kept without knowing why.`;

const LIBRARY_PASSAGE = `When the town council in Carmel Heights first proposed replacing the local library's front desk with a self-service kiosk, many residents worried the change would make the building feel cold and impersonal. Two years later, something unexpected happened: the library became busier than ever, not in spite of the change but partly because of it.

The renovation, completed with a modest municipal grant, allowed the library to stay open to card-holders around the clock, using an automated entry system instead of relying on staff to be present at all hours. Visitors could scan their library card at a side entrance, enter a smaller reading room equipped with security cameras, and borrow or return books using self-checkout machines, even at two in the morning.

At first, usage during the overnight hours was minimal — mostly a handful of university students preparing for exams. Within a few months, however, librarians noticed a clear pattern: parents of young children were showing up shortly after bedtime, finally finding time to browse quietly without interruption, something many said had become nearly impossible during the library's previous, more limited hours.

Shift workers made up another unexpected group of frequent late-night visitors. A nurse who works overnight hospital shifts said the extended hours meant she could finally visit the library on her way home at six in the morning, rather than having to choose between sleep and reading time on her rare days off.

Not everyone was pleased with the change. Some long-time staff members raised concerns about safety and about the loss of the personal guidance a librarian could once offer browsing visitors. In response, the library kept staffed hours during the traditional daytime schedule, reserving the unstaffed overnight access only for returning and borrowing, not for research help or children's programs.

Perhaps the most telling sign of the project's success came a year after launch, when the town's youth council voted to request a similar system for the local sports center, arguing that teenagers, much like night-shift nurses and sleep-deprived parents, often needed access to spaces at hours that did not match a traditional nine-to-five schedule. The library, it seemed, had quietly proven something broader than anyone first expected: that access, not just content, can determine whether a public service truly serves its community. Town officials now describe the extended-hours model less as an experiment and more as a correction — a recognition that a schedule built around a traditional workday had, for years, simply excluded anyone whose life didn't fit it.`;

const ALWAYS_REACHABLE_PASSAGE = `For most of human history, being unreachable was simply the default condition of being away from home. A traveler, once departed, might be out of contact with family and colleagues for days, weeks, or in earlier centuries, months at a time. Today, that condition has become not the default but the exception — carefully engineered through flight mode, remote cabins, or simply, increasingly rarely, the willpower to leave a phone behind.

Researchers studying workplace behavior have become particularly interested in what they call "the expectation of availability" — the unspoken assumption, common in many modern workplaces, that an employee ought to be reachable outside of official working hours, even if no policy explicitly requires it. A recent study following several hundred office workers found that the mere perception of being expected to respond quickly to messages, regardless of whether a reply was actually demanded, was strongly associated with elevated stress levels and reduced satisfaction with one's personal time, even among employees who received relatively few messages after hours.

What makes this phenomenon especially difficult to address, according to the researchers, is that it rarely stems from an explicit rule. Few managers formally instruct employees to answer emails at ten at night. Instead, the expectation tends to form gradually, through small, often unintentional signals: a manager who regularly sends messages late in the evening, even without expecting an immediate reply, can inadvertently create a culture in which employees feel obligated to at least appear responsive, lest they be perceived as uncommitted.

Some companies have attempted structural solutions. A handful of organizations have experimented with software that delays the delivery of emails sent outside working hours until the following morning, regardless of when they were actually written. Early results suggest this reduces the sense of obligation employees feel to respond immediately, though critics argue it treats a cultural problem as though it were merely a technical one, and does little to address managers who simply call instead.

Other voices in the debate take a different view entirely, arguing that the discomfort many employees feel is not evidence of a problem to be solved through policy, but a natural, perhaps even necessary, adjustment to a world that has genuinely changed. Work, they argue, has never been strictly confined to fixed hours for everyone, and the real task is not to recreate an imagined past of clean separation, but to build healthier individual habits within a connected present that is not going away.

Whichever view one takes, few dispute the underlying fact uncovered by the research: it is often not the message itself, but the quiet, half-conscious sense of being expected to answer it, that exacts the greater cost.`;

// ============ Second unit per module (2026-10-02) ============
// Same discipline as the first batch: every passage below is original,
// composed from scratch, and not adapted from anything real.

const SILENT_DISCO_TRANSCRIPT = `This is your Friday morning update from Sunrise Radio. Before the news, here's something a little different: this Saturday, the community center on Maple Street is hosting its very first "silent disco" afternoon in the park. If you haven't heard of a silent disco before, everyone wears wireless headphones instead of listening to speakers, so people dancing right next to each other might actually be listening to completely different songs.

Organizers say they chose this format specifically because it means the event won't disturb nearby apartments with loud music, something that caused complaints during last year's outdoor festival. There will be three channels to choose from: pop, eighties classics, and local community requests.

Entry is free, though organizers are asking people to bring their own water bottles, since none will be sold on-site this year to cut down on plastic waste. The event runs from two until six in the afternoon, and headphones will be available to borrow at the entrance, first come, first served. In case of rain, the whole thing moves indoors to the community hall instead.`;

const TUTORING_EXCHANGE_PASSAGE = `When Daniel Cohen struggled with algebra in ninth grade, it was a classmate, not a teacher, who finally helped the concepts make sense to him. Two years later, remembering how much that help had mattered, Daniel decided to set up something similar for other students at his school: a free, student-run tutoring exchange.

The idea was simple. Students who felt confident in one subject could offer to tutor others, in exchange for receiving help in a subject where they themselves struggled. A tenth-grader good at chemistry but weak in English literature, for example, could be matched with another student willing to make the opposite trade.

Daniel expected maybe ten or fifteen students to sign up in the first month. Instead, word spread quickly through the school's group chats, and within three weeks over eighty students had registered, covering nearly every subject taught at the school. Daniel and two friends spent most evenings that month manually matching students by hand, before eventually building a simple spreadsheet system to manage requests more efficiently.

Teachers at the school noticed the change as well. Several reported that students who had rarely asked questions in class were now arriving with much more specific, confident questions, clearly having already discussed the material with a peer tutor beforehand. The school's guidance counselor began recommending the exchange to students who seemed hesitant to ask teachers directly for extra help, especially those worried about appearing behind their classmates.

Not every match worked out perfectly. A handful of students dropped out after a session or two, usually because personalities or teaching styles didn't fit well together. Daniel says he stopped seeing this as a failure and started treating it as useful information, simply re-matching students until something clicked. Two years after starting with a handful of friends, the exchange now runs every semester, entirely organized by students, with no teacher supervision required at all.`;

const FREE_PANTRY_PASSAGE = `Outside a small house on Birch Avenue, a wooden box about the size of a large mailbox sits attached to the garden fence, its glass door visible from the sidewalk. Inside, instead of mail, there are usually a few cans of soup, a box of pasta, sometimes a jar of peanut butter, and occasionally a handwritten note.

The box, known locally as a "little free pantry," was built two summers ago by a retired carpenter named Ruth Feldman, after she read about similar projects in other cities. The idea is simple: anyone can take what they need, and anyone can leave something to share, no questions asked and no registration required.

At first, Ruth kept the pantry stocked almost entirely by herself, checking it every morning and refilling it whenever it ran low. Within a few months, however, she began noticing that other neighbors were quietly contributing too, often leaving items without ever mentioning it to her directly. A box that usually emptied out by evening would somehow be half-full again by the next morning.

Ruth says the hardest part was convincing some neighbors that taking food from the box wasn't something to feel embarrassed about. She started leaving a small handwritten sign inside reading, "Take what you need, leave what you can, no explanation necessary," which seemed to make a noticeable difference.

Three other little free pantries have since appeared in nearby neighborhoods, each maintained independently by different residents, with no official organization connecting them. Ruth says she never expected the project to spread, but she isn't surprised either. "People want to help," she says. "Sometimes they just need to see that someone else started first."

Local schools have also taken notice. A nearby elementary school now runs a short project each spring where students help build and paint new pantry boxes, which are then donated to streets that don't yet have one of their own.`;

const ROBOTICS_CLUB_PASSAGE = `Two years ago, Lior Mizrahi wanted to start a robotics club at his school, but there was one problem: nobody else seemed interested, and the school had no budget for new equipment.

Lior didn't give up easily. He asked his physics teacher for permission to use the science lab after school, and he brought his own old motors and spare parts from home. At first, only two other students joined him, both friends he had known since elementary school. They spent most afternoons simply figuring out how things worked, often making careless mistakes along the way.

Slowly, things changed. The small group entered a local competition, and even though they didn't win, other students at school noticed and became curious. By the end of the year, the club had grown to fifteen members, and the school finally agreed to give them a small budget.

Lior says the hardest part was never the robots themselves — it was convincing people to try something new when nothing was guaranteed to work. These days, the club meets twice a week, and several of its first members have gone on to study engineering. Looking back, he's proud that the club started with almost nothing, and he hopes future students will remember that it doesn't take much to begin, just someone willing to start and a few spare parts from home.`;

const SUSPENDED_COFFEE_PASSAGE = `At Marlowe's, a small coffee shop on the corner of Fifth and Main, customers are sometimes surprised to find they don't need to pay for their drink at all. The shop runs on something it calls the "suspended coffee" system, where customers can choose to pay for an extra coffee in advance, leaving it for whoever might need one later.

The idea isn't new — it has existed in cafés in several countries for many years — but Marlowe's owner, Teresa Ruiz, only introduced it after a regular customer suggested it during a particularly difficult winter. "We had people walking past every day who clearly couldn't afford a hot drink," she explains, "and we also had plenty of customers who said they'd happily pay a little extra if it helped someone else."

The system works on a simple honor basis. A small chalkboard near the register shows how many suspended coffees are currently available. Anyone, regardless of whether they look like they need help, can simply ask for a "suspended coffee" and receive one, no explanation required and no questions asked.

In its first year, the program covered just over four hundred drinks. Teresa says what surprised her most wasn't how many people took a free coffee, but who did: students studying during exam season, delivery workers taking a short break, and even, occasionally, someone who later came back to pay for several suspended coffees themselves once their own situation improved.

Not every customer uses the system, and Teresa has never pressured anyone to participate. Still, she says the chalkboard tally has become something regular customers check almost automatically, treating it less like charity and more like a small, ongoing habit the whole neighborhood quietly takes part in together.`;

const HOUSE_REMEMBERS_POEM = `The paint has changed three times since we moved in,
the kitchen tiles get colder every year,
yet standing in the hallway, I begin
to hear the voices no one else can hear.

My father's keys, dropped twice upon this floor.
My mother, singing softly, slightly off.
The door that always stuck, the broken drawer,
the winter that the heating coughed and coughed.

New families will walk these halls one day,
and paint again, and fix what time has bent.
They will not hear the songs that drift away,
or know the names of those who also went.

A house keeps nothing, really, for itself —
it only holds what we have chosen to leave
on walls, in corners, on a dusty shelf:
not objects, but the people we still grieve.`;

const TOOL_LIBRARY_PASSAGE = `In most neighborhoods, owning a power drill that gets used twice a year seems like an unavoidable waste, but residents of Elm Heights have found an alternative: a tool library, where borrowing equipment works exactly like borrowing books.

The idea began when a local handyman, Victor Osei, realized that many of his neighbors owned expensive tools that sat unused in garages for months at a time, while others avoided small home repairs simply because buying the right tool seemed like an unnecessary expense for a single job. He proposed converting an unused storage room at the community center into a shared tool collection, funded partly by small membership fees and partly by donated equipment that residents no longer needed.

Within its first year, the tool library had collected over two hundred items, ranging from basic hammers and screwdrivers to specialized equipment like tile cutters and pressure washers, tools that would be expensive for any single household to justify buying outright. Members pay a small annual fee, considerably less than the cost of buying even one or two of the pricier tools themselves, and can borrow items for up to a week at a time.

Victor insists the project is about more than simply saving money. "When someone comes to return a drill," he says, "they often end up talking to whoever is staffing the desk about what they're actually building or fixing, and sometimes that turns into advice, or even someone offering to help." The tool library has, somewhat by accident, become a place where neighbors with no obvious reason to interact now regularly do.

Not every tool survives heavy community use. Volunteers maintain a small repair bench specifically for equipment that gets returned in poor condition, and a few older, less durable donations have had to be retired entirely rather than repaired. Victor says this was expected from the beginning and considers a certain amount of wear simply the cost of the system working as intended.

Local officials from two neighboring towns have since visited Elm Heights to learn how the tool library operates, hoping to start similar projects of their own. Victor jokes that he never expected to become, in his words, "an accidental expert in borrowed hammers," but he has clearly grown fond of the role.`;

const ROOFTOP_BEES_PASSAGE = `Few people walking past the Grantham Hotel in the city center would guess that its flat roof, fourteen floors above the street, is home to six beehives and roughly two hundred thousand bees. The hotel installed the hives three years ago, part of a small but growing trend of urban beekeeping that has spread to office buildings, rooftop gardens, and even a handful of schools.

The idea came from the hotel's head chef, Marco Dellacqua, who had read that honeybee populations were declining in many rural areas due to pesticide use and the loss of wildflower meadows, while cities, somewhat surprisingly, often provide a wider variety of flowering plants across parks, gardens, and balconies than large stretches of modern farmland. Rooftops, it turns out, can be unexpectedly good places for bees to thrive, as long as someone is willing to manage the hives properly.

Managing urban hives, however, is not as simple as placing a few wooden boxes on a roof and waiting. The hotel hired a professional beekeeper, Priya Nair, who visits weekly to check the health of each colony, monitor for disease, and ensure the bees have enough space as their numbers grow throughout the warmer months. Guests staying at the hotel can request a short rooftop tour, viewed safely from behind protective netting, and the hotel's restaurant now serves its own rooftop honey at breakfast, something Marco says guests find far more interesting than a generic honey packet ever could.

The project has not been entirely without challenges. During the first summer, one hive became unexpectedly aggressive, likely due to a change in queen bee, and had to be relocated to a quieter section of the roof away from the guest terrace. Priya also notes that urban beekeeping requires constant attention to local regulations, since not every city permits hives within a certain distance of windows or public walkways.

Still, the benefits have been significant enough that two nearby hotels have since installed their own rooftop hives, partly inspired by the Grantham's example and partly by simple curiosity from guests who ask about it. Marco hopes the trend continues to spread, not just for the honey itself, but for what he sees as a small, visible reminder, fourteen floors above a busy street, that even a dense city center can support more life than most people walking beneath it ever notice. "You just have to look up," he says, "or in this case, remember to look up at all."`;

const RIGHT_TO_BE_FORGOTTEN_PASSAGE = `In 2014, a Spanish citizen successfully argued before a European court that outdated, personally embarrassing information about him should no longer appear in search engine results for his name, even though the original article reporting it had been entirely accurate at the time of publication. The ruling established what has since become widely known as the "right to be forgotten," and it continues to generate fierce debate nearly a decade later.

Supporters of the right to be forgotten argue that the internet has fundamentally changed what it means for information to fade from public memory. Before search engines existed, an old newspaper article about a minor financial mistake or a teenage arrest would typically require a trip to a physical archive to locate, effectively allowing most people's past missteps to recede naturally with time. Today, the same information can resurface instantly and permanently attached to a person's name, regardless of how much they may have changed in the intervening years, or how irrelevant the information has become to who they currently are.

Critics, however, warn that the right to be forgotten sits uneasily alongside another principle many societies value just as strongly: freedom of information, and the public's right to access an accurate historical record. Journalists and historians in particular have expressed concern that allowing individuals to request the removal of search results, even when the underlying facts are true, risks quietly erasing inconvenient but legitimate public history, especially in cases involving public figures, former officials, or individuals convicted of serious crimes.

Search engine companies, caught in the middle of this debate, have generally been required to evaluate each removal request individually, weighing the requester's privacy interest against the public's interest in the information remaining accessible. This has placed technology companies in the unusual position of making judgment calls that resemble legal or journalistic decisions, despite being neither courts nor news organizations themselves, a role many of these companies have publicly stated they never sought and remain uncomfortable occupying.

The debate has also expanded well beyond Europe, as other countries consider whether to adopt similar protections, often adapting the underlying principle to fit very different legal traditions around free expression. Some legal scholars argue that a version of the right to be forgotten will eventually become a global norm, simply because the discomfort of a permanent, searchable past is not unique to any one culture or legal system. Others remain skeptical, pointing out that any right which depends on selectively hiding true information will always sit in tension with the basic premise that history, however uncomfortable, generally serves the public better recorded than erased.

Whatever position one takes, the underlying tension is unlikely to resolve itself cleanly, if only because it pits two deeply held values against one another rather than pitting a clear right against a clear wrong — and disputes of that particular shape, history suggests, tend to persist for a very long time.`;

export const BAGRUT_SAMPLE_UNITS: readonly BagrutSampleUnit[] = [
  {
    moduleCode: "A",
    unitSlug: "1",
    titleHe: "דוגמה למודול A — הדרכה בקמפוס",
    teacherReviewed: false,
    aiContentDisclosed: true,
    listeningTask: {
      transcriptEn: CAMPUS_VOICES_TRANSCRIPT,
      questions: [
        {
          formatHe: "רב-ברירה",
          promptEn: "Why did Noa decide to start the project?",
          options: [
            "Because she kept getting lost on campus during her first week",
            "Because her professor asked her to build an app",
            "Because she wanted to start a business",
            "Because the campus map was too expensive to print",
          ],
          correctOptionIndex: 0,
          modelAnswerHe: "תשובה נכונה: A.",
        },
        {
          formatHe: "השלמת משפט",
          promptEn: "According to Noa, international students find the app especially useful because many campus signs are ___.",
          modelAnswerHe: "תשובה: only in Hebrew.",
        },
        {
          formatHe: "רב-ברירה",
          promptEn: "How many students are currently using the app, according to Noa?",
          options: ["About sixty", "About six hundred", "About six thousand", "About sixteen hundred"],
          correctOptionIndex: 1,
          modelAnswerHe: "תשובה נכונה: B.",
        },
        {
          formatHe: "שאלה פתוחה",
          promptEn: "What does Noa hope to add to the app in the future? Explain in your own words.",
          modelAnswerHe:
            "תשובה מקובלת: מידע בזמן אמת על אילו כיתות פנויות, כדי שתלמידים ימצאו מקום שקט ללמוד בין שיעורים.",
        },
      ],
    },
    readingPassages: [OUTDOOR_LESSONS_PASSAGE, BLACKOUT_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why did Mr. Doron suggest holding lessons outdoors?",
        options: [
          "He noticed students seemed more focused after being outside",
          "He wanted to save money on classroom supplies",
          "The school building was being repaired",
          "Parents demanded a change",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "According to the text, one of the first outdoor lessons had to be cut short because of ___.",
        modelAnswerHe: "תשובה: unexpected rain.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn:
          "According to the text, why did some students who rarely spoke up in regular classrooms begin to participate outdoors? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: הם הרגישו רגועים יותר ופחות לחוצים בחוץ, מה שהקל עליהם להשתתף.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What did neighbors do once it became clear the power outage wasn't a quick fix?",
        options: [
          "They all went to a nearby hotel for the night",
          "They gathered outside together and spent time with each other",
          "They called the news to complain",
          "They left the neighborhood",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The elderly resident said the gathering reminded her of ___.",
        modelAnswerHe: "תשובה מקובלת: neighborhood gatherings from decades earlier, before every building had a security gate.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, what changed in the weeks after the blackout? Support your answer with information from the text.",
        modelAnswerHe:
          "תשובה מקובלת: כמה שכנים שנפגשו באותו ערב התחילו לארגן מפגש חודשי קבוע בחוץ, גם בלי הפסקת חשמל.",
      },
    ],
  },
  {
    moduleCode: "B",
    unitSlug: "1",
    titleHe: "דוגמה למודול B — הפינה הירוקה",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [GREEN_CORNER_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What was the area behind the sports hall used for before the project began?",
        options: [
          "A vegetable garden",
          "A place full of old furniture and rubbish",
          "A parking lot for teachers",
          "A second sports field",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The Green Corner became more popular in its second year because ___.",
        modelAnswerHe: "תשובה מקובלת: יותר תלמידים ביקשו להצטרף / התלמידים הצעירים רצו לעזור, מספר המשתתפים גדל למעל חמישים.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, in what way did the garden change some students who \"rarely spoke up in class\"? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: הם התחילו לקחת אחריות על משימות קטנות בגינה, כמו ארגון מתנדבים או רישום מה נשתל.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which of the following is NOT mentioned as something the students did?",
        options: [
          "Removing broken furniture",
          "Selling vegetables outside the school",
          "Learning about composting",
          "Keeping records of what was planted",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B — מכירת ירקות מחוץ לבית הספר אינה מוזכרת בטקסט.",
      },
      {
        formatHe: "אוצר מילים בהקשר",
        promptEn: 'Find a word in paragraph 2 that means "gave without asking for payment."',
        modelAnswerHe: "תשובה: donated.",
      },
    ],
    writingTask: {
      promptEn:
        "Write a short message to a friend about a school or class project you took part in. Say what you did and how you felt about it.",
      wordCountRange: [35, 40],
    },
  },
  {
    moduleCode: "C",
    unitSlug: "1",
    titleHe: "דוגמה למודול C — קפה התיקונים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [REPAIR_CAFE_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why did Mr. Harel start the Repair Café?",
        options: [
          "He wanted to start a business repairing appliances",
          "He was frustrated that neighbors threw away items that needed only small repairs",
          "He needed extra income after retiring",
          "A local company asked him to organize it",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn:
          "On the first day of the Repair Café, about thirty people showed up, and many of them came only to ___.",
        modelAnswerHe: "תשובה: watch, not because they needed anything fixed themselves.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, what different skills did the volunteers who joined Mr. Harel bring? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: תפירה ותיקון בגדים, תיקון מכשירים אלקטרוניים קטנים, ותיקון רהיטים.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "How much do visitors pay to have something fixed at the Repair Café?",
        options: [
          "A fixed fee set by the organizers",
          "Nothing, though many leave a small donation",
          "Only the cost of spare parts",
          "A membership fee paid once a year",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn:
          "According to Mr. Harel, what do people actually leave the Repair Café with, besides a fixed item? Support your answer with information from the text.",
        modelAnswerHe: "תשובה מקובלת: זמן שבילו עם שכן — חיבור חברתי, לא רק הפריט המתוקן עצמו.",
      },
    ],
    writingTask: {
      promptEn:
        "Describe a time when you helped someone or were helped by someone in your community. What happened, and how did it make you feel?",
      wordCountRange: [70, 90],
    },
  },
  {
    moduleCode: "D",
    unitSlug: "1",
    titleHe: "דוגמה לתרגול ניתוח ספרותי בסגנון מודול D — \"השיעור האחרון\"",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [LAST_LESSON_STORY],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why did Mrs. Avram ask the principal not to announce that it was her last lesson?",
        options: [
          "She didn't want a fuss or attention made about it",
          "She was embarrassed about retiring",
          "She wasn't sure she wanted to retire",
          "She wanted to surprise the students later",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "שאלת ניתוח",
        promptEn:
          "What does the detail of the students 'barely glancing back' suggest about how ordinary the moment felt to them, compared to how it felt to Mrs. Avram? Answer in your own words, referring to the text.",
        modelAnswerHe:
          "תשובה מקובלת: בעוד שעבור התלמידים זה היה עוד שיעור רגיל שנגמר, עבור מורה אברם זה היה רגע משמעותי של סיום קריירה שלמה — הטקסט מדגיש את הפער בין איך שני הצדדים חוו את אותו רגע.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "At the bottom of her desk drawer, Mrs. Avram found ___.",
        modelAnswerHe: "תשובה: a folded, unsigned note from a former student.",
      },
      {
        formatHe: "שאלת ניתוח",
        promptEn:
          "In your opinion, why does the story end with the note rather than with a classroom ceremony? What does this suggest about the kind of ending the writer believes a long career 'truly needed'? Answer in your own words.",
        modelAnswerHe:
          "תשובה פתוחה — התלמיד צריך להתייחס לרעיון שהכרה אמיתית ותודה אישית, אפילו קטנה ואנונימית, משמעותית יותר מטקס רשמי; חשוב שהתשובה תתבסס על הטקסט עצמו.",
      },
    ],
    writingTask: {
      promptEn:
        "Write a short composition about a teacher, coach, or mentor who had an impact on you — even if they never knew it. Describe what they did and why it mattered to you.",
      wordCountRange: [100, 120],
    },
  },
  {
    moduleCode: "E",
    unitSlug: "1",
    titleHe: "דוגמה למודול E — אופניים שיתופיים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [BIKE_SHARE_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What was one of the main reasons the transportation authority became interested in a bike-share program?",
        options: [
          "A new law required every city to build one",
          "Most car trips in the city center were quite short",
          "Residents demanded free public transportation",
          "The city wanted to close all its bus lines",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, how did the bike-share program affect local businesses? Explain in your own words.",
        modelAnswerHe: "תשובה מקובלת: רוכבי אופניים נטו לעצור יותר לאורך הדרך (בניגוד לנהגים שמחפשים חניה), מה שהגביר את התנועה הרגלית לעסקים קטנים.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Before the program started, many residents doubted that people would use it, especially ___.",
        modelAnswerHe: "תשובה מקובלת: בחודשי הקיץ החמים.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What problem did the program experience during its first year?",
        options: [
          "Too few residents signed up",
          "Bicycles were frequently stolen",
          "Some stations ran out of bikes during busy hours",
          "The bikes were too expensive to maintain",
        ],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "How did engineers solve the problem mentioned in the previous question?",
        modelAnswerHe: "תשובה מקובלת: הם השתמשו בנתונים מכל נסיעה כדי לחזות שעות עומס, ומעבירים אופניים בין תחנות במהלך הלילה.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "According to a recent survey, the most significant change caused by the program was not environmental but ___.",
        modelAnswerHe: "תשובה: חברתית (social).",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which sentence best describes how the writer feels about the bike-share program overall?",
        options: [
          "It has been a disappointing failure",
          "It started with difficulties but has become a valued part of city life",
          "It is too expensive to continue",
          "It was successful only among tourists",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Why do you think the number of daily bike trips surprised city planners? Support your answer with information from the text.",
        modelAnswerHe: "תשובה מקובלת: תוכננה רק מספר מוגבל של תחנות/אופניים מתוך ציפייה נמוכה, ומספר הנסיעות היומי חצה עשרת אלפים — הרבה מעבר לתחזית.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Engineers now use data from every ride in order to ___.",
        modelAnswerHe: "תשובה מקובלת: לחזות שעות עומס ולהעביר אופניים בין תחנות מראש.",
      },
    ],
    vocabularyQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the word closest in meaning to "convince":',
        options: ["persuade", "ignore", "forbid", "delay"],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: persuade.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The new policy will __________ (reduce) traffic in the city center.",
        modelAnswerHe: "תשובה: reduce.",
      },
      {
        formatHe: "התאמה",
        promptEn:
          'Match each word to its meaning: (1) unexpected (2) scattered (3) significant — (a) spread out over an area (b) important (c) surprising, not predicted.',
        modelAnswerHe: "תשובה: 1-c, 2-a, 3-b.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: '"Foot traffic" in the text refers to:',
        options: ["people walking to or through a place", "traffic jams", "shoes sold in stores", "hiking trails"],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: people walking to or through a place.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Many students find it difficult to __________ (predict) which topics will appear on the exam.",
        modelAnswerHe: "תשובה: predict.",
      },
    ],
  },
  {
    moduleCode: "F",
    unitSlug: "1",
    titleHe: "דוגמה למודול F — הספרייה שלא נסגרת",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [LIBRARY_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why did some residents originally worry about replacing the front desk with a self-service kiosk?",
        options: [
          "They thought it would make the library feel cold and impersonal",
          "They thought it would be too expensive",
          "They thought it would increase theft immediately",
          "They thought it would reduce the number of books available",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "According to the text, parents of young children began visiting the library late at night because ___.",
        modelAnswerHe:
          "תשובה מקובלת: it finally gave them time to browse quietly without interruption, something that was nearly impossible during the library's previous, more limited hours.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, why was the extended-hours system especially useful for the nurse mentioned in the article? Answer in your own words.",
        modelAnswerHe:
          "תשובה מקובלת: היא עובדת במשמרות לילה בבית חולים, והשעות המורחבות אפשרו לה לבקר בספרייה בדרך הביתה בשש בבוקר, במקום לבחור בין שינה לקריאה בימי החופש הנדירים שלה.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What limitation did the library keep in place even after the change?",
        options: [
          "Overnight visitors could not borrow books at all",
          "Research help and children's programs were only available during staffed daytime hours",
          "Only university students were allowed overnight access",
          "The library closed completely on weekends",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What broader idea does the writer suggest the library's project proved, according to the text? Support your answer with information from the text.",
        modelAnswerHe:
          "תשובה מקובלת: שגישה (לא רק תוכן) יכולה לקבוע אם שירות ציבורי באמת משרת את הקהילה שלו — תושבים כמו אחיות במשמרת לילה או הורים עייפים זקוקים לגישה בשעות שלא תואמות יום עבודה רגיל.",
      },
    ],
    writingTask: {
      promptEn:
        "Describe a public place in your town or city (such as a library, park, or community center) that you think should be improved or changed. Explain what you would change and why.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "G",
    unitSlug: "1",
    titleHe: "דוגמה למודול G — המחיר של זמינות מתמדת",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [ALWAYS_REACHABLE_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn:
          "According to the text, what did researchers find was strongly associated with elevated stress, even among employees who received few after-hours messages?",
        options: [
          "The actual number of messages received",
          "The perception of being expected to respond quickly",
          "The type of device used for work",
          "The length of the average workday",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, how can an 'expectation of availability' form without any explicit workplace rule? Explain in your own words.",
        modelAnswerHe:
          "תשובה מקובלת: דרך אותות עקיפים ולא מכוונים — למשל מנהל ששולח הודעות בשעות מאוחרות, גם בלי לצפות לתגובה מיידית, יוצר תחושה שהעובדים צריכים להיראות זמינים כדי לא להיתפס כלא מחויבים.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Critics of email-delay software argue that it treats a cultural problem as though it were merely ___.",
        modelAnswerHe: "תשובה: a technical one.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which of the following best describes the view of those who see the discomfort as a 'natural adjustment' rather than a problem?",
        options: [
          "They believe strict separation between work and personal time has always existed and should be restored",
          "They argue that some groups have always carried round-the-clock responsibilities, so building better habits matters more than recreating a clean separation",
          "They think companies should ban all after-hours communication entirely",
          "They believe the research findings are incorrect",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What is the 'underlying fact' the text says few people dispute, regardless of which side of the debate they take? Support your answer with information from the text.",
        modelAnswerHe:
          "תשובה מקובלת: שלא ההודעה עצמה היא הבעיה העיקרית, אלא התחושה החצי-מודעת של ציפייה להגיב אליה — זה מה שגובה את המחיר הגבוה יותר.",
      },
    ],
    writingTask: {
      promptEn:
        "Some people believe employees should have a legal 'right to disconnect' — meaning they cannot be contacted by their employer outside working hours. Do you agree or disagree with this idea? Give reasons and examples to support your opinion.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "A",
    unitSlug: "2",
    titleHe: "דוגמה שנייה למודול A — מסיבה שקטה",
    teacherReviewed: false,
    aiContentDisclosed: true,
    listeningTask: {
      transcriptEn: SILENT_DISCO_TRANSCRIPT,
      questions: [
        {
          formatHe: "רב-ברירה",
          promptEn: "Why did the organizers choose a silent disco format for this event?",
          options: [
            "It was cheaper than hiring a sound system",
            "It would not disturb nearby apartments with loud music",
            "It was the only equipment available",
            "It was requested by the local council",
          ],
          correctOptionIndex: 1,
          modelAnswerHe: "תשובה נכונה: B.",
        },
        {
          formatHe: "השלמת משפט",
          promptEn: "This year, organizers are not selling water bottles on-site in order to ___.",
          modelAnswerHe: "תשובה: cut down on plastic waste.",
        },
        {
          formatHe: "רב-ברירה",
          promptEn: "How many music channels will be available at the event?",
          options: ["One", "Two", "Three", "Four"],
          correctOptionIndex: 2,
          modelAnswerHe: "תשובה נכונה: C.",
        },
        {
          formatHe: "שאלה פתוחה",
          promptEn: "What will happen to the event if it rains? Answer in your own words.",
          modelAnswerHe: "תשובה מקובלת: האירוע יעבור לאולם הקהילתי במקום להתקיים בפארק.",
        },
      ],
    },
    readingPassages: [TUTORING_EXCHANGE_PASSAGE, FREE_PANTRY_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why did Daniel decide to set up the tutoring exchange?",
        options: [
          "A teacher asked him to organize it",
          "He remembered how much a classmate's help had mattered to him",
          "He needed volunteer hours for school",
          "He wanted to start a business",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Within three weeks, over eighty students had registered, covering ___.",
        modelAnswerHe: "תשובה: nearly every subject taught at the school.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, how did some teachers notice a change in their students? Answer in your own words.",
        modelAnswerHe:
          "תשובה מקובלת: תלמידים שלא שאלו שאלות בעבר התחילו להגיע עם שאלות ספציפיות ובטוחות יותר, אחרי שכבר דנו בחומר עם בן/בת זוג.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What did Ruth do to help neighbors feel less embarrassed about taking food from the pantry?",
        options: [
          "She removed the glass door",
          "She left a sign saying no explanation was necessary",
          "She asked neighbors to register first",
          "She only stocked it at night",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "A box that usually emptied out by evening would somehow be ___ by the next morning.",
        modelAnswerHe: "תשובה: half-full again.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to Ruth, why does she think the project has spread to other neighborhoods? Support your answer with information from the text.",
        modelAnswerHe:
          "תשובה מקובלת: לדעתה אנשים רוצים לעזור, אבל לפעמים צריך לראות שמישהו אחר כבר התחיל כדי להעז לעשות את זה בעצמם.",
      },
    ],
  },
  {
    moduleCode: "B",
    unitSlug: "2",
    titleHe: "דוגמה שנייה למודול B — מועדון הרובוטיקה",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [ROBOTICS_CLUB_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What was the first problem Lior faced when starting the club?",
        options: [
          "The school had no budget and nobody else seemed interested",
          "The science lab was closed after school",
          "His physics teacher refused permission",
          "He didn't know how robots worked",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "At first, only two other students joined him, and they spent most afternoons ___.",
        modelAnswerHe: "תשובה: simply figuring out how things worked, often making mistakes.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, what changed after the club entered a local competition? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: למרות שלא ניצחו, תלמידים אחרים בבית הספר שמו לב והתעניינו, והמועדון גדל.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "According to Lior, what was the hardest part of starting the club?",
        options: [
          "Finding good equipment",
          "Convincing people to try something new with no guarantee of success",
          "Getting permission from the principal",
          "Finding a time that worked for everyone",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "אוצר מילים בהקשר",
        promptEn: 'Find a phrase in the last paragraph that means "thinking back about the past."',
        modelAnswerHe: "תשובה: Looking back.",
      },
    ],
    writingTask: {
      promptEn:
        "Write a short message to a friend about a club, team, or group you'd like to start or join. Say what it is and why it interests you.",
      wordCountRange: [35, 40],
    },
  },
  {
    moduleCode: "C",
    unitSlug: "2",
    titleHe: "דוגמה שנייה למודול C — קפה שמחכה למישהו",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [SUSPENDED_COFFEE_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What is a 'suspended coffee'?",
        options: [
          "A coffee that is paid for in advance by one customer for someone else to receive later",
          "A type of iced coffee served without sugar",
          "A coffee that is free only for regular customers",
          "A coffee ordered online in advance",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Teresa introduced the suspended coffee system after a regular customer suggested it during ___.",
        modelAnswerHe: "תשובה: a particularly difficult winter.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, how does a customer receive a suspended coffee? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: פשוט מבקשים 'suspended coffee' ליד הקופה, בלי לתת הסבר ובלי שאלות — על בסיס אמון.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What surprised Teresa most about the program's first year?",
        options: [
          "How many drinks were given away",
          "Who actually used the system",
          "How much money the café lost",
          "How quickly the chalkboard needed replacing",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, what did some customers do once their own situation improved? Support your answer with information from the text.",
        modelAnswerHe: "תשובה מקובלת: חלקם חזרו מאוחר יותר ושילמו עבור כמה 'suspended coffees' בעצמם.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Teresa says regular customers now treat the chalkboard tally less like charity and more like ___.",
        modelAnswerHe: "תשובה: a small, ongoing habit the whole neighborhood quietly takes part in together.",
      },
    ],
    writingTask: {
      promptEn: "Describe a small act of kindness you witnessed or took part in. What happened, and why do you think it mattered?",
      wordCountRange: [70, 90],
    },
  },
  {
    moduleCode: "D",
    unitSlug: "2",
    titleHe: "דוגמה שנייה לתרגול ניתוח ספרותי בסגנון מודול D — \"מה שהבית זוכר\" (שיר)",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [HOUSE_REMEMBERS_POEM],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What is the main subject the speaker reflects on in this poem?",
        options: [
          "How a house changes physically over time",
          "Memories of family connected to the house",
          "Plans to renovate the house",
          "A disagreement between neighbors",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלת ניתוח",
        promptEn:
          "What does the phrase 'A house keeps nothing, really, for itself' suggest about the speaker's view of a house's true meaning? Answer in your own words, referring to the poem.",
        modelAnswerHe:
          "תשובה מקובלת אם מתייחסת לרעיון שהבית עצמו הוא רק מסגרת ריקה — המשמעות האמיתית שלו היא האנשים והזכרונות שחיו בו, לא המבנה הפיזי.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "According to the third stanza, new families who live in the house in the future will not ___.",
        modelAnswerHe: "תשובה: hear the songs that drift away, or know the names of those who also went.",
      },
      {
        formatHe: "שאלת ניתוח",
        promptEn:
          "Why do you think the poet repeats small, ordinary details (keys dropped, a stuck door, singing slightly off-key) instead of describing one dramatic event? What effect does this create? Answer in your own words.",
        modelAnswerHe:
          "תשובה פתוחה — התלמיד צריך להתייחס לכך שפרטים קטנים ויומיומיים דווקא ממחישים טוב יותר איך זיכרון אמיתי נשמר, יותר מאירוע דרמטי בודד; חשוב שהתשובה תתייחס לטקסט.",
      },
    ],
    writingTask: {
      promptEn:
        "Write a short composition about a place that holds special memories for you. Describe the place and explain why it matters to you.",
      wordCountRange: [100, 120],
    },
  },
  {
    moduleCode: "E",
    unitSlug: "2",
    titleHe: "דוגמה שנייה למודול E — ספריית הכלים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [TOOL_LIBRARY_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What problem did Victor Osei notice that led him to start the tool library?",
        options: [
          "Many neighbors owned expensive tools that sat unused for months",
          "The community center needed more storage space",
          "Local stores had stopped selling tools",
          "Residents were stealing tools from each other",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The tool library was funded partly by membership fees and partly by ___.",
        modelAnswerHe: "תשובה: donated equipment that residents no longer needed.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, how much does it cost to be a member compared to buying the pricier tools yourself? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: התשלום השנתי זול משמעותית מקניית אפילו כלי אחד או שניים מהיקרים יותר.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "According to Victor, what often happens when someone returns a borrowed tool?",
        options: [
          "They are charged a late fee",
          "They end up talking to the desk volunteer about their project",
          "They must fill out a damage report",
          "They receive a discount on their next rental",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What happens to tools that are returned in poor condition? Support your answer with information from the text.",
        modelAnswerHe: "תשובה מקובלת: יש ספסל תיקונים קטן של מתנדבים; חלק מהתרומות הישנות יותר לא ניתנות לתיקון ונגרעות לגמרי.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Victor considers a certain amount of wear on the tools to be ___.",
        modelAnswerHe: "תשובה: simply the cost of the system working as intended.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Why have officials from two neighboring towns visited Elm Heights?",
        options: [
          "To inspect the community center's safety standards",
          "To learn how the tool library operates",
          "To ask Victor to run for office",
          "To buy tools for their own towns",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "How does Victor describe his own role in the project, according to the last paragraph? Explain in your own words.",
        modelAnswerHe: "תשובה מקובלת: הוא מתאר את עצמו בבדיחות כ'מומחה בטעות' להשאלת פטישים — לא תפקיד שציפה לקחת על עצמו.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Before the tool library existed, residents often avoided small home repairs because ___.",
        modelAnswerHe: "תשובה: buying the right tool seemed like an unnecessary expense for a single job.",
      },
    ],
    vocabularyQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the word closest in meaning to "unavoidable":',
        options: ["inevitable", "optional", "forbidden", "temporary"],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: inevitable.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The company tried to __________ (justify) the high price by pointing to the product's quality.",
        modelAnswerHe: "תשובה: justify.",
      },
      {
        formatHe: "התאמה",
        promptEn:
          "Match each word to its meaning: (1) durable (2) considerably (3) retired — (a) by a significant amount (b) long-lasting, not easily damaged (c) taken permanently out of use.",
        modelAnswerHe: "תשובה: 1-b, 2-a, 3-c.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: '"Staffing the desk" in the text refers to:',
        options: [
          "working at or being responsible for the desk",
          "building a wooden desk",
          "cleaning the desk",
          "selling the desk",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: working at or being responsible for the desk.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The volunteers __________ (maintain) a small repair bench for damaged tools.",
        modelAnswerHe: "תשובה: maintain.",
      },
    ],
  },
  {
    moduleCode: "F",
    unitSlug: "2",
    titleHe: "דוגמה שנייה למודול F — דבורים על הגג",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [ROOFTOP_BEES_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why, according to the text, can cities sometimes be unexpectedly good places for bees?",
        options: [
          "Cities have fewer insects competing for food",
          "Cities often have more varied flowering plants than large farmland areas",
          "Cities are warmer than rural areas year-round",
          "Cities have no pesticide use at all",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The hotel hired a professional beekeeper who visits weekly to ___.",
        modelAnswerHe:
          "תשובה: check the health of each colony, monitor for disease, and ensure the bees have enough space.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the text, what happened to one of the hives during the first summer, and why? Answer in your own words.",
        modelAnswerHe:
          "תשובה מקובלת: אחת הכוורות הפכה לאגרסיבית במפתיע, כנראה בגלל שינוי במלכת הדבורים, ונאלצו להעביר אותה למקום שקט יותר בגג, רחוק ממרפסת האורחים.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What does Priya say urban beekeeping requires constant attention to?",
        options: [
          "The hotel's breakfast menu",
          "Local regulations about hive placement",
          "The color of the hives",
          "Guest reviews online",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Why have two nearby hotels installed their own rooftop hives, according to the text? Support your answer with information from the text.",
        modelAnswerHe: "תשובה מקובלת: בהשראת ההצלחה של מלון גרנתהאם וגם בגלל סקרנות של אורחים ששאלו על זה.",
      },
    ],
    writingTask: {
      promptEn:
        "Write a composition about an unusual or unexpected place where nature (plants, animals, or insects) has found a way to thrive. Describe it and explain why it interests you.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "G",
    unitSlug: "2",
    titleHe: "דוגמה שנייה למודול G — הזכות להישכח",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [RIGHT_TO_BE_FORGOTTEN_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "According to the text, what changed about personal information because of the internet, according to supporters of the right to be forgotten?",
        options: [
          "Information became more expensive to access",
          "Old information can resurface instantly and permanently, rather than naturally fading over time",
          "Newspapers stopped publishing physical archives",
          "Courts became slower at processing requests",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to critics, what principle does the right to be forgotten conflict with? Explain in your own words.",
        modelAnswerHe:
          "תשובה מקובלת: חופש המידע וזכות הציבור לגשת לרשומה היסטורית מדויקת — יש חשש שמחיקת תוצאות חיפוש אמיתיות תמחק בשקט היסטוריה ציבורית לגיטימית.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Search engine companies have generally been required to weigh the requester's privacy interest against ___.",
        modelAnswerHe: "תשובה: the public's interest in the information remaining accessible.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What unusual position does the text say search engine companies have been placed in?",
        options: [
          "Acting as courts or news organizations despite being neither",
          "Being required to publish more information than before",
          "Losing all legal responsibility for search results",
          "Becoming official government agencies",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the final paragraph, why does the text suggest this debate is unlikely to resolve itself cleanly? Support your answer with information from the text.",
        modelAnswerHe:
          "תשובה מקובלת: כי זה מעמיד שני ערכים חשובים זה מול זה, לא ערך ברור מול טעות ברורה — ומחלוקות מהסוג הזה נוטות להימשך זמן רב.",
      },
    ],
    writingTask: {
      promptEn:
        "Some people argue that individuals should have the right to request removal of true but embarrassing information about them from internet search results. Do you agree or disagree? Give reasons and examples to support your opinion.",
      wordCountRange: [120, 140],
    },
  },
] as const;

export function getSampleUnit(moduleCode: BagrutModuleCode, unitSlug: string): BagrutSampleUnit | undefined {
  return BAGRUT_SAMPLE_UNITS.find((u) => u.moduleCode === moduleCode && u.unitSlug === unitSlug);
}

// The only function a future learner-facing practice screen should call for
// ONE specific unit. See the module-level comment above for what the two
// flags mean and why they never merge into one.
export function getPublishableSampleUnit(moduleCode: BagrutModuleCode, unitSlug: string): BagrutSampleUnit | undefined {
  const unit = getSampleUnit(moduleCode, unitSlug);
  if (!unit) return undefined;
  return unit.teacherReviewed || unit.aiContentDisclosed ? unit : undefined;
}

// Every publishable unit for a module, in the order they appear above — for
// a "choose a practice set" listing page, not for grading or exam logic.
export function getPublishableSampleUnits(moduleCode: BagrutModuleCode): BagrutSampleUnit[] {
  return BAGRUT_SAMPLE_UNITS.filter(
    (u) => u.moduleCode === moduleCode && (u.teacherReviewed || u.aiContentDisclosed)
  );
}

// Building sample content for a module whose own structure isn't verified
// yet (moduleFormats.ts) would mean guessing at both the format AND the
// content at once — kept as a hard error, not just a lint note, so it fails
// loudly in tests rather than shipping quietly.
for (const unit of BAGRUT_SAMPLE_UNITS) {
  if (!BAGRUT_MODULE_FORMATS[unit.moduleCode].verified) {
    throw new Error(`Sample content exists for unverified module ${unit.moduleCode} — see moduleFormats.ts`);
  }
}

// Practice sets 4–6 for the 5-point questionnaires (E, F, G), written from
// scratch for Saylo in the same verified formats as sampleUnits.ts
// (moduleFormats.ts gives the word counts and sections; sampleUnits.test.ts
// enforces them, and checks every answer key). Same discipline as sets 1–3:
// no real exam text was read or adapted, the places and people are
// invented, and no statistics or named studies are cited as fact.
import type { BagrutSampleUnit } from "./sampleUnits";

const ADULT_SWIMMERS_PASSAGE = `When the municipal pool in Kiryat Galim announced a swimming course for adults, the organizers expected perhaps ten people to sign up. Within a week, more than sixty names were on the list, and a second group had to be opened.

Most of the new students had a similar story. As children, they had never learned to swim, sometimes because there was no pool nearby, sometimes because a frightening experience in the sea had kept them away from water. Over the years, the problem became harder to admit. Many said they had spent family holidays sitting on the beach, pretending they simply preferred to read.

The instructor, Michal Barak, quickly realized that the main difficulty was not physical. "Adults already know how to move their arms and legs," she explained. "What they need first is to trust the water." For this reason, the first three lessons took place entirely in the shallow end. Students practiced breathing out under the water, floating on their backs, and standing up calmly after losing their balance.

Progress was slower than in children's classes, but it was also more emotional. One student, a grandfather of five, cried after swimming his first full length of the pool. Another said that the course had changed the way she thought about learning in general: if she could overcome this fear at fifty-two, she wondered, what else had she given up on too early?

By the end of the course, almost every student could swim at least twenty-five meters without help. The pool has since made the program permanent, and Michal now trains other instructors to teach adults. Her advice to them is short: be patient, never laugh, and remember that for some people, getting into the water at all is already a brave step.`;

const BIRD_COUNT_PASSAGE = `Every winter for the past four years, the students of Ein Harod Elementary School have spent one morning doing something unusual: counting birds. Armed with notebooks, a few pairs of borrowed binoculars and a simple guide with pictures, they spread out across the schoolyard, the nearby fields and the edge of a small pond.

The project was started by Ruth Peled, a biology teacher who was worried that her students could name dozens of video game characters but hardly any of the birds outside their window. She contacted a local nature organization, which agreed to train the teachers and to collect the students' results each year.

The rules of the count are simple. Each group stays in one area for exactly fifteen minutes and writes down every bird it sees or hears. Students are told not to guess. If they are not sure what a bird is, they draw it or describe it, and an expert checks the notes later. "A careful 'I don't know' is more useful to science than a confident mistake," Ruth tells them.

Over the years, the counts have produced some interesting information. The students noticed, for example, that a small green bird which was rare in the first year has become common around the school. The experts were pleased, because this kind of information from many small places is hard for professional researchers to collect on their own.

For the students, however, the biggest change may be in how they see their surroundings. Parents report that children now stop on the way home to point at birds on electric wires. Some have asked for binoculars as birthday presents. And a few of the first students to take part, now in middle school, return every winter to help the younger children with the count.`;

const LATER_START_PASSAGE = `For as long as anyone could remember, the first bell at Shaked High School rang at 7:45. Students arriving by bus from distant villages often left home before seven, and many teachers admitted that the first lesson of the day was the hardest to teach. Heads rested on desks, and even simple questions were answered slowly, if at all.

Two years ago, the school's parents' committee suggested an experiment: for one semester, lessons would begin at 8:45 instead. The idea was based on something many parents had noticed at home. Teenagers, they said, were not lazy in the morning; their bodies simply seemed to want to sleep and wake later than younger children or adults.

Not everyone supported the plan. Some parents worried that a later start would mean a later finish, leaving less time for sports, part-time jobs and homework. Bus companies had to change their timetables, and a few teachers who had young children of their own found the new schedule difficult.

The school decided to measure the results carefully. Teachers kept records of lateness and absence, and students filled in short questionnaires about how tired they felt during the day. At the end of the semester, the results were clear enough to persuade the staff. Lateness to the first lesson had dropped sharply, and most students reported feeling more awake in class. Teachers described the morning lessons as "a completely different atmosphere."

The later start is now permanent, although the school made one change in response to the criticism: the long lunch break was shortened, so the school day ends only half an hour later than before. The principal admits that the new schedule is not perfect for everyone. "But when students are awake," she says, "everything else we do works better."`;

const WITHOUT_A_MAP_PASSAGE = `Not long ago, finding your way in an unfamiliar city required a folded paper map, a few questions to strangers and, quite often, a wrong turn or two. Today most people simply type an address into their phone and follow a blue line on the screen. The change has made travel easier and faster, but some educators and psychologists have started to ask what it costs us.

Their main concern is that navigation is a skill, and skills that are not used tend to weaken. When we read a map, we have to build a picture of the area in our heads: where the river is, which direction the sea lies, how one street connects to another. When we follow spoken instructions, we only need to know the next turn. Many drivers say that they can travel the same route for months with GPS and still be unable to drive it without help.

Supporters of the technology reply that this worry is exaggerated. People have always used tools to save mental effort, from written calendars to calculators, and nobody suggests returning to doing every sum by hand. In their view, the time and attention that GPS saves can be used for other things. They also point out that navigation apps have made cities more accessible to people who once felt anxious about getting lost, including older adults and tourists who do not speak the local language.

There are also practical risks on both sides. A traveler who depends completely on a phone may be helpless when the battery runs out or the signal disappears, in a desert or a forest, for example. On the other hand, a driver who studies a paper map while moving is hardly safer than one who listens to clear instructions.

Some teachers have found a middle path. In a number of schools, students go on "orientation walks" in which phones stay in their bags. They receive a simple map of the neighborhood and must reach several points on their own, discussing which way to go. Teachers say the students are often surprised by how much they notice when they have to pay attention: a bakery on the corner, a hill they had never felt, the position of the sun in the sky.

Perhaps the question is not whether to use GPS but when. Following the blue line is efficient when we are in a hurry. Finding our own way, at least sometimes, may help us remain truly at home in the places where we live.`;

const REQUIRED_VOLUNTEERING_PASSAGE = `In many countries, high-school students are expected to complete a number of hours of community service before they graduate. They help in hospitals, tutor younger children, visit elderly people or work with environmental organizations. Few people object to the activities themselves. The debate is about a single word: should volunteering be required?

Those who support the requirement argue that many teenagers would never discover the value of helping others if they were not pushed to try. A student who reluctantly agrees to spend a few hours a week at a center for children with disabilities may find, months later, that it has become the most meaningful part of the week. Supporters also stress that the requirement creates a kind of fairness. Without it, volunteering tends to attract students who already have free time, confident personalities and parents with useful connections.

Critics answer that the phrase "required volunteering" contradicts itself. Volunteering, by definition, is something people choose to do. When it becomes an obligation that must be signed and counted, they argue, students may learn the opposite lesson from the one intended: that helping others is a box to tick on the way to a certificate. Some organizations complain that students arrive without real interest, watch the clock and disappear as soon as their hours are complete. For the people they were meant to help, such visits can do more harm than good.

There is also a question of time. Many students already study long hours, and some work to help their families. For them, a fixed number of service hours may be one more pressure rather than an opportunity. Critics suggest that schools should encourage volunteering through good examples, flexible options and public recognition, rather than through rules.

Between these positions, some schools have tried to change not whether volunteering is required but how it is organized. Instead of sending students to any available place, they let students choose a cause that interests them, and they ask them to reflect regularly on what they have learned. Teachers in such programs say that the quality of the experience matters more than the number of hours. A student who spends twenty hours in a place that truly interests them may gain more than one who spends sixty hours simply waiting for the day to end.

Perhaps that is the real lesson of the debate. Whether volunteering is required or not, it only works when young people understand why they are doing it.`;

const SECOND_LIFE_CLOTHES_PASSAGE = `Open the wardrobe of an average teenager and you will probably find at least a few items that have been worn once or twice and then forgotten. Clothing has never been cheaper or easier to buy. New collections appear in shops every few weeks, and online stores deliver to the door within days. Yet a growing number of young people are choosing to do something their grandparents would have found completely ordinary: wearing clothes that someone else owned first.

Second-hand shopping has changed its image. In the past, buying used clothes was often associated with having little money, and many people preferred to hide it. Today, vintage shops, clothing swaps and apps for selling used items have made it fashionable. For some buyers, the attraction is the price. For others, it is the chance to find something unusual that no one else at school will be wearing.

For many, however, the main reason is environmental. Producing a single piece of clothing requires water, energy and raw materials, and transporting it often involves long journeys across the world. When a garment is thrown away after a short time, all of those resources are wasted. Every item that is worn for longer, by its first owner or a second one, reduces the need to produce a new one.

Not everyone is convinced that second-hand shopping is the answer. Critics point out that some people buy used clothes in large quantities simply because they are cheap, which repeats the same habit of overconsumption in a different form. Others note that when well-off shoppers fill second-hand stores, prices may rise for families who depend on them out of necessity rather than choice.

There is also the question of quality. Many cheap new garments are not made to last, so they reach the second-hand market already worn out. Shops that sell used clothing say that they receive more items than they can ever sell, and much of it ends up being thrown away after all, the very waste that second-hand shopping was meant to prevent.

For this reason, some environmental educators argue that the most important step is not where we buy clothes but how many we buy. A smaller wardrobe of well-made items, repaired when necessary and passed on when no longer needed, may do more good than any single shopping trend. The oldest idea in fashion, it seems, may also be the newest one: buy less, and take good care of what you already have.`;

const DE_EXTINCTION_PASSAGE = `For most of history, extinction has been understood as the one truly irreversible event in nature. A species that disappears is gone forever; nothing remains but bones, feathers in museum drawers and, occasionally, a name in an old traveler's journal. In recent years, however, advances in genetic engineering have led some scientists to suggest that this finality may no longer be absolute. By editing the genes of a living relative, they argue, it might one day be possible to produce an animal that closely resembles a species that vanished centuries ago.

The appeal of the idea is easy to understand. Many extinctions were caused, directly or indirectly, by human activity, through hunting, the destruction of habitats or the introduction of new predators. Restoring a lost species could therefore be seen as a form of repair, a way of taking responsibility for damage done by earlier generations. Supporters also argue that some vanished animals played important roles in their ecosystems, spreading seeds or shaping landscapes, and that bringing them back could help damaged environments recover.

Critics raise objections that are both practical and philosophical. On the practical side, they note that an animal produced in a laboratory would not truly be the original species but an approximation, a modern creature built to look and behave like one. It would have no parents of its own kind to learn from, and the habitat it once depended on may have changed beyond recognition. Releasing it into the wild could have consequences no one can predict.

The philosophical objection is more subtle. If extinction can be reversed, some fear, it may come to seem less serious. Governments and companies might be tempted to treat endangered species as something that can be recovered later, rather than protected now. In this sense, the promise of de-extinction could weaken the very sense of urgency on which conservation depends.

There is also the question of priorities. Conservation budgets are limited, and the cost of recreating even a single species would be enormous. Many biologists argue that the same money could protect a great many living animals whose survival is threatened today. To them, spending it on the dead while the living disappear seems a strange order of priorities.

Supporters reply that the research itself may produce tools useful for living species, for example by increasing the genetic variety of small, endangered populations. The debate, in the end, is less about what science can do than about what we believe our responsibility to nature to be: to protect what still exists, to repair what we have broken, or, if possible, to do both without allowing one to replace the other.`;

const MACHINE_TRANSLATION_PASSAGE = `Only a few years ago, machine translation was a source of jokes. Menus translated by computer offered dishes that no one could imagine eating, and instruction manuals produced sentences that made sense in no language at all. Today the situation is very different. A traveler can point a phone at a sign and read it in their own language, or hold a conversation with a shopkeeper through an app that translates each sentence almost instantly. This progress has led some people to ask an uncomfortable question: is learning a foreign language still worth the years of effort it demands?

The argument against language learning is mainly economic. If a machine can do in seconds what takes a person years to master, it seems wasteful, the argument goes, to spend so much school time on vocabulary lists and grammar exercises. That time could be devoted to subjects in which machines are less capable. For many everyday tasks, such as booking a hotel, reading a news article or asking for directions, the technology is already more than adequate.

Language teachers, unsurprisingly, disagree, but their strongest arguments are not about jobs. They point out that translation, however accurate, places a screen between two people. A conversation conducted through a device tends to be slower, more formal and more limited than one in which both speakers share a language. Humor, irony and the small adjustments people make to one another's mood are exactly the elements that are most easily lost.

There is a deeper argument as well. Learning another language, many educators believe, changes the learner, not only what the learner can do. It forces a person to notice that their own way of expressing ideas is one possibility among many. Words that seem to have exact equivalents turn out to carry different associations; grammar that seems natural turns out to be a choice. Someone who has struggled to express a feeling in a foreign language often understands their own language better as a result.

Finally, there is the question of trust. A person who depends entirely on a machine cannot judge whether the translation is correct. In a hospital, a courtroom or a business negotiation, a small error may have serious consequences, and only someone who understands both languages can notice it.

None of this means that translation technology is a threat to be resisted. Used wisely, it can make the early stages of learning less frightening and open doors that would otherwise remain closed. The real risk is not the machine itself but the belief that understanding another person can be fully delegated to it.`;

const ONLINE_RATINGS_PASSAGE = `Before choosing a restaurant, a hotel or even a plumber, millions of people now consult the same source: the opinions of strangers. Online ratings, usually expressed as a number of stars, have become one of the most influential forces in modern consumer life. Their attraction is obvious. Instead of relying on advertising, which is written by the seller, or on the advice of a single friend, we can draw on the experience of hundreds of previous customers. In theory, the crowd should be wiser than any individual.

In practice, the system is more fragile than it appears. The first problem is who writes reviews at all. Most satisfied customers never bother; those who do tend to be people with unusually strong reactions, either delighted or furious. As a result, ratings often reflect the extremes of experience rather than its ordinary middle. A small café may receive a string of one-star reviews after a single bad evening, while hundreds of pleasant, unremarkable visits leave no trace.

The second problem is that reviews influence one another. A customer who reads ten enthusiastic comments before arriving may enjoy a meal more, or at least feel reluctant to disagree in public. Early reviews thus carry disproportionate weight, and a business that receives a few negative ratings at the start may struggle to recover, however much it improves.

Then there is the question of honesty. Because ratings affect income so directly, some businesses are tempted to buy positive reviews or to encourage friends to post them, while competitors may post false complaints. Platforms invest considerable effort in detecting such manipulation, but it is difficult to prove that a particular review is fake, and readers have little way of judging for themselves.

Perhaps the most subtle effect concerns the businesses themselves. When every interaction may be rated, workers can feel that they are being judged constantly, and some describe the pressure to please every customer as exhausting. Owners may avoid anything unusual or experimental, since a dish or a service that disappoints even a few customers can lower an average built up over years. In this way, a system designed to reward quality may also, quietly, reward caution.

None of this means that ratings are worthless. Read carefully, they can reveal patterns that no single opinion could: a hotel that many guests describe as noisy probably is. The skill lies in treating stars not as a verdict but as evidence, to be weighed alongside the details of what reviewers actually wrote and, when possible, the judgment of people we trust.`;

export const BAGRUT_SAMPLE_UNITS_SETS_4_TO_6: BagrutSampleUnit[] = [
  {
    moduleCode: "E",
    unitSlug: "4",
    titleHe: "ללמוד לשחות בגיל מבוגר",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [ADULT_SWIMMERS_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "How did the number of people who signed up compare with what the organizers expected?",
        options: ["Fewer people signed up", "Exactly ten people signed up", "Many more people signed up", "Nobody signed up in the first week"],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C. ציפו לכעשרה אנשים, ותוך שבוע נרשמו יותר משישים.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Give TWO reasons why the students had not learned to swim as children.",
        modelAnswerHe: "תשובה: לא הייתה בריכה קרובה; חוויה מפחידה בים הרחיקה אותם מהמים.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "On family holidays, many of the students sat on the beach and pretended that ___.",
        modelAnswerHe: "תשובה: they simply preferred to read.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "According to Michal Barak, what do adults need first?",
        options: ["To learn how to move their arms and legs", "To trust the water", "To swim a full length", "To buy the right equipment"],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B. לדבריה, הקושי העיקרי אינו פיזי: קודם צריך לסמוך על המים.",
      },
      {
        formatHe: "מארגן גרפי",
        promptEn: "Complete the table: The first three lessons — Where: ___ | TWO things the students practiced: ___, ___.",
        modelAnswerHe:
          "תשובה: בחלק הרדוד של הבריכה (the shallow end). שניים מתוך: לנשוף אוויר מתחת למים, לצוף על הגב, לעמוד ברוגע אחרי איבוד שיווי משקל.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: 'Which example shows that progress was "more emotional" than in children\'s classes?',
        options: [
          "A second group had to be opened",
          "Michal now trains other instructors",
          "The first lessons took place in the shallow end",
          "A grandfather cried after swimming his first full length",
        ],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D. סבא לחמישה נכדים בכה אחרי שסיים לשחות לראשונה אורך שלם של הבריכה.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What question did the fifty-two-year-old student ask herself? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: אם הצליחה להתגבר על הפחד הזה בגיל 52, אולי ויתרה מוקדם מדי גם על דברים אחרים בחיים.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "By the end of the course, almost every student could ___.",
        modelAnswerHe: "תשובה: swim at least twenty-five meters without help.",
      },
      {
        formatHe: "אוצר מילים בהקשר",
        promptEn: 'In the last paragraph, the word "permanent" means:',
        options: ["very expensive", "lasting, not temporary", "only for children", "dangerous"],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
    ],
    vocabularyQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the word closest in meaning to "admit":',
        options: ["celebrate", "refuse", "confess", "measure"],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: confess.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Swimming in deep water was a __________ (frighten) experience for him.",
        modelAnswerHe: "תשובה: frightening.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the word closest in meaning to "overcome":',
        options: ["avoid", "describe", "repeat", "defeat"],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: defeat.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The instructor answered every question __________ (patient).",
        modelAnswerHe: "תשובה: patiently.",
      },
      {
        formatHe: "התאמה",
        promptEn:
          "Match: (1) shallow (2) balance (3) brave — (a) not afraid to do something difficult (b) not deep (c) a steady position that stops you from falling",
        modelAnswerHe: "תשובה: 1-b, 2-c, 3-a.",
      },
    ],
  },
  {
    moduleCode: "F",
    unitSlug: "4",
    titleHe: "למצוא את הדרך בלי טלפון",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [WITHOUT_A_MAP_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What is the main concern of the educators and psychologists?",
        options: [
          "GPS devices are too expensive",
          "Paper maps are often wrong",
          "Navigation skills that are not used tend to weaken",
          "People travel more than before",
        ],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C. ניווט הוא מיומנות, ומיומנות שלא משתמשים בה נחלשת.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to paragraph 2, how is reading a map different from following spoken instructions?",
        modelAnswerHe:
          "תשובה מקובלת: כשקוראים מפה בונים בראש תמונה של האזור (איפה הנהר, לאיזה כיוון הים, איך רחובות מתחברים); כשמקשיבים להוראות צריך לדעת רק את הפנייה הבאה.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which argument do the supporters of GPS NOT make?",
        options: [
          "People have always used tools to save mental effort",
          "GPS saves time and attention for other things",
          "Navigation apps help people who are anxious about getting lost",
          "GPS improves people's own sense of direction",
        ],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D. התומכים לא טוענים שה-GPS משפר את חוש הכיוון; זה הפוך לחשש שבפסקה 2.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to paragraph 4, give ONE risk of depending completely on a phone and ONE risk of using a paper map.",
        modelAnswerHe:
          "תשובה: טלפון: כשהסוללה נגמרת או שאין קליטה (למשל במדבר או ביער) נשארים חסרי אונים. מפת נייר: נהג שמעיין במפה תוך כדי נסיעה אינו בטוח יותר.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: 'What is an "orientation walk", and what are students often surprised by? Answer in your own words.',
        modelAnswerHe:
          "תשובה מקובלת: הליכה בשכונה כשהטלפונים בתיק, עם מפה פשוטה, שבה התלמידים מגיעים לבד לכמה נקודות ומתווכחים לאן ללכת. הם מופתעים מכמה דברים הם קולטים כשהם חייבים לשים לב: מאפייה בפינה, גבעה, מיקום השמש.",
      },
    ],
    writingTask: {
      promptEn:
        "Should schools teach students to find their way without a phone? Write an essay presenting your opinion. Support it with reasons and an example.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "G",
    unitSlug: "4",
    titleHe: "להחזיר לחיים מינים שנכחדו",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [DE_EXTINCTION_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "According to paragraph 1, what have advances in genetic engineering led some scientists to suggest?",
        options: [
          "That most extinctions were natural",
          "That museums should collect more bones",
          "That extinction may not always be final",
          "That living relatives of extinct species are also endangered",
        ],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C. אולי אפשר יהיה ליצור חיה שדומה מאוד למין שנכחד, ולכן ההכחדה אולי כבר אינה סופית לגמרי.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Give TWO reasons the supporters give for bringing back lost species.",
        modelAnswerHe:
          "תשובה: זו דרך לתקן נזק שבני אדם גרמו (ציד, הרס בתי גידול, טורפים חדשים) ולקחת אחריות עליו; לחלק מהחיות שנעלמו היה תפקיד חשוב במערכת האקולוגית (פיזור זרעים, עיצוב הנוף), והחזרתן יכולה לעזור לסביבות פגועות להתאושש.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: 'Explain in your own words why the critics call the laboratory animal "an approximation".',
        modelAnswerHe:
          "תשובה מקובלת: זה לא יהיה המין המקורי אלא יצור מודרני שנבנה כדי להיראות ולהתנהג כמוהו. אין לו הורים מאותו מין ללמוד מהם, וגם בית הגידול שלו אולי השתנה לגמרי.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: 'What is the "philosophical objection" described in paragraph 4?',
        options: [
          "Animals in laboratories suffer more than wild animals",
          "Scientists should never edit genes",
          "Extinct animals were never important to their ecosystems",
          "If extinction seems reversible, protecting endangered species now may seem less urgent",
        ],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D. אם אפשר לבטל הכחדה, ממשלות וחברות עלולות לדחות את ההגנה על מינים בסכנה, וזה מחליש את תחושת הדחיפות.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which of the following is NOT mentioned in the text?",
        options: [
          "The money could protect many living animals instead",
          "Recreated animals would attract tourists and raise money",
          "The research may help increase genetic variety in endangered populations",
          "Releasing a recreated animal could have unpredictable consequences",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B. הטקסט לא מזכיר תיירות או הכנסות.",
      },
    ],
    writingTask: {
      promptEn:
        "Some people believe that if science can bring back extinct animals, it should. Others think the money and effort should go only to protecting animals alive today. Write an essay presenting your opinion and responding to the opposite view.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "E",
    unitSlug: "5",
    titleHe: "סופרים ציפורים בחצר בית הספר",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [BIRD_COUNT_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Which of the following do the students NOT take with them on the count?",
        options: ["Notebooks", "Binoculars", "A guide with pictures", "Cameras"],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D. מוזכרים מחברות, משקפות שאולות ומדריך עם תמונות, אבל לא מצלמות.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Why did Ruth Peled start the project?",
        modelAnswerHe: "תשובה: היא דאגה שהתלמידים יודעים לקרוא בשם לעשרות דמויות ממשחקי וידאו, אבל כמעט לא לאף ציפור שמחוץ לחלון.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The local nature organization agreed to ___ and to ___.",
        modelAnswerHe: "תשובה: train the teachers; collect the students' results each year.",
      },
      {
        formatHe: "מארגן גרפי",
        promptEn: "Complete the rules of the count: Time in each area: ___ | What to write down: ___ | What to do when not sure: ___.",
        modelAnswerHe: "תשובה: חמש־עשרה דקות בדיוק; כל ציפור שרואים או שומעים; לצייר או לתאר אותה, ומומחה בודק אחר כך.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What does Ruth mean when she says \"A careful 'I don't know' is more useful to science than a confident mistake\"?",
        options: [
          "Students should never write anything down",
          "Guessing quickly saves time",
          "Admitting you are not sure is better than giving wrong information",
          "Experts do not need the students' notes",
        ],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C. לכן אומרים לתלמידים לא לנחש.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Why were the experts pleased with the students' information?",
        options: [
          "It proved that birds are disappearing everywhere",
          "It came from many small places that researchers find hard to cover alone",
          "It was collected by professional researchers",
          "It was the first bird count in the country",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "A small green bird that was rare in the first year has ___.",
        modelAnswerHe: "תשובה: become common around the school.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Give TWO examples from paragraph 5 that show how the project changed the children.",
        modelAnswerHe:
          "תשובה: שניים מתוך: הם עוצרים בדרך הביתה כדי להצביע על ציפורים על חוטי חשמל; חלקם ביקשו משקפות כמתנת יום הולדת; תלמידים מהשנה הראשונה חוזרים כל חורף לעזור לצעירים.",
      },
      {
        formatHe: "אוצר מילים בהקשר",
        promptEn: 'In paragraph 1, "spread out" means:',
        options: ["sat close together", "ran home", "moved apart to different places", "became ill"],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C.",
      },
    ],
    vocabularyQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the best meaning of "surroundings":',
        options: ["your family members", "the place and things around you", "a kind of bird", "the end of a lesson"],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: the place and things around you.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The students were told to write their notes __________ (care).",
        modelAnswerHe: "תשובה: carefully.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the word closest in meaning to "confident":',
        options: ["tired", "angry", "quiet", "sure"],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: sure.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Over the years, the count produced some very __________ (interest) results.",
        modelAnswerHe: "תשובה: interesting.",
      },
      {
        formatHe: "התאמה",
        promptEn:
          "Match: (1) expert (2) pond (3) notice — (a) a small area of still water (b) to see or become aware of something (c) a person with special knowledge",
        modelAnswerHe: "תשובה: 1-c, 2-a, 3-b.",
      },
    ],
  },
  {
    moduleCode: "F",
    unitSlug: "5",
    titleHe: "התנדבות חובה?",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [REQUIRED_VOLUNTEERING_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What is the debate about, according to paragraph 1?",
        options: [
          "Whether volunteering should be required",
          "Whether community service activities are useful",
          "Which organizations students should choose",
          "How many hours students should study",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A. על הפעילויות עצמן כמעט אין מחלוקת; הוויכוח הוא אם לחייב.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Give TWO arguments of those who support the requirement.",
        modelAnswerHe:
          "תשובה: הרבה בני נוער לא היו מגלים את הערך שבעזרה לאחרים בלי שידחפו אותם לנסות; החובה יוצרת הוגנות, כי בלעדיה מתנדבים בעיקר מי שיש להם זמן פנוי, ביטחון עצמי והורים עם קשרים.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: 'Why do critics say that the phrase "required volunteering" contradicts itself? Explain in your own words.',
        modelAnswerHe:
          "תשובה מקובלת: התנדבות היא מעצם הגדרתה משהו שבוחרים לעשות. כשהיא הופכת לחובה שסופרים בה שעות, תלמידים עלולים ללמוד שעזרה לאחרים היא רק סעיף לסמן בדרך לתעודה.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "According to paragraph 4, why may service hours be a problem for some students?",
        options: [
          "They live too far from the organizations",
          "They prefer to spend their time on sports",
          "Their parents do not allow them to volunteer",
          "They already study long hours, and some work to help their families",
        ],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What do teachers in the programs described in paragraph 5 say matters most?",
        options: ["The number of hours", "The certificate at the end", "The quality of the experience", "The distance from home"],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C. עשרים שעות במקום שבאמת מעניין שוות יותר משישים שעות של המתנה לסוף היום.",
      },
    ],
    writingTask: {
      promptEn:
        "Should community service be a requirement for finishing high school? Write an essay presenting your opinion. Support it with reasons and an example.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "G",
    unitSlug: "5",
    titleHe: "האם עוד צריך ללמוד שפות?",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [MACHINE_TRANSLATION_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What is the purpose of the examples about menus and instruction manuals in paragraph 1?",
        options: [
          "To prove that restaurants need human translators",
          "To show how poor machine translation used to be",
          "To argue that travelers should learn languages",
          "To show that machine translation is still useless",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B. הם מראים כמה התרגום היה גרוע בעבר, לעומת המצב היום.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Explain the economic argument against language learning in your own words.",
        modelAnswerHe:
          "תשובה מקובלת: אם מכונה עושה בשניות מה שלוקח לאדם שנים ללמוד, חבל להשקיע כל כך הרבה זמן בבית הספר באוצר מילים ובדקדוק; עדיף להקדיש אותו למקצועות שבהם מכונות פחות טובות.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "According to the language teachers, what is most easily lost in a conversation through a device?",
        options: [
          "Grammar and vocabulary",
          "The names of places",
          "Formal expressions",
          "Humor, irony and small adjustments to the other person's mood",
        ],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to paragraph 4, how can learning a foreign language change the way people understand their own language?",
        modelAnswerHe:
          "תשובה מקובלת: מגלים שהדרך שלנו לבטא רעיונות היא רק אפשרות אחת מתוך רבות: מילים שנראות מקבילות נושאות אסוציאציות שונות, ודקדוק שנראה טבעי הוא בעצם בחירה. מי שהתקשה לבטא רגש בשפה זרה מבין טוב יותר את השפה שלו.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which statement best reflects the writer's conclusion?",
        options: [
          "The danger is believing that understanding another person can be left entirely to a machine",
          "Translation technology should be banned in schools",
          "Machines will soon translate humor perfectly",
          "Language learning is only useful in hospitals and courts",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A. הכותב לא נגד הטכנולוגיה; הסכנה היא האמונה שאפשר להעביר אליה לגמרי את ההבנה של אדם אחר.",
      },
    ],
    writingTask: {
      promptEn:
        "Now that translation apps are so good, should schools still require students to learn a foreign language? Write an essay presenting a clear position and responding to the opposite view.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "E",
    unitSlug: "6",
    titleHe: "כשהלימודים התחילו שעה מאוחר יותר",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [LATER_START_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why was the first lesson of the day the hardest to teach?",
        options: [
          "The classrooms were too cold",
          "The students were tired and slow to answer",
          "The teachers arrived late",
          "The lesson was always a difficult subject",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B. ראשים היו מונחים על השולחנות, וגם על שאלות פשוטות ענו לאט.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Students who came by bus from distant villages often left home ___.",
        modelAnswerHe: "תשובה: before seven.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What had many parents noticed about teenagers at home?",
        modelAnswerHe: "תשובה: בני נוער לא עצלנים בבוקר; הגוף שלהם פשוט רוצה לישון ולהתעורר מאוחר יותר מילדים צעירים או ממבוגרים.",
      },
      {
        formatHe: "מארגן גרפי",
        promptEn: "Complete the table of problems with the plan: Some parents: ___ | Bus companies: ___ | Some teachers: ___.",
        modelAnswerHe:
          "תשובה: הורים: חששו שסיום מאוחר ישאיר פחות זמן לספורט, לעבודה ולשיעורי בית. חברות האוטובוסים: היו צריכות לשנות את לוחות הזמנים. מורים עם ילדים קטנים: התקשו עם המערכת החדשה.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "How did the school measure the results of the experiment?",
        options: [
          "By comparing exam grades with other schools",
          "By asking the bus companies",
          "With records of lateness and absence, and student questionnaires",
          "By counting how many students ate lunch",
        ],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Teachers described the morning lessons after the change as ___.",
        modelAnswerHe: "תשובה: a completely different atmosphere.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What change did the school make in response to the criticism?",
        options: [
          "It cancelled the experiment",
          "It started at 7:45 again on Fridays",
          "It added a lesson at the end of the day",
          "It shortened the long lunch break",
        ],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "How much later does the school day end now, and why only that much?",
        modelAnswerHe: "תשובה: רק חצי שעה מאוחר יותר, כי הפסקת הצהריים הארוכה קוצרה.",
      },
      {
        formatHe: "אוצר מילים בהקשר",
        promptEn: 'In paragraph 4, the word "persuade" means:',
        options: ["confuse", "convince", "punish", "ignore"],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
    ],
    vocabularyQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the best meaning of "absence":',
        options: ["a loud noise", "a short break", "not being present", "a new rule"],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: not being present.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Lateness to the first lesson dropped __________ (sharp).",
        modelAnswerHe: "תשובה: sharply.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the best meaning of "criticism":',
        options: ["comments about what is wrong", "a kind of timetable", "praise and thanks", "a school subject"],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: comments about what is wrong.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Not all the teachers were in __________ (agree) with the plan.",
        modelAnswerHe: "תשובה: agreement.",
      },
      {
        formatHe: "התאמה",
        promptEn:
          "Match: (1) semester (2) timetable (3) atmosphere — (a) a list showing when buses or lessons happen (b) the feeling or mood in a place (c) half of a school year",
        modelAnswerHe: "תשובה: 1-c, 2-a, 3-b.",
      },
    ],
  },
  {
    moduleCode: "F",
    unitSlug: "6",
    titleHe: "החיים השניים של בגדים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [SECOND_LIFE_CLOTHES_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "According to paragraph 1, what would the grandparents of today's teenagers have found completely ordinary?",
        options: [
          "Buying clothes online",
          "Buying a new collection every few weeks",
          "Throwing clothes away after wearing them once",
          "Wearing clothes that someone else owned first",
        ],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "How has the image of second-hand shopping changed? Answer in your own words.",
        modelAnswerHe:
          "תשובה מקובלת: בעבר קנייה של בגדים משומשים נקשרה למחסור בכסף, ואנשים העדיפו להסתיר אותה. היום, בזכות חנויות וינטג׳, החלפות בגדים ואפליקציות, זה נחשב אופנתי.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to paragraph 3, why does wearing an item for longer help the environment?",
        modelAnswerHe:
          "תשובה: ייצור של בגד דורש מים, אנרגיה וחומרי גלם, וההובלה שלו ארוכה. כל פריט שלובשים יותר זמן מקטין את הצורך לייצר בגד חדש, ולכן המשאבים לא מתבזבזים.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which point do the critics make in paragraph 4?",
        options: [
          "Prices may rise for families who depend on second-hand shops",
          "Second-hand clothes are always of low quality",
          "Second-hand shopping should be banned",
          "Vintage shops are too far from most homes",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A. כשקונים אמידים ממלאים את החנויות, המחירים עלולים לעלות למי שקונה שם מתוך צורך.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the last paragraph, what do some environmental educators see as the most important step?",
        modelAnswerHe:
          "תשובה: לא איפה קונים בגדים אלא כמה: ארון קטן יותר של פריטים טובים, שמתקנים כשצריך ומעבירים הלאה כשכבר לא צריך אותם.",
      },
    ],
    writingTask: {
      promptEn:
        "Describe one change you would like young people in your community to make in the way they buy or use things. Explain why it matters and how it could be done.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "G",
    unitSlug: "6",
    titleHe: "דירוגים ברשת: כמה אפשר לסמוך עליהם",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [ONLINE_RATINGS_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "According to paragraph 1, why are online ratings attractive?",
        options: [
          "They are written by the sellers themselves",
          "They are shorter than advertisements",
          "They draw on the experience of many previous customers",
          "They come from a single trusted friend",
        ],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: 'Explain in your own words why ratings often "reflect the extremes of experience rather than its ordinary middle".',
        modelAnswerHe:
          "תשובה מקובלת: רוב הלקוחות המרוצים בכלל לא כותבים ביקורת. כותבים בעיקר מי שהתלהבו מאוד או כעסו מאוד, ולכן הדירוג משקף את הקצוות ולא את החוויה הרגילה.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: 'According to paragraph 3, why do early reviews carry "disproportionate weight"?',
        options: [
          "Later customers are influenced by what they read before arriving",
          "Platforms show early reviews in larger letters",
          "Early customers are usually experts",
          "Businesses delete later reviews",
        ],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A. ביקורות משפיעות זו על זו, ולכן עסק שהתחיל עם כמה דירוגים שליליים מתקשה להתאושש.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: 'What is the "most subtle effect" of ratings on businesses, according to paragraph 5? Mention TWO points.',
        modelAnswerHe:
          "תשובה: העובדים מרגישים ששופטים אותם כל הזמן, והלחץ לרצות כל לקוח מתיש; בעלי עסקים נמנעים מדברים חריגים או ניסיוניים, כך שמערכת שנועדה לתגמל איכות מתגמלת גם זהירות.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which of the following is NOT presented in the text as a problem with online ratings?",
        options: [
          "Some businesses buy positive reviews",
          "Reviews influence one another",
          "Satisfied customers rarely write reviews",
          "Most ratings are written by professional critics",
        ],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D. הטקסט מדבר על לקוחות רגילים, לא על מבקרים מקצועיים.",
      },
    ],
    writingTask: {
      promptEn:
        "Do online reviews help people make better choices, or do they cause more harm than good? Write an essay presenting your opinion, with reasons and examples, and respond to the opposite view.",
      wordCountRange: [120, 140],
    },
  },
];

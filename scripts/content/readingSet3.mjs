// Reading, set 3: one new text each for B1 to C2, which had nine texts
// against ten at A1 and A2. Same shape as readingSet2.mjs: 5 comprehension
// questions [prompt, options, correctIndex] and 2 open questions. All
// original; no invented statistics.

export const READING = [
  // ---------------- B1 ----------------
  {
    level: "B1",
    title_en: "The Book Swap on Our Street",
    title_he: "מדף החלפת הספרים ברחוב שלנו",
    body: `Two years ago, a wooden box appeared next to the bus stop on our street. It looked like a small cupboard with a glass door, and inside there were about twenty books. A note on the door said: "Take a book, leave a book. Thank you, Ruth from number 14."

At first, nobody paid much attention. People walked past it on their way to work, and the books stayed the same for weeks. Then, slowly, things started to change. One morning I noticed a cookbook that had not been there before. A week later, there were three children's books and a guide to Italy. By the end of the first month, the box was so full that Ruth had to add a second shelf.

I decided to meet Ruth and ask her why she had started it. She is a retired English teacher, and she told me that when she moved to a smaller flat, she could not keep all her books. "I didn't want to throw them away," she said, "and I didn't want to sell them either. I wanted them to be read."

The box has become more than a place for books. Neighbours who had never spoken now stop to talk about what they are reading. Parents bring their children on Friday afternoons to choose something for the weekend. Someone even left a notebook inside, and people write short comments about the books they have taken.

Of course, there are small problems. Sometimes the books get wet in winter, and once someone left a pile of old newspapers. But Ruth says that is part of the experience. "It belongs to everyone now," she told me. "So everyone takes care of it."`,
    mcq: [
      ["Where is the book box?", ["Inside the library", "Next to the bus stop", "In Ruth's flat", "At the school"], 1],
      ["Why did Ruth start the book swap?", ["She wanted to sell her books", "She moved to a smaller flat and wanted her books to be read", "The school asked her to", "She found the box on the street"], 1],
      ["What happened by the end of the first month?", ["The box was empty", "The box was so full that a second shelf was added", "Someone took the box away", "Ruth closed it"], 1],
      ["What did someone leave inside the box?", ["A notebook for comments", "A camera", "A map of the city", "A box of sweets"], 0],
      ["What does Ruth mean by \"It belongs to everyone now\"?", ["Anyone can sell the books", "The whole street looks after it", "She wants to give it to the city", "Nobody is allowed to change it"], 1],
    ],
    open: ["Would a book swap work on your street? Why or why not?", "What is something you own that you would like other people to use? Explain."],
  },

  // ---------------- B2 ----------------
  {
    level: "B2",
    title_en: "Are You a Morning Person?",
    title_he: "אנשי בוקר ואנשי לילה",
    body: `Some people jump out of bed at six, full of energy, while others can barely open their eyes before nine and only start thinking clearly in the late afternoon. For a long time, the second group was often described as lazy. Sleep researchers now see it differently: much of the difference comes from a person's chronotype, the natural timing of their internal body clock.

Every one of us has an internal rhythm of roughly twenty-four hours that controls when we feel sleepy, when our body temperature rises and falls, and when we are most alert. In some people this clock runs a little early, and in others it runs a little late. The tendency is partly inherited, which is why "night owls" often have parents who were night owls too.

Chronotype also changes with age. Young children tend to wake up early, which many tired parents know very well. During the teenage years, the body clock usually shifts later, so a sixteen-year-old who cannot fall asleep before midnight is not necessarily being difficult. In later adulthood, many people gradually become early risers again.

This has practical consequences. Schools and workplaces are mostly organised around an early schedule, which suits morning types and puts evening types at a disadvantage. A night owl who must start work at eight may spend the first hours of the day performing well below their real ability. Some schools have experimented with later start times for older students, and several have reported that students arrive more awake.

None of this means that a night owl is stuck forever. Morning light, a regular bedtime and avoiding bright screens late at night can all move the body clock a little earlier. But the change is usually modest. The more useful lesson may be simply to know your own rhythm, and, where possible, to save your most demanding tasks for the hours when your mind is at its best.`,
    mcq: [
      ["What is a chronotype?", ["A sleep disorder", "The natural timing of a person's body clock", "A way of measuring intelligence", "A type of alarm clock"], 1],
      ["According to the text, why do night owls often have night-owl parents?", ["They copy their parents' habits", "The tendency is partly inherited", "They live in the same time zone", "Their parents keep them awake"], 1],
      ["What usually happens to the body clock during the teenage years?", ["It shifts earlier", "It shifts later", "It stops changing", "It becomes exactly twenty-four hours"], 1],
      ["Why are evening types at a disadvantage?", ["They sleep less in total", "Schools and workplaces mostly start early", "They are less intelligent", "They eat at the wrong times"], 1],
      ["What does the writer suggest at the end?", ["Night owls should force themselves to wake at six", "Changing your body clock is impossible", "Know your rhythm and do hard tasks at your best hours", "Schools should start at noon"], 2],
    ],
    open: ["Are you a morning person or a night owl? How does it affect your day?", "Should schools start later for teenagers? Give reasons for your opinion."],
  },

  // ---------------- C1 ----------------
  {
    level: "C1",
    title_en: "The Trouble with Five Stars",
    title_he: "הבעיה עם חמישה כוכבים",
    body: `Rating systems were supposed to make choosing easier. Instead of relying on advertising, we could see what thousands of other customers thought of a hotel, a phone charger or a plumber. In principle, that is a remarkable shift of power from sellers to buyers. In practice, anyone who has scrolled through online reviews knows that something has gone wrong.

The first problem is inflation. On many platforms, the vast majority of ratings cluster at four or five stars. When almost everything scores between 4.6 and 4.9, the number stops carrying much information. A difference of one tenth of a star may reflect a single unhappy customer rather than any real difference in quality, yet it can decide which product appears at the top of a search.

Part of the reason is social rather than technical. Many people feel that anything below five stars is a punishment, particularly when they are rating an individual, such as a driver or a host, whose income depends on the score. Giving "only" four stars to a perfectly adequate service feels mean, so people round up. Over time, five stars comes to mean "nothing went wrong" rather than "this was excellent".

The second problem is who writes reviews at all. Customers who were delighted or furious are far more likely to share their opinion than those who were merely satisfied, which pushes ratings towards the extremes and leaves the ordinary experience underrepresented. Add to this the reviews written or paid for by sellers themselves, and the picture becomes even less reliable.

None of this makes reviews useless, but it does change how they are best read. The written comments are usually more informative than the average score, especially the moderate ones, which tend to describe specific strengths and weaknesses. Looking at the three-star reviews, rather than the five-star ones, is often the quickest way to discover what a product is really like.`,
    mcq: [
      ["What does the writer mean by \"inflation\" in ratings?", ["Prices rising because of reviews", "Most ratings bunching at four or five stars", "Too many people writing reviews", "Ratings falling over time"], 1],
      ["Why do many people round their rating up, according to the text?", ["Platforms force them to", "Giving less than five stars feels like punishing someone", "They are paid to do so", "They don't read the scale"], 1],
      ["What has five stars come to mean?", ["The service was outstanding", "Nothing went wrong", "The customer was paid", "The product is new"], 1],
      ["Which customers are most likely to write reviews?", ["Those who were merely satisfied", "Those who were delighted or furious", "Those who bought nothing", "Only professional reviewers"], 1],
      ["What does the writer recommend?", ["Ignoring reviews completely", "Trusting only the average score", "Reading moderate, three-star reviews", "Writing only five-star reviews"], 2],
    ],
    open: ["How do you use online reviews when you buy something? Has a review ever misled you?", "Should rating systems be designed differently? Suggest one change and explain why it would help."],
  },

  // ---------------- C2 ----------------
  {
    level: "C2",
    title_en: "When a Measure Becomes a Target",
    title_he: "כשמדד הופך למטרה",
    body: `In 1975 the British economist Charles Goodhart observed that statistical regularities tend to collapse once they are used for the purpose of control. The idea has since been popularised in a sharper form, usually called Goodhart's law: when a measure becomes a target, it ceases to be a good measure. It is one of those principles that sound almost too neat to be true, until one starts noticing it everywhere.

Consider a hospital that is judged on how quickly patients are seen after arriving in the emergency department. The intention is admirable; nobody wants the sick to wait. Yet once the waiting time becomes the figure on which managers are assessed, the incentive shifts subtly from treating patients promptly to recording that they were treated promptly. Patients may be "seen" briefly to stop the clock, then left waiting elsewhere. The number improves, while the experience it was meant to describe may not.

Schools offer an equally familiar example. Examination results are a reasonable indicator of what pupils have learned, provided nobody is trying too hard to raise them. Once a school's reputation, funding or a teacher's career depends on them, it becomes rational to teach precisely what the examination rewards and little else. Scores rise; whether understanding rises with them is another matter.

What makes the law so persistent is that nobody in these stories need be dishonest. Each individual responds sensibly to the incentives in front of them, and the distortion emerges from the system as a whole. That is also why simply adding more measures rarely solves the problem: every new indicator becomes a fresh target, with its own opportunities for gaming.

The more promising responses are less mechanical. Some organisations rotate the indicators they pay attention to, so that none can be optimised for long; others combine numbers with the judgement of people close enough to the work to see what the figures conceal. Neither approach is as tidy as a single, objective score. But tidiness, Goodhart's law suggests, may be precisely what we should be most suspicious of.`,
    mcq: [
      ["What does Goodhart's law state, as described in the text?", ["Statistics are always unreliable", "When a measure becomes a target, it stops being a good measure", "Economists should not set targets", "Every organisation needs more measures"], 1],
      ["In the hospital example, what may happen once waiting time becomes a target?", ["Hospitals hire more doctors", "Patients are seen briefly to stop the clock and then wait elsewhere", "Waiting times are no longer recorded", "Patients choose other hospitals"], 1],
      ["According to the writer, why does the problem persist even without dishonesty?", ["People ignore the rules", "Individuals respond sensibly to incentives and the distortion comes from the system", "Managers deliberately hide the truth", "The measures are calculated incorrectly"], 1],
      ["Why does adding more measures rarely help?", ["They are too expensive", "Each new measure becomes another target that can be gamed", "Nobody reads them", "They contradict each other"], 1],
      ["What is the writer's attitude to a single, objective score?", ["It is the best solution available", "It should be viewed with suspicion", "It is only useful in hospitals", "It is impossible to calculate"], 1],
    ],
    open: ["Think of a target in your school, workplace or daily life. Has it ever been reached in a way that missed its real purpose?", "Is it possible to measure success without creating the problem the text describes? Discuss."],
  },
];

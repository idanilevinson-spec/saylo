// Reading, set 2: two new texts per level (there were 7 or 8). Same shape
// as READING in a2AndIdioms.mjs: 5 comprehension questions
// [prompt, options, correctIndex] and 2 open questions. All original.

export const READING = [
  // ---------------- A1 ----------------
  {
    level: "A1",
    title_en: "My Grandmother's Garden",
    title_he: "הגינה של סבתא",
    body: `My grandmother lives in a small house in a village. Behind the house, there is a big garden. Every Saturday, I go to her house with my parents and my little brother.

In the garden, there are many trees. There is an orange tree, a lemon tree and two olive trees. My grandmother says the olive trees are very old. They are older than her!

There are also many flowers. Some are red, some are yellow and some are white. My favorite flowers are the yellow ones. They smell very nice.

My grandmother grows vegetables too. She has tomatoes, cucumbers and peppers. In the summer, we pick the tomatoes together. They are red and sweet. We wash them and eat them at lunch with bread and cheese.

My brother likes the garden because of the cat. The cat is gray and white, and it sleeps under the lemon tree every afternoon.

I love my grandmother's garden. It is quiet and green, and it is my favorite place in the world.`,
    mcq: [
      ["When does the writer visit the grandmother?", ["Every Friday", "Every Saturday", "Every Sunday", "Every day"], 1],
      ["Which trees are very old?", ["The orange tree", "The lemon tree", "The olive trees", "All the trees"], 2],
      ["What color are the writer's favorite flowers?", ["Red", "White", "Yellow", "Blue"], 2],
      ["What do they eat with the tomatoes?", ["Rice and fish", "Bread and cheese", "Eggs and salad", "Soup"], 1],
      ["Where does the cat sleep?", ["In the house", "Under the lemon tree", "Under the olive tree", "With the brother"], 1],
    ],
    open: ["Describe a place you love. What is there, and why do you like it?", "Who do you visit on the weekend? What do you do together?"],
  },
  {
    level: "A1",
    title_en: "A Day at the Beach",
    title_he: "יום בים",
    body: `It is Friday morning, and the sun is hot. My friends and I want to go to the beach. We take the bus at nine o'clock. The trip is short, only twenty minutes.

At the beach, there are many people. Some people swim in the sea, and some people sit under umbrellas. Children build sand castles near the water. We find a good place and put our towels on the sand.

First, we swim. The water is cool and blue. Then we play ball on the sand. My friend Noa is very good at ball games, and she always wins.

At twelve o'clock, we are hungry. We eat sandwiches and watermelon. Watermelon is my favorite fruit in the summer. We also drink a lot of cold water, because it is very hot.

In the afternoon, we sit under an umbrella and read. At four o'clock, we take the bus home. We are tired, but we are very happy. It is a perfect day.`,
    mcq: [
      ["How do they go to the beach?", ["By car", "By bus", "By bike", "On foot"], 1],
      ["How long is the trip?", ["Ten minutes", "Twenty minutes", "One hour", "Two hours"], 1],
      ["Who always wins at ball games?", ["The writer", "Noa", "A child", "Nobody"], 1],
      ["What do they eat at twelve o'clock?", ["Pizza and juice", "Sandwiches and watermelon", "Ice cream", "Fish and rice"], 1],
      ["How do they feel at the end of the day?", ["Sad", "Angry", "Tired but happy", "Hungry"], 2],
    ],
    open: ["What do you like to do on a hot day?", "Describe a perfect day with your friends."],
  },

  // ---------------- A2 ----------------
  {
    level: "A2",
    title_en: "Lost at the Airport",
    title_he: "הלכתי לאיבוד בשדה התעופה",
    body: `Last year, I flew to London alone for the first time. I was very excited, but I was also a little nervous, because I didn't speak English very well.

When the plane landed, everything was fine. I followed the other passengers to passport control, and then I went to get my suitcase. I waited and waited, but my suitcase didn't come. After forty minutes, there were no more bags on the belt.

I didn't know what to do. Then I saw a sign that said "Lost Baggage". I went to the desk and spoke to a woman there. I said slowly, "My suitcase is not here." She smiled and asked me for my ticket and my address in London. She typed everything into her computer.

"Your suitcase is still in Tel Aviv," she said. "It will arrive tomorrow on the next flight. We will bring it to your hotel."

I was worried, because all my clothes were in the suitcase. That evening, I bought a toothbrush and a T-shirt at a small shop near the hotel.

The next afternoon, someone knocked on my door. It was my suitcase! I was so happy. And I learned something important: always keep a change of clothes in your hand luggage.`,
    mcq: [
      ["How did the writer feel before the trip?", ["Only happy", "Excited but a little nervous", "Bored", "Angry"], 1],
      ["How long did the writer wait for the suitcase?", ["Ten minutes", "Twenty minutes", "Forty minutes", "Two hours"], 2],
      ["Where was the suitcase?", ["On another belt", "In Tel Aviv", "At the hotel", "In another airport"], 1],
      ["What did the writer buy that evening?", ["A new suitcase", "A toothbrush and a T-shirt", "Shoes and a jacket", "Food and water"], 1],
      ["What did the writer learn?", ["Never fly alone", "Always arrive early", "Keep some clothes in your hand luggage", "Learn English before you travel"], 2],
    ],
    open: ["Tell about a problem you had on a trip. What happened, and how did you solve it?", "What do you always take with you when you travel? Why?"],
  },
  {
    level: "A2",
    title_en: "Our Class Trip to the Desert",
    title_he: "הטיול השנתי למדבר",
    body: `Every year, our school goes on a trip. This year, we went to the desert in the south for three days. We traveled by bus, and the journey took four hours.

On the first day, we walked in a dry river called a wadi. Our guide, Avi, told us not to walk alone and to drink water every thirty minutes. It was very hot, almost thirty-five degrees, but the views were beautiful. The rocks were red, orange and brown.

In the evening, we slept in big tents. After dinner, we sat around a fire and sang songs. Then Avi turned off all the lights. I looked up and saw more stars than I ever saw in the city. Some of my friends saw a shooting star.

On the second day, we got up at four in the morning to climb a mountain and watch the sunrise. I was very tired, and the climb was hard. But when the sun came up, everyone was quiet. It was amazing.

On the last day, we visited a small farm where people grow vegetables with very little water. I didn't know that was possible in the desert.

When I came home, I was dirty and tired. But it was the best trip of my life.`,
    mcq: [
      ["How long was the trip?", ["One day", "Two days", "Three days", "A week"], 2],
      ["What did Avi tell them to do?", ["Walk fast", "Drink water every thirty minutes", "Take photos", "Stay in the tents"], 1],
      ["What did the writer see at night?", ["The city lights", "Many stars", "Animals", "A storm"], 1],
      ["Why did they get up at four in the morning?", ["To catch the bus", "To watch the sunrise", "To eat breakfast", "To visit the farm"], 1],
      ["What surprised the writer at the farm?", ["The animals", "Growing vegetables with little water", "The size of the farm", "The heat"], 1],
    ],
    open: ["Describe a school trip you remember. What was the best part?", "Would you like to sleep in the desert? Why or why not?"],
  },

  // ---------------- B1 ----------------
  {
    level: "B1",
    title_en: "Saving Money as a Student",
    title_he: "לחסוך כסף בתור סטודנטים",
    body: `When I started university, I had never managed my own money before. My parents had always paid for everything. Suddenly, I had rent, food, transport and books to pay for, and a part-time job that didn't pay very much. By the end of the first month, I had almost nothing left in my bank account.

I realized I needed a plan. First, I wrote down everything I spent for two weeks, even small things like a coffee or a snack. I was shocked by the results. I was spending more on coffee and takeout than on books. It wasn't that I was buying expensive things; it was that I was buying small things all the time.

So I made some changes. I started cooking at home with my roommates. We took turns, and each person cooked twice a week. It was cheaper, and it was also fun. I bought a thermos and made coffee at home. I also stopped buying new books and started using the library or buying them second-hand from older students.

The biggest change was a simple rule: before buying anything that wasn't food or rent, I waited forty-eight hours. Most of the time, after two days, I didn't want it anymore.

By the end of the year, I had saved enough money for a short trip abroad with my friends. More importantly, I felt in control. I learned that saving money isn't about never spending. It's about knowing where your money goes and choosing what really matters to you.`,
    mcq: [
      ["What was the writer's problem in the first month?", ["The rent was too high", "Almost no money was left", "There was no job", "The books were lost"], 1],
      ["What did the writer discover after writing down expenses?", ["Books were very expensive", "Small purchases added up to a lot", "Rent was the biggest cost", "Transport was too expensive"], 1],
      ["How did the roommates save on food?", ["They ate at the university", "They took turns cooking at home", "They stopped eating lunch", "They bought cheap takeout"], 1],
      ["What was the forty-eight-hour rule?", ["Pay bills within two days", "Wait two days before buying non-essentials", "Work forty-eight hours a week", "Spend money only on weekends"], 1],
      ["According to the writer, what is saving money really about?", ["Never spending", "Earning more", "Knowing where your money goes", "Asking parents for help"], 2],
    ],
    open: ["Which of the writer's ideas would work best for you, and why?", "Write about a time you had to manage money on your own."],
  },
  {
    level: "B1",
    title_en: "Why I Started Running",
    title_he: "למה התחלתי לרוץ",
    body: `Two years ago, I couldn't run for more than two minutes without stopping. I worked long hours in an office, I slept badly, and I often felt stressed. A friend suggested I try running. I laughed, because I had always hated sport at school. But I was tired of feeling tired, so I decided to try.

I downloaded a beginner's program on my phone. The first week, I ran for one minute, then walked for one and a half minutes, eight times. It doesn't sound like much, but on the first day I thought I was going to die. My legs hurt and my face was red. Still, I didn't give up.

Slowly, things got easier. After three weeks, I could run for five minutes without stopping. After two months, I ran my first five kilometers. I wasn't fast, but I didn't care. I had never felt so proud of myself.

What surprised me most wasn't the change in my body; it was the change in my mind. Running became my thinking time. Problems that seemed huge at my desk looked smaller after half an hour in the park. I also started sleeping better, and I had more energy at work.

Of course, there are still days when I don't want to go. On those days, I tell myself I only have to run for ten minutes. Usually, once I start, I keep going.

Last month, I finished a half marathon. If you had told me that two years ago, I would never have believed you.`,
    mcq: [
      ["Why did the writer decide to start running?", ["To win a race", "To feel less tired and stressed", "Because a doctor said so", "To lose weight for a wedding"], 1],
      ["How did the beginner's program start?", ["Running for thirty minutes", "Running and walking in short turns", "Walking only", "Running five kilometers"], 1],
      ["What surprised the writer most?", ["Losing weight", "The change in the mind", "Making new friends", "Running fast"], 1],
      ["What does the writer do on days without motivation?", ["Stays at home", "Runs with a friend", "Promises to run just ten minutes", "Goes to the gym instead"], 2],
      ["What did the writer achieve last month?", ["A five-kilometer run", "A full marathon", "A half marathon", "A new job"], 2],
    ],
    open: ["Have you ever started a new habit that was difficult at first? What happened?", "Why do you think exercise can help people feel less stressed?"],
  },

  // ---------------- B2 ----------------
  {
    level: "B2",
    title_en: "The Hidden Cost of Fast Fashion",
    title_he: "המחיר הנסתר של אופנה מהירה",
    body: `A T-shirt that costs less than a sandwich seems like a bargain. But the low price on the label is only part of the story. Over the past twenty years, the fashion industry has changed dramatically. Instead of two collections a year, many large brands now release new designs every few weeks. This model, known as fast fashion, has made clothes cheaper and more available than ever before, and it has encouraged people to buy far more than they need.

The environmental costs are significant. Producing a single pair of jeans can require thousands of liters of water, much of it used to grow cotton. Synthetic fabrics like polyester are made from oil and release tiny plastic fibers into rivers and oceans every time they are washed. And because cheap clothes are often worn only a few times, huge quantities end up in landfill, where they can take decades to break down.

There is also a human cost. To keep prices low, many garments are produced in countries where workers earn very little and factory conditions can be unsafe. Several serious accidents in recent years have drawn attention to these problems, though change has been slow.

So what can consumers do? Experts suggest a few simple steps: buy fewer items of better quality, repair clothes instead of throwing them away, and consider second-hand shops or clothing swaps. Some brands are also experimenting with rental services and recycled materials.

None of this means that everyone must stop buying new clothes. But it does mean asking a different question when we shop: not just "How much does this cost?" but "Who really pays for it?"`,
    mcq: [
      ["What is the main feature of fast fashion?", ["Clothes made by hand", "New designs released very often", "Only two collections a year", "Very expensive materials"], 1],
      ["Why are synthetic fabrics a problem?", ["They are too expensive", "They release plastic fibers when washed", "They use no water", "They are hard to sew"], 1],
      ["What happens to many cheap clothes?", ["They are given to museums", "They end up in landfill", "They are always recycled", "They are sold again in shops"], 1],
      ["Which of these is NOT suggested in the text?", ["Buying fewer, better items", "Repairing clothes", "Never buying new clothes", "Shopping second-hand"], 2],
      ["What does the final question \"Who really pays for it?\" suggest?", ["Shops should lower prices", "The true cost falls on the environment and workers", "Consumers pay too much", "Brands should pay more tax"], 1],
    ],
    open: ["Do you think fast fashion should be regulated? Give reasons for your opinion.", "Which of the suggested steps would you be willing to take, and why?"],
  },
  {
    level: "B2",
    title_en: "How Bees Keep Food on Our Tables",
    title_he: "איך הדבורים שומרות על האוכל שלנו",
    body: `When most people think of bees, they think of honey, or perhaps of being stung. Far fewer realize how much of what they eat depends on these small insects. Around three quarters of the world's main food crops benefit, at least in part, from pollination by animals, and bees are among the most important pollinators of all.

Pollination happens when pollen is moved from one flower to another, allowing the plant to produce fruit and seeds. As bees fly from flower to flower collecting nectar, pollen sticks to their bodies and is carried along. Without this process, crops such as almonds, apples, cherries and many vegetables would produce far smaller harvests, or none at all.

In recent decades, however, scientists have reported worrying declines in many bee populations. The causes are complex and often combined. Certain pesticides can weaken bees' ability to navigate. The loss of wild flowers, as fields and meadows are turned into farmland or housing, leaves bees with less food. Diseases and parasites spread more easily among weakened colonies, and changes in climate can disturb the timing between when flowers bloom and when bees are active.

The good news is that there is a lot that can be done, and not only by farmers. Governments in several countries have restricted the most harmful pesticides. Cities are creating green roofs and planting wild flowers along roads. Even individuals can help by growing a few flowering plants on a balcony and avoiding chemical sprays in their gardens.

Protecting bees is not simply about saving one species. It is about protecting a system that quietly supports our own.`,
    mcq: [
      ["What is the main point of the first paragraph?", ["Bees are dangerous", "Much of our food depends on bees", "Honey is very healthy", "Bees live only in gardens"], 1],
      ["What happens during pollination?", ["Bees make honey", "Pollen is moved between flowers", "Plants grow taller", "Insects eat the seeds"], 1],
      ["Which is NOT mentioned as a cause of bee decline?", ["Pesticides", "Loss of wild flowers", "Climate change", "Too much honey production"], 3],
      ["How are some cities helping bees?", ["Banning all insects", "Building green roofs and planting flowers", "Keeping bees in museums", "Selling local honey"], 1],
      ["What does the last sentence mean?", ["Bees are only one species", "Protecting bees protects our food system", "People should keep bees at home", "Bees do not need help"], 1],
    ],
    open: ["Why might people underestimate the importance of bees?", "What could your city or school do to help pollinators?"],
  },

  // ---------------- C1 ----------------
  {
    level: "C1",
    title_en: "The Architecture of Habit",
    title_he: "הארכיטקטורה של ההרגל",
    body: `Much of what we do each day is not, strictly speaking, decided. We reach for our phone on waking, take the same route to work and order the same coffee, often without any conscious deliberation at all. Researchers estimate that a substantial share of everyday behavior is habitual, carried out automatically in response to familiar cues. Far from being a flaw, this is an efficient design: if every routine action required careful thought, we would have little mental energy left for anything else.

Habits are commonly described as a loop. A cue, such as a time of day, a place or an emotion, triggers a routine, which is followed by some kind of reward. Over many repetitions, the brain learns to associate the cue with the reward, and the routine becomes increasingly automatic. Crucially, by the time a habit is established, the reward may no longer be the main driver; the cue alone is enough to set the behavior in motion.

This helps explain why willpower is such an unreliable tool for change. Resolving to resist a habit leaves the cue in place, so the urge returns every time it appears. More effective strategies tend to work on the environment rather than on motivation. Someone who wants to snack less might simply stop keeping snacks at home; someone who wants to read more might leave a book on the pillow. Making a desired behavior easier, and an unwanted one slightly harder, often achieves what determination alone cannot.

Another useful approach is to attach a new habit to an existing one, so that a routine already in place becomes the cue. After making the morning coffee, for instance, one might write for five minutes.

None of this makes change effortless. But it does suggest that the question is less "How can I try harder?" than "How can I design my surroundings so that I need to try less?"`,
    mcq: [
      ["Why does the writer call habits an \"efficient design\"?", ["They make us more creative", "They save mental energy for other things", "They are always healthy", "They are easy to change"], 1],
      ["According to the habit loop, what can eventually trigger a habit on its own?", ["The reward", "The cue", "Willpower", "Conscious decision"], 1],
      ["Why is willpower described as unreliable?", ["It is impossible to measure", "The cue remains and keeps causing the urge", "It only works for good habits", "It is too tiring to use"], 1],
      ["Which example illustrates changing the environment?", ["Promising yourself to stop snacking", "Not keeping snacks at home", "Snacking only at night", "Counting calories"], 1],
      ["What is the main idea of the final paragraph?", ["Change is impossible", "We should design our surroundings to need less effort", "Trying harder always works", "Habits are mostly harmful"], 1],
    ],
    open: ["Choose a habit you would like to build or break. How could you use the ideas in the text?", "Do you agree that environment matters more than willpower? Explain your view with examples."],
  },
  {
    level: "C1",
    title_en: "Why We Trust Strangers Online",
    title_he: "למה אנחנו סומכים על זרים ברשת",
    body: `A generation ago, the idea of sleeping in a stranger's apartment or getting into a stranger's car would have struck most people as reckless. Today, millions do both every day, arranged through apps and platforms. This shift raises an interesting question: what persuades us to trust people we have never met?

Part of the answer lies in reputation systems. Ratings and reviews allow strangers to borrow credibility from the experiences of others. A host with hundreds of positive reviews, or a driver with a near-perfect score, appears to have been vetted by the crowd. Research suggests that even a small number of reviews dramatically increases people's willingness to trust, and that detailed, specific comments carry more weight than a simple star rating.

Platforms also reduce the perceived risk through design. Verified identities, secure payment and the promise of support if something goes wrong all shift some of the risk away from the individual. In effect, we are not only trusting the stranger; we are trusting the system that stands behind them.

Yet this arrangement has weaknesses. Ratings tend to cluster at the top of the scale, partly because people feel awkward leaving negative feedback for someone they have met in person. Fake reviews, sometimes produced at scale, can distort the picture. And reputation systems can embed bias: studies have found that users with certain names or profile photos may receive fewer bookings, regardless of their actual behavior.

None of this means online trust is misplaced. For the vast majority of interactions, it works remarkably well. But it is worth remembering that a five-star rating is a signal, not a guarantee, and that the systems we rely on are built, and can be improved, by people.`,
    mcq: [
      ["What change does the first paragraph describe?", ["People trust each other less", "People now regularly trust strangers through apps", "Apartments are more expensive", "Cars are less safe"], 1],
      ["According to research, which reviews carry more weight?", ["Short star ratings", "Detailed, specific comments", "Reviews from friends", "Anonymous reviews"], 1],
      ["What does \"we are trusting the system that stands behind them\" mean?", ["We only trust the app's designers", "Platform features reduce our personal risk", "We should not trust strangers", "Systems never fail"], 1],
      ["Why do ratings tend to be very high?", ["Everyone has a perfect experience", "People feel awkward leaving negative feedback", "Platforms delete all bad reviews", "Ratings are calculated automatically"], 1],
      ["What is the writer's overall position?", ["Online trust is a dangerous mistake", "Online trust works well but has real limits", "Rating systems should be banned", "Reviews are always fake"], 1],
    ],
    open: ["Have you ever relied on online reviews to make a decision? Did they help?", "How could platforms make their reputation systems fairer?"],
  },

  // ---------------- C2 ----------------
  {
    level: "C2",
    title_en: "In Defense of Boredom",
    title_he: "להגנת השעמום",
    body: `Boredom has an unenviable reputation. It is the state we rush to escape, the empty minute we fill reflexively with a glance at a screen. Yet a growing body of psychological research suggests that this much-maligned experience may serve a purpose, and that our near-total success in abolishing it could carry a cost we have scarcely begun to reckon with.

At its core, boredom appears to function as a signal. It tells us that our current activity is failing to engage us, and in doing so, it nudges us to seek something more meaningful. Viewed this way, boredom is less a problem than a prompt, an uncomfortable but useful indication that our attention is going to waste. Several studies have found that participants who were first given a deliberately tedious task subsequently performed better on tests of creative thinking, as though the mind, deprived of stimulation, had begun to generate its own.

The difficulty is that the signal now rarely gets the chance to register. With an inexhaustible supply of distraction always within reach, the faint discomfort that might once have led to daydreaming, reflection or a new idea is extinguished almost before it arises. We are, in a sense, treating the symptom so effectively that we no longer receive the message.

It would be naive to romanticize boredom unreservedly. Chronic boredom is associated with poorer wellbeing, and there is nothing ennobling about the tedium of a job one cannot escape. The argument is not that boredom is good in itself, but that brief, unfilled intervals may be more valuable than our habits imply.

Reclaiming them requires no grand gesture: a walk without headphones, a queue endured without a phone, a few minutes of staring out of a train window. Such moments are unlikely to feel productive. That, perhaps, is precisely the point.`,
    mcq: [
      ["How does the writer reframe boredom in the second paragraph?", ["As a disease", "As a signal prompting us to seek meaning", "As a sign of intelligence", "As a waste of time"], 1],
      ["What did the studies mentioned suggest?", ["Boring tasks reduce creativity", "A tedious task was followed by more creative thinking", "People prefer boring tasks", "Creativity cannot be measured"], 1],
      ["What does \"treating the symptom so effectively that we no longer receive the message\" mean?", ["We cure boredom permanently", "Constant distraction stops boredom from doing its job", "Doctors misunderstand boredom", "Messages from others are ignored"], 1],
      ["Which qualification does the writer make?", ["All boredom is beneficial", "Chronic boredom is linked to poorer wellbeing", "Boredom should be avoided entirely", "Only children benefit from boredom"], 1],
      ["What is implied by \"That, perhaps, is precisely the point\"?", ["Unproductive-feeling moments have value of their own", "Productivity is the main goal", "Walks should be avoided", "Phones are useful in queues"], 0],
    ],
    open: ["Do you agree that boredom can be valuable? Support your view with reasons and examples.", "How has technology changed the way you deal with empty moments?"],
  },
  {
    level: "C2",
    title_en: "Does Language Shape Thought?",
    title_he: "האם השפה מעצבת את המחשבה?",
    body: `Few questions in the study of language have provoked as much enthusiasm, or as much skepticism, as whether the language we speak influences the way we think. In its strongest form, the idea, often associated with the linguist Benjamin Lee Whorf, holds that language determines thought: that speakers of different languages inhabit, in effect, different mental worlds. This version has largely been abandoned. If language rigidly constrained thought, translation would be impossible and new concepts could never be expressed, yet both happen constantly.

A weaker and more defensible claim has, however, gathered considerable support: that language can subtly shape habits of attention and memory. Some of the most cited evidence concerns spatial description. In certain languages, speakers describe locations using fixed compass directions rather than terms like left and right, saying, for instance, that a cup is to the north of a plate. Experiments suggest that such speakers maintain a remarkably precise sense of orientation, even in unfamiliar surroundings, presumably because their language obliges them to track it continuously.

Similar effects have been reported for color, where languages that draw a lexical boundary between two shades appear to make speakers slightly quicker at telling them apart, and for grammatical gender, though findings in the latter area have proved harder to replicate.

The emerging picture is therefore more modest than the original hypothesis, but arguably more interesting. Language does not imprison thought; rather, it acts as a set of habitual nudges, directing attention to some distinctions more readily than others. For anyone who speaks more than one language, the implication is intriguing: each language may offer not a different world, but a different way of noticing the same one.`,
    mcq: [
      ["Why has the strongest form of the hypothesis been largely abandoned?", ["It was never tested", "Translation and new concepts would be impossible if it were true", "Whorf withdrew it", "It applied only to one language"], 1],
      ["What does the spatial description evidence suggest?", ["Some speakers cannot learn left and right", "Using compass directions is linked to a precise sense of orientation", "All languages use compass directions", "Orientation is purely genetic"], 1],
      ["What is said about research on grammatical gender?", ["It strongly confirms the hypothesis", "Its findings have been harder to replicate", "It has never been studied", "It disproves all other findings"], 1],
      ["How does the writer characterize language in the final paragraph?", ["As a prison for thought", "As a set of habitual nudges to attention", "As irrelevant to thinking", "As identical across cultures"], 1],
      ["What implication is suggested for multilingual people?", ["They live in different worlds", "Each language may offer a different way of noticing", "They think more slowly", "They should use only one language"], 1],
    ],
    open: ["If you speak more than one language, have you noticed differences in how you think or express yourself?", "Evaluate the difference between the strong and weak versions of the hypothesis described in the text."],
  },
];

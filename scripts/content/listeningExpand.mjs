// Listening: the ten "standard" clips that were 27 to 41 words with only a
// dictation. Each transcript is rewritten in place at a length that fits
// its level, keeping the clip's dictation sentence word for word, and gets
// three comprehension questions. Updated, not deleted and re-inserted, so
// learners' answers to the existing dictations are kept.

// title_en -> new transcript (must contain the clip's dictation sentence)
export const TRANSCRIPT_UPDATES = {
  "Scheduling a Meeting": `Hi Tom, are you free tomorrow afternoon for a quick meeting? I want to talk about the new website before we send it to the client. Tomorrow? Let me check. I have something at two, but I am free after three. Great, let's meet at three thirty then. Should we meet in your office? No, my office is too small. Let's use the meeting room on the second floor. Okay. Can you bring the photos for the home page? Sure, I'll bring them on my laptop. See you tomorrow.`,

  "Booking a Taxi": `Good evening, City Taxis. How can I help you? Hi, I need a taxi to the airport, please. Sure, what time do you need it? Six in the morning, if possible. My flight is at nine. No problem, we will be there at six. What's the address? It's twelve Herzl Street, near the post office. And how many people are traveling? Just me, but I have two big suitcases. Okay, we'll send a large car. The trip to the airport costs about one hundred and fifty shekels. That's fine. Can I pay by card? Yes, all our drivers take cards. Thank you!`,

  "A Complaint at a Restaurant": `Excuse me, can I talk to you for a moment? Of course. Is everything all right? Not really. I ordered this dish without onions, but there are onions in it. I'm allergic to them, so I can't eat it. I am so sorry about that, let me bring you a new plate right away. I'll tell the kitchen myself so it doesn't happen again. Thank you, I appreciate it. Also, my friend's soup is a bit cold. Oh no, I'll take that back too and bring a hot one. And because of the trouble, your desserts tonight are on us. That's very kind of you. Really, there's no need. Please, it's the least we can do. Your food will be ready in about ten minutes.`,

  "Planning a Vacation": `I was thinking we could go somewhere warm this winter. Maybe Eilat, or even Greece? That sounds nice, but flights can be expensive during the holidays. True, maybe we should book early to get a better price. My sister went to Crete last December and paid almost half because she booked in September. Half? That's a big difference. What about the hotel? She stayed in a small apartment by the beach instead of a hotel. It had a kitchen, so they cooked most of their meals and saved even more. I like that idea. But I don't want to spend the whole vacation cooking. Fair enough. We can cook breakfast and eat dinner out. Okay, let's look at flights tonight and decide by the weekend.`,

  "A Job Interview": `Thanks for coming in today. Can you tell me about a challenge you faced at your previous job? Sure. Last year we had a tight deadline on a project for one of our biggest clients. Two people on the team got sick in the same week, and we were about to miss the date. What did you do? First, I spoke to the client honestly and asked which features mattered most to them. Then I had to reorganize the team's priorities to make sure we finished on time. We delivered the most important parts on the original date and the rest a week later. How did the client react? They were happy, actually. They said they preferred honesty to a last-minute surprise, and they gave us their next project too. That's a good example. What did you learn from it? That a hard conversation early is better than an easy one too late.`,

  "A Discussion About the Environment": `Do you think individuals can really make a difference in fighting climate change? I believe small actions matter, but real change also requires policy shifts at the government level. What do you mean by small actions? Things like taking the train instead of flying for short trips, or eating less meat. On their own, they don't solve much, but they change what people see as normal. And when enough people change their habits, politicians start to pay attention. But isn't that a bit optimistic? Most people won't change unless it's cheaper or easier. That's exactly why government policy matters. If public transport is fast and affordable, people use it without needing to be convinced. So both are needed? Exactly. Personal choices build pressure, and policy makes the better choice the easy one.`,

  "A Panel Discussion on Remote Work": `Let's move to the second question: what's the real cost of remote work for companies? Honestly, I think the biggest challenge isn't productivity, it's maintaining a sense of connection with your team when you rarely see them in person. Most studies show output stays roughly the same or even improves. But informal moments, like a chat after a meeting or asking a quick question across the desk, mostly disappear. Why does that matter if the work still gets done? Because that's where trust is built, and where junior employees learn by watching more experienced colleagues. Companies that ignore that tend to see higher turnover, even if the numbers look fine on paper. People leave jobs where they feel like a name in a chat window. So what do you recommend? Not forcing everyone back five days a week, but planning regular days together with a clear purpose, so the time in the office is worth the commute.`,

  "An Interview About a Career Change": `You worked in banking for years before becoming a teacher. What happened? I'd been in finance for almost a decade before I realized it just wasn't fulfilling anymore. The salary was good, but I was spending my days on reports that, honestly, nobody would remember a week later. Was there a specific moment when you decided? Not one dramatic moment, no. It was more a slow realization. I'd been volunteering on weekends, helping teenagers with maths, and I noticed I looked forward to Saturday mornings far more than to Monday meetings. So you went back to study? Yes, a two-year teaching course in the evenings while I was still working. It was exhausting. Making the switch was terrifying, but it's the best decision I've made. Looking back, I'd say it's easily the best one professionally. I earn less, but I go home knowing my work mattered to someone.`,

  "A Debate on Economic Policy": `My opponent claims that if we simply cut taxes on businesses, they'll invest more, hire more and raise wages, because that's the rational thing to do. The problem with that argument is simple. It assumes markets are perfectly rational, which just isn't the case, as decades of behavioral economics have shown. Firms, like people, respond to uncertainty, habit and fear as much as to incentives. In the last two tax cuts of this kind, a large share of the savings went into share buybacks rather than new jobs. Any policy built on that assumption is bound to have unintended consequences. That doesn't mean tax policy is useless. It means we should design it around how companies actually behave, for example by tying relief to measurable investment, rather than around how a textbook says they ought to behave.`,

  "A Lecture Excerpt on Philosophy": `Let's return to the famous case Kant discusses: a murderer comes to your door and asks where your friend is hiding. Must you tell the truth? Many students conclude that Kant is simply rigid, that he values a rule over a human life. But that reading is too quick. What Kant is really getting at here isn't that we should never lie, full stop, but that we can't universalize a maxim that relies on everyone else not following it too. A lie only works because people generally expect the truth. If everyone lied whenever it suited them, the very practice of asking and answering would collapse, and the lie would achieve nothing. That's the deeper point most people miss. Whether Kant was right to apply it so strictly to the murderer at the door is a separate question, and one we'll take up next week.`,
};

// Comprehension questions for these clips. [prompt, options, correctIndex]
export const EXISTING_LISTENING_MCQ = {
  "Scheduling a Meeting": [
    ["What do they want to talk about?", ["A new client", "The new website", "A new office", "The photos from a trip"], 1],
    ["What time will they meet?", ["At two", "At three", "At three thirty", "At four"], 2],
    ["Where will they meet?", ["In Tom's office", "In a café", "In the meeting room on the second floor", "Online"], 2],
  ],
  "Booking a Taxi": [
    ["What time is the flight?", ["At six", "At seven", "At nine", "At twelve"], 2],
    ["Why will they send a large car?", ["There are four people", "The customer has two big suitcases", "The trip is long", "The customer asked for it"], 1],
    ["How much does the trip cost?", ["About fifty shekels", "About one hundred shekels", "About one hundred and fifty shekels", "About two hundred shekels"], 2],
  ],
  "A Complaint at a Restaurant": [
    ["Why can't the customer eat the dish?", ["It's too spicy", "It has onions and the customer is allergic", "It's cold", "It's the wrong dish"], 1],
    ["What is the problem with the friend's soup?", ["It's too salty", "It's cold", "It has onions", "It never arrived"], 1],
    ["What does the waiter offer because of the trouble?", ["A discount on the bill", "Free desserts", "A free drink", "A different table"], 1],
  ],
  "Planning a Vacation": [
    ["Why might the flights be expensive?", ["Because of the holidays", "Because they fly business class", "Because the airport is far", "Because of the weather"], 0],
    ["How did the sister save money?", ["She flew at night", "She booked early", "She stayed with friends", "She traveled alone"], 1],
    ["What do they decide to do?", ["Book a hotel tonight", "Cook every meal", "Look at flights and decide by the weekend", "Go to Eilat"], 2],
  ],
  "A Job Interview": [
    ["Why was the team going to miss the deadline?", ["The client changed the plan", "Two people got sick", "The budget was cut", "The software broke"], 1],
    ["What did the candidate do first?", ["Hired new people", "Asked the client which features mattered most", "Worked through the weekend", "Asked for more money"], 1],
    ["What did the candidate learn?", ["Never accept tight deadlines", "A hard conversation early is better than an easy one too late", "Clients don't like honesty", "Small teams work faster"], 1],
  ],
  "A Discussion About the Environment": [
    ["According to the second speaker, why do small actions matter?", ["They solve the problem on their own", "They change what people see as normal", "They save a lot of money", "Governments require them"], 1],
    ["Why does the second speaker say government policy is needed?", ["People change only when it's cheaper or easier", "Individuals can't do anything", "Companies pay for it", "It's faster than personal action"], 0],
    ["What is the final conclusion?", ["Only personal choices matter", "Only policy matters", "Both personal choices and policy are needed", "Nothing can be done"], 2],
  ],
  "A Panel Discussion on Remote Work": [
    ["What does the speaker say about productivity in remote work?", ["It drops sharply", "It stays about the same or improves", "Nobody has measured it", "It depends only on salary"], 1],
    ["Why are informal moments important, according to the speaker?", ["They make meetings shorter", "They build trust and help junior employees learn", "They reduce costs", "They are required by law"], 1],
    ["What does the speaker recommend?", ["Returning to the office five days a week", "Fully remote work with no office", "Planned days together with a clear purpose", "More video meetings"], 2],
  ],
  "An Interview About a Career Change": [
    ["Why did the speaker leave finance?", ["The salary was too low", "The work no longer felt meaningful", "The bank closed", "A manager asked them to leave"], 1],
    ["What helped the speaker realize what they wanted?", ["A dramatic event at work", "Volunteering with teenagers on weekends", "A conversation with a teacher", "Losing their job"], 1],
    ["How did the speaker train as a teacher?", ["Full-time for a year", "A two-year evening course while still working", "An online course in a month", "They didn't need training"], 1],
  ],
  "A Debate on Economic Policy": [
    ["What assumption does the speaker criticize?", ["That taxes should be higher", "That markets and firms behave perfectly rationally", "That wages never change", "That governments waste money"], 1],
    ["What happened after earlier tax cuts of this kind, according to the speaker?", ["Most of the savings created new jobs", "A large share went into share buybacks", "Wages rose quickly", "Businesses left the country"], 1],
    ["What does the speaker propose instead?", ["Abolishing business taxes", "Designing relief around real behavior, tied to measurable investment", "Raising taxes on everyone", "Ignoring economic theory"], 1],
  ],
  "A Lecture Excerpt on Philosophy": [
    ["What reading of Kant does the lecturer say is too quick?", ["That he valued a rule over a human life", "That he allowed lying", "That he ignored morality", "That he wrote only about politics"], 0],
    ["Why can't a lie be universalized, according to the lecture?", ["Lying is illegal", "A lie works only because people generally expect the truth", "People always discover lies", "Kant had no explanation"], 1],
    ["What will the class discuss next week?", ["Whether Kant applied the idea too strictly to the murderer case", "A different philosopher", "The history of lying", "The exam"], 0],
  ],
};

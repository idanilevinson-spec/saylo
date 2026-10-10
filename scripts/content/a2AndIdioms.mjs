// Original A2 reading/listening and C1–C2 idioms (seed 028). Same rules
// as readingListening.mjs: written for Saylo, no invented facts, every
// answer checked by hand against its text.

export const READING = [
  {
    level: "A2",
    title_en: "A New Neighbour",
    title_he: "שכנה חדשה",
    body: `Last month, a new family moved into the apartment next to ours. On the first day, I saw a woman carrying many boxes up the stairs. The elevator in our building was broken, so I asked if she needed help. Her name was Rina, and she was very happy to get some help.

We carried boxes together for almost an hour. Rina told me that she came from a small town in the north and that this was her first time living in a big city. She was a little worried because she did not know anyone here. Her son, Eli, was eight years old, and he was starting at a new school the next week.

The next evening, I knocked on their door with a cake that my mother made. Rina invited me in for tea. Eli showed me his drawings of trains and asked me a lot of questions about the city. He wanted to know where the nearest park was and if there was a library nearby.

Now we meet almost every weekend. Sometimes I take Eli to the park with my little sister, and Rina and I drink coffee on the balcony. She says the city does not feel so big anymore.`,
    mcq: [
      ["Why did the writer offer to help Rina?", ["Rina asked for help", "The elevator was broken", "Rina was the writer's friend", "The writer's mother asked them to"], 1],
      ["Where did Rina live before?", ["In another big city", "In a small town in the north", "In the same building", "Abroad"], 1],
      ["What did the writer bring the next evening?", ["Flowers", "A drawing", "A cake", "A book"], 2],
      ["What did Eli want to know?", ["Where the nearest park and library were", "When school starts", "How to draw trains", "Where the writer works"], 0],
      ["How does Rina feel about the city now?", ["She wants to leave", "It still feels very big", "It does not feel so big anymore", "She is worried about her son"], 2],
    ],
    open: [
      "How did the writer and Rina become friends? Describe what happened in order.",
      "How do you welcome new people in your neighbourhood, school or work?",
    ],
  },
  {
    level: "A2",
    title_en: "My First Job",
    title_he: "העבודה הראשונה שלי",
    body: `When I was sixteen, I got my first job at an ice cream shop near the beach. I worked there every summer afternoon from three o'clock until nine. I wanted to earn money to buy a new bicycle.

The first week was difficult. There were twenty-four flavours, and I always forgot where each one was. Once, a customer asked for mint and I gave him pistachio, because they are both green. He laughed and said he liked pistachio too, so it was fine.

My manager, Yoni, was patient with me. He showed me how to hold the scoop and how to make the ice cream look nice in the cone. He also told me to always smile, even when the shop was very busy and there was a long line of hot, tired people.

The busiest days were Fridays. Sometimes I served more than a hundred customers in one afternoon, and my arm hurt at the end of the day. But I liked talking to people, especially to the children who could not decide which flavour to choose.

At the end of the summer, I had enough money for the bicycle. I still ride it today, and every time I pass an ice cream shop, I remember that summer.`,
    mcq: [
      ["Why did the writer want a job?", ["To help the family", "To buy a new bicycle", "To meet new friends", "To learn about ice cream"], 1],
      ["What mistake did the writer make with a customer?", ["Gave the wrong change", "Gave pistachio instead of mint", "Forgot the cone", "Closed the shop early"], 1],
      ["What did Yoni teach the writer?", ["How to count money", "How to make new flavours", "How to hold the scoop and serve nicely", "How to clean the shop"], 2],
      ["Why did the writer's arm hurt on Fridays?", ["They served many customers", "They carried heavy boxes", "They rode the bicycle to work", "They fell in the shop"], 0],
      ["What did the writer enjoy most about the job?", ["The free ice cream", "Talking to people, especially children", "Working on Fridays", "Working near the beach"], 1],
    ],
    open: [
      "Describe the writer's first week at work. What was difficult, and who helped?",
      "Write about your first job or a job you would like to have. Why?",
    ],
  },
  {
    level: "A2",
    title_en: "A Day Without a Phone",
    title_he: "יום בלי טלפון",
    body: `Last Saturday, I left my phone at my friend's house by mistake. At first I was a bit nervous. How could I check the time, the weather or my messages? I decided to try a whole day without it.

In the morning, I looked out of the window to check the weather instead of looking at an app. It was sunny, so I walked to the market. Usually I listen to music on my phone when I walk, but this time I listened to the birds and the people talking in the street. It was more interesting than I expected.

At the market, I bought vegetables and some fresh bread. I did not take any photos of the food, which is strange for me. I just enjoyed it. In the afternoon, I read half of a book that I started months ago and never finished.

In the evening, I visited my friend to get my phone back. There were fourteen new messages, but none of them were important. That night, I went to sleep earlier than usual and slept very well. Now I try to have one morning every week without my phone.`,
    mcq: [
      ["Why didn't the writer have a phone on Saturday?", ["It was broken", "They left it at a friend's house", "They lost it at the market", "They gave it to their friend"], 1],
      ["How did the writer check the weather?", ["They asked a neighbour", "They looked out of the window", "They used an app", "They listened to the radio"], 1],
      ["What did the writer listen to on the way to the market?", ["Music", "A podcast", "Birds and people in the street", "The news"], 2],
      ["What did the writer do in the afternoon?", ["Went shopping again", "Read half of a book", "Called a friend", "Took photos"], 1],
      ["What new habit does the writer have now?", ["One morning a week without the phone", "No phone on weekends", "Going to the market every day", "Reading every evening"], 0],
    ],
    open: [
      "What did the writer notice during the day without a phone?",
      "Could you spend a day without your phone? What would be easy, and what would be hard?",
    ],
  },
];

export const LISTENING = [
  {
    level: "A2",
    title_en: "At the Train Station",
    title_he: "בתחנת הרכבת",
    transcript: `Excuse me, is this the right platform for the train to Haifa? Yes, it's platform three, but the next train is late. It leaves at ten forty, not ten fifteen. Oh no. Is there a café here? Yes, there's one near the main entrance, next to the ticket machines. Thank you. And how long is the trip to Haifa? About one hour and a half. Great, thanks for your help. You're welcome. Have a good trip.`,
    mcq: [
      ["Which platform does the train to Haifa leave from?", ["Platform one", "Platform two", "Platform three", "Platform four"], 2],
      ["What time does the train leave now?", ["Ten fifteen", "Ten forty", "Eleven o'clock", "Ten thirty"], 1],
      ["Where is the café?", ["On platform three", "Near the main entrance, next to the ticket machines", "Outside the station", "On the train"], 1],
    ],
    dictation: "The next train is late.",
  },
  {
    level: "A2",
    title_en: "Buying a Birthday Present",
    title_he: "קונים מתנת יום הולדת",
    transcript: `Hi, can I help you? Yes, I'm looking for a present for my brother. He's turning fifteen. What does he like? He loves football and music. We have these headphones. They're very popular with teenagers. How much are they? They're two hundred shekels. Hmm, that's a bit expensive. Do you have something cheaper? This football shirt is one hundred and twenty. Which team is it? It's the national team. Perfect, he'll love it. Can you wrap it for me? Of course.`,
    mcq: [
      ["How old is the brother turning?", ["Twelve", "Fourteen", "Fifteen", "Sixteen"], 2],
      ["Why doesn't the customer buy the headphones?", ["Her brother has headphones", "They are too expensive", "They are not popular", "They are broken"], 1],
      ["What does the customer buy?", ["A football", "Headphones", "A football shirt", "A music album"], 2],
    ],
    dictation: "I'm looking for a present for my brother.",
  },
  {
    level: "A2",
    title_en: "A Message from School",
    title_he: "הודעה מבית הספר",
    transcript: `Good afternoon, parents. This is a message from the school office. Tomorrow, Thursday, the school trip to the science museum will start at eight in the morning. Please make sure your children arrive at school by seven forty-five. They need to bring a packed lunch and a bottle of water. The bus will bring everyone back to school at three o'clock. If your child cannot come, please call the office before tomorrow morning. Thank you, and have a good day.`,
    mcq: [
      ["Where are the children going tomorrow?", ["To the zoo", "To the science museum", "To the beach", "To a park"], 1],
      ["What time should children arrive at school?", ["Seven thirty", "Seven forty-five", "Eight o'clock", "Eight fifteen"], 1],
      ["What should the children bring?", ["Money for lunch", "A packed lunch and a bottle of water", "A camera", "Their school books"], 1],
    ],
    dictation: "They need to bring a packed lunch.",
  },
];

// [phrase, type, meaning_he, example_en, level]
export const IDIOMS = [
  ["cut corners", "idiom", "לעשות עבודה חפיפית כדי לחסוך זמן או כסף", "The builders cut corners, and now the roof leaks.", "C1"],
  ["the elephant in the room", "idiom", "נושא בעייתי ברור שכולם נמנעים מלדבר עליו", "The budget cuts were the elephant in the room during the meeting.", "C1"],
  ["play it by ear", "idiom", "לאלתר, להחליט תוך כדי לפי המצב", "We don't have a plan for tomorrow, so let's play it by ear.", "C1"],
  ["iron out", "phrasal_verb", "ליישב, לפתור בעיות קטנות אחרונות", "We still need to iron out a few details before we sign.", "C1"],
  ["fall through", "phrasal_verb", "להתבטל, לא לצאת לפועל", "The deal fell through at the last minute.", "C1"],
  ["a double-edged sword", "idiom", "משהו שיש לו גם יתרונות וגם חסרונות משמעותיים", "Fame can be a double-edged sword.", "C2"],
  ["to split hairs", "idiom", "להתווכח על הבדלים זניחים, לדקדק בקטנות", "We agree on the main point, so let's not split hairs over the wording.", "C2"],
  ["to toe the line", "idiom", "לציית לכללים או לעמדה הרשמית", "Junior staff were expected to toe the line and not question decisions.", "C2"],
  ["a moot point", "idiom", "שאלה שכבר לא רלוונטית או שאין טעם להתווכח עליה", "Whether we could have won is a moot point now.", "C2"],
  ["to pay lip service to", "idiom", "לתמוך במשהו רק במילים, בלי מעשים", "The company pays lip service to equality but changes nothing.", "C2"],
  ["the thin end of the wedge", "idiom", "צעד קטן שעלול להוביל לשינוי גדול ושלילי", "Some see the new fee as the thin end of the wedge.", "C2"],
  ["gloss over", "phrasal_verb", "להתעלם מבעיה או להציג אותה כפחות חמורה", "The report glosses over the main risks.", "C2"],
  ["bow out", "phrasal_verb", "לפרוש בצורה מכובדת מתפקיד או מתחרות", "After twenty years, she decided to bow out gracefully.", "C2"],
];

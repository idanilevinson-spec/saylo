// Listening, set 3. A2, B1 and B2 had six clips each against seven to nine
// at the other levels. Three more per level, at a length that fits it
// (A2 about 90 words, B1 about 120, B2 about 150). All transcripts are
// original; each dictation sentence appears word for word in its clip.

export const READING = [];

export const LISTENING = [
  // ---------------- A2 ----------------
  {
    level: "A2",
    title_en: "Lost Keys",
    title_he: "המפתחות שנעלמו",
    transcript: `Mom, have you seen my keys? I can't find them anywhere. Did you look in your bag? Yes, twice. They're not there. When did you last use them? Yesterday evening, when I came home from the gym. Then they're probably in your jacket. Which jacket? The blue one. You wore it yesterday because it was cold. Let me check. Yes! Here they are, in the left pocket. Great. Now hurry, the bus leaves in ten minutes. Thanks, Mom. See you tonight!`,
    mcq: [
      ["When did the speaker last use the keys?", ["This morning", "Yesterday evening", "Last weekend", "An hour ago"], 1],
      ["Where were the keys?", ["In the bag", "On the table", "In the jacket pocket", "In the car"], 2],
      ["Why did the speaker wear the blue jacket yesterday?", ["It was raining", "It was cold", "It was new", "Mom asked"], 1],
    ],
    dictation: "When did you last use them?",
  },
  {
    level: "A2",
    title_en: "A New Neighbour",
    title_he: "שכנים חדשים",
    transcript: `Hi, I'm Dana. I just moved into the flat next door. Oh, welcome! I'm Yossi. When did you arrive? On Sunday. Everything is still in boxes. I know how that feels. Do you need anything? Actually, yes. Is there a supermarket near here? Yes, there's a small one at the end of the street. It's open until ten at night. And the big one is about fifteen minutes away by car. Thanks! And when is the rubbish collected? On Mondays and Thursdays, early in the morning. Good to know. Thanks for your help!`,
    mcq: [
      ["When did Dana move in?", ["On Saturday", "On Sunday", "On Monday", "On Thursday"], 1],
      ["Until what time is the small supermarket open?", ["Eight", "Nine", "Ten", "Eleven"], 2],
      ["When is the rubbish collected?", ["Every day", "On Sundays only", "On Mondays and Thursdays", "On Fridays"], 2],
    ],
    dictation: "There's a small one at the end of the street.",
  },
  {
    level: "A2",
    title_en: "Calling the Dentist",
    title_he: "טלפון למרפאת השיניים",
    transcript: `Good morning, Smile Dental Clinic. Hello, I'd like to make an appointment, please. I have a toothache. I'm sorry to hear that. Is it very bad? It started two days ago, and it hurts when I drink something cold. Okay. The doctor can see you tomorrow at eleven, or on Wednesday at four. Tomorrow at eleven is fine. Can I have your name, please? It's Ron Peretz. Thank you, Ron. Please come ten minutes early and bring your ID card. See you tomorrow.`,
    mcq: [
      ["When did the toothache start?", ["This morning", "Yesterday", "Two days ago", "Last week"], 2],
      ["When is the appointment?", ["Today at four", "Tomorrow at eleven", "Wednesday at eleven", "Wednesday at four"], 1],
      ["What should the patient bring?", ["Money", "An ID card", "A letter from a doctor", "Nothing"], 1],
    ],
    dictation: "Please come ten minutes early and bring your ID card.",
  },

  // ---------------- B1 ----------------
  {
    level: "B1",
    title_en: "A Change of Plans",
    title_he: "שינוי בתוכניות",
    transcript: `Hey, it's Noa. I'm calling about Friday. I know we said we'd go to the beach, but the forecast says it's going to be windy and maybe even rain in the afternoon. So I was thinking, what if we go to the new science museum in Holon instead? My cousin went last month and said the space exhibition is amazing. It opens at ten, and if we buy tickets online, they're twenty percent cheaper. We could have lunch at that Italian place nearby and still be home by five. If the weather turns out fine, we can do the beach on Saturday morning. Let me know what you think. Text me tonight, because I need to book the tickets before tomorrow.`,
    mcq: [
      ["Why does Noa want to change the plan?", ["The beach is closed", "The weather may be bad", "She is busy on Friday", "The museum is free"], 1],
      ["What is the advantage of buying tickets online?", ["You don't have to wait", "They are cheaper", "You get free lunch", "You can come at any time"], 1],
      ["Why should the listener text tonight?", ["The museum closes early", "Noa needs to book tickets before tomorrow", "The cousin is waiting", "The restaurant needs a booking"], 1],
    ],
    dictation: "If the weather turns out fine, we can do the beach on Saturday morning.",
  },
  {
    level: "B1",
    title_en: "Choosing a Phone Plan",
    title_he: "בחירת חבילה סלולרית",
    transcript: `So, which plan are you interested in? I'm not sure. I use my phone mostly for messages and maps, and I watch videos on the train. Then I'd recommend the basic plan with twenty gigabytes. It's forty-nine shekels a month. Is twenty enough if I watch videos every day? Probably not. Video uses a lot of data. In that case, the unlimited plan is better. It's sixty-nine shekels, and it includes calls abroad to thirty countries. Is there a contract? No, you can cancel at any time without paying anything extra. And if you join today, the first month is free. That sounds good. I'll take the unlimited plan, then.`,
    mcq: [
      ["What does the customer use the phone for on the train?", ["Calls", "Games", "Videos", "Music"], 2],
      ["How much is the unlimited plan?", ["Forty-nine shekels", "Fifty-nine shekels", "Sixty-nine shekels", "Seventy-nine shekels"], 2],
      ["What happens if the customer joins today?", ["They get a new phone", "The first month is free", "They get extra data", "They pay less forever"], 1],
    ],
    dictation: "You can cancel at any time without paying anything extra.",
  },
  {
    level: "B1",
    title_en: "Instructions for a New Job",
    title_he: "הוראות ביום הראשון בעבודה",
    transcript: `Welcome to your first day! Let me explain how things work here. Your shift starts at eight, but please arrive a few minutes early so you have time to change into your uniform. The lockers are next to the kitchen, and you'll get your key from the office. You have a thirty-minute lunch break, usually around one, but check with your manager because it changes when we're busy. If you're sick, call the office before seven in the morning, not after, so we can find someone to replace you. And one more thing: phones stay in the locker during your shift. If there's an emergency, your family can call the office number. Any questions so far?`,
    mcq: [
      ["Where are the lockers?", ["Next to the office", "Next to the kitchen", "At the entrance", "Upstairs"], 1],
      ["When should a sick worker call?", ["Before seven", "At eight", "After lunch", "The day before"], 0],
      ["What is the rule about phones?", ["They must be turned off", "They stay in the locker", "They can be used at lunch only", "There is no rule"], 1],
    ],
    dictation: "Please arrive a few minutes early so you have time to change into your uniform.",
  },

  // ---------------- B2 ----------------
  {
    level: "B2",
    title_en: "A Radio Tip on Saving Energy",
    title_he: "טיפ ברדיו על חיסכון בחשמל",
    transcript: `Welcome back. With the summer heat on its way, a lot of you have written in asking how to keep your electricity bill under control. So here's what the experts told us. First, the air conditioner. Most people set it to around twenty degrees, but every degree lower adds roughly six percent to its energy use. Setting it to twenty-four or twenty-five keeps the room comfortable and saves a surprising amount over a month. Second, close the blinds during the hottest hours, especially on windows that face west. It sounds obvious, but a room that doesn't heat up in the first place needs far less cooling. And finally, don't leave devices on standby overnight. Individually they use very little, but together they can add up to around five percent of a household's bill.`,
    mcq: [
      ["What happens with every degree lower on the air conditioner?", ["Energy use drops", "Energy use rises by about six percent", "The room heats up", "Nothing changes"], 1],
      ["Which windows does the speaker mention especially?", ["North-facing", "East-facing", "West-facing", "South-facing"], 2],
      ["What is said about devices on standby?", ["They use nothing", "Together they can be about five percent of the bill", "They are dangerous", "They should be replaced"], 1],
    ],
    dictation: "A room that doesn't heat up in the first place needs far less cooling.",
  },
  {
    level: "B2",
    title_en: "Feedback After a Presentation",
    title_he: "משוב אחרי מצגת",
    transcript: `Have you got a minute? I wanted to give you some feedback on this morning's presentation. Overall, it went really well. The client clearly liked the design, and your answer to the question about the budget was spot on. There are a couple of things I'd do differently next time, though. You spent almost ten minutes on the background, which they already knew from our email, so by the time we got to the actual proposal, some of them had started checking their phones. I'd cut that part down to two minutes at most. Also, a few of the slides had a lot of text. People end up reading instead of listening to you. Try keeping it to one main idea per slide. But honestly, these are small things. You came across as confident and well prepared.`,
    mcq: [
      ["What part of the presentation went especially well?", ["The background section", "The answer about the budget", "The slides with text", "The timing"], 1],
      ["Why does the manager suggest shortening the background?", ["The client already knew it", "It had mistakes", "It was boring to prepare", "The room was booked"], 0],
      ["What is the advice about slides?", ["Use more pictures and no text", "One main idea per slide", "Add more detail", "Print them for the client"], 1],
    ],
    dictation: "People end up reading instead of listening to you.",
  },
  {
    level: "B2",
    title_en: "A Debate on School Uniforms",
    title_he: "ויכוח על תלבושת אחידה",
    transcript: `I think school uniforms make a lot of sense. They save parents money, and nobody gets judged for not wearing expensive brands. I see your point about money, but I'm not convinced it's true in practice. Uniform shirts with the school logo often cost more than ordinary T-shirts, and kids still find ways to show off, with shoes, phones or bags. Fair enough, but at least it reduces the pressure every single morning. Teenagers spend a ridiculous amount of time deciding what to wear. Maybe, but choosing what to wear is also a way of expressing who you are. Taking that away at an age when you're figuring out your identity doesn't seem right to me. So what's the alternative? A simple dress code, I'd say. No offensive slogans, nothing unsafe, and beyond that, let students decide for themselves.`,
    mcq: [
      ["What is the first speaker's main argument for uniforms?", ["They look smart", "They save money and reduce judgement", "Teachers prefer them", "They are required by law"], 1],
      ["Why does the second speaker doubt the money argument?", ["Uniforms with the logo can cost more", "Parents never pay for clothes", "Uniforms last for years", "Schools give them for free"], 0],
      ["What does the second speaker suggest instead?", ["No rules at all", "A simple dress code", "Uniforms only on special days", "Letting parents vote"], 1],
    ],
    dictation: "Choosing what to wear is also a way of expressing who you are.",
  },
];

// Original content for seed 026 (level expansion): fills the levels the
// content inventory showed were thin — B1 had one vocabulary topic, C1/C2
// had no writing prompts or conversation scenarios. Written for Saylo;
// not taken from any course book, exam or site. Hebrew is gender-neutral
// (plural/infinitive forms).
//
// Vocabulary rows: [headword, ipa, part_of_speech, translation_he, example_en, definition_en]

export const VOCAB_TOPICS = [
  {
    slug: "kitchen-cooking",
    name_he: "מטבח ובישול",
    name_en: "Kitchen & Cooking",
    level: "A2",
    sort: 23,
    words: [
      ["boil", "/bɔɪl/", "verb", "להרתיח", "Boil the water before you add the pasta.", "to heat a liquid until it bubbles"],
      ["fry", "/fraɪ/", "verb", "לטגן", "My dad likes to fry eggs in the morning.", "to cook food in hot oil"],
      ["bake", "/beɪk/", "verb", "לאפות", "We bake a cake for every birthday.", "to cook food like bread or cake in an oven"],
      ["slice", "/slaɪs/", "verb", "לפרוס", "Can you slice the bread, please?", "to cut something into thin pieces"],
      ["stir", "/stɜːr/", "verb", "לערבב", "Stir the soup so it doesn't burn.", "to move a spoon around in a liquid to mix it"],
      ["pan", "/pæn/", "noun", "מחבת", "Put a little oil in the pan.", "a flat metal pot used for frying"],
      ["oven", "/ˈʌvən/", "noun", "תנור", "The chicken is in the oven.", "a box-shaped machine that cooks food with heat"],
      ["recipe", "/ˈresəpi/", "noun", "מתכון", "This recipe is from my grandmother.", "instructions for cooking a dish"],
      ["ingredient", "/ɪnˈɡriːdiənt/", "noun", "מרכיב", "Flour is the main ingredient in bread.", "one of the foods you use to make a dish"],
      ["taste", "/teɪst/", "verb", "לטעום", "Taste the sauce and add salt if you need it.", "to try a little food to see what it is like"],
    ],
  },
  {
    slug: "nature-outdoors",
    name_he: "טבע ונופים",
    name_en: "Nature & the Outdoors",
    level: "A2",
    sort: 24,
    words: [
      ["forest", "/ˈfɔːrɪst/", "noun", "יער", "We walked through the forest for two hours.", "a large area full of trees"],
      ["river", "/ˈrɪvər/", "noun", "נהר", "The river runs through the middle of the city.", "a long line of water that flows to the sea"],
      ["mountain", "/ˈmaʊntən/", "noun", "הר", "They climbed the mountain on Saturday.", "a very high hill"],
      ["lake", "/leɪk/", "noun", "אגם", "In summer we swim in the lake.", "a large area of water with land all around it"],
      ["beach", "/biːtʃ/", "noun", "חוף ים", "The beach is ten minutes from our hotel.", "the sandy area next to the sea"],
      ["island", "/ˈaɪlənd/", "noun", "אי", "Cyprus is an island in the Mediterranean.", "land with water on every side"],
      ["flower", "/ˈflaʊər/", "noun", "פרח", "She gave her mother a flower.", "the colorful part of a plant"],
      ["grass", "/ɡræs/", "noun", "דשא", "The children are playing on the grass.", "the thin green plant that covers parks and fields"],
      ["hill", "/hɪl/", "noun", "גבעה", "Our house is at the top of a hill.", "a high area of land, smaller than a mountain"],
      ["desert", "/ˈdezərt/", "noun", "מדבר", "It almost never rains in the desert.", "a very dry area with sand and few plants"],
    ],
  },
  {
    slug: "work-office",
    name_he: "עבודה ומשרד",
    name_en: "Work & the Office",
    level: "B1",
    sort: 25,
    words: [
      ["colleague", "/ˈkɒliːɡ/", "noun", "עמית לעבודה", "I had lunch with a colleague from the sales team.", "a person you work with"],
      ["manager", "/ˈmænɪdʒər/", "noun", "מנהל", "Ask your manager if you can leave early.", "the person in charge of a team or department"],
      ["meeting", "/ˈmiːtɪŋ/", "noun", "פגישה", "The meeting starts at nine.", "an event where people come together to discuss something"],
      ["salary", "/ˈsæləri/", "noun", "משכורת", "Her salary went up this year.", "the money you get every month for your job"],
      ["schedule", "/ˈskedʒuːl/", "noun", "לוח זמנים", "My schedule is full this week.", "a plan of what you will do and when"],
      ["contract", "/ˈkɒntrækt/", "noun", "חוזה", "Read the contract carefully before you sign it.", "a written legal agreement"],
      ["employee", "/ɪmˈplɔɪiː/", "noun", "עובד", "The company has two hundred employees.", "a person who works for a company"],
      ["promotion", "/prəˈmoʊʃən/", "noun", "קידום", "He got a promotion after three years.", "a move to a higher job in the same company"],
      ["resign", "/rɪˈzaɪn/", "verb", "להתפטר", "She resigned because she found a better job.", "to leave your job by choice"],
      ["task", "/tæsk/", "noun", "משימה", "My first task today is to answer emails.", "a piece of work that you have to do"],
    ],
  },
  {
    slug: "money-banking",
    name_he: "כסף ובנקים",
    name_en: "Money & Banking",
    level: "B1",
    sort: 26,
    words: [
      ["account", "/əˈkaʊnt/", "noun", "חשבון בנק", "I opened a bank account when I started working.", "an arrangement to keep your money in a bank"],
      ["loan", "/loʊn/", "noun", "הלוואה", "They took a loan to buy a car.", "money that you borrow and must pay back"],
      ["savings", "/ˈseɪvɪŋz/", "noun", "חסכונות", "She used her savings to travel.", "money that you keep and do not spend"],
      ["debt", "/det/", "noun", "חוב", "He paid off all his debt last year.", "money that you owe someone"],
      ["invest", "/ɪnˈvest/", "verb", "להשקיע", "They want to invest in a small business.", "to put money into something to make more money"],
      ["withdraw", "/wɪðˈdrɔː/", "verb", "למשוך (כסף)", "I need to withdraw some money from the ATM.", "to take money out of a bank account"],
      ["afford", "/əˈfɔːrd/", "verb", "להרשות לעצמו (כלכלית)", "We can't afford a new apartment right now.", "to have enough money to pay for something"],
      ["borrow", "/ˈbɒroʊ/", "verb", "ללוות", "Can I borrow ten shekels until tomorrow?", "to take something that you will give back later"],
      ["expense", "/ɪkˈspens/", "noun", "הוצאה", "Rent is our biggest monthly expense.", "money that you spend on something"],
      ["refund", "/ˈriːfʌnd/", "noun", "החזר כספי", "The shop gave me a full refund.", "money that is paid back to you, for example when you return something"],
    ],
  },
  {
    slug: "media-news",
    name_he: "תקשורת וחדשות",
    name_en: "Media & News",
    level: "B1",
    sort: 27,
    words: [
      ["headline", "/ˈhedlaɪn/", "noun", "כותרת", "The headline was about the election.", "the title of a news story, in large letters"],
      ["journalist", "/ˈdʒɜːrnəlɪst/", "noun", "עיתונאי", "The journalist interviewed the mayor.", "a person who writes or reports the news"],
      ["article", "/ˈɑːrtɪkəl/", "noun", "כתבה, מאמר", "I read an interesting article about sleep.", "a piece of writing in a newspaper or on a website"],
      ["broadcast", "/ˈbrɔːdkæst/", "verb", "לשדר", "The game will be broadcast live tonight.", "to send out a program on TV or radio"],
      ["audience", "/ˈɔːdiəns/", "noun", "קהל", "The show has a young audience.", "the people who watch, read or listen to something"],
      ["reporter", "/rɪˈpɔːrtər/", "noun", "כתב", "A reporter was waiting outside the court.", "a journalist who collects and tells the news"],
      ["rumor", "/ˈruːmər/", "noun", "שמועה", "Don't believe every rumor you hear online.", "a story that may not be true, passed from person to person"],
      ["source", "/sɔːrs/", "noun", "מקור", "Always check the source of the information.", "the place or person information comes from"],
      ["advertisement", "/ˌædvərˈtaɪzmənt/", "noun", "פרסומת", "There was an advertisement before the video.", "a short message that tries to make you buy something"],
      ["editor", "/ˈedɪtər/", "noun", "עורך", "The editor changed the title of my story.", "a person who checks and corrects writing before it is published"],
    ],
  },
  {
    slug: "relationships",
    name_he: "יחסים בין אנשים",
    name_en: "Relationships",
    level: "B1",
    sort: 28,
    words: [
      ["trust", "/trʌst/", "verb", "לסמוך על", "I trust my best friend completely.", "to believe that someone is honest and will not hurt you"],
      ["argue", "/ˈɑːrɡjuː/", "verb", "להתווכח", "My brothers argue about everything.", "to disagree with someone in an angry way"],
      ["apologize", "/əˈpɒlədʒaɪz/", "verb", "להתנצל", "He apologized for being late.", "to say that you are sorry"],
      ["jealous", "/ˈdʒeləs/", "adjective", "מקנא", "She was jealous of her sister's new phone.", "unhappy because someone has something you want"],
      ["loyal", "/ˈlɔɪəl/", "adjective", "נאמן", "A loyal friend stays with you in hard times.", "always supporting someone"],
      ["support", "/səˈpɔːrt/", "verb", "לתמוך", "My parents support my decision.", "to help and encourage someone"],
      ["partner", "/ˈpɑːrtnər/", "noun", "בן או בת זוג", "She lives with her partner in Haifa.", "the person you are in a relationship with"],
      ["engaged", "/ɪnˈɡeɪdʒd/", "adjective", "מאורס", "They got engaged last summer.", "having agreed to marry someone"],
      ["get along", "/ɡet əˈlɔːŋ/", "verb", "להסתדר עם", "I get along well with my neighbors.", "to have a friendly relationship with someone"],
      ["respect", "/rɪˈspekt/", "noun", "כבוד", "Good teams are built on respect.", "a feeling that someone is important and should be treated well"],
    ],
  },
  {
    slug: "travel-planning",
    name_he: "תכנון נסיעה",
    name_en: "Planning a Trip",
    level: "B1",
    sort: 29,
    words: [
      ["itinerary", "/aɪˈtɪnəreri/", "noun", "מסלול טיול", "Our itinerary includes three cities in five days.", "a detailed plan of a journey"],
      ["passport", "/ˈpæspɔːrt/", "noun", "דרכון", "Don't forget your passport at the airport.", "an official document you need to travel abroad"],
      ["luggage", "/ˈlʌɡɪdʒ/", "noun", "מזוודות", "My luggage didn't arrive with the flight.", "the bags you take when you travel"],
      ["reservation", "/ˌrezərˈveɪʃən/", "noun", "הזמנה מראש", "We have a reservation for two nights.", "an arrangement to keep a room or table for you"],
      ["destination", "/ˌdestɪˈneɪʃən/", "noun", "יעד", "Rome is a popular destination in spring.", "the place you are traveling to"],
      ["departure", "/dɪˈpɑːrtʃər/", "noun", "יציאה, המראה", "Check the departure time on your ticket.", "the act of leaving a place"],
      ["delay", "/dɪˈleɪ/", "noun", "עיכוב", "There was a two-hour delay because of the storm.", "a situation when something happens later than planned"],
      ["sightseeing", "/ˈsaɪtsiːɪŋ/", "noun", "סיור באתרים", "We spent the morning sightseeing in the old city.", "visiting famous places as a tourist"],
      ["accommodation", "/əˌkɒməˈdeɪʃən/", "noun", "מקום לינה", "The price includes flights and accommodation.", "a place to stay, like a hotel or apartment"],
      ["insurance", "/ɪnˈʃʊrəns/", "noun", "ביטוח", "Buy travel insurance before you go.", "an agreement that pays you if something bad happens"],
    ],
  },
  {
    slug: "crime-law",
    name_he: "פשע ומשפט",
    name_en: "Crime & the Law",
    level: "B2",
    sort: 30,
    words: [
      ["suspect", "/ˈsʌspekt/", "noun", "חשוד", "The police arrested a suspect last night.", "a person who may have committed a crime"],
      ["witness", "/ˈwɪtnəs/", "noun", "עד", "A witness saw the car leave the scene.", "a person who saw something happen and can describe it"],
      ["trial", "/ˈtraɪəl/", "noun", "משפט (בבית משפט)", "The trial will last several weeks.", "the process in a court that decides if someone is guilty"],
      ["jury", "/ˈdʒʊri/", "noun", "חבר מושבעים", "The jury needed two days to reach a verdict.", "a group of citizens who decide a case in court"],
      ["sentence", "/ˈsentəns/", "noun", "גזר דין", "He received a sentence of three years.", "the punishment a judge gives"],
      ["arrest", "/əˈrest/", "verb", "לעצור", "The officers arrested two men at the border.", "to take someone to the police because of a crime"],
      ["guilty", "/ˈɡɪlti/", "adjective", "אשם", "The court found her not guilty.", "responsible for doing something illegal or wrong"],
      ["victim", "/ˈvɪktɪm/", "noun", "קורבן", "The victim was taken to hospital.", "a person who is hurt or harmed by a crime"],
      ["fraud", "/frɔːd/", "noun", "הונאה", "The company was accused of fraud.", "the crime of tricking people to get money"],
      ["verdict", "/ˈvɜːrdɪkt/", "noun", "פסק דין", "Everyone waited quietly for the verdict.", "the official decision at the end of a trial"],
    ],
  },
  {
    slug: "education-learning",
    name_he: "השכלה ולימודים",
    name_en: "Education & Learning",
    level: "B2",
    sort: 31,
    words: [
      ["curriculum", "/kəˈrɪkjələm/", "noun", "תוכנית לימודים", "Coding is now part of the school curriculum.", "all the subjects taught in a school or course"],
      ["lecture", "/ˈlektʃər/", "noun", "הרצאה", "The lecture on climate was recorded.", "a formal talk to a group of students"],
      ["assignment", "/əˈsaɪnmənt/", "noun", "מטלה", "The assignment is due on Monday.", "a piece of work given to a student"],
      ["scholarship", "/ˈskɒlərʃɪp/", "noun", "מלגה", "She won a scholarship to study abroad.", "money given to a student to pay for their studies"],
      ["tuition", "/tuːˈɪʃən/", "noun", "שכר לימוד", "Tuition at private universities is expensive.", "the money paid for teaching at a school or university"],
      ["semester", "/sɪˈmestər/", "noun", "סמסטר", "I'm taking four courses this semester.", "one of the two main periods of the academic year"],
      ["degree", "/dɪˈɡriː/", "noun", "תואר אקדמי", "He has a degree in engineering.", "the qualification you get after finishing university"],
      ["graduate", "/ˈɡrædʒueɪt/", "verb", "לסיים לימודים", "She graduated from Tel Aviv University in 2024.", "to finish your studies and receive a degree"],
      ["literacy", "/ˈlɪtərəsi/", "noun", "אוריינות", "Reading at home improves children's literacy.", "the ability to read and write"],
      ["vocational", "/voʊˈkeɪʃənəl/", "adjective", "מקצועי (הכשרה)", "He chose a vocational course in electronics.", "teaching the skills needed for a particular job"],
    ],
  },
  {
    slug: "urban-life",
    name_he: "חיים בעיר",
    name_en: "City Life",
    level: "B2",
    sort: 32,
    words: [
      ["congestion", "/kənˈdʒestʃən/", "noun", "עומס תנועה", "Congestion is worst between eight and nine.", "too much traffic in one place"],
      ["pedestrian", "/pəˈdestriən/", "noun", "הולך רגל", "This street is only for pedestrians.", "a person who is walking, not driving"],
      ["suburb", "/ˈsʌbɜːrb/", "noun", "פרבר", "They moved to a quiet suburb outside the city.", "an area where people live at the edge of a city"],
      ["commute", "/kəˈmjuːt/", "verb", "לנסוע לעבודה וממנה", "I commute to work by train.", "to travel regularly between home and work"],
      ["residential", "/ˌrezɪˈdenʃəl/", "adjective", "מגורים (אזור)", "It's a residential area with few shops.", "used for people's homes rather than businesses"],
      ["infrastructure", "/ˈɪnfrəstrʌktʃər/", "noun", "תשתית", "The city is investing in new infrastructure.", "basic systems like roads, water and electricity"],
      ["skyscraper", "/ˈskaɪskreɪpər/", "noun", "גורד שחקים", "The new skyscraper has sixty floors.", "a very tall building in a city"],
      ["neighborhood", "/ˈneɪbərhʊd/", "noun", "שכונה", "I grew up in a friendly neighborhood.", "an area of a town where people live"],
      ["crowded", "/ˈkraʊdɪd/", "adjective", "צפוף", "The bus was so crowded that I had to stand.", "full of too many people"],
      ["affordable", "/əˈfɔːrdəbəl/", "adjective", "במחיר סביר", "Young families need affordable housing.", "cheap enough for most people to pay for"],
    ],
  },
  {
    slug: "politics-government",
    name_he: "פוליטיקה ושלטון",
    name_en: "Politics & Government",
    level: "C1",
    sort: 33,
    words: [
      ["parliament", "/ˈpɑːrləmənt/", "noun", "פרלמנט", "The bill was debated in parliament for weeks.", "the group of elected people who make a country's laws"],
      ["legislation", "/ˌledʒɪsˈleɪʃən/", "noun", "חקיקה", "New legislation will protect online privacy.", "a law or a set of laws"],
      ["candidate", "/ˈkændɪdət/", "noun", "מועמד", "Each candidate gave a short speech.", "a person who wants to be elected or chosen"],
      ["coalition", "/ˌkoʊəˈlɪʃən/", "noun", "קואליציה", "Three parties formed a coalition government.", "a group of parties that agree to govern together"],
      ["referendum", "/ˌrefəˈrendəm/", "noun", "משאל עם", "The decision was put to a referendum.", "a vote by all citizens on one specific question"],
      ["accountable", "/əˈkaʊntəbəl/", "adjective", "נושא באחריות", "Leaders must be held accountable for their decisions.", "expected to explain and take responsibility for actions"],
      ["constituency", "/kənˈstɪtʃuənsi/", "noun", "אזור בחירה", "She represents a rural constituency.", "an area whose voters elect a representative"],
      ["veto", "/ˈviːtoʊ/", "verb", "להטיל וטו", "The president vetoed the new tax law.", "to officially reject a decision or law"],
      ["bureaucracy", "/bjʊˈrɒkrəsi/", "noun", "ביורוקרטיה", "Too much bureaucracy slows down small businesses.", "complicated official rules and procedures"],
      ["sovereignty", "/ˈsɒvrənti/", "noun", "ריבונות", "The treaty respects each nation's sovereignty.", "the power of a country to govern itself"],
    ],
  },
  {
    slug: "media-communication",
    name_he: "מדיה ותקשורת המונים",
    name_en: "Media & Public Communication",
    level: "C1",
    sort: 34,
    words: [
      ["propaganda", "/ˌprɒpəˈɡændə/", "noun", "תעמולה", "The poster was a piece of wartime propaganda.", "information used to push people toward one opinion"],
      ["censorship", "/ˈsensərʃɪp/", "noun", "צנזורה", "The film was banned because of censorship.", "stopping people from seeing or publishing certain content"],
      ["credibility", "/ˌkredəˈbɪləti/", "noun", "אמינות", "The scandal damaged the newspaper's credibility.", "the quality of being trusted and believed"],
      ["misinformation", "/ˌmɪsɪnfərˈmeɪʃən/", "noun", "מידע שגוי", "Misinformation spreads quickly on social media.", "false information, whether or not it is meant to trick people"],
      ["coverage", "/ˈkʌvərɪdʒ/", "noun", "סיקור", "The election got wide coverage abroad.", "the way news reports on an event"],
      ["editorial", "/ˌedɪˈtɔːriəl/", "noun", "מאמר מערכת", "The editorial criticized the new policy.", "an article giving a newspaper's own opinion"],
      ["spokesperson", "/ˈspoʊkspɜːrsən/", "noun", "דובר", "A spokesperson for the company declined to comment.", "a person chosen to speak for an organization"],
      ["sensationalism", "/senˈseɪʃənəlɪzəm/", "noun", "סנסציוניות", "Readers are tired of sensationalism in the news.", "presenting stories in a shocking way to attract attention"],
      ["transparency", "/trænsˈpærənsi/", "noun", "שקיפות", "The public expects transparency from officials.", "openness about decisions, so others can check them"],
      ["outlet", "/ˈaʊtlet/", "noun", "כלי תקשורת", "Several news outlets reported the story.", "a company that publishes or broadcasts news"],
    ],
  },
  {
    slug: "economy-finance",
    name_he: "כלכלה ומשק",
    name_en: "The Economy",
    level: "C1",
    sort: 35,
    words: [
      ["inflation", "/ɪnˈfleɪʃən/", "noun", "אינפלציה", "Inflation made food much more expensive this year.", "a general rise in prices over time"],
      ["recession", "/rɪˈseʃən/", "noun", "מיתון", "Many people lost their jobs during the recession.", "a period when a country's economy gets smaller"],
      ["currency", "/ˈkɜːrənsi/", "noun", "מטבע", "The shekel is Israel's currency.", "the money used in a particular country"],
      ["shareholder", "/ˈʃerhoʊldər/", "noun", "בעל מניות", "Shareholders voted against the merger.", "a person who owns part of a company"],
      ["unemployment", "/ˌʌnɪmˈplɔɪmənt/", "noun", "אבטלה", "Unemployment fell to its lowest level in years.", "the number of people who want work but have none"],
      ["subsidy", "/ˈsʌbsɪdi/", "noun", "סובסידיה", "Farmers receive a government subsidy for water.", "money a government pays to keep prices low or help an industry"],
      ["fiscal", "/ˈfɪskəl/", "adjective", "פיסקלי, תקציבי", "The government announced new fiscal measures.", "relating to government taxes and spending"],
      ["monopoly", "/məˈnɒpəli/", "noun", "מונופול", "One company has a monopoly on the market.", "complete control of a market by one company"],
      ["surplus", "/ˈsɜːrpləs/", "noun", "עודף", "The country had a trade surplus last year.", "an amount that is more than what is needed"],
      ["volatile", "/ˈvɒlətaɪl/", "adjective", "תנודתי", "Oil prices have been volatile this month.", "likely to change suddenly and without warning"],
    ],
  },
];

// Writing prompts: [level, title_he, prompt_en]
export const WRITING_PROMPTS = [
  ["A1", "החדר שלי", "Describe your room in 3-5 sentences. What is in it? What color is it?"],
  ["A1", "האוכל שאני אוהב", "Write 3-5 sentences about food you like and food you don't like."],
  ["A2", "הודעה לחבר", "Write a short message to a friend inviting them to your birthday. Say when, where and what you will do."],
  ["A2", "סוף שבוע שעבר", "Write about what you did last weekend. Use at least four verbs in the past."],
  ["B1", "חוויה מטיול", "Write about a trip you remember well. Where did you go, what happened, and how did you feel?"],
  ["B1", "מייל לבקשת מידע", "Write an email to a language school asking about their summer courses: dates, price and level."],
  ["B1", "בעד ונגד: עבודה מהבית", "What are the advantages and disadvantages of working from home? Give at least two of each."],
  ["B2", "מכתב תלונה", "You bought a product online and it arrived broken. Write a formal complaint and say what you expect the company to do."],
  ["B2", "האם צריך לבטל שיעורי בית?", "Should schools stop giving homework? Write a short essay with a clear opinion, two reasons and an example."],
  ["B2", "סקירת סרט או ספר", "Write a review of a film or book you enjoyed. Describe it briefly and explain who would like it and why."],
  ["C1", "מאמר דעה: בינה מלאכותית בחינוך", "Write an opinion article on whether AI tools help or harm students' learning. Consider both sides before giving your view."],
  ["C1", "הצעה לשיפור בעיר", "Write a proposal to your local council suggesting one change that would improve life in your city. Explain the problem, your solution and its cost."],
  ["C1", "השוואת שני מקומות", "Compare life in a big city with life in a small town. Which would you choose at this stage of your life, and why?"],
  ["C2", "מאמר: האם הטכנולוגיה מבודדת?", "Discuss the claim that digital technology has made people more connected but lonelier. Use precise examples and address a counter-argument."],
  ["C2", "נאום קצר", "Write a short speech for a graduation ceremony. Aim for a tone that is personal, persuasive and memorable."],
  ["C2", "ניתוח החלטה", "Describe a difficult decision a public figure or organization made. Analyze the trade-offs and argue whether it was the right call."],
];

// Conversation scenarios: [slug, title_he, title_en, level, category, system_prompt]
export const SCENARIOS = [
  ["policy-debate", "דיון על מדיניות ציבורית", "Debating a Public Policy", "C1", "serious_topics",
    "You are a well-informed debate partner. Pick a current public-policy question with the user (for example public transport, housing or screen time for children), take the opposite side of their view, and challenge their arguments politely with counter-examples. Push for precise reasoning."],
  ["job-offer-counter", "משא ומתן מתקדם על תנאים", "Counter-Offering on a Senior Role", "C1", "work_professional",
    "You are a director negotiating a senior job offer with the user. Be professional and somewhat firm: discuss salary, remote work, title and start date. Make them justify each request and look for trade-offs rather than simply agreeing."],
  ["research-presentation-qa", "שאלות אחרי הצגת מחקר", "Q&A After a Research Talk", "C1", "academic",
    "You are an audience member after the user's short research presentation. First ask what their research is about, then ask sharp but fair follow-up questions about their method, their evidence and the limits of their conclusions."],
  ["difficult-feedback", "לתת משוב קשה", "Giving Difficult Feedback", "C1", "work_professional",
    "You are an employee who reports to the user. Your recent work has had problems, and the user needs to give you honest feedback. React realistically: at first a little defensive, then open to a plan if the user is clear and respectful."],
  ["ethics-dilemma", "דילמה מוסרית", "An Ethical Dilemma", "C1", "serious_topics",
    "You are a thoughtful friend discussing an ethical dilemma with the user, such as whether to report a colleague's mistake or whether it is ever right to break a promise. Ask probing questions, offer different moral perspectives, and avoid preaching."],
  ["crisis-press-conference", "מסיבת עיתונאים במשבר", "A Crisis Press Conference", "C2", "work_professional",
    "You are a tough journalist at a press conference. The user is the spokesperson for an organization facing a crisis they describe. Ask pointed, sometimes uncomfortable questions, follow up when answers are vague, and stay professional."],
  ["philosophy-cafe", "בית קפה פילוסופי", "A Philosophy Café", "C2", "serious_topics",
    "You are a fellow participant in a philosophy café. Explore an abstract question with the user, such as what makes a life meaningful or whether free will exists. Use nuanced language, introduce relevant ideas, and build on the user's points rather than lecturing."],
  ["literary-discussion", "דיון ספרותי מעמיק", "An In-Depth Book Discussion", "C2", "entertainment_culture",
    "You are a well-read friend discussing a novel the user chooses. Discuss themes, character motivation, style and how the book has aged. Share your own interpretation and invite disagreement."],
  ["board-pitch", "הצגת הצעה לדירקטוריון", "Pitching to a Board", "C2", "work_professional",
    "You are the chair of a company board. The user is pitching a major proposal (they decide what it is). Ask demanding questions about risk, cost, timing and evidence, as a sceptical but fair board member would."],
];

// Grammar topics: { slug, name_he, name_en, level, sort, title_he, body_md, fill: [[sentence, answer, hint]], reorder: [[tokens]] }
export const GRAMMAR_TOPICS = [
  {
    slug: "future-will",
    name_he: "עתיד — will",
    name_en: "Future: will",
    level: "B1",
    sort: 30,
    title_he: "עתיד עם will, ומתי going to",
    body_md: `משתמשים ב-**will** + צורת בסיס כדי לדבר על העתיד, בעיקר במצבים האלה:

- **החלטה ברגע הדיבור:** The phone is ringing. I'll answer it.
- **תחזית או השערה:** I think it will rain tomorrow.
- **הבטחה או הצעה:** I'll help you with your homework.

**מבנה:**

- חיוב: I / you / she / we / they **will go** (בקיצור I'll, she'll)
- שלילה: **will not** = **won't** — I won't tell anyone.
- שאלה: **Will** + נושא + בסיס — Will you come with us?

**will או going to?**

| will | going to |
|---|---|
| החלטה עכשיו | תוכנית שכבר הוחלטה |
| I'll call her now. | I'm going to call her tonight. |
| תחזית לפי דעה | תחזית לפי מה שרואים |
| I think he'll win. | Look at the clouds. It's going to rain. |

**שימו לב:** אחרי will תמיד באה צורת בסיס, בלי to ובלי s: She will **go** (לא will goes, לא will to go).`,
    fill: [
      ["It's cold in here. I ___ close the window.", "will", "decision now"],
      ["I promise I ___ be late again.", "won't", "negative of will"],
      ["Do you think she ___ pass the exam?", "will", "prediction"],
      ["We have already bought the tickets. We are ___ to fly to Rome.", "going", "a plan already decided"],
      ["___ you help me carry these bags?", "Will", "request"],
    ],
    reorder: [
      ["I", "think", "it", "will", "be", "sunny", "tomorrow"],
      ["She", "won't", "forget", "your", "birthday"],
    ],
  },
  {
    slug: "zero-conditional",
    name_he: "משפט תנאי אפס",
    name_en: "Zero Conditional",
    level: "B1",
    sort: 31,
    title_he: "תנאי אפס — עובדות ותוצאות קבועות",
    body_md: `משתמשים בתנאי אפס לדברים ש**תמיד** קורים כשמשהו מסוים קורה: עובדות, חוקי טבע, הרגלים.

**מבנה:** If + הווה פשוט, הווה פשוט

- If you heat ice, it **melts**.
- If I **drink** coffee at night, I **can't** sleep.
- If it **rains**, the roads **get** wet.

אפשר להחליף את **if** ב-**when** בלי לשנות את המשמעות: When you heat ice, it melts.

**סדר החלקים:** אפשר להתחיל בכל אחד מהם. כשהמשפט מתחיל ב-if, שמים פסיק באמצע:

- If you mix blue and yellow, you get green.
- You get green if you mix blue and yellow.

**ההבדל מתנאי ראשון:**

| תנאי אפס | תנאי ראשון |
|---|---|
| תמיד נכון | מצב אפשרי אחד בעתיד |
| If it rains, the grass gets wet. | If it rains tomorrow, we will stay home. |
| הווה + הווה | הווה + will |`,
    fill: [
      ["If you ___ water to 100 degrees, it boils.", "heat", "present simple"],
      ["If people don't sleep enough, they ___ tired.", "get", "present simple"],
      ["Plants die if they ___ get water.", "don't", "negative, present simple"],
      ["___ I'm stressed, I go for a walk.", "When", "same meaning as if"],
      ["If you press this button, the machine ___.", "stops", "he/she/it form"],
    ],
    reorder: [
      ["If", "you", "mix", "red", "and", "white,", "you", "get", "pink"],
      ["Ice", "melts", "if", "you", "leave", "it", "in", "the", "sun"],
    ],
  },
  {
    slug: "question-tags",
    name_he: "שאלות זנב",
    name_en: "Question Tags",
    level: "B1",
    sort: 32,
    title_he: "שאלות זנב — ..., isn't it?",
    body_md: `שאלת זנב היא שאלה קצרה בסוף משפט, שמבקשת אישור: "נכון?", "לא?".

**הכלל:** משפט חיובי → זנב שלילי. משפט שלילי → זנב חיובי.

- It's cold today, **isn't it**?
- You don't eat meat, **do you**?

**איך בונים:** לוקחים את פועל העזר מהמשפט (is, are, can, have, will...) וחוזרים עליו עם כינוי גוף.

- She **can** swim, **can't she**?
- They **have** finished, **haven't they**?
- He **will** come, **won't he**?

**אין פועל עזר?** בהווה פשוט ובעבר פשוט משתמשים ב-do / does / did:

- You **live** here, **don't you**?
- She **works** with you, **doesn't she**?
- They **went** home, **didn't they**?

**מקרים מיוחדים:**

- I am late, **aren't I**? (לא amn't I)
- Let's go, **shall we**?

**בדיבור:** כשהקול יורד בזנב, מבקשים הסכמה. כשהוא עולה, באמת שואלים.`,
    fill: [
      ["It's a beautiful day, ___ it?", "isn't", "positive sentence, negative tag"],
      ["You don't like horror films, ___ you?", "do", "negative sentence, positive tag"],
      ["She works in a bank, ___ she?", "doesn't", "present simple, he/she"],
      ["They went to the concert, ___ they?", "didn't", "past simple"],
      ["You can drive, ___ you?", "can't", "repeat the modal"],
    ],
    reorder: [
      ["You", "are", "coming", "tonight,", "aren't", "you?"],
      ["He", "hasn't", "called", "yet,", "has", "he?"],
    ],
  },
  {
    slug: "participle-clauses",
    name_he: "פסוקיות בינוני",
    name_en: "Participle Clauses",
    level: "C1",
    sort: 33,
    title_he: "פסוקיות בינוני — כתיבה תמציתית",
    body_md: `פסוקית בינוני מקצרת משפט בעזרת צורת **-ing** או צורת **V3** (past participle), במקום פסוקית מלאה עם נושא ופועל. זה נפוץ בכתיבה רשמית, אקדמית ועיתונאית.

**פעולה בו-זמנית או סיבה — -ing:**

- **Feeling** tired, she went to bed early. (= Because she felt tired...)
- **Walking** home, I met an old friend. (= While I was walking home...)

**פעולה שקדמה — Having + V3:**

- **Having finished** the report, he sent it to his manager. (= After he had finished...)

**משמעות סבילה — V3:**

- **Built** in 1920, the house needs major repairs. (= Because it was built in 1920...)
- **Asked** about the delay, the minister refused to comment.

**כלל חשוב — אותו נושא:** הנושא של הפסוקית חייב להיות הנושא של המשפט הראשי.

- ✗ Walking down the street, the rain started. (הגשם לא הלך ברחוב)
- ✓ Walking down the street, I felt the rain start.

**בתוך שם עצם:** אפשר לקצר גם פסוקית זיקה:

- The man **sitting** by the window is my uncle. (= who is sitting)
- Most of the products **sold** online are delivered within a week. (= that are sold)`,
    fill: [
      ["___ finished her degree, she moved to Berlin.", "Having", "the earlier action"],
      ["___ in 1889, the tower is now a symbol of Paris.", "Built", "passive meaning"],
      ["Not ___ what to say, he stayed silent.", "knowing", "reason, -ing"],
      ["The students ___ the exam early may leave.", "finishing", "who finish"],
      ["___ by the results, the team decided to continue the study.", "Encouraged", "passive: they were encouraged"],
    ],
    reorder: [
      ["Having", "read", "the", "contract,", "she", "refused", "to", "sign", "it"],
      ["Founded", "in", "1998,", "the", "company", "now", "employs", "thousands"],
    ],
  },
  {
    slug: "nominalisation",
    name_he: "נומינליזציה — שמות במקום פעלים",
    name_en: "Nominalisation",
    level: "C2",
    sort: 34,
    title_he: "נומינליזציה — סגנון אקדמי ורשמי",
    body_md: `נומינליזציה היא הפיכת פועל או תואר ל**שם עצם**, כדי לכתוב בצורה רשמית, אובייקטיבית ודחוסה יותר. זה אחד הסימנים הבולטים של כתיבה אקדמית ברמה גבוהה.

**לפני ואחרי:**

- The government **decided** to raise taxes, and people **reacted** angrily.
- → The government's **decision** to raise taxes provoked an angry **reaction**.

- Prices **rose** quickly, which **worried** investors.
- → The rapid **rise** in prices caused **concern** among investors.

**סיומות נפוצות:**

| פועל / תואר | שם עצם |
|---|---|
| analyze | analysis |
| fail | failure |
| expand | expansion |
| able | ability |
| refuse | refusal |
| develop | development |

**למה זה עובד:**

- מעביר את המוקד מ**מי** עשה ל**מה** קרה.
- מאפשר לדחוס רעיון שלם לשם עצם אחד ולהשתמש בו כנושא: **This expansion** led to...

**זהירות:** עודף נומינליזציה הופך טקסט לכבד וקשה לקריאה. בכתיבה טובה משלבים: שמות עצם לרעיונות המרכזיים, ופעלים חיים לפעולה.`,
    fill: [
      ["The company's rapid ___ (expand) surprised its competitors.", "expansion", "noun from expand"],
      ["Her ___ (refuse) to comment made the story bigger.", "refusal", "noun from refuse"],
      ["A careful ___ (analyze) of the data showed a clear trend.", "analysis", "noun from analyze"],
      ["The project's ___ (fail) was blamed on poor planning.", "failure", "noun from fail"],
      ["The ___ (able) to adapt is essential for leaders.", "ability", "noun from able"],
    ],
    reorder: [
      ["The", "introduction", "of", "the", "tax", "led", "to", "widespread", "protests"],
      ["Their", "rejection", "of", "the", "offer", "came", "as", "a", "surprise"],
    ],
  },
];

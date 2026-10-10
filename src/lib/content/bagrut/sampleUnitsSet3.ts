// Third practice set for every module, written from scratch for Saylo in
// the same verified formats as sampleUnits.ts (moduleFormats.ts gives the
// word counts, sections and question counts; the tests in
// sampleUnits.test.ts enforce them for these units too). Same discipline
// as the first two sets: no real exam text was read or adapted, topics are
// invented, and no statistics or named studies are cited as fact.
import type { BagrutSampleUnit } from "./sampleUnits";

const BOOK_SWAP_PASSAGE = `Every September, students at Ofek High School used to buy a long list of new books, even though many of the same books were sitting unused in older students' homes. Last year, a group of eleventh-graders decided to change that. They set up a "book swap" in an empty classroom, where students could bring the books they no longer needed and take the ones they did.

The idea sounded simple, but organizing it was not. The students had to check which books were still on the official lists, because some editions had changed. They made a spreadsheet of every book that came in, wrote the condition of each one on a label, and set up a schedule so that the classroom was open during breaks. Parents helped by collecting books from families who had already finished school.

In the first month, more than four hundred books changed hands. Families saved a lot of money, and the school library received the books that nobody claimed. Some students who had never volunteered before ended up spending hours sorting shelves, and several said that it was the first time they had felt useful at school in a practical way.

There were problems, too. A few books came back with missing pages or written answers inside, and the team had to decide what to do with them. In the end, they agreed on a simple rule: a book is accepted only if another student could actually learn from it. Books that did not pass were sent for recycling, and the small amount of money this brought in paid for new labels and boxes.

This year, two more schools in the city have asked the team to explain how they did it. The students prepared a short guide with their spreadsheet, their rules and a list of mistakes to avoid. "The hardest part was not collecting books," one of them said. "It was convincing people that a used book is just as good as a new one."`;

const SIGN_LANGUAGE_PASSAGE = `When Yael started seventh grade, she had never met anyone who was deaf. That changed when a new student, Eden, joined her class. Eden could read lips a little, but most of the time she communicated in Israeli Sign Language, and only one teacher in the school could understand her.

At first, Yael felt awkward. She did not know whether to speak slowly, write notes or simply wait. One afternoon, Eden showed her how to sign "hello" and "thank you," and Yael practiced the movements all the way home. The next day she used them, and Eden laughed and corrected the position of her hand.

That small moment grew into something bigger. Yael asked the school counselor whether students could learn basic sign language together. The counselor found a volunteer from a local association, and a weekly lunch-time class began with eight students. Within a few months, there were almost thirty. They learned the alphabet, numbers and everyday phrases, and Eden often helped the volunteer by showing the signs to small groups.

The class changed the atmosphere in the school. Students started greeting Eden in the corridor without thinking about it, and she was invited to join the drama club, where she performed a short scene completely in sign language. Teachers noticed that the students in the class had also become more patient listeners in general. At the end of the year, the class prepared a short performance for parents, signing a song while one student sang it aloud, and many parents asked whether they could join the lessons too.

Today Yael says that the most important thing she learned was not a particular sign. It was that communication is a shared effort, and that the person who feels uncomfortable at first is usually the one who has the most to learn.`;

const SHELTER_TRANSCRIPT = `Host: Today I'm talking to Omer, who's been volunteering at an animal shelter near Haifa for two years. Omer, how did you start?

Omer: Honestly, by accident. My sister wanted to adopt a dog, and I went with her to the shelter. While she was filling in the forms, one of the workers mentioned that they needed volunteers on Fridays to walk the dogs. I said yes almost without thinking.

Host: What does a normal Friday look like?

Omer: I arrive at eight. First we clean the kennels, which is not the fun part, believe me. Then each volunteer takes two or three dogs for a walk. Some of them have spent weeks inside, so the walk is the best moment of their week. In the afternoon we help with photos for the shelter's website, because a good photo really helps a dog get adopted.

Host: Was anything harder than you expected?

Omer: Saying goodbye. You get attached to certain dogs, and then one day they're gone because a family took them home. It's happy news, but you still feel it. There was an old dog called Bamba that nobody wanted for months. When she was finally adopted, I was the one who cried.

Host: What would you say to teenagers who are thinking about volunteering?

Omer: Start with something small and regular. One morning a week is enough. And don't choose something just because it looks good on a CV. Choose something you'd be sad to miss.`;

const RADIO_PASSAGE = `Three years ago, the music room at Ramot High School was mostly used for storage. Today it is the home of "Radio Ramot," a small station that broadcasts every morning before classes begin. The idea came from Noam, a student who loved podcasts and wanted to make something similar at school.

The first broadcasts were not very professional. The microphone was old, the students spoke too fast, and once the whole program was accidentally recorded without sound. But the team did not give up. They watched online lessons about recording, asked the music teacher for advice, and slowly improved.

Now the program includes school news, interviews with teachers and short music requests from students. Younger students are often nervous about speaking on the radio, so the team gives them a short training session first. Several of them have discovered that they enjoy speaking in public, something they never expected.

The station has also changed the way the school shares information. Instead of long announcements over the loudspeaker, important news is now presented by students in a short and friendly way. Last month the team interviewed the school's oldest teacher before she retired, and many students said it was the first time they had heard her story. The team now hopes to record a weekly program that families can listen to at home.`;

const PHONE_LUNCH_PASSAGE = `For one month last spring, the cafeteria at Givat Oranim High School became a phone-free zone during lunch. The idea did not come from the principal but from the student council, after a survey showed that many students felt their lunch break was "quiet but not relaxing." Most tables, they noticed, were full of people sitting together while looking at separate screens.

The rules were simple. Phones stayed in bags or in a basket at the entrance, and anyone who needed to make an urgent call could step outside. To make the break more interesting, the council placed board games, card games and a few puzzles on the tables. At first many students complained. Some said it was unfair to treat teenagers like children, and others simply ate quickly and left. A few even tried to hide their phones under the table until a friend reminded them of the rules.

After the first week, however, something changed. Groups that had never spoken before began playing cards together, and the noise level in the cafeteria went up in a way the staff described as "the good kind of noisy." A few students who usually sat alone found themselves invited into games. Teachers on lunch duty said that arguments became less common, although nobody could say for certain whether the phones were the reason.

When the month ended, the council asked students to vote on whether to continue. The result was close: a small majority chose to keep phone-free lunches on two days a week rather than every day. The council felt this was a reasonable compromise, because it allowed students to decide for themselves instead of having a rule imposed on them.`;

const BUS_DRIVER_STORY = `Every morning at 6:40, Avner started the number 12 bus and drove the same route through the quiet streets of the town. He had done it for twenty-two years. Passengers rarely looked at him; they looked at their phones, out of the window, or at nothing at all.

What nobody knew was that Avner kept a small notebook in the pocket of his jacket. In it he wrote one line each day about someone who got on his bus. "Girl with a violin case, practicing with her fingers on her knee." "Old man who always says thank you, even when it rains." "Boy who ran for the bus and laughed when he made it."

One winter morning, a young woman got on carrying a box of papers. The bus braked suddenly at a red light, and the papers flew across the floor. Passengers helped her pick them up, and Avner waited at the next stop until she had them all. She thanked him, a little embarrassed, and said it was her first day as a teacher.

That evening, Avner opened his notebook and stopped. He had been writing about strangers for so many years that he had never wondered whether anyone noticed him. He wrote: "Today a teacher thanked me. Maybe I am also someone's line."

On his last day before retiring, he left the notebook on the seat behind him, with a short note on the cover: "For whoever needs proof that people are worth noticing." He never found out who took it.`;

const DESERT_FARMING_PASSAGE = `In many dry regions of the world, farmers face the same difficult question: how can you grow food when rain is rare and water is expensive? Some of the most interesting answers come not from huge new machines but from careful changes in the way water is used.

One of the best-known methods is drip irrigation. Instead of spraying water over an entire field, thin pipes carry water directly to the roots of each plant, a few drops at a time. Much less water is lost to the sun and wind, and weeds, which grow wherever the ground is wet, have fewer chances to spread.

Another approach is to reuse water that has already been used once. After treatment, water from homes and cities can be suitable for irrigating certain crops, especially trees and plants that are not eaten raw. This reduces the pressure on rivers and underground sources, although it requires strict testing and public trust.

Farmers in dry areas also choose their crops more carefully. Some plants need far less water than others, and some can grow in soil that contains a little salt. Researchers and farmers often work together on small test fields before a new crop is planted on a larger scale.

None of these solutions is perfect. Drip systems cost money to install and must be cleaned regularly, and treated water is not suitable for every use. Still, many experts believe that the future of farming in dry places will depend less on finding new water and more on wasting less of the water we already have.`;

const BOREDOM_PASSAGE = `Few feelings are as unpopular as boredom. We try to escape it at every opportunity, and modern life makes escape remarkably easy: a phone in every pocket offers endless entertainment at the first sign of an empty moment. Yet some writers and educators have begun to ask whether we lose something valuable when we never allow ourselves to be bored.

Their argument starts with a simple observation. Boredom is uncomfortable precisely because it pushes us to look for something to do. When an external distraction is available, we reach for it immediately. When none is available, the mind is forced to produce its own material: it wanders, makes plans, remembers, imagines. Many people report that their most original ideas arrived during exactly these "wasted" moments, while waiting for a bus or staring out of a window.

There is also a practical side. Children who are constantly entertained may never learn to entertain themselves, a skill that becomes surprisingly important in adulthood, when long stretches of routine are unavoidable. Learning to tolerate a little emptiness, the argument goes, is part of learning to manage one's own attention.

Critics answer that this praise of boredom can easily become a romantic idea that ignores real life. Not every empty hour leads to creativity; for many people it simply leads to frustration or restlessness. They also point out that the content people turn to is not always shallow. Reading an article or listening to a lecture on a phone is hardly the same as scrolling without purpose. Some add that the people who praise boredom most loudly are often those with the most interesting lives, for whom a free hour is a rare luxury rather than a daily condition.

A further complication is that boredom is not experienced in the same way by everyone. For a student sitting through a lesson that is far too easy, boredom may be a signal that something needs to change, not an opportunity for creativity. Treating every bored moment as valuable could make it easier to ignore situations that really are badly designed.

Perhaps the most reasonable position lies between these views. Boredom is not a virtue in itself, but the habit of filling every gap automatically deserves attention. The question is not whether we should be bored more often, but whether we are still capable of choosing what to do with our own quiet moments, or whether that choice has quietly been made for us.`;

const PHOTO_MEMORY_PASSAGE = `It has become almost a reflex: at a concert, a family dinner or the edge of a spectacular view, the first gesture is to raise a phone. We photograph more than any generation before us, often hundreds of images in a single week. The assumption behind this habit seems obvious enough. If we record the moment, we will be able to keep it. Yet a growing number of thinkers have questioned whether the camera preserves memory or quietly replaces it.

The concern is not that photographs are inaccurate. A picture captures detail far more reliably than the human mind does. The worry is rather about what happens to attention at the moment the picture is taken. To photograph something, we must frame it, check the light and decide what to leave out, and in doing so we may be treating the experience as material for later rather than living it now. Some people describe a curious result: they remember taking the picture more clearly than the event itself.

There is also the problem of abundance. A memory that is stored in thousands of files is, in practice, often never revisited. The photographs exist, but they are not looked at, organized or shared in any meaningful way. In earlier times, a family might own a single album, consulted repeatedly until its images became part of the family's own story. Scarcity, paradoxically, made each picture more valuable.

Defenders of the camera reply that these arguments romanticize a past that was not necessarily better. Photographs allow people to share experiences with relatives far away, to document injustice, and to recover details that memory alone would distort. For someone who has lost a person they loved, even an ordinary, carelessly taken picture can become precious.

The more interesting question, then, may not be whether to take pictures, but how. A photograph taken deliberately, after the moment has been experienced, may support memory rather than replace it. The difference lies less in the technology than in the attention we bring to it.`;

export const BAGRUT_SAMPLE_UNITS_SET3: BagrutSampleUnit[] = [
  {
    moduleCode: "A",
    unitSlug: "3",
    titleHe: "מתנדבים במקלט לבעלי חיים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    listeningTask: {
      transcriptEn: SHELTER_TRANSCRIPT,
      questions: [
        {
          formatHe: "רב-ברירה",
          promptEn: "How did Omer start volunteering at the shelter?",
          options: [
            "His school asked students to volunteer",
            "He went with his sister, who wanted to adopt a dog",
            "He saw an advertisement online",
            "A friend of his worked there",
          ],
          correctOptionIndex: 1,
          modelAnswerHe: "תשובה נכונה: B.",
        },
        {
          formatHe: "השלמת משפט",
          promptEn: "In the afternoon, the volunteers help take photos for the website, because a good photo ___.",
          modelAnswerHe: "תשובה: helps a dog get adopted.",
        },
        {
          formatHe: "רב-ברירה",
          promptEn: "What does Omer find hardest about volunteering?",
          options: ["Cleaning the kennels", "Waking up early", "Saying goodbye to dogs he is attached to", "Taking photos"],
          correctOptionIndex: 2,
          modelAnswerHe: "תשובה נכונה: C.",
        },
        {
          formatHe: "שאלה פתוחה",
          promptEn: "What advice does Omer give to teenagers who want to volunteer? Give two details.",
          modelAnswerHe: "תשובה מקובלת: להתחיל במשהו קטן וקבוע (בוקר אחד בשבוע מספיק), ולבחור משהו שיהיה חבל להם לפספס, לא משהו שרק נראה טוב בקורות חיים.",
        },
      ],
    },
    readingPassages: [BOOK_SWAP_PASSAGE, SIGN_LANGUAGE_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Text 1: Why did the students start the book swap?",
        options: [
          "The school library was closing",
          "Families were buying new books while old ones sat unused",
          "The official book lists had been cancelled",
          "A publisher asked the school for help",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Text 1: Name TWO things the students did to organize the swap.",
        modelAnswerHe: "תשובה מקובלת: בדקו אילו ספרים עדיין ברשימות, הכינו גיליון של כל הספרים, סימנו את מצב כל ספר, וקבעו מערכת שעות לפתיחת הכיתה.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Text 1: The team decided that a book is accepted only if ___.",
        modelAnswerHe: "תשובה: another student could actually learn from it.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Text 2: How did Yael first feel around Eden?",
        options: ["Excited", "Awkward", "Angry", "Bored"],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Text 2: How did the sign language class change the school? Give ONE example.",
        modelAnswerHe: "תשובה מקובלת: תלמידים התחילו לברך את עדן במסדרון, היא הוזמנה לחוג הדרמה, ותלמידי החוג הפכו למקשיבים סבלניים יותר.",
      },
      {
        formatHe: "אוצר מילים בהקשר",
        promptEn: 'Text 2, paragraph 5: what does "a shared effort" mean here?',
        modelAnswerHe: "תשובה: מאמץ ששני הצדדים עושים יחד, לא רק אחד מהם.",
      },
    ],
  },
  {
    moduleCode: "B",
    unitSlug: "3",
    titleHe: "תחנת הרדיו של בית הספר",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [RADIO_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What was the music room used for before Radio Ramot?",
        options: ["Music lessons", "Mostly storage", "Teachers' meetings", "Exams"],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Noam wanted to start the station because he ___.",
        modelAnswerHe: "תשובה: loved podcasts and wanted to make something similar at school.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which problem is NOT mentioned in the first broadcasts?",
        options: ["An old microphone", "Students speaking too fast", "A program recorded without sound", "Too few listeners"],
        correctOptionIndex: 3,
        modelAnswerHe: "תשובה נכונה: D — מספר המאזינים לא מוזכר.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "How does the team help younger students who are nervous?",
        modelAnswerHe: "תשובה: נותנים להם אימון קצר לפני שהם מדברים ברדיו.",
      },
      {
        formatHe: "אוצר מילים בהקשר",
        promptEn: 'Find a word in paragraph 2 that means "got better."',
        modelAnswerHe: "תשובה: improved.",
      },
    ],
    writingTask: {
      promptEn: "Your school is starting a radio program. Write a short message to the team saying what you would like to hear on it and why.",
      wordCountRange: [35, 40],
    },
  },
  {
    moduleCode: "C",
    unitSlug: "3",
    titleHe: "הפסקת צהריים בלי טלפונים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [PHONE_LUNCH_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Who suggested the phone-free lunch?",
        options: ["The principal", "The parents' committee", "The student council", "The cafeteria staff"],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: 'What did students mean when they described lunch as "quiet but not relaxing"?',
        modelAnswerHe: "תשובה מקובלת: היה שקט כי כולם הסתכלו במסכים, אבל לא הייתה מנוחה או שיחה אמיתית.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "To make the break more interesting, the council placed ___ on the tables.",
        modelAnswerHe: "תשובה: board games, card games and puzzles.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What does the text say about arguments in the cafeteria?",
        options: [
          "They stopped completely",
          "They became less common, but the reason is not certain",
          "They became more common",
          "They were caused by the games",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Why did the council see the final decision as a reasonable compromise?",
        modelAnswerHe: "תשובה מקובלת: כי התלמידים בחרו בעצמם, בהצבעה, במקום שכלל ייכפה עליהם.",
      },
    ],
    writingTask: {
      promptEn:
        "Should schools limit phone use during breaks? Write a short composition giving your opinion and at least two reasons.",
      wordCountRange: [70, 90],
    },
  },
  {
    moduleCode: "D",
    unitSlug: "3",
    titleHe: "המחברת של הנהג (סיפור)",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [BUS_DRIVER_STORY],
    readingQuestions: [
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What did Avner write in his notebook, and how often?",
        modelAnswerHe: "תשובה: שורה אחת בכל יום על נוסע שעלה לאוטובוס שלו.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: 'What does the first paragraph suggest about the passengers?',
        options: [
          "They were rude to Avner",
          "They hardly noticed him",
          "They knew him well",
          "They complained about the route",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה (ניתוח)",
        promptEn: 'Explain the meaning of the line "Maybe I am also someone\'s line." What does Avner realize?',
        modelAnswerHe: "תשובה מקובלת: הוא מבין שגם הוא אדם שאחרים עשויים לשים לב אליו ולזכור אותו, בדיוק כמו שהוא שם לב לזרים.",
      },
      {
        formatHe: "שאלה פתוחה (ניתוח)",
        promptEn: "Why do you think Avner left the notebook on the bus instead of keeping it? Support your answer with the note on the cover.",
        modelAnswerHe: "תשובה מקובלת: הוא רצה להעביר הלאה את הרעיון שאנשים ראויים לתשומת לב; הפתק מראה שהמחברת נועדה למי שצריך הוכחה לכך.",
      },
    ],
    writingTask: {
      promptEn:
        "Write about a person you see often but do not really know (a driver, a guard, a shop owner). Describe what you notice about them and what you imagine about their life.",
      wordCountRange: [100, 120],
    },
  },
  {
    moduleCode: "E",
    unitSlug: "3",
    titleHe: "חקלאות באזורים יבשים",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [DESERT_FARMING_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "According to paragraph 1, where do many interesting answers come from?",
        options: ["Huge new machines", "Careful changes in how water is used", "New rivers", "Imported food"],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "In drip irrigation, thin pipes carry water directly to ___.",
        modelAnswerHe: "תשובה: the roots of each plant.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Give TWO advantages of drip irrigation mentioned in the text.",
        modelAnswerHe: "תשובה: פחות מים הולכים לאיבוד לשמש ולרוח, ולעשבים שוטים יש פחות סיכוי להתפשט.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "For which crops is treated water especially suitable, according to the text?",
        options: ["Vegetables eaten raw", "Trees and plants not eaten raw", "All crops", "Only flowers"],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What does reusing water require, according to paragraph 3?",
        modelAnswerHe: "תשובה: בדיקות קפדניות ואמון הציבור.",
      },
      {
        formatHe: "מארגן גרפי",
        promptEn: "Complete the table: Method — Drip irrigation | Benefit: ___ | Problem: ___.",
        modelAnswerHe: "תשובה: יתרון — חיסכון במים / פחות עשבים; בעיה — עלות התקנה וצורך בניקוי קבוע.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Before a new crop is planted on a large scale, researchers and farmers ___.",
        modelAnswerHe: "תשובה: work together on small test fields.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What is the main idea of the last paragraph?",
        options: [
          "Drip systems are too expensive to use",
          "The future depends more on wasting less water than on finding new water",
          "Treated water should never be used",
          "Farming in dry places is impossible",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "אוצר מילים בהקשר",
        promptEn: 'In paragraph 2, the word "spread" means:',
        options: ["grow over a wider area", "become smaller", "die", "be removed"],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: A.",
      },
    ],
    vocabularyQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the word closest in meaning to "rare":',
        options: ["uncommon", "heavy", "cheap", "dangerous"],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: uncommon.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "Farmers must __________ (reduce) the amount of water they waste.",
        modelAnswerHe: "תשובה: reduce.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: 'Choose the word closest in meaning to "suitable":',
        options: ["appropriate", "expensive", "dirty", "ancient"],
        correctOptionIndex: 0,
        modelAnswerHe: "תשובה נכונה: appropriate.",
      },
      {
        formatHe: "השלמת משפט",
        promptEn: "The new pipes must be cleaned __________ (regular) to work well.",
        modelAnswerHe: "תשובה: regularly.",
      },
      {
        formatHe: "התאמה",
        promptEn: "Match: (1) install (2) source (3) crop — (a) a plant grown for food (b) to put a system in place (c) where something comes from",
        modelAnswerHe: "תשובה: 1-b, 2-c, 3-a.",
      },
    ],
  },
  {
    moduleCode: "F",
    unitSlug: "3",
    titleHe: "הערך של שעמום",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [BOREDOM_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "Why, according to the writer, is boredom easy to escape today?",
        options: ["People work longer hours", "Phones offer constant entertainment", "Schools are more interesting", "People travel more"],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What does the mind do when no external distraction is available? Give TWO examples from the text.",
        modelAnswerHe: "תשובה: הוא נודד, מתכנן, נזכר או מדמיין.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "Why might learning to entertain oneself be important in adulthood?",
        modelAnswerHe: "תשובה מקובלת: כי בחיים הבוגרים יש תקופות ארוכות של שגרה שאי אפשר להימנע מהן, וצריך לדעת לנהל את הקשב לבד.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "What is ONE point the critics make?",
        options: [
          "Boredom always leads to creativity",
          "Not every empty hour leads to creativity",
          "Phones should be banned",
          "Children are never bored",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "What is the writer's own conclusion in the last paragraph? Answer in your own words.",
        modelAnswerHe: "תשובה מקובלת: שעמום אינו מעלה בפני עצמו, אבל ההרגל למלא כל רגע ריק באופן אוטומטי ראוי לתשומת לב; השאלה היא אם אנחנו עדיין בוחרים בעצמנו מה לעשות ברגעים השקטים.",
      },
    ],
    writingTask: {
      promptEn:
        "\"Young people today are never bored, and that is a problem.\" Do you agree? Write an essay presenting your opinion, with reasons and an example.",
      wordCountRange: [120, 140],
    },
  },
  {
    moduleCode: "G",
    unitSlug: "3",
    titleHe: "צילום וזיכרון",
    teacherReviewed: false,
    aiContentDisclosed: true,
    readingPassages: [PHOTO_MEMORY_PASSAGE],
    readingQuestions: [
      {
        formatHe: "רב-ברירה",
        promptEn: "What question have some thinkers raised, according to paragraph 1?",
        options: [
          "Whether photographs are accurate",
          "Whether the camera preserves memory or replaces it",
          "Whether phones should be allowed at concerts",
          "Whether people photograph too little",
        ],
        correctOptionIndex: 1,
        modelAnswerHe: "תשובה נכונה: B.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to paragraph 2, what happens to our attention when we take a photograph?",
        modelAnswerHe: "תשובה מקובלת: אנחנו עסוקים במסגור, באור ובהחלטה מה להשאיר בחוץ, ומתייחסים לחוויה כחומר לאחר כך במקום לחיות אותה עכשיו.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: 'Explain the paradox in paragraph 3: how could "scarcity" make pictures more valuable?',
        modelAnswerHe: "תשובה מקובלת: כשהיו מעט תמונות, חזרו אליהן שוב ושוב והן הפכו לחלק מהסיפור המשפחתי; היום יש אלפי קבצים שאף אחד לא מסתכל עליהם.",
      },
      {
        formatHe: "רב-ברירה",
        promptEn: "Which argument do the defenders of the camera NOT make?",
        options: [
          "Photographs help share experiences with distant relatives",
          "Photographs can document injustice",
          "Photographs improve our attention during the event",
          "Photographs can recover details memory distorts",
        ],
        correctOptionIndex: 2,
        modelAnswerHe: "תשובה נכונה: C.",
      },
      {
        formatHe: "שאלה פתוחה",
        promptEn: "According to the final paragraph, what makes the difference between a photograph that supports memory and one that replaces it?",
        modelAnswerHe: "תשובה: תשומת הלב שאנחנו מביאים; צילום מכוון אחרי שחווינו את הרגע, ולא הטכנולוגיה עצמה.",
      },
    ],
    writingTask: {
      promptEn:
        "Write an essay: Do smartphones help us remember our lives or make us experience them less fully? Present a clear position and address the opposite view.",
      wordCountRange: [120, 140],
    },
  },
];

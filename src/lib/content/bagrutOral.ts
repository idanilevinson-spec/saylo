// Question bank for the oral Bagrut simulation (docs/specs/bagrut-oral.md).
// Every question and passage here is Saylo's own, written for this file to
// fit the public COBE structure: nothing is copied, translated or reworded
// from Ministry of Education exams or from prep courses. Part C passages are
// short fictional stories (no factual claims that could be wrong), read
// aloud by the browser instead of the exam's video clip.

export interface QuestionSet {
  id: string;
  // Shown and read to the learner, in English, like the real exam.
  questions: string[];
}

export interface PartATopic extends QuestionSet {
  topicEn: string;
  topicHe: string;
}

export interface PartCPassage {
  id: string;
  titleEn: string;
  titleHe: string;
  // Read aloud by the browser; about a minute of speech.
  script: string;
  sets: [QuestionSet, QuestionSet];
}

export const PART_A_TOPICS: PartATopic[] = [
  {
    id: "a-free-time",
    topicEn: "free time",
    topicHe: "זמן פנוי",
    questions: [
      "How do you usually spend a free afternoon? Describe it.",
      "Do you think teenagers today have enough free time? Explain why or why not.",
    ],
  },
  {
    id: "a-phones",
    topicEn: "phones",
    topicHe: "טלפונים",
    questions: [
      "How much do you use your phone on a normal day, and for what? Give examples.",
      "Would your life be better or worse without a phone for a week? Explain.",
    ],
  },
  {
    id: "a-food",
    topicEn: "food",
    topicHe: "אוכל",
    questions: [
      "What is a meal that is special to you or your family? Describe it.",
      "Is it important for young people to learn how to cook? Explain your opinion.",
    ],
  },
  {
    id: "a-friends",
    topicEn: "friendship",
    topicHe: "חברות",
    questions: [
      "What makes someone a good friend? Give an example from your life.",
      "Is it easier to make friends online or in person? Explain.",
    ],
  },
  {
    id: "a-music",
    topicEn: "music",
    topicHe: "מוזיקה",
    questions: [
      "What kind of music do you listen to, and when? Explain.",
      "Can music change the way people feel or act? Give an example.",
    ],
  },
  {
    id: "a-travel",
    topicEn: "travel",
    topicHe: "טיולים",
    questions: [
      "Tell me about a place you visited and remember well. What made it memorable?",
      "Where would you like to travel in the future, and why?",
    ],
  },
  {
    id: "a-school",
    topicEn: "school",
    topicHe: "בית הספר",
    questions: [
      "Which subject do you find the most useful, and why?",
      "If you could change one thing about your school, what would it be? Explain.",
    ],
  },
  {
    id: "a-sport",
    topicEn: "sport",
    topicHe: "ספורט",
    questions: [
      "Do you do any sport or physical activity? Describe what you do and how often.",
      "Should schools give students more time for sport? Explain your opinion.",
    ],
  },
  {
    id: "a-volunteering",
    topicEn: "helping others",
    topicHe: "עזרה לאחרים",
    questions: [
      "Have you ever volunteered or helped someone in your community? Describe what you did.",
      "Why do you think some people choose to volunteer? Explain.",
    ],
  },
  {
    id: "a-future-work",
    topicEn: "work in the future",
    topicHe: "עבודה בעתיד",
    questions: [
      "What kind of job would you like to have one day? Explain why.",
      "What skills do you think young people will need for work in the future? Give examples.",
    ],
  },
  {
    id: "a-reading-screens",
    topicEn: "books and screens",
    topicHe: "ספרים ומסכים",
    questions: [
      "Do you prefer reading books or watching series and films? Explain.",
      "Do you think people read less than they used to? Why might that be?",
    ],
  },
  {
    id: "a-environment",
    topicEn: "the environment at home",
    topicHe: "סביבה בבית",
    questions: [
      "What do you or your family do to waste less, for example water, food or electricity?",
      "Whose job is it to protect the environment: each person, or the government? Explain.",
    ],
  },
  {
    id: "a-family",
    topicEn: "family traditions",
    topicHe: "מסורות משפחתיות",
    questions: [
      "Describe a tradition or event your family celebrates together.",
      "Why do you think traditions are important, or not important, to young people? Explain.",
    ],
  },
  {
    id: "a-pets",
    topicEn: "animals and pets",
    topicHe: "בעלי חיים",
    questions: [
      "Do you have a pet, or would you like one? Explain why.",
      "What do you think people learn from taking care of an animal? Give examples.",
    ],
  },
];

export const PART_B_SETS: QuestionSet[] = [
  {
    id: "b-learned",
    questions: [
      "Tell me briefly what your project is about and why you chose this subject.",
      "What is the most important thing you learned while working on it? Give an example from your project.",
    ],
  },
  {
    id: "b-challenge",
    questions: [
      "Describe your project in a few sentences.",
      "What was the hardest part of working on it, and how did you deal with it? Explain.",
    ],
  },
  {
    id: "b-audience",
    questions: [
      "What is your project about, and who would find it interesting?",
      "What is one part of your project you would like people to remember? Explain why.",
    ],
  },
  {
    id: "b-sources",
    questions: [
      "Tell me about the subject of your project.",
      "Where did you find information for it, and which source helped you most? Explain.",
    ],
  },
  {
    id: "b-change",
    questions: [
      "Briefly describe your project.",
      "If you could do the project again, what would you do differently? Explain.",
    ],
  },
  {
    id: "b-opinion",
    questions: [
      "What did your project try to find out or show?",
      "Did working on it change your opinion about the subject? Explain, with an example.",
    ],
  },
  {
    id: "b-teamwork",
    questions: [
      "Tell me what your project is about.",
      "Did you work alone or with others? How did that affect the project? Explain.",
    ],
  },
  {
    id: "b-real-life",
    questions: [
      "What is the topic of your project?",
      "How is your topic connected to real life or to people around you? Give an example.",
    ],
  },
];

export const PART_C_PASSAGES: PartCPassage[] = [
  {
    id: "c-repair-cafe",
    titleEn: "The Repair Café",
    titleHe: "בית הקפה לתיקונים",
    script:
      "Every second Friday, the community center in a small town turns into a repair café. People bring things that are broken: a lamp, a toaster, a bike with a flat tire, a favorite jacket with a hole in it. Volunteers sit at long tables with tools, and they fix the things together with the owners. Nobody pays. The idea is simple: instead of throwing something away and buying a new one, you learn how to repair it. Dana, a retired electrician, says the best part is watching people's faces when an old radio starts to play again. Last month the volunteers counted more than sixty repairs in one morning. Some teenagers from the local high school have also joined. At first they only served coffee, but now two of them repair phones and headphones by themselves.",
    sets: [
      {
        id: "c-repair-cafe-1",
        questions: [
          "What happens at the repair café? Describe two things.",
          "According to the recording, how did the teenagers' role change? Explain.",
        ],
      },
      {
        id: "c-repair-cafe-2",
        questions: [
          "Why do you think people come to the repair café instead of buying new things? Give two reasons.",
          "Would you volunteer at a place like this? Explain why or why not.",
        ],
      },
    ],
  },
  {
    id: "c-silent-library",
    titleEn: "The Night the Library Stayed Open",
    titleHe: "הלילה שבו הספרייה נשארה פתוחה",
    script:
      "Before the final exams, students at one high school complained that they had nowhere quiet to study. Their homes were noisy, and the cafés were too expensive. So the school librarian, Mr. Levy, made an offer: for two weeks, the library would stay open until ten at night. Parents took turns staying with the students, and a local bakery sent bread and cookies every evening. On the first night, only eight students came. By the end of the second week, there were more than forty, and some of them brought younger brothers and sisters to read. Mr. Levy says the grades were not the only thing that improved. Students who had never spoken to each other started studying together and explaining things to one another.",
    sets: [
      {
        id: "c-silent-library-1",
        questions: [
          "What problem did the students have before the exams? Name two details.",
          "Who helped to keep the library open in the evenings? Give two examples from the recording.",
        ],
      },
      {
        id: "c-silent-library-2",
        questions: [
          "According to Mr. Levy, what improved besides the grades? Explain.",
          "Do you think a quiet place to study is important for success? Explain your opinion.",
        ],
      },
    ],
  },
  {
    id: "c-rooftop-garden",
    titleEn: "A Garden on the Roof",
    titleHe: "גינה על הגג",
    script:
      "The roof of an old apartment building used to be empty, hot and full of dust. Then Noa, who lives on the fourth floor, asked her neighbors a question: what if we grew vegetables up there? Some neighbors laughed. Others were worried about the cost. Noa started small, with six boxes of soil and some tomato plants. A neighbor who is a carpenter built wooden benches, and the children painted signs with the names of the plants. After one summer, the roof had cucumbers, peppers, herbs and even a lemon tree. The neighbors now meet there on Saturday mornings. Noa says the vegetables are nice, but the real change is that people in the building now know each other's names.",
    sets: [
      {
        id: "c-rooftop-garden-1",
        questions: [
          "How did the neighbors react to Noa's idea at first? Name two reactions.",
          "How did different neighbors help the garden? Give two examples from the recording.",
        ],
      },
      {
        id: "c-rooftop-garden-2",
        questions: [
          "According to Noa, what was the most important change? Explain.",
          "What could a project like this teach young people? Explain, with an example.",
        ],
      },
    ],
  },
  {
    id: "c-phone-free-trip",
    titleEn: "Three Days Without Phones",
    titleHe: "שלושה ימים בלי טלפונים",
    script:
      "A youth group went on a three-day trip in the north, and the guides made one unusual rule: all phones went into a locked box on the first morning. Many teenagers were angry. They worried about missing messages and about getting lost without maps. On the first day, the group walked more slowly than planned, because people kept stopping to ask each other for directions. By the second day, something changed. They sang around the fire, played games they had not played since they were children, and talked late into the night. When the phones came back on the last day, a few teenagers didn't even turn them on until they got home. One of them, Yoav, said he slept better than he had in months.",
    sets: [
      {
        id: "c-phone-free-trip-1",
        questions: [
          "Why were the teenagers angry about the rule? Give two reasons.",
          "What did the group do on the second day? Name two activities.",
        ],
      },
      {
        id: "c-phone-free-trip-2",
        questions: [
          "Why do you think some teenagers didn't turn their phones on right away? Explain.",
          "Would you agree to a rule like this on a trip? Explain your answer.",
        ],
      },
    ],
  },
  {
    id: "c-grandma-recipes",
    titleEn: "Grandma's Recipes",
    titleHe: "המתכונים של סבתא",
    script:
      "When Maya was sixteen, she noticed that nobody in her family had written down her grandmother's recipes. Her grandmother cooked by feeling, with a little of this and a handful of that. So every Thursday, Maya came to her kitchen with a notebook and a measuring cup. Before her grandmother added an ingredient, Maya measured it and wrote it down. It was slow work, and sometimes they argued about how much salt was too much. After a year, Maya had forty recipes, each with a short story about where the dish came from. She printed copies for the whole family. Her grandmother says the book is nice, but her favorite part was the Thursdays themselves.",
    sets: [
      {
        id: "c-grandma-recipes-1",
        questions: [
          "Why did Maya decide to write down the recipes? Explain.",
          "How did Maya record the recipes? Describe two things she did.",
        ],
      },
      {
        id: "c-grandma-recipes-2",
        questions: [
          "What did the grandmother enjoy most, according to the recording? Explain.",
          "Why might it be important to save family traditions like recipes? Explain your opinion.",
        ],
      },
    ],
  },
  {
    id: "c-bike-workshop",
    titleEn: "The Bike Workshop",
    titleHe: "סדנת האופניים",
    script:
      "Ido works at a bicycle shop after school. One day, a younger boy came in with a bike that had no brakes and a broken chain. He didn't have money to fix it. Ido showed him how to repair the chain himself, and the boy came back the next week with two friends. Soon Ido's manager agreed to give the back room of the shop every Tuesday afternoon. Children from the neighborhood bring old bikes, and Ido teaches them how to fix brakes, change tires and adjust seats. Old bikes that nobody wants are donated to the workshop, repaired by the children, and given to families who need them. So far, the group has given away more than thirty bikes.",
    sets: [
      {
        id: "c-bike-workshop-1",
        questions: [
          "How did the workshop begin? Describe what happened.",
          "What do the children learn to do in the workshop? Name two things.",
        ],
      },
      {
        id: "c-bike-workshop-2",
        questions: [
          "Why do you think the manager agreed to help? Explain.",
          "Do you think young people can make a real difference in their neighborhood? Explain, with an example.",
        ],
      },
    ],
  },
];

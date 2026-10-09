"use client";

import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// A rundown, not a card grid — segment numbers are earned here (a real
// broadcast rundown IS numbered order), unlike the banned decorative
// 01/02/03 the old direction refused.
const STEPS = [
  {
    en: "About ten minutes, four skills.",
    he: "שאלות באוצר מילים, דקדוק, קריאה והאזנה. בסוף מקבלים רמה לכל מיומנות בנפרד, כי קריאה ודיבור לא תמיד באותה רמה.",
    title: "מבחן רמה",
  },
  {
    en: "A plan for today.",
    he: "שישה תרגילים קצרים: דקדוק, מילים, קריאה, האזנה, כתיבה ושיחה. כל אחד ברמה שלכם במיומנות שלו.",
    title: "התוכנית היומית",
  },
  {
    en: "Talk, and get corrected.",
    he: "בכתב או בקול. המורה ממשיך את השיחה ומתקן את הטעות שחשובה, לא כל פסיק.",
    title: "שיחה עם המורה",
  },
  {
    en: "Mistakes come back.",
    he: "מילה שטעיתם בה חוזרת אליכם למחרת, ואחר כך במרווחים הולכים וגדלים, עד שהיא נשארת.",
    title: "חזרה חכמה",
  },
];

export default function LandingSteps() {
  return (
    <section className="px-4 py-20 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">סדר היום</h2>
        <p className="mt-3 mb-10 max-w-xl text-lg text-muted leading-relaxed">מה קורה מהרגע שנרשמים: ארבעה שלבים, ורק הראשון הוא חד-פעמי.</p>

        <div className="divide-y divide-card-border border-y border-card-border">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-center gap-5 sm:gap-8 py-6">
              <span className="chyron shrink-0 w-14 sm:w-16 text-4xl sm:text-5xl text-card-border text-center" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <EnglishText as="p" className="caption-track-en text-lg font-bold text-foreground">
                  {step.en}
                </EnglishText>
                <p className="mt-1 text-sm text-primary-hover font-bold">{step.title}</p>
                <p className="mt-2 text-muted leading-relaxed max-w-md">{step.he}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

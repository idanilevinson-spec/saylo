"use client";

import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";

// A rundown, not a card grid — segment numbers are earned here (a real
// broadcast rundown IS numbered order), unlike the banned decorative
// 01/02/03 the old direction refused.
const STEPS = [
  {
    en: "Take the level test.",
    he: "כמה דקות של שאלות מתאימות שמזהות בדיוק איפה אתם עומדים, מתוך 6 רמות ה-CEFR.",
    title: "מבחן רמה חכם",
  },
  {
    en: "Get your own track.",
    he: "המערכת בונה לכם תוכנית לימוד שמתמקדת במה שאתם באמת צריכים, לא שיעור אחיד לכולם.",
    title: "מסלול אישי",
  },
  {
    en: "Practice, daily.",
    he: "אוצר מילים, דקדוק, האזנה, קריאה, כתיבה ודיבור, במינון קטן וקבוע שבאמת נשאר בזיכרון.",
    title: "תרגול יומי",
  },
  {
    en: "Corrected in real time.",
    he: "יודע איפה טעיתם אתמול, ומתאים את השיעור הבא בדיוק לזה.",
    title: "מורה AI אישי",
  },
];

export default function LandingSteps() {
  return (
    <section className="px-4 py-20 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-14"
        >
          סדר היום
        </motion.h2>

        <div className="divide-y divide-card-border border-y border-card-border">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex items-center gap-5 sm:gap-8 py-6"
            >
              <span className="chyron shrink-0 w-14 sm:w-16 text-4xl sm:text-5xl text-card-border text-center" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <EnglishText as="p" className="caption-track-en text-lg font-bold text-foreground">
                  {step.en}
                </EnglishText>
                <p className="mt-1 text-sm text-accent-hover font-bold">{step.title}</p>
                <p className="mt-2 text-muted leading-relaxed max-w-md">{step.he}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

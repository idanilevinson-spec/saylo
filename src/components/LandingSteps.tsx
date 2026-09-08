"use client";

import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";

// A continuous rail replaces the banned 01/02/03 card grid — order reads
// from position on the line, not from a printed number.
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
    <section className="px-4 py-24">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-16"
        >
          איך זה עובד
        </motion.h2>

        {/* One continuous rail — a single vertical line the steps sit on,
            not four identical boxes. Order reads from position alone. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute top-1 bottom-1 start-1 w-px bg-card-border"
          />
          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative flex gap-6 sm:gap-8 ps-9"
              >
                <span
                  aria-hidden="true"
                  className="absolute start-0 top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"
                />
                <div className="flex-1 min-w-0 pb-1">
                  <EnglishText as="p" className="caption-track-en text-lg font-bold text-foreground">
                    {step.en}
                  </EnglishText>
                  <p className="mt-1 text-sm text-accent font-medium">{step.title}</p>
                  <p className="mt-2 text-muted leading-relaxed max-w-md">{step.he}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

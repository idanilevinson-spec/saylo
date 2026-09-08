"use client";

import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";

// Timecodes are diegetic, not decorative — each step is a "cue" in the
// transcript of one learning session, replacing the banned 01/02/03 card
// grid with the same caption-track grammar the hero already established.
const STEPS = [
  {
    time: "00:00",
    en: "Take the level test.",
    he: "כמה דקות של שאלות מתאימות שמזהות בדיוק איפה אתם עומדים, מתוך 6 רמות ה-CEFR.",
    title: "מבחן רמה חכם",
  },
  {
    time: "00:08",
    en: "Get your own track.",
    he: "המערכת בונה לכם תוכנית לימוד שמתמקדת במה שאתם באמת צריכים — לא שיעור אחיד לכולם.",
    title: "מסלול אישי",
  },
  {
    time: "00:15",
    en: "Practice, daily.",
    he: "אוצר מילים, דקדוק, האזנה, קריאה, כתיבה ודיבור — במינון קטן וקבוע שבאמת נשאר בזיכרון.",
    title: "תרגול יומי",
  },
  {
    time: "00:24",
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

        {/* One continuous transcript rail — a single vertical timeline the
            cues sit on, not four identical boxes. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute top-1 bottom-1 start-[52px] w-px bg-card-border"
          />
          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.time}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative flex gap-6 sm:gap-8"
              >
                <div className="w-[104px] shrink-0 flex items-start justify-end pt-1">
                  <EnglishText as="span" className="timecode text-sm text-primary font-semibold">
                    {step.time}
                  </EnglishText>
                </div>
                <span
                  aria-hidden="true"
                  className="absolute start-[48px] top-2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"
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

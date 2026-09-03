"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import EnglishText from "@/components/EnglishText";

const STEPS = [
  {
    n: "01",
    title: "מבחן רמה חכם",
    body: "כמה דקות של שאלות מתאימות שמזהות בדיוק איפה אתם עומדים, מתוך 6 רמות ה-CEFR.",
  },
  {
    n: "02",
    title: "מסלול אישי",
    body: "המערכת בונה לכם תוכנית לימוד שמתמקדת במה שאתם באמת צריכים — לא שיעור אחיד לכולם.",
  },
  {
    n: "03",
    title: "תרגול יומי",
    body: "אוצר מילים, דקדוק, האזנה, קריאה, כתיבה ודיבור — במינון קטן וקבוע שבאמת נשאר בזיכרון.",
  },
  {
    n: "04",
    title: "מורה AI אישי",
    body: "יודע איפה טעיתם אתמול, ומתאים את השיעור הבא בדיוק לזה.",
  },
];

export default function LandingSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  // The dashed route between steps "flies" itself in — a solid accent line
  // tracing the same path a boarding pass shows between two airports.
  const pathWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="px-4 py-24">
      <div className="max-w-5xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="block text-center text-xs font-bold tracking-[0.14em] uppercase text-accent-hover mb-2.5"
        >
          מסלול הטיסה שלכם
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-16"
        >
          איך זה עובד
        </motion.h2>

        <div ref={ref} className="relative">
          <div
            aria-hidden="true"
            className="hidden sm:block absolute top-[34px] inset-x-[6%] border-t-2 border-dashed border-card-border"
          />
          <motion.div
            aria-hidden="true"
            style={{ width: pathWidth }}
            className="hidden sm:block absolute top-[34px] right-[6%] border-t-2 border-accent"
          />

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-card border border-card-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-[box-shadow,border-color]"
              >
                <span className="w-10 h-10 rounded-full bg-background-2 border border-card-border flex items-center justify-center mb-3.5">
                  <EnglishText as="span" className="text-sm font-bold text-primary">
                    {step.n}
                  </EnglishText>
                </span>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

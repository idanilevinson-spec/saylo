"use client";

import { motion } from "framer-motion";
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
  return (
    <section className="px-4 py-24">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-16"
        >
          איך זה עובד
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <EnglishText as="span" className="text-3xl font-bold text-primary/30 block">
                {step.n}
              </EnglishText>
              <h3 className="mt-3 font-bold text-lg">{step.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

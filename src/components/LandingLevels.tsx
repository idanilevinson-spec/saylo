"use client";

import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";

const LEVELS = [
  { code: "A1", label: "Beginner", he: "מתחילים" },
  { code: "A2", label: "Elementary", he: "בסיסי" },
  { code: "B1", label: "Intermediate", he: "בינוני" },
  { code: "B2", label: "Upper Intermediate", he: "בינוני-מתקדם" },
  { code: "C1", label: "Advanced", he: "מתקדם" },
  { code: "C2", label: "Proficiency", he: "שליטה מלאה" },
];

export default function LandingLevels() {
  return (
    <section className="px-4 py-24">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold mb-4"
        >
          מרמת התחלה ועד שליטה מלאה
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted mb-14"
        >
          מבחן הרמה שלנו ממקם אתכם בדיוק, לפי הסטנדרט הבינלאומי CEFR.
        </motion.p>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {LEVELS.map((level, i) => (
            <motion.div
              key={level.code}
              initial={{ opacity: 0, scale: 0.7, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08, type: "spring", bounce: 0.4 }}
              className="w-28 sm:w-32 bg-card border border-card-border rounded-2xl p-4 hover:-translate-y-1 hover:shadow-lg transition-transform"
            >
              <EnglishText as="span" className="block text-2xl font-bold text-primary">
                {level.code}
              </EnglishText>
              <EnglishText as="span" className="block text-xs text-muted mt-1">
                {level.label}
              </EnglishText>
              <span className="block text-xs text-foreground/70 mt-2">{level.he}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

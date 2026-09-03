"use client";

import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";

const LEVELS = [
  { code: "A1", label: "Beginner", he: "מתחילים", rotate: -6 },
  { code: "A2", label: "Elementary", he: "בסיסי", rotate: 4 },
  { code: "B1", label: "Intermediate", he: "בינוני", rotate: -3 },
  { code: "B2", label: "Upper Int.", he: "בינוני-מתקדם", rotate: 5 },
  { code: "C1", label: "Advanced", he: "מתקדם", rotate: -5 },
  { code: "C2", label: "Proficiency", he: "שליטה מלאה", rotate: 3 },
];

export default function LandingLevels() {
  return (
    <section className="px-4 py-24">
      <div className="max-w-4xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="block text-xs font-bold tracking-[0.14em] uppercase text-accent-hover mb-2.5"
        >
          דרכון השפה שלכם
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
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

        <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-3">
          {LEVELS.map((level, i) => {
            const isLast = i === LEVELS.length - 1;
            return (
              <div key={level.code} className="flex items-end">
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: level.rotate }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.08, type: "spring", bounce: 0.4 }}
                  whileHover={{ scale: 1.06, rotate: 0 }}
                  className={
                    "w-24 h-24 sm:w-[104px] sm:h-[104px] rounded-full border-2 flex flex-col items-center justify-center " +
                    (isLast ? "border-accent bg-accent/10" : "border-dashed border-card-border bg-card")
                  }
                >
                  <EnglishText
                    as="span"
                    className={"font-extrabold text-lg sm:text-xl leading-none " + (isLast ? "text-accent-hover" : "text-primary")}
                  >
                    {level.code}
                  </EnglishText>
                  <EnglishText as="span" className="text-[9.5px] sm:text-[10px] text-muted mt-1">
                    {level.label}
                  </EnglishText>
                  <span className="text-[10px] sm:text-[11px] mt-0.5">{level.he}</span>
                </motion.div>
                {!isLast && (
                  <span aria-hidden="true" className="hidden sm:block w-4 md:w-6 border-t-2 border-dashed border-card-border mb-11" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

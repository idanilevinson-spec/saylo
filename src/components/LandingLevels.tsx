"use client";

import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

// The CEFR ladder as a scrubber, not passport stamps — six chapter markers
// on one continuous rail. Order and position carry the progression; the
// level code itself is the only label this needs.
const LEVELS = [
  { code: "A1", label: "Beginner", he: "מתחילים" },
  { code: "A2", label: "Elementary", he: "בסיסי" },
  { code: "B1", label: "Intermediate", he: "בינוני" },
  { code: "B2", label: "Upper Int.", he: "בינוני-מתקדם" },
  { code: "C1", label: "Advanced", he: "מתקדם" },
  { code: "C2", label: "Proficiency", he: "שליטה מלאה" },
];

export default function LandingLevels() {
  return (
    <section className="px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-4">
          מדריך התוכניות: מהתחלה ועד שליטה מלאה
        </h2>
        <p className="text-center text-muted mb-16">
          מבחן הרמה שלנו ממקם אתכם בדיוק, לפי הסטנדרט הבינלאומי CEFR.
        </p>

        {/* The scrubber rail — the fill-width reveal is a real progress
            indicator, not decoration, so it keeps its own scroll trigger. */}
        <div className="relative pt-2">
          <div className="relative h-1.5 rounded-full bg-card-border overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "18%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2, ease: EASE_OUT }}
              className="absolute inset-y-0 start-0 rounded-full bg-primary"
            />
          </div>

          <div className="mt-3 grid grid-cols-6 gap-1 sm:gap-3">
            {LEVELS.map((level, i) => {
              const isCurrent = i === 1;
              return (
                <div key={level.code} className="flex flex-col items-center text-center">
                  <span
                    aria-hidden="true"
                    className={
                      "w-3 h-3 rounded-full mb-2.5 " + (i <= 1 ? "bg-primary" : "bg-card-border")
                    }
                  />
                  <EnglishText
                    as="span"
                    className={
                      "mt-1 font-extrabold text-sm sm:text-lg leading-none " +
                      (isCurrent ? "text-primary" : "text-foreground")
                    }
                  >
                    {level.code}
                  </EnglishText>
                  <span className="hidden sm:block mt-1 text-[11px] text-muted">{level.he}</span>
                  {isCurrent && (
                    <span className="mt-1.5 hidden sm:inline-block px-2 py-0.5 rounded-md bg-primary text-primary-ink text-[10px] font-bold">
                      אתם כאן
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

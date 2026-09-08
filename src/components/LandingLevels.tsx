"use client";

import { motion } from "framer-motion";
import EnglishText from "@/components/EnglishText";

// The CEFR ladder as a scrubber, not passport stamps — six chapter markers
// on one continuous timeline, the same rail a video's chapter list uses.
// Timecodes stand in for "how far the story has to run", not real minutes.
const LEVELS = [
  { code: "A1", time: "00:00", label: "Beginner", he: "מתחילים" },
  { code: "A2", time: "04:30", label: "Elementary", he: "בסיסי" },
  { code: "B1", time: "09:15", label: "Intermediate", he: "בינוני" },
  { code: "B2", time: "14:00", label: "Upper Int.", he: "בינוני-מתקדם" },
  { code: "C1", time: "19:20", label: "Advanced", he: "מתקדם" },
  { code: "C2", time: "24:00", label: "Proficiency", he: "שליטה מלאה" },
];

export default function LandingLevels() {
  return (
    <section className="px-4 py-24">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
        >
          מרמת התחלה ועד שליטה מלאה
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-muted mb-16"
        >
          מבחן הרמה שלנו ממקם אתכם בדיוק, לפי הסטנדרט הבינלאומי CEFR.
        </motion.p>

        {/* The scrubber rail. */}
        <div className="relative pt-2">
          <div className="relative h-1.5 rounded-full bg-card-border overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "18%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 start-0 rounded-full bg-primary"
            />
          </div>

          <div className="mt-3 grid grid-cols-6 gap-1 sm:gap-3">
            {LEVELS.map((level, i) => {
              const isCurrent = i === 1;
              return (
                <motion.div
                  key={level.code}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.06 }}
                  className="flex flex-col items-center text-center"
                >
                  <span
                    aria-hidden="true"
                    className={
                      "w-3 h-3 rounded-full mb-2.5 " + (i <= 1 ? "bg-primary" : "bg-card-border")
                    }
                  />
                  <EnglishText as="span" className="timecode text-[10px] sm:text-xs text-muted">
                    {level.time}
                  </EnglishText>
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
                    <span className="mt-1.5 hidden sm:inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                      אתם כאן
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

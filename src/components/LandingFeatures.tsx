"use client";

import { motion } from "framer-motion";
import { BookOpen, PenLine, MessageCircle, Headphones, BookOpenText, Brain, Gamepad2, Target } from "lucide-react";

const FEATURES = [
  { icon: BookOpen, title: "אוצר מילים לפי נושא", body: "ממספרים ובגדים ועד Business ו-Technology, עם הגייה, תרגום ודוגמאות." },
  { icon: PenLine, title: "דקדוק מלא", body: "מסלול שלם מ-A1 ועד C2 — כל הזמנים, כל המבנים, בלי לדלג." },
  { icon: MessageCircle, title: "דיבור עם AI", body: "תרגלו מצבים אמיתיים — ראיון עבודה, מסעדה, שדה תעופה — ותקבלו משוב מיידי." },
  { icon: Headphones, title: "האזנה", body: "שיחות, חדשות ופודקאסטים לפי רמה, עם כתוביות ותמלול." },
  { icon: BookOpenText, title: "קריאה חכמה", body: "לוחצים על כל מילה בטקסט ומקבלים פירוש, תרגום והגייה מיידית." },
  { icon: Brain, title: "חזרה חכמה", body: "המערכת זוכרת מה שכחתם, ומחזירה לכם בדיוק את זה ברגע הנכון." },
  { icon: Gamepad2, title: "גיימיפיקציה", body: "XP, רצף ימים, תגי הישג ואתגרים יומיים — כדי שתרצו לחזור כל יום." },
  { icon: Target, title: "מסלולים לפי מטרה", body: "אנגלית לעבודה, לטיולים, לראיונות או ללימודים אקדמיים." },
];

export default function LandingFeatures() {
  return (
    <section className="px-4 py-24 bg-background-2">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
        >
          הכל במקום אחד
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-muted mb-16 max-w-lg mx-auto"
        >
          לא עוד אתר לימוד רגיל — מערכת שלמה שמכירה אתכם ומתאימה את עצמה אליכם.
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
              className="bg-card border border-card-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon size={22} strokeWidth={2} />
              </span>
              <h3 className="mt-3 font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

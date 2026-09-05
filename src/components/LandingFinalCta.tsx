"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";

export default function LandingFinalCta() {
  return (
    <section className="px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold">מוכנים להתחיל?</h2>
        <p className="mt-4 text-muted text-lg">
          מבחן הרמה לוקח פחות מ־10 דקות. תדעו בדיוק איפה אתם עומדים — ולאן ללכת מכאן.
        </p>
        <MagneticButton className="mt-8 inline-block">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/signup"
              className="block px-10 py-4 rounded-xl bg-primary text-primary-ink font-medium text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
              התחילו ללמוד בחינם
            </Link>
          </motion.div>
        </MagneticButton>
      </motion.div>
    </section>
  );
}

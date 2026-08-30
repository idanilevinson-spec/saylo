"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import EnglishText from "@/components/EnglishText";
import { PRICING_PLANS, monthlyEquivalent } from "@/lib/subscriptions/plans";

const bestValue = PRICING_PLANS[PRICING_PLANS.length - 1];

export default function LandingPricingTeaser() {
  return (
    <section className="px-4 py-24 bg-background-2">
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-card-border rounded-3xl p-8 sm:p-10 shadow-xl shadow-primary/5"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-accent/15 text-accent-hover text-xs font-bold mb-4">
            {bestValue.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold">3 ימים חינם, בלי התחייבות</h2>
          <p className="mt-3 text-muted">
            ואז החל מ־
            <EnglishText as="span" className="font-bold text-foreground mx-1">
              ₪{monthlyEquivalent(bestValue)}
            </EnglishText>
            לחודש במסלול השנתי
          </p>
          <motion.div className="mt-8 inline-block" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/pricing"
              className="block px-8 py-3.5 rounded-xl bg-primary text-primary-ink font-medium hover:bg-primary-hover transition-colors"
            >
              לכל המסלולים
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { motion } from "framer-motion";

interface IconBadgeProps {
  icon: ComponentType<LucideProps>;
  tone?: "primary" | "accent" | "success" | "danger";
  className?: string;
}

const TONES = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent-hover",
  success: "bg-success-ink text-success",
  danger: "bg-danger-ink text-danger",
};

// Shared "big icon in a soft-tinted circle" treatment for empty/blocked/
// success states (HeartsGate, PremiumGate, review completion, etc.) —
// keeps that pattern consistent instead of ad-hoc emoji per screen. A
// single spring entrance here upgrades every one of those screens at once.
export default function IconBadge({ icon: Icon, tone = "primary", className = "" }: IconBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
      className={`inline-flex w-16 h-16 items-center justify-center rounded-full mb-4 ${TONES[tone]} ${className}`}
    >
      <Icon size={30} strokeWidth={2} />
    </motion.div>
  );
}

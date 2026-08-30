"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const progress = useMotionValue(0);
  const scaleX = useSpring(progress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      progress.set(max > 0 ? doc.scrollTop / max : 0);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [progress]);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 h-[3px] origin-right bg-gradient-to-l from-primary via-accent to-primary"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

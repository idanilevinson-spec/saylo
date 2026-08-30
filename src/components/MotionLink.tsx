"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// motion.create(Link) applies transform/animation props directly on the
// anchor element — no extra wrapper div, so it drops into existing
// className-based layouts unchanged. Used for standalone CTA links that
// want tap/hover feedback outside of a ContentCard grid.
const MotionLink = motion.create(Link);

export default MotionLink;

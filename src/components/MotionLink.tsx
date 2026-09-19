"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { motion, type MotionProps } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";

// motion.create(Link) applies transform/animation props directly on the
// anchor element — no extra wrapper div, so it drops into existing
// className-based layouts unchanged. Used for standalone CTA links that
// want tap/hover feedback outside of a ContentCard grid.
const BaseMotionLink = motion.create(Link);

// A default visible focus ring, baked in rather than left opt-in per
// caller — several pages (dashboard, games hub, etc.) forgot to pass one,
// so keyboard focus fell back to the browser default and was inconsistent
// with the rest of the app. Appending duplicate focus-visible utilities is
// harmless when a caller already sets its own.
const DEFAULT_FOCUS_CLASSES = "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

type MotionLinkProps = ComponentPropsWithoutRef<typeof BaseMotionLink> & MotionProps;

const MotionLink = forwardRef<HTMLAnchorElement, MotionLinkProps>(function MotionLink(
  { className, ...props },
  ref,
) {
  return (
    <BaseMotionLink
      ref={ref}
      className={className ? `${className} ${DEFAULT_FOCUS_CLASSES}` : DEFAULT_FOCUS_CLASSES}
      {...props}
    />
  );
});

export default MotionLink;

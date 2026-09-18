"use client";

import { useEffect, useRef } from "react";
import { useMotionReduced } from "@/lib/a11y/useMotionReduced";

interface BackgroundVideoProps {
  src: string;
  className?: string;
}

// A decorative, muted, looping video that stops when the visitor has asked
// for less motion (OS setting or the on-page accessibility toolbar).
export default function BackgroundVideo({ src, className = "" }: BackgroundVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useMotionReduced();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (reduced) video.pause();
    else video.play().catch(() => {});
  }, [reduced]);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      onLoadedData={() => {
        if (reduced) ref.current?.pause();
      }}
      className={className}
    />
  );
}

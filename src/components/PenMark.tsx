import type { ReactNode } from "react";

// The teacher's red pen: a hand-drawn stroke under the one phrase a heading
// turns on. It is the brand's single mark of emphasis (no gradient text, no
// coloured words), so use it at most once per section.
export default function PenMark({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-[-0.06em] -bottom-[0.12em] h-[0.3em] w-[calc(100%+0.12em)] overflow-visible text-pen"
      >
        <path
          d="M3 8.6c31-3.6 70-6 112-5.6 29 .3 55 2 82 4.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

"use client";

import { useReducer, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { clearActiveUnit, getActiveUnit, pathInUnit } from "@/lib/content/courseSession";

const subscribeNever = () => () => {};

// A slim strip on a page the learner opened from a course unit: which unit
// they are in, and the way back to it. Shows only on that unit's own steps.
export default function CourseReturnBar() {
  const pathname = usePathname();
  // sessionStorage only exists in the browser: nothing on the server pass.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  // Storage isn't React state: closing the bar clears it and re-renders.
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const active = mounted ? getActiveUnit() : null;
  const unit = active && pathInUnit(pathname, active.paths) ? active : null;

  if (!unit) return null;

  return (
    <div className="border-b border-card-border bg-background-2">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-3 min-h-11">
        <Link
          href={`/course/${unit.id}`}
          className="group flex min-w-0 flex-1 items-center gap-2 py-2 text-sm rounded focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
          <span className="font-bold text-primary-hover shrink-0">חזרה ליחידה</span>
          <span className="truncate text-muted">
            <span className="chyron text-[0.95em]" dir="ltr">
              {unit.level}
            </span>{" "}
            · יחידה {unit.number} · {unit.titleHe}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => {
            clearActiveUnit();
            rerender();
          }}
          aria-label="להסתיר את הקישור ליחידה"
          className="shrink-0 inline-flex w-9 h-9 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-card transition-colors focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

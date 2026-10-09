import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Target } from "lucide-react";
import { CEFR_NAME_HE } from "@/lib/content/levelOrder";
import type { CefrLevel } from "@/types/database";

// The top of every practice area: what it is, and the learner's level in
// this skill — so the page opens on "this is for you", not on a catalog.
export default function AreaHeader({
  icon: Icon,
  title,
  description,
  level,
  levelLabel,
  signedIn = true,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  level: CefrLevel | null;
  // e.g. "הרמה שלכם בדקדוק"
  levelLabel: string;
  signedIn?: boolean;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 max-w-xl">
        <span className="inline-flex w-11 h-11 items-center justify-center rounded-lg bg-primary text-primary-ink">
          <Icon size={21} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">{title}</h1>
        <p className="mt-2 text-muted leading-relaxed">{description}</p>
        {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
      </div>
      {level ? (
        <div className="flex items-center gap-3 rounded-lg border border-card-border bg-card px-4 py-3">
          <span className="chyron text-4xl leading-none text-primary" dir="ltr">
            {level}
          </span>
          <span className="text-sm leading-tight">
            <span className="block text-muted">{levelLabel}</span>
            <span className="block font-bold">{CEFR_NAME_HE[level]}</span>
          </span>
        </div>
      ) : (
        signedIn && (
          <Link
            href="/placement"
            className="game-press inline-flex items-center gap-2.5 rounded-lg border border-accent/40 bg-accent/[0.07] px-4 py-3 text-sm transition-[background-color,transform] duration-150 hover:bg-accent/[0.12]"
          >
            <Target size={18} aria-hidden="true" className="text-accent-hover shrink-0" />
            <span className="leading-tight">
              <span className="block font-bold">עוד לא יודעים את הרמה?</span>
              <span className="block text-muted">מבחן רמה קצר, ואז נסדר הכל לפיה</span>
            </span>
          </Link>
        )
      )}
    </header>
  );
}

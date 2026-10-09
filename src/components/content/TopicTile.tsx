import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import EnglishText from "@/components/EnglishText";
import type { CefrLevel } from "@/types/database";

// One piece of content in a practice area: English title, Hebrew title, a
// line of facts, and the level — the same tile in every area.
export default function TopicTile({
  href,
  titleEn,
  titleHe,
  level,
  meta,
  done = false,
}: {
  href?: string;
  titleEn: string;
  titleHe: string;
  level: CefrLevel;
  meta?: ReactNode;
  done?: boolean;
}) {
  const body = (
    <>
      <span aria-hidden="true" className={`absolute inset-y-0 start-0 w-1 ${done ? "bg-success" : "bg-transparent"}`} />
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <EnglishText as="span" className="block text-right text-lg font-bold leading-snug">
            {titleEn}
          </EnglishText>
          <span className="block text-sm text-muted">{titleHe}</span>
        </span>
        <span className="chyron shrink-0 rounded-md bg-background-2 px-1.5 py-0.5 text-sm text-primary" dir="ltr">
          {level}
        </span>
      </span>
      {(meta || href) && (
        <span className="mt-auto pt-3 flex items-center gap-3 text-xs text-muted tabular-nums">
          {meta}
          {href && (
            <ChevronLeft size={16} aria-hidden="true" className="ms-auto shrink-0 transition-transform group-hover:-translate-x-0.5" />
          )}
        </span>
      )}
    </>
  );

  const cls =
    "group relative flex h-full flex-col overflow-hidden rounded-lg border border-card-border bg-card p-4 text-start";
  return href ? (
    <Link
      href={href}
      className={`game-press ${cls} transition-[border-color,transform,box-shadow] duration-150 hover:border-primary/50 hover:shadow-[0_12px_30px_-18px_rgb(0_0_0/0.5)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2`}
    >
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

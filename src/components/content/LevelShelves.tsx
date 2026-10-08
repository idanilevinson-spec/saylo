import type { ReactNode } from "react";
import { shelveByLevel, CEFR_NAME_HE } from "@/lib/content/levelOrder";
import type { CefrLevel } from "@/types/database";

// A content list arranged by the learner's level: a highlighted "at your
// level" shelf, then "a step around it", then the rest grouped by level.
// Used by every practice area so they all read the same way.
export default function LevelShelves<T>({
  items,
  level,
  levelOf,
  keyOf,
  renderItem,
  gridClassName = "grid sm:grid-cols-2 gap-3",
  emptyAtLevel = "עוד אין כאן תוכן ברמה הזו בדיוק. הנה הכי קרוב אליה:",
}: {
  items: T[];
  level: CefrLevel | null;
  levelOf: (item: T) => CefrLevel;
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  gridClassName?: string;
  emptyAtLevel?: string;
}) {
  const { atLevel, near, rest } = shelveByLevel(items, level, levelOf);
  const grid = (list: T[]) => (
    <ul className={gridClassName}>
      {list.map((item) => (
        <li key={keyOf(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-12">
      {level && (
        <section aria-labelledby="shelf-mine" className="relative rounded-lg bg-primary/[0.05] ring-1 ring-primary/25 p-4 sm:p-5">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-primary" />
          <h2 id="shelf-mine" className="flex flex-wrap items-baseline gap-x-2 text-xl font-black tracking-tight">
            ברמה שלכם
            <span className="chyron text-2xl text-primary" dir="ltr">
              {level}
            </span>
            <span className="text-sm font-medium text-muted">
              {atLevel.length > 0 ? `${atLevel.length} ${atLevel.length === 1 ? "פריט" : "פריטים"}` : ""}
            </span>
          </h2>
          <div className="mt-4">{atLevel.length > 0 ? grid(atLevel) : <p className="text-sm text-muted">{emptyAtLevel}</p>}</div>
          {atLevel.length === 0 && near.length > 0 && <div className="mt-3">{grid(near)}</div>}
        </section>
      )}

      {level && near.length > 0 && atLevel.length > 0 && (
        <section aria-labelledby="shelf-near">
          <h2 id="shelf-near" className="text-lg font-bold">
            צעד מסביב לרמה שלכם
          </h2>
          <p className="mt-0.5 text-sm text-muted">רמה אחת מעל לאתגר, ורמה אחת מתחת לחיזוק.</p>
          <div className="mt-3">{grid(near)}</div>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby="shelf-rest" className="space-y-8">
          {level && (
            <h2 id="shelf-rest" className="text-lg font-bold">
              כל שאר הרמות
            </h2>
          )}
          {rest.map((group) => (
            <div key={group.level}>
              <h3 className="flex items-baseline gap-2 font-bold">
                <span className="chyron text-2xl text-primary" dir="ltr">
                  {group.level}
                </span>
                {CEFR_NAME_HE[group.level]}
              </h3>
              <div className="mt-3">{grid(group.items)}</div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

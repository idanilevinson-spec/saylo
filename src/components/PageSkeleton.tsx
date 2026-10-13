// What a page looks like while its data is on the way, as quiet blocks in
// the real page's footprint, so a tap swaps to this at once instead of
// leaving the old page frozen, and nothing jumps when the content lands.
// Rendered from loading.tsx files, which Next prefetches. A loading.tsx
// also covers every page nested under it, so each shape of page gets its
// own skeleton next to it: the area grid, the exercise, and a detail page.

function Block({ className }: { className: string }) {
  return <div className={`rounded-lg bg-background-2 ${className}`} />;
}

// An area: header (icon, title, description) and the topic tiles, as in
// AreaHeader + the tile grid.
export default function PageSkeleton() {
  return (
    <div role="status" aria-label="טוען" className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <Block className="w-11 h-11" />
        <Block className="mt-4 h-9 w-44" />
        <div className="mt-3 h-4 w-full max-w-md rounded bg-background-2" />
        <div className="mt-2 h-4 w-2/3 max-w-sm rounded bg-background-2" />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-28 rounded-lg border border-card-border bg-card" />
          ))}
        </div>
      </div>
    </div>
  );
}

// One exercise (ExercisePlayer): the game HUD (exit, title, round track)
// above the stage plate with a prompt and four answer rows.
export function ExerciseSkeleton() {
  return (
    <div role="status" aria-label="טוען" className="max-w-2xl mx-auto px-4 pt-6 pb-12">
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="mb-5 flex items-center gap-3">
          <Block className="w-10 h-10 shrink-0" />
          <div className="flex-1">
            <Block className="h-4 w-32" />
            <Block className="mt-1.5 h-3.5 w-24" />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-card-border bg-card p-5 sm:p-7">
          <span className="absolute inset-x-0 top-0 h-1 bg-primary/40" />
          <Block className="h-5 w-3/4" />
          <Block className="mt-2 h-5 w-1/2" />
          <div className="mt-6 space-y-2.5">
            {Array.from({ length: 4 }, (_, i) => (
              <Block key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// A single item inside an area (a grammar topic, a text, a clip, a prompt):
// back link, title, a line of detail, then body text.
export function DetailSkeleton() {
  return (
    <div role="status" aria-label="טוען" className="max-w-3xl mx-auto px-4 pt-8 pb-16">
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <Block className="h-4 w-28" />
        <Block className="mt-5 h-9 w-2/3" />
        <Block className="mt-3 h-4 w-40" />
        <div className="mt-8 rounded-lg border border-card-border bg-card p-6 space-y-3">
          {["w-full", "w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"].map((w, i) => (
            <div key={i} className={`h-4 rounded bg-background-2 ${w}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

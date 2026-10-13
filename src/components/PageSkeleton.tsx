// What a practice area looks like while its data is on the way: the same
// header (icon, title, description) and tile grid as AreaHeader + the
// topic tiles, as quiet blocks. Rendered from each area's loading.tsx, which
// Next prefetches, so a tap swaps to this at once instead of leaving the old
// page frozen until the server answers. Same footprint as the real page, so
// nothing jumps when the content lands.
export default function PageSkeleton() {
  return (
    <div role="status" aria-label="טוען" className="max-w-4xl mx-auto px-4 pt-10 pb-16">
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="w-11 h-11 rounded-lg bg-background-2" />
        <div className="mt-4 h-9 w-44 rounded-lg bg-background-2" />
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

import type { UnitProgress } from "@/lib/content/courseProgress";

// A unit's steps (and its check) as a row of short segments: done, started
// or still to do. Decorative; the count beside it carries the number.
export default function StepTrack({ progress, onField = false }: { progress: UnitProgress; onField?: boolean }) {
  const segments = [...progress.steps.map((s) => s.status), progress.checkPassed ? "done" : "todo"];
  const tone = (status: string) =>
    onField
      ? status === "done"
        ? "bg-primary-ink"
        : status === "started"
          ? "bg-primary-ink/50"
          : "bg-primary-ink/20"
      : status === "done"
        ? "bg-success"
        : status === "started"
          ? "bg-primary"
          : "bg-card-border";
  return (
    <span className="flex gap-1" aria-hidden="true">
      {segments.map((status, i) => (
        <span key={i} className={`h-1.5 w-4 sm:w-5 rounded-full ${tone(status)}`} />
      ))}
    </span>
  );
}

const LABELS: Record<string, string> = {
  draft: "טיוטה",
  ai_generated_pending_review: "ממתין לבדיקה",
  published: "פורסם",
  open: "פתוח",
  resolved: "טופל",
  dismissed: "נדחה",
  trialing: "ניסיון",
  active: "פעיל",
  canceled: "מבוטל",
  past_due: "באיחור",
  expired: "פג תוקף",
  not_required: "לא נדרש",
  pending: "ממתין",
  granted: "אושר",
  denied: "נדחה",
};

const TONES: Record<string, string> = {
  draft: "bg-background-2 text-muted",
  ai_generated_pending_review: "bg-accent/15 text-accent-hover",
  published: "bg-success-ink text-success",
  open: "bg-danger-ink text-danger",
  resolved: "bg-success-ink text-success",
  dismissed: "bg-background-2 text-muted",
  trialing: "bg-accent/15 text-accent-hover",
  active: "bg-success-ink text-success",
  canceled: "bg-background-2 text-muted",
  past_due: "bg-danger-ink text-danger",
  expired: "bg-background-2 text-muted",
  not_required: "bg-background-2 text-muted",
  pending: "bg-accent/15 text-accent-hover",
  granted: "bg-success-ink text-success",
  denied: "bg-danger-ink text-danger",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
        TONES[status] ?? "bg-background-2 text-muted"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}

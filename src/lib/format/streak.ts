// "רצף של 1 ימים" isn't Hebrew: one day and two days have their own forms.
export function streakLabel(days: number): string {
  if (days === 1) return "רצף של יום אחד";
  if (days === 2) return "רצף של יומיים";
  return `רצף של ${days} ימים`;
}

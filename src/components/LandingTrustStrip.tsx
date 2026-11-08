// The plain facts, set once and left still: the kind of line a printed
// prospectus runs under its title. (It was a scrolling news ticker; motion
// that repeats forever was the loudest "template" signal on the page.)
const ITEMS = [
  "3 ימים חינם, בלי כרטיס אשראי",
  "מבחן רמה של כ-10 דקות",
  "שש רמות, מ-A1 עד C2",
  "תרגול לבגרות: 3, 4 ו-5 יח״ל",
  "זיהוי דיבור אמיתי בתרגול הגייה",
  "ביטול בכל עת",
];

export default function LandingTrustStrip() {
  return (
    <div className="border-y border-card-border bg-background-2 px-4">
      <ul className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-5 gap-y-1.5 py-4 text-sm text-muted">
        {ITEMS.map((item, i) => (
          <li key={item} className="flex items-center gap-5">
            {i > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted/50" />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

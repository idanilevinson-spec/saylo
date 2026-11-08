// What happens after signing up, in the order it happens. The numbers are
// the order itself (the first step is the only one-off), set small in the
// teacher's red, not as giant decorative 01/02/03.
const STEPS = [
  {
    title: "מבחן רמה",
    en: "Placement test",
    body: "שאלות באוצר מילים, דקדוק, קריאה והאזנה. בסוף מקבלים רמה לכל מיומנות בנפרד, כי קריאה ודיבור לא תמיד באותה רמה.",
  },
  {
    title: "התוכנית היומית",
    en: "Today's plan",
    body: "שישה תרגילים קצרים: דקדוק, מילים, קריאה, האזנה, כתיבה ושיחה. כל אחד ברמה שלכם במיומנות שלו.",
  },
  {
    title: "שיחה עם המורה",
    en: "Talk it through",
    body: "בכתב או בקול. המורה ממשיך את השיחה ומתקן את הטעות שחשובה, לא כל פסיק.",
  },
  {
    title: "הטעויות חוזרות",
    en: "Mistakes come back",
    body: "מילה שטעיתם בה חוזרת אליכם למחרת, ואחר כך במרווחים הולכים וגדלים, עד שהיא נשארת.",
  },
];

export default function LandingSteps() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-black leading-[1.1]">מה קורה אחרי ההרשמה</h2>
        <p lang="en" dir="ltr" className="gloss mt-2 text-right text-lg">What happens after you sign up</p>
        <p className="mt-4 max-w-xl text-lg text-muted leading-relaxed">ארבעה שלבים, ורק הראשון קורה פעם אחת.</p>

        <ol className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-foreground/15 pt-5">
              <p className="flex items-baseline gap-3">
                <span aria-hidden="true" dir="ltr" className="font-display text-2xl font-bold text-pen tabular-nums">
                  {i + 1}.
                </span>
                <span className="font-display text-2xl font-bold">{step.title}</span>
                <span lang="en" dir="ltr" className="gloss text-base">{step.en}</span>
              </p>
              <p className="mt-2.5 max-w-md text-muted leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

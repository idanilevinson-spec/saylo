import EnglishText from "@/components/EnglishText";

// The site's one marquee (design-taste-frontend's max-one-per-page rule),
// spent on the single place it's actually earned: a real news ticker is
// this world's own thesis, not a decorative reach. A static duplicate
// list, not fetched data — motion.div wrapping isn't needed since the
// CSS animation runs on mount regardless.
const ITEMS = [
  "3 ימים ראשונים חינם",
  "בלי כרטיס אשראי",
  "ביטול בכל עת",
  "מורה AI זמין 24/7",
  "תרגול דיבור עם זיהוי קול אמיתי",
];

export default function LandingTrustStrip() {
  return (
    <div className="bg-accent overflow-hidden">
      <div className="flex items-stretch">
        <EnglishText
          as="span"
          className="chyron shrink-0 flex items-center px-4 py-2 bg-foreground text-background text-xs tracking-[0.15em]"
        >
          Now
        </EnglishText>
        <div className="flex-1 overflow-hidden py-2.5">
          <div className="ticker-track flex w-max gap-12 whitespace-nowrap">
            {[...ITEMS, ...ITEMS].map((item, i) => (
              <span key={i} className="text-sm font-bold text-accent-ink">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

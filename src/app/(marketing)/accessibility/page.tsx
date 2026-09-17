import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "הצהרת נגישות — Saylo",
};

export default function AccessibilityPage() {
  return (
    <>
      <section className="px-4 pt-16 pb-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">הצהרת נגישות</h1>
        <p className="mt-2 text-sm text-muted">עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}</p>

        <div className="mt-8 space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold">המחויבות שלנו לנגישות</h2>
            <p className="mt-2 text-muted">
              אנחנו ב-Saylo רואים חשיבות רבה במתן שירות שוויוני, מכבד ונגיש לכלל המשתמשים, כולל אנשים עם
              מוגבלויות. אנו פועלים להנגשת האתר והאפליקציה בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות
              נגישות לשירות), התשע״ג-2013, ובהתאם לתקן הישראלי ת״י 5568 המבוסס על הנחיות WCAG 2.0 ברמה AA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">אמצעי הנגישות שיושמו</h2>
            <ul className="mt-2 space-y-1.5 text-muted list-disc list-inside">
              <li>
                תפריט נגישות צף בפינת המסך המאפשר הגדלת טקסט, מצב ניגודיות גבוהה, גווני אפור, הדגשת קישורים, ריווח
                קריאה מוגדל ועצירת אנימציות — זמין בכל עמוד באתר ובאפליקציה.
              </li>
              <li>ניגודיות צבעים העומדת בתקן WCAG AA בין טקסט לרקע, במצב בהיר ובמצב כהה כאחד.</li>
              <li>ניווט מלא באמצעות מקלדת לכל הפעולות באתר ובאפליקציה, כולל מצבי פוקוס (focus) גלויים לעין.</li>
              <li>תמיכה בטכנולוגיות מסייעות (כגון קוראי מסך) — תיוג ARIA, תוויות נגישות לכפתורי אייקון, והכרזות סטטוס לתוצאות תרגילים ומשוב בזמן אמת.</li>
              <li>קישור &quot;דלגו לתוכן הראשי&quot; המאפשר לדלג על תפריט הניווט החוזר בכל עמוד.</li>
              <li>כיבוד הגדרת &quot;הפחתת תנועה&quot; (Reduce Motion) של מערכת ההפעלה — אנימציות מושבתות אוטומטית למשתמשים שבחרו בכך.</li>
              <li>אזורי נגיעה (touch targets) בגודל מספק, ותצוגה שאינה חוסמת הגדלת טקסט או תנועות זום.</li>
              <li>מבנה סמנטי של כותרות, טפסים והודעות שגיאה, המאפשר ניווט מובנה עם טכנולוגיות מסייעות.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">מגבלות נגישות ידועות</h2>
            <p className="mt-2 text-muted">
              חלק מהתרגילים באתר מבוססים על תוכן שמע (זיהוי דיבור, הקראה) המהווים חלק מהותי מתהליך לימוד השפה
              המדוברת. עבור משתמשים המתקשים בשימוש בתכנים אלו, קיימות חלופות מבוססות טקסט ברוב התרגילים. אנו
              ממשיכים לעבוד על שיפור הנגישות של הרכיבים הקוליים באתר ובאפליקציה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">פנייה בנושאי נגישות</h2>
            <p className="mt-2 text-muted">
              נתקלתם בבעיית נגישות באתר או באפליקציה, או שיש לכם הצעה לשיפור? נשמח שתפנו אלינו לרכז הנגישות מטעם
              Saylo בכתובת{" "}
              <a href="mailto:support@saylolearn.com" className="text-primary hover:underline">
                support@saylolearn.com
              </a>
              . נשתדל להשיב ולטפל בפנייה בהקדם האפשרי.
            </p>
          </section>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

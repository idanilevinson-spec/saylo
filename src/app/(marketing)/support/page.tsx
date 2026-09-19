import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { BusinessDetails, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "תמיכה — Saylo",
  description: "יצירת קשר, ביטול מנוי, מחיקת חשבון ותשובות לשאלות נפוצות על Saylo.",
};

const linkClass = "text-primary hover:underline";

export default function SupportPage() {
  return (
    <LegalPage title="תמיכה">
      <LegalSection title="יצירת קשר">
        <p>נתקלתם בבעיה או שיש לכם שאלה? כתבו לנו או התקשרו, ונחזור אליכם בהקדם האפשרי.</p>
        <BusinessDetails />
      </LegalSection>

      <LegalSection title="איך מבטלים מנוי">
        <p>
          <strong className="text-foreground">מנוי שנרכש באתר:</strong> היכנסו לעמוד הפרופיל ולחצו &quot;ביטול
          המנוי&quot;. הגישה נשארת עד סוף התקופה ששולמה, ולא יהיה חיוב נוסף.
        </p>
        <p>
          <strong className="text-foreground">מנוי שנרכש באפליקציית ה-iPhone:</strong> פתחו את הגדרות ה-iPhone, לחצו
          על השם שלכם, ואז &quot;מינויים&quot; ובחרו ב-Saylo. את הביטול צריך לבצע לפחות 24 שעות לפני סוף התקופה. בקשת
          החזר מגישים ל-Apple בכתובת reportaproblem.apple.com.
        </p>
        <p>
          פרטים על ביטולים והחזרים ב
          <Link href="/refunds" className={linkClass}>
            מדיניות הביטולים וההחזרים
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="איך מוחקים חשבון">
        <p>
          בעמוד הפרופיל, בתחתית העמוד, לחצו &quot;מחיקת החשבון&quot; ואשרו. החשבון וכל הנתונים שקשורים אליו נימחקים
          לצמיתות. אם רכשתם מנוי דרך App Store, בטלו אותו קודם בהגדרות ה-Apple ID, כי מחיקת החשבון לא מבטלת אותו.
        </p>
      </LegalSection>

      <LegalSection title="שאלות נפוצות">
        <p>
          <strong className="text-foreground">שכחתי סיסמה.</strong> אפשר לאפס אותה ב
          <Link href="/reset-password" className={linkClass}>
            עמוד איפוס הסיסמה
          </Link>
          .
        </p>
        <p>
          <strong className="text-foreground">השיחה עם מורה ה-AI לא זמינה לי.</strong> שיחה עם המורה, בטקסט ובקול,
          זמינה רק במנוי בתשלום, ולא בתקופת הניסיון החינם. יש גם מגבלת שימוש הוגן, כמפורט ב
          <Link href="/terms" className={linkClass}>
            תנאי השימוש
          </Link>
          .
        </p>
        <p>
          <strong className="text-foreground">אני מתחת לגיל 18 ומתבקש אישור הורה.</strong> הקלטת קול ושיחה עם המורה
          דורשות אישור של הורה או אפוטרופוס. במסך שמופיע אפשר להזין את האימייל של ההורה ולשלוח לו קישור לאישור.
        </p>
        <p>
          <strong className="text-foreground">איך מפסיקים לקבל תזכורות ודוחות במייל?</strong> בעמוד הפרופיל, בחלק
          &quot;התראות&quot;, אפשר לכבות כל אחד מהם.
        </p>
        <p>
          <strong className="text-foreground">בעיית נגישות.</strong> פנו אלינו בפרטים למעלה, או קראו את{" "}
          <Link href="/accessibility" className={linkClass}>
            הצהרת הנגישות
          </Link>
          .
        </p>
        <p>
          <strong className="text-foreground">פרטיות ונתונים.</strong> מה אנחנו אוספים ואיך אפשר לעיין במידע או
          למחוק אותו: ב
          <Link href="/privacy" className={linkClass}>
            מדיניות הפרטיות
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

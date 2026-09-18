import type { Metadata } from "next";
import LegalPage, { EmailLink, LegalSection, LegalList, PhoneLink } from "@/components/LegalPage";
import { ACCESSIBILITY_COORDINATOR_NAME, ACCESSIBILITY_COORDINATOR_PHONE } from "@/lib/legal/siteInfo";

export const metadata: Metadata = {
  title: "הצהרת נגישות — Saylo",
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="הצהרת נגישות">
      <LegalSection title="המחויבות שלנו לנגישות">
        <p>
          אנחנו ב-Saylo רוצים שכל אחד יוכל ללמוד באתר ובאפליקציה, כולל אנשים עם מוגבלות. אנחנו פועלים להנגשת השירות
          לפי תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013, ולפי התקן הישראלי ת״י 5568
          המבוסס על הנחיות WCAG ברמה AA.
        </p>
      </LegalSection>

      <LegalSection title="התאמות הנגישות שבוצעו">
        <LegalList>
          <li>
            תפריט נגישות צף שמאפשר להגדיל טקסט, להפעיל ניגודיות גבוהה או גווני אפור, להדגיש קישורים, להגדיל ריווח
            קריאה ולעצור אנימציות. הוא זמין בכל עמוד באתר ובאפליקציה.
          </li>
          <li>
            ניגודיות צבעים לפי דרישות רמה AA, במצב בהיר ובמצב כהה: יחס של 4.5:1 לפחות לטקסט, ו-3:1 לפחות לגבולות של
            שדות טופס.
          </li>
          <li>ניווט במקלדת בפעולות המרכזיות בשירות, עם מסגרת פוקוס גלויה.</li>
          <li>
            תמיכה בקוראי מסך: תוויות לכפתורים ולשדות, והכרזה על תוצאות תרגילים והודעות שגיאה בזמן אמת.
          </li>
          <li>קישור &quot;דלגו לתוכן הראשי&quot; בתחילת כל עמוד.</li>
          <li>
            כיבוד הגדרת &quot;הפחתת תנועה&quot; של מערכת ההפעלה: אנימציות מושבתות אוטומטית למי שבחר בכך.
          </li>
          <li>אפשרות להגדיל טקסט ולהתקרב במסך, בלי שהתצוגה תיחסם.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="מגבלות נגישות ידועות">
        <p>
          חלק מהתרגילים מבוססים על שמע: הקראה וזיהוי דיבור הם חלק מהותי מלימוד שפה מדוברת. במרבית התרגילים
          האלה יש חלופה בטקסט. אנחנו ממשיכים לשפר את הנגישות של הרכיבים הקוליים. ייתכן שחלקים נוספים בשירות עדיין
          אינם נגישים במלואם.
        </p>
      </LegalSection>

      <LegalSection title="נתקלתם בבעיה? פנו אלינו">
        <p>
          מצאתם בעיית נגישות או שיש לכם הצעה לשיפור? פנו אל רכז הנגישות של Saylo. נטפל בפנייה בהקדם האפשרי.
        </p>
        <LegalList>
          {ACCESSIBILITY_COORDINATOR_NAME && <li>שם: {ACCESSIBILITY_COORDINATOR_NAME}</li>}
          {ACCESSIBILITY_COORDINATOR_PHONE && (
            <li>
              טלפון: <PhoneLink />
            </li>
          )}
          <li>
            אימייל: <EmailLink />
          </li>
        </LegalList>
      </LegalSection>
    </LegalPage>
  );
}

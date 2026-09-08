import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "מדיניות פרטיות — Saylo",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="px-4 pt-16 pb-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">מדיניות פרטיות</h1>
        <p className="mt-2 text-sm text-muted">עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}</p>

        <div className="mt-8 space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold">איזה מידע אנחנו אוספים</h2>
            <p className="mt-2 text-muted">
              כדי לספק את השירות אנחנו אוספים: כתובת המייל שלכם, שם התצוגה, גיל וקבוצת גיל (לצורך התאמת תוכן
              ואישור הורים לקטינים), ונתוני התקדמות בלימוד — תשובות לתרגילים, ציונים, רצף ימים, XP ותגי הישג.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">הקלטות קול</h2>
            <p className="mt-2 text-muted">
              בתרגילי הגייה, מבחן הדיבור, ושיחה קולית עם המורה ה-AI, האודיו שאתם מקליטים נשלח ל-Microsoft Azure
              Speech Services לצורך זיהוי דיבור ותמלול, ואינו נשמר על ידינו לאחר עיבוד ההקלטה.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">תשלומים</h2>
            <p className="mt-2 text-muted">
              עיבוד התשלומים מתבצע על ידי Stripe. אנחנו לא שומרים פרטי כרטיס אשראי בשרתים שלנו — כל המידע הפיננסי
              מנוהל ישירות מול Stripe בהתאם לתקני האבטחה שלהם.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">איך משתמשים במידע</h2>
            <p className="mt-2 text-muted">
              המידע משמש להתאמת מסלול הלימוד האישי שלכם, מעקב אחר התקדמות, שליחת תזכורות ודוחות התקדמות (רק אם
              בחרתם לאפשר זאת בהגדרות הפרופיל), ותפעול המנוי שלכם. אנחנו לא מוכרים את המידע שלכם לצדדים שלישיים.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">מחיקת חשבון ומידע</h2>
            <p className="mt-2 text-muted">
              ניתן לבקש מחיקה מלאה של החשבון והמידע הנלווה בכל עת דרך הגדרות הפרופיל, או בפנייה אלינו במייל.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">יצירת קשר</h2>
            <p className="mt-2 text-muted">
              שאלות בנוגע למדיניות הפרטיות ניתן לשלוח לכתובת{" "}
              <a href="mailto:support@saylolearn.com" className="text-primary hover:underline">
                support@saylolearn.com
              </a>
              .
            </p>
          </section>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

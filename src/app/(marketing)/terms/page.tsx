import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "תנאי שימוש — Saylo",
};

export default function TermsPage() {
  return (
    <>
      <section className="px-4 pt-16 pb-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">תנאי שימוש</h1>
        <p className="mt-2 text-sm text-muted">עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}</p>

        <div className="mt-8 space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold">השירות</h2>
            <p className="mt-2 text-muted">
              Saylo הוא שירות ללימוד אנגלית מקוון, הכולל תרגילי אוצר מילים, דקדוק, קריאה, האזנה, כתיבה ודיבור,
              ומורה AI אישי. השימוש בשירות כפוף לתנאים המפורטים כאן.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">ניסיון חינם ומנוי</h2>
            <p className="mt-2 text-muted">
              כל חשבון חדש מקבל 3 ימי ניסיון חינם עם גישה מלאה לכל התכונות, ללא צורך בכרטיס אשראי. בסיום תקופת
              הניסיון, גישה לתכונות פרימיום מותנית ברכישת מנוי בתשלום. ניתן לבטל את המנוי בכל עת — הביטול ייכנס
              לתוקף בסוף מחזור החיוב הנוכחי, ולא יחויב חיוב נוסף לאחר מכן.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">תשלומים וחיובים</h2>
            <p className="mt-2 text-muted">
              תשלומים מעובדים באמצעות Stripe. מנוי מתחדש אוטומטית בסוף כל מחזור, אלא אם בוטל מראש. המחירים
              המוצגים באתר עשויים להשתנות; שינויים לא ישפיעו על מחזור חיוב שכבר שולם.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">שימוש הוגן</h2>
            <p className="mt-2 text-muted">
              החשבון אישי ואינו ניתן להעברה. אין להשתמש בשירות למטרות בלתי חוקיות או לניסיון לעקוף את מנגנוני
              האבטחה או ההגבלות של השירות.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">שינויים בשירות</h2>
            <p className="mt-2 text-muted">
              אנחנו עשויים לעדכן, להוסיף או להסיר תכונות מהשירות מעת לעת. במקרה של שינוי מהותי בתנאים אלו, נודיע
              על כך למשתמשים הרשומים.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">יצירת קשר</h2>
            <p className="mt-2 text-muted">
              שאלות בנוגע לתנאי השימוש ניתן לשלוח לכתובת{" "}
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

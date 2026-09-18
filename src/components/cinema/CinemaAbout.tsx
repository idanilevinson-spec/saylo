import ScrollRevealText from "@/components/cinema/ScrollRevealText";
import WordsPullUpMultiStyle from "@/components/cinema/WordsPullUpMultiStyle";

// Real product facts only (see PRODUCT.md): the CEFR placement test, the six
// independently-leveled skills, the AI teacher that remembers recurring
// mistakes — and the same "have went / have gone" example the site's own
// live correction demo already uses.
const BODY =
  "מתחילים במבחן רמה לפי תקן CEFR, שמאתר את הרמה שלכם בכל אחד משישה תחומים בנפרד. משם נבנה מסלול אישי שמתעדכן בכל תרגול. וכשאתם כותבים have went במקום have gone, המורה לא רק מתקן — הוא זוכר, ומחזיר אתכם לאותה טעות בדיוק ברגע שכדאי, עד שהיא נעלמת.";

export default function CinemaAbout() {
  return (
    <section id="about" className="bg-black px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl rounded-2xl bg-[#101010] px-6 py-16 text-center sm:px-12 sm:py-24 md:rounded-[2rem] md:py-32">
        <p className="text-xs text-primary sm:text-sm">איך זה עובד</p>

        <h2
          className="mx-auto mt-6 max-w-3xl text-3xl leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
          style={{ color: "#E1E0CC" }}
        >
          <WordsPullUpMultiStyle
            segments={[
              { text: "מבחן רמה אחד, ומורה שלא שוכח אף טעות.", className: "font-normal", dir: "rtl" },
              { text: "The English you always wanted.", className: "font-serif italic", dir: "ltr", lang: "en" },
              { text: "ומסלול שבנוי סביב מה שקשה לכם.", className: "font-normal", dir: "rtl" },
            ]}
          />
        </h2>

        <ScrollRevealText
          text={BODY}
          className="mx-auto mt-10 max-w-2xl text-sm leading-relaxed text-[#DEDBC8] sm:text-base md:mt-14 md:text-lg"
        />
      </div>
    </section>
  );
}

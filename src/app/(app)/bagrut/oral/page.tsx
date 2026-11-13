import type { Metadata } from "next";
import ParentalConsentGuard from "@/components/ParentalConsentGuard";
import AiConsentGate from "@/components/AiConsentGate";
import PremiumGate from "@/components/PremiumGate";
import BagrutOralExam from "@/components/bagrut/oral/BagrutOralExam";

export const metadata: Metadata = {
  title: "סימולציה של בגרות בעל פה | Saylo",
};

// Recording needs a guardian's consent for minors and the AI consent, like
// the speaking test; the simulation itself is in the subscription and the
// trial (one in the trial, enforced by the grading route).
export default function BagrutOralPage() {
  return (
    <ParentalConsentGuard title="בגרות בעל פה">
      <AiConsentGate>
        <PremiumGate featureName="סימולציה של בגרות בעל פה">
          <BagrutOralExam />
        </PremiumGate>
      </AiConsentGate>
    </ParentalConsentGuard>
  );
}

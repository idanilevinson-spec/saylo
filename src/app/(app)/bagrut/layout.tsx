import BagrutSubnav from "@/components/BagrutSubnav";
import { getBagrutLearnerState } from "@/lib/content/bagrut/learnerState";

export default async function BagrutLayout({ children }: { children: React.ReactNode }) {
  // The learner's track decides the sub-menu: one "my questionnaires" tab
  // instead of three track tabs. Choosing a track refreshes the route, so
  // the menu follows.
  const { track } = await getBagrutLearnerState();
  return (
    <>
      <BagrutSubnav track={track} />
      {children}
    </>
  );
}

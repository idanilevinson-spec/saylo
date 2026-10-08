import BagrutSubnav from "@/components/BagrutSubnav";

export default function BagrutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BagrutSubnav />
      {children}
    </>
  );
}

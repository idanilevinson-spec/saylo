import SmoothScroll from "@/components/SmoothScroll";

// The public pages share one addition the app doesn't get: smoothed
// mouse-wheel scrolling (see SmoothScroll for where it switches itself off).
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SmoothScroll />
      {children}
    </>
  );
}

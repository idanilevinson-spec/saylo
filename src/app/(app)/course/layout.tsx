import type { Metadata } from "next";

// The pages are client components, so their tab title is set here.
export const metadata: Metadata = { title: "המסלול שלי | Saylo" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

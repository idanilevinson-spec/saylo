import type { Metadata } from "next";

// The page itself is a client component, so its tab title is set here.
export const metadata: Metadata = { title: "שיחה עם המורה | Saylo" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

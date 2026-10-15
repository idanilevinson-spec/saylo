import type { Metadata } from "next";

// The page itself is a client component, so its tab title is set here.
export const metadata: Metadata = { title: "חזרה על מילים | Saylo" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

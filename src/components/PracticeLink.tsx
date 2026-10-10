"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthProvider";

// The call to action on the public content pages. A visitor goes to sign
// up; someone already signed in (say, arriving from Google) goes straight
// to the same material inside the app instead of a sign-up page they
// don't need. The page is static, so this is decided in the browser; until
// the session is known it points to sign-up, the right default.
export default function PracticeLink({
  signedInHref,
  signedInLabel,
  children,
  className,
}: {
  signedInHref: string;
  signedInLabel: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { session } = useAuth();
  return (
    <Link href={session ? signedInHref : "/signup"} className={className}>
      {session ? signedInLabel : children}
    </Link>
  );
}

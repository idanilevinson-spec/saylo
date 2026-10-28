"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// A sign-up confirmation link whose return address wasn't accepted lands on
// the home page as "/?code=…" (Supabase falls back to the site's address).
// Nothing here turns that code into a session, so the learner stayed signed
// out with a confirmed email and no idea what to do; in the data, several
// did exactly that. This passes the code on to /auth/callback, which signs
// them in and continues to the dashboard.
export default function AuthCodeForward() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) return;
    window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=/dashboard`);
  }, [code]);

  return null;
}

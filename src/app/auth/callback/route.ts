import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";

// OAuth (Google, Apple) must redirect here, never straight at a protected
// page like /dashboard. proxy.ts checks for a session on every request to
// a protected route server-side — but exchanging the OAuth `code` for a
// session is exactly what hasn't happened yet at that point, so a
// redirectTo of /dashboard hits proxy.ts with no session, gets bounced
// straight back to /login, and the code (a one-time value) is gone. This
// route does the exchange first, so the session cookie exists by the time
// the browser is sent on to `next`.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}

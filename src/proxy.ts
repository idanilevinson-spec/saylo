import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Route groups like (app)/(admin) don't affect the URL, so gating is done by
// real path prefix. Extend these lists as new protected routes are added in
// later phases.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/learn",
  "/vocabulary",
  "/grammar",
  "/practice",
  "/review",
  "/reading",
  "/listening",
  "/idioms",
  "/placement",
  "/writing",
  "/speaking",
];
const ADMIN_PREFIXES = ["/admin"];

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  // Without real project credentials configured yet, let every request
  // through unauthenticated rather than hard-failing the whole app.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected || isAdminRoute) {
    // getClaims() verifies the session token's signature locally (against the
    // project's cached public keys) instead of asking the Auth server on
    // every navigation the way getUser() does — that round trip was added to
    // every tap on a protected page. This gate only decides who gets
    // redirected to /login; every API route still calls getUser(), and the
    // data itself is protected by row-level security, so nothing here is the
    // security boundary. On a project still signing with a shared secret,
    // getClaims() falls back to asking the Auth server, i.e. today's behaviour.
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    if (!userId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();

      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/learn/:path*",
    "/vocabulary/:path*",
    "/grammar/:path*",
    "/practice/:path*",
    "/review/:path*",
    "/reading/:path*",
    "/listening/:path*",
    "/idioms/:path*",
    "/placement/:path*",
    "/writing/:path*",
    "/speaking/:path*",
    "/admin/:path*",
  ],
};

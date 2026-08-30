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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
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

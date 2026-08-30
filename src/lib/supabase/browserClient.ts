import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and fill in your Supabase project credentials."
  );
}

// Cookie-backed client (via @supabase/ssr) so the session stays in sync with
// serverClient.ts and proxy.ts, unlike a plain supabase-js client which only
// persists to localStorage.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

import "server-only";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { fetchAll } from "@/lib/supabase/fetchAll";
import {
  countActiveLearners,
  summarizeRevenue,
  type AdminSubscriptionRow,
  type RevenueSummary,
} from "@/lib/admin/metricRules";

// The admin dashboard's headline numbers, computed with the service role.
// The admin screens used to query these from the browser, where RLS hid
// whole activity tables (games, reading answers) and every sign-up that
// never reached a profile row.

export interface IncompleteSignup {
  id: string;
  email: string | null;
  provider: string | null;
  createdAt: string;
  emailConfirmed: boolean;
  lastSignInAt: string | null;
}

export interface DashboardMetrics {
  totalUsers: number;
  signupsLast7Days: number;
  activeLast7Days: number;
  testAccountCount: number;
  revenue: RevenueSummary;
  incompleteSignups: IncompleteSignup[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Profiles flagged as the owner's own test/demo accounts. Reads nothing if
// the column isn't there yet (migration 048 not run), so the dashboard keeps
// working and simply counts everyone.
async function loadTestAccountIds(): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin.from("profiles").select("id").eq("is_test_account", true);
  if (error) {
    console.warn("admin metrics: test accounts unavailable:", error.message);
    return new Set();
  }
  return new Set(data.map((r) => r.id));
}

async function profileIdsSince(table: string, since: string): Promise<string[]> {
  const { data, error } = await fetchAll((from, to) =>
    supabaseAdmin.from(table).select("profile_id").gte("created_at", since).order("profile_id").range(from, to),
  );
  if (error) console.warn(`admin metrics: ${table} unavailable:`, error);
  return (data as { profile_id: string }[]).map((r) => r.profile_id);
}

async function listAllAuthUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

export async function loadDashboardMetrics(now = new Date()): Promise<DashboardMetrics> {
  const since7 = new Date(now.getTime() - 7 * DAY_MS).toISOString();

  const [testIds, profilesRes, subsRes, authUsers, ...activitySources] = await Promise.all([
    loadTestAccountIds(),
    fetchAll((from, to) => supabaseAdmin.from("profiles").select("id, created_at").order("id").range(from, to)),
    fetchAll((from, to) =>
      supabaseAdmin
        .from("subscriptions")
        .select("profile_id, status, trial_ends_at, current_period_end, subscription_plans(code, price_ils, months)")
        .order("profile_id")
        .range(from, to),
    ),
    listAllAuthUsers(),
    profileIdsSince("exercise_attempts", since7),
    profileIdsSince("xp_events", since7),
    profileIdsSince("vocabulary_game_sessions", since7),
    profileIdsSince("reading_responses", since7),
    profileIdsSince("conversations", since7),
    profileIdsSince("ai_usage_log", since7),
  ]);
  if (profilesRes.error) throw new Error(`profiles: ${JSON.stringify(profilesRes.error)}`);
  if (subsRes.error) throw new Error(`subscriptions: ${JSON.stringify(subsRes.error)}`);

  const profiles = profilesRes.data.filter((p) => !testIds.has(p.id));
  const profileIds = new Set(profilesRes.data.map((p) => p.id));

  const subs: AdminSubscriptionRow[] = subsRes.data.map((row) => ({
    profile_id: row.profile_id,
    status: row.status,
    trial_ends_at: row.trial_ends_at,
    current_period_end: row.current_period_end,
    plan: row.subscription_plans as unknown as AdminSubscriptionRow["plan"],
  }));

  const incompleteSignups = authUsers
    .filter((u) => !profileIds.has(u.id))
    .map((u) => ({
      id: u.id,
      email: u.email ?? null,
      provider: (u.app_metadata?.provider as string | undefined) ?? null,
      createdAt: u.created_at,
      emailConfirmed: !!u.email_confirmed_at,
      lastSignInAt: u.last_sign_in_at ?? null,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    totalUsers: profiles.length,
    signupsLast7Days: profiles.filter((p) => p.created_at >= since7).length,
    activeLast7Days: countActiveLearners(activitySources, testIds),
    testAccountCount: testIds.size,
    revenue: summarizeRevenue(subs, testIds, now),
    incompleteSignups,
  };
}

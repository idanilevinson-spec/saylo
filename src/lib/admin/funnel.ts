// The admin analytics funnel. Every step counts distinct real learners:
// test/demo accounts (profiles.is_test_account) are left out everywhere,
// and a learner who took the placement test twice counts once. Before
// this, the later steps counted rows and included test accounts, so they
// could be larger than the steps above them (10 "completed placement"
// against 4 real learners, 2026-11-13).

export interface FunnelStep {
  label: string;
  count: number;
}

export interface FunnelInput {
  // Real learners with a profile (test accounts already left out).
  realProfileIds: Set<string>;
  // Accounts opened that never got a profile.
  incompleteSignups: number;
  completedPlacementProfileIds: string[];
  attemptProfileIds: string[];
  conversationProfileIds: string[];
}

function distinctReal(ids: string[], real: Set<string>): number {
  return new Set(ids.filter((id) => real.has(id))).size;
}

export function buildFunnel(input: FunnelInput): FunnelStep[] {
  const real = input.realProfileIds;
  return [
    { label: "פתחו חשבון", count: real.size + input.incompleteSignups },
    { label: "השלימו פרופיל", count: real.size },
    { label: "השלימו מבחן רמה", count: distinctReal(input.completedPlacementProfileIds, real) },
    { label: "ביצעו תרגיל אחד לפחות", count: distinctReal(input.attemptProfileIds, real) },
    { label: "ניסו שיחת AI", count: distinctReal(input.conversationProfileIds, real) },
  ];
}

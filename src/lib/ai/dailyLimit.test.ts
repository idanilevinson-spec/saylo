import { describe, expect, it } from "vitest";
import { DAILY_AI_LIMITS, underDailyAiLimit } from "./dailyLimit";

function client(result: { count?: number | null; error?: unknown } | Error) {
  const seen: { col: string; val: unknown }[] = [];
  const chain = {
    select: () => chain,
    eq: (col: string, val: unknown) => {
      seen.push({ col, val });
      return chain;
    },
    gte: () => (result instanceof Error ? Promise.reject(result) : Promise.resolve(result)),
  };
  return { supabase: { from: () => chain } as never, seen };
}

describe("underDailyAiLimit", () => {
  it("counts this learner's calls of this feature", async () => {
    const { supabase, seen } = client({ count: 3 });
    expect(await underDailyAiLimit(supabase, "p1", "word_lookup")).toBe(true);
    expect(seen).toEqual([
      { col: "profile_id", val: "p1" },
      { col: "feature", val: "word_lookup" },
    ]);
  });

  it("stops at the cap", async () => {
    const { supabase } = client({ count: DAILY_AI_LIMITS.conversation_ideas });
    expect(await underDailyAiLimit(supabase, "p1", "conversation_ideas")).toBe(false);
  });

  it("never blocks on a failed count", async () => {
    expect(await underDailyAiLimit(client({ count: null, error: { message: "x" } }).supabase, "p1", "conversation_turn")).toBe(true);
    expect(await underDailyAiLimit(client(new Error("network")).supabase, "p1", "conversation_turn")).toBe(true);
  });
});

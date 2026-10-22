import { describe, expect, it } from "vitest";
import { trialTeacherConversationIds } from "./teacherTrial";

function client(sub: object | null, conversationIds: string[]) {
  return {
    from: (table: string) => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: (n: number) => Promise.resolve({ data: conversationIds.slice(0, n).map((id) => ({ id })) }),
        maybeSingle: () => Promise.resolve({ data: table === "subscriptions" ? sub : null }),
      };
      return chain;
    },
  } as never;
}

const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

describe("trialTeacherConversationIds", () => {
  it("gives an active trial its first two conversations", async () => {
    expect(await trialTeacherConversationIds(client({ status: "trialing", trial_ends_at: future }, ["c1", "c2", "c3"]), "p")).toEqual([
      "c1",
      "c2",
    ]);
  });

  it("gives nothing to an expired trial, a paying or lapsed subscription, or no subscription", async () => {
    expect(await trialTeacherConversationIds(client({ status: "trialing", trial_ends_at: past }, ["c1"]), "p")).toBeNull();
    expect(await trialTeacherConversationIds(client({ status: "active", current_period_end: future }, ["c1"]), "p")).toBeNull();
    expect(await trialTeacherConversationIds(client({ status: "canceled" }, ["c1"]), "p")).toBeNull();
    expect(await trialTeacherConversationIds(client(null, ["c1"]), "p")).toBeNull();
  });

  it("is empty, not null, for a trial that hasn't started a conversation yet", async () => {
    expect(await trialTeacherConversationIds(client({ status: "trialing", trial_ends_at: future }, []), "p")).toEqual([]);
  });
});

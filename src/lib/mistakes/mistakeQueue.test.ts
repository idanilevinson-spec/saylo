import { beforeEach, describe, expect, it, vi } from "vitest";

const { dueLimit, topicsIn, exercisesIn } = vi.hoisted(() => ({
  dueLimit: vi.fn(),
  topicsIn: vi.fn(),
  exercisesIn: vi.fn(),
}));

vi.mock("@/lib/supabase/browserClient", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "mistake_review_items") {
        return { select: () => ({ eq: () => ({ eq: () => ({ lte: () => ({ order: () => ({ limit: dueLimit }) }) }) }) }) };
      }
      if (table === "grammar_topics") {
        return { select: () => ({ in: topicsIn }) };
      }
      if (table === "exercises") {
        return { select: () => ({ eq: () => ({ in: exercisesIn }) }) };
      }
      throw new Error(`unexpected table: ${table}`);
    },
  },
}));

import { getDueMistakeItems } from "./mistakeQueue";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("getDueMistakeItems", () => {
  it("returns an empty queue when nothing is due", async () => {
    dueLimit.mockResolvedValue({ data: [] });
    const result = await getDueMistakeItems("user-1");
    expect(result).toEqual([]);
    expect(topicsIn).not.toHaveBeenCalled();
  });

  it("joins topic names and one exercise per due topic", async () => {
    dueLimit.mockResolvedValue({
      data: [
        { item_ref: "topic-1", due_at: "2026-09-27T00:00:00.000Z" },
        { item_ref: "topic-2", due_at: "2026-09-28T00:00:00.000Z" },
      ],
    });
    topicsIn.mockResolvedValue({
      data: [
        { id: "topic-1", name_he: "הווה פשוט" },
        { id: "topic-2", name_he: "עבר פשוט" },
      ],
    });
    exercisesIn.mockResolvedValue({
      data: [
        { id: "ex-1", grammar_topic_id: "topic-1", type: "mcq" },
        { id: "ex-2", grammar_topic_id: "topic-2", type: "fill_blank" },
      ],
    });

    const result = await getDueMistakeItems("user-1");
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ itemRef: "topic-1", topicNameHe: "הווה פשוט" });
    expect(result[0].exercise).toMatchObject({ id: "ex-1" });
    expect(result[1]).toMatchObject({ itemRef: "topic-2", topicNameHe: "עבר פשוט" });
  });

  it("skips a due topic that has no published exercise or no name", async () => {
    dueLimit.mockResolvedValue({ data: [{ item_ref: "topic-orphan", due_at: "2026-09-28T00:00:00.000Z" }] });
    topicsIn.mockResolvedValue({ data: [] });
    exercisesIn.mockResolvedValue({ data: [] });

    const result = await getDueMistakeItems("user-1");
    expect(result).toEqual([]);
  });

  it("picks only the first published exercise per topic", async () => {
    dueLimit.mockResolvedValue({ data: [{ item_ref: "topic-1", due_at: "2026-09-28T00:00:00.000Z" }] });
    topicsIn.mockResolvedValue({ data: [{ id: "topic-1", name_he: "הווה פשוט" }] });
    exercisesIn.mockResolvedValue({
      data: [
        { id: "ex-1", grammar_topic_id: "topic-1", type: "mcq" },
        { id: "ex-2", grammar_topic_id: "topic-1", type: "fill_blank" },
      ],
    });

    const result = await getDueMistakeItems("user-1");
    expect(result).toHaveLength(1);
    expect(result[0].exercise.id).toBe("ex-1");
  });
});

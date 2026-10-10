import { describe, expect, it } from "vitest";
import { fetchAll, PAGE_SIZE } from "./fetchAll";

// A fake table of `total` rows served the way the API does: never more
// than PAGE_SIZE rows per request.
function table(total: number) {
  const calls: [number, number][] = [];
  const page = async (from: number, to: number) => {
    calls.push([from, to]);
    const end = Math.min(to + 1, total, from + PAGE_SIZE);
    return { data: Array.from({ length: Math.max(0, end - from) }, (_, i) => from + i), error: null };
  };
  return { page, calls };
}

describe("fetchAll", () => {
  it("returns everything past the 1000-row cap", async () => {
    const { page, calls } = table(2500);
    const { data, error } = await fetchAll(page);
    expect(error).toBeNull();
    expect(data).toHaveLength(2500);
    expect(new Set(data).size).toBe(2500);
    expect(calls).toEqual([
      [0, 999],
      [1000, 1999],
      [2000, 2999],
    ]);
  });

  it("makes one request when everything fits", async () => {
    const { page, calls } = table(12);
    expect((await fetchAll(page)).data).toHaveLength(12);
    expect(calls).toHaveLength(1);
  });

  it("asks once more when the last page is exactly full", async () => {
    const { page, calls } = table(1000);
    expect((await fetchAll(page)).data).toHaveLength(1000);
    expect(calls).toHaveLength(2);
  });

  it("stops at maxRows", async () => {
    const { page } = table(10_000);
    expect((await fetchAll(page, 3000)).data).toHaveLength(3000);
  });

  it("passes an error through with what it had so far", async () => {
    let n = 0;
    const { data, error } = await fetchAll(async () => {
      n++;
      return n === 1 ? { data: Array(PAGE_SIZE).fill(0), error: null } : { data: null, error: new Error("boom") };
    });
    expect(error).toBeInstanceOf(Error);
    expect(data).toHaveLength(PAGE_SIZE);
  });
});

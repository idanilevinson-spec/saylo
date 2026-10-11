import { describe, expect, it } from "vitest";
import { streakLabel } from "./streak";

describe("streakLabel", () => {
  it("uses the Hebrew forms for one and two days", () => {
    expect(streakLabel(1)).toBe("רצף של יום אחד");
    expect(streakLabel(2)).toBe("רצף של יומיים");
    expect(streakLabel(7)).toBe("רצף של 7 ימים");
  });
});

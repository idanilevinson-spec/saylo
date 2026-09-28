import { describe, expect, it } from "vitest";
import { BAGRUT_MODULE_FORMATS, getModuleFormat, modulesForUnits } from "./moduleFormats";

describe("BAGRUT_MODULE_FORMATS", () => {
  it("has all seven modules, A through G", () => {
    expect(Object.keys(BAGRUT_MODULE_FORMATS).sort()).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });

  it("cites a source for every module, verified or not", () => {
    for (const format of Object.values(BAGRUT_MODULE_FORMATS)) {
      expect(format.sourceNotesHe.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives every verified module at least one section with points", () => {
    for (const format of Object.values(BAGRUT_MODULE_FORMATS)) {
      if (!format.verified) continue;
      expect(format.sections.length).toBeGreaterThan(0);
      for (const section of format.sections) {
        expect(section.points).toBeGreaterThan(0);
      }
    }
  });

  it("leaves unverified modules with no sections, so nothing gets built on unconfirmed structure", () => {
    for (const format of Object.values(BAGRUT_MODULE_FORMATS)) {
      if (format.verified) continue;
      expect(format.sections).toEqual([]);
    }
  });

  it("sums each verified module's section points to 100", () => {
    for (const format of Object.values(BAGRUT_MODULE_FORMATS)) {
      if (!format.verified) continue;
      const total = format.sections.reduce((sum, s) => sum + s.points, 0);
      expect(total).toBe(100);
    }
  });
});

describe("modulesForUnits", () => {
  it("maps 3 יח\"ל to A, B, C", () => {
    expect(modulesForUnits(3).sort()).toEqual(["A", "B", "C"]);
  });

  it("maps 4 יח\"ל to C, D, E", () => {
    expect(modulesForUnits(4).sort()).toEqual(["C", "D", "E"]);
  });

  it("maps 5 יח\"ל to E, F, G", () => {
    expect(modulesForUnits(5).sort()).toEqual(["E", "F", "G"]);
  });
});

describe("getModuleFormat", () => {
  it("returns the requested module's format", () => {
    expect(getModuleFormat("E").timeMinutes).toBe(75);
  });
});

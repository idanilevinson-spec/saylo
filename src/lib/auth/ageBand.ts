import type { AgeBand } from "@/types/database";

export function deriveAgeBand(age: number): AgeBand {
  if (age < 13) return "child";
  if (age < 18) return "teen";
  return "adult";
}

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  child: "עד גיל 13",
  teen: "גיל 13–17",
  adult: "גיל 18 ומעלה",
};

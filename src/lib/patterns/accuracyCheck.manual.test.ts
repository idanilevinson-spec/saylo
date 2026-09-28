import { describe, it } from "vitest";
import { GOLDEN_SET } from "./goldenSet";
import { validateAiPatterns } from "./validateAiPatterns";

// Manual accuracy check for the AI-detectable patterns (spec §8, §10 step 7)
// — NOT part of the normal test run and NOT run in CI, because every
// iteration is a real, billed Anthropic API call against the actual
// writing-coach prompt. Every import that touches the real Anthropic client
// is deferred inside the `it` below, behind the env-var guard, so this file
// is completely inert (no network, no API key required) under a normal
// `npm test` / CI run.
//
// How to run it for real:
//   RUN_LIVE_PATTERN_CHECK=1 npx vitest run src/lib/patterns/accuracyCheck.manual.test.ts
//
// This prints a precision/recall table per pattern. The spec's suggested
// gate — leave a pattern disabled below ~90% — is a starting point for the
// reviewing teacher/professional to apply, not something this script
// enforces on its own.
describe("pattern-coach accuracy (manual — costs real Anthropic API usage)", () => {
  it(
    "reports precision and recall per AI-detectable pattern against the golden set",
    async () => {
      if (!process.env.RUN_LIVE_PATTERN_CHECK) {
        console.log(
          "Skipped — set RUN_LIVE_PATTERN_CHECK=1 to actually call the API and run this check (it costs real usage)."
        );
        return;
      }

      const { anthropic, CLAUDE_MODEL, extractText, parseJsonResponse } = await import("@/lib/ai/claudeClient");
      const { buildWritingCoachPrompt } = await import("@/lib/ai/prompts/writingCoach");

      interface Counts {
        truePositive: number;
        falsePositive: number;
        falseNegative: number;
        trueNegative: number;
      }
      const counts = new Map<string, Counts>();
      const bump = (code: string, key: keyof Counts) => {
        const entry = counts.get(code) ?? { truePositive: 0, falsePositive: 0, falseNegative: 0, trueNegative: 0 };
        entry[key] += 1;
        counts.set(code, entry);
      };

      for (const example of GOLDEN_SET) {
        const prompt = buildWritingCoachPrompt("Describe a recent experience.", example.sentence);
        const message = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          thinking: { type: "disabled" },
          messages: [{ role: "user", content: prompt }],
        });
        const parsed = parseJsonResponse<{ patterns?: unknown }>(extractText(message));
        const validated = validateAiPatterns(parsed?.patterns, example.sentence, "writing");
        const detected = validated.some((p) => p.code === example.code);

        if (example.expected && detected) bump(example.code, "truePositive");
        else if (example.expected && !detected) bump(example.code, "falseNegative");
        else if (!example.expected && detected) bump(example.code, "falsePositive");
        else bump(example.code, "trueNegative");
      }

      const rows = [...counts.entries()].map(([code, c]) => {
        const precision = c.truePositive + c.falsePositive > 0 ? c.truePositive / (c.truePositive + c.falsePositive) : null;
        const recall = c.truePositive + c.falseNegative > 0 ? c.truePositive / (c.truePositive + c.falseNegative) : null;
        return {
          code,
          truePositive: c.truePositive,
          falsePositive: c.falsePositive,
          falseNegative: c.falseNegative,
          trueNegative: c.trueNegative,
          precision: precision !== null ? `${Math.round(precision * 100)}%` : "n/a",
          recall: recall !== null ? `${Math.round(recall * 100)}%` : "n/a",
        };
      });

      console.table(rows);
    },
    10 * 60 * 1000
  );
});

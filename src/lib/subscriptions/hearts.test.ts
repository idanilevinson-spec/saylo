import { describe, it, expect } from "vitest";
import { regenerateHearts, loseHeart, REGEN_INTERVAL_MS } from "./hearts";

describe("regenerateHearts", () => {
  it("adds no hearts if less than one regen interval has passed", () => {
    const lastRegenAt = new Date("2026-06-15T12:00:00Z");
    const now = new Date(lastRegenAt.getTime() + REGEN_INTERVAL_MS / 2);
    const result = regenerateHearts({ current: 2, max: 5, lastRegenAt }, now);
    expect(result.current).toBe(2);
  });

  it("adds one heart after exactly one regen interval", () => {
    const lastRegenAt = new Date("2026-06-15T12:00:00Z");
    const now = new Date(lastRegenAt.getTime() + REGEN_INTERVAL_MS);
    const result = regenerateHearts({ current: 2, max: 5, lastRegenAt }, now);
    expect(result.current).toBe(3);
  });

  it("adds multiple hearts for multiple elapsed intervals", () => {
    const lastRegenAt = new Date("2026-06-15T12:00:00Z");
    const now = new Date(lastRegenAt.getTime() + REGEN_INTERVAL_MS * 3);
    const result = regenerateHearts({ current: 0, max: 5, lastRegenAt }, now);
    expect(result.current).toBe(3);
  });

  it("caps regeneration at max hearts", () => {
    const lastRegenAt = new Date("2026-06-15T12:00:00Z");
    const now = new Date(lastRegenAt.getTime() + REGEN_INTERVAL_MS * 10);
    const result = regenerateHearts({ current: 3, max: 5, lastRegenAt }, now);
    expect(result.current).toBe(5);
  });

  it("does not change lastRegenAt when already at max", () => {
    const lastRegenAt = new Date("2026-06-15T12:00:00Z");
    const now = new Date(lastRegenAt.getTime() + REGEN_INTERVAL_MS * 3);
    const result = regenerateHearts({ current: 5, max: 5, lastRegenAt }, now);
    expect(result.current).toBe(5);
    expect(result.lastRegenAt.getTime()).toBe(now.getTime());
  });
});

describe("loseHeart", () => {
  it("decrements current hearts by one", () => {
    const lastRegenAt = new Date("2026-06-15T12:00:00Z");
    const now = new Date("2026-06-15T13:00:00Z");
    const result = loseHeart({ current: 3, max: 5, lastRegenAt }, now);
    expect(result.current).toBe(2);
  });

  it("starts the regen clock when losing a heart from full", () => {
    const lastRegenAt = new Date("2026-06-15T12:00:00Z");
    const now = new Date("2026-06-15T13:00:00Z");
    const result = loseHeart({ current: 5, max: 5, lastRegenAt }, now);
    expect(result.lastRegenAt.getTime()).toBe(now.getTime());
  });

  it("does not reset the regen clock when already below max", () => {
    const lastRegenAt = new Date("2026-06-15T12:00:00Z");
    const now = new Date("2026-06-15T13:00:00Z");
    const result = loseHeart({ current: 3, max: 5, lastRegenAt }, now);
    expect(result.lastRegenAt.getTime()).toBe(lastRegenAt.getTime());
  });

  it("does not go below zero", () => {
    const lastRegenAt = new Date("2026-06-15T12:00:00Z");
    const result = loseHeart({ current: 0, max: 5, lastRegenAt }, lastRegenAt);
    expect(result.current).toBe(0);
  });
});

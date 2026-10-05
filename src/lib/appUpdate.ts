// When a page loaded from an older deploy should pick up a newer one.
//
// The iOS app (and any long-lived browser tab) loads the site once and then
// keeps that JavaScript in memory: navigating between screens never fetches
// a new version, so a fix that went live an hour ago is invisible until the
// person force-quits the app. Reloading the moment a new deploy is noticed
// would be just as bad the other way — it would wipe someone's half-finished
// exercise or placement test.
//
// So: once a newer deploy is noticed, the next page change becomes a full
// load (the person is leaving that screen anyway). The one exception is
// coming back after a long time away, when whatever was on screen is very
// likely abandoned and a fresh start is what they'd expect.

export const LONG_AWAY_MS = 30 * 60 * 1000;
// Checking costs one tiny request; more often than this buys nothing.
export const MIN_CHECK_INTERVAL_MS = 60 * 1000;

export function isNewerDeploy(loadedBuildId: string, liveBuildId: unknown): boolean {
  // "dev" means a local build: never auto-reload while developing.
  if (loadedBuildId === "dev") return false;
  return typeof liveBuildId === "string" && liveBuildId.length > 0 && liveBuildId !== "dev" && liveBuildId !== loadedBuildId;
}

export function shouldReloadOnReturn(awayMs: number): boolean {
  return awayMs >= LONG_AWAY_MS;
}

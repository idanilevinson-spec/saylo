// Whether a speech SDK error means the browser/OS denied microphone access,
// as opposed to a real connection or recognition failure. Every mic feature
// uses this to skip its "try again" once permission was denied — retrying
// is pointless (neither the browser nor the app can re-prompt), and offering
// any path back toward granting the permission (even an opt-in "open
// Settings" link, tried and rejected once already) is itself what App
// Review's Guideline 5.1.1(iv) calls directing the learner to reconsider
// their choice. Once denied, the UI just says so and stops there.
export function isMicPermissionDeniedError(err: unknown): boolean {
  const text = String(err);
  return text.includes("Permission denied") || text.includes("NotAllowedError");
}

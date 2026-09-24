// Whether a speech SDK error means the browser/OS denied microphone access,
// as opposed to a real connection or recognition failure.
export function isMicPermissionDeniedError(err: unknown): boolean {
  const text = String(err);
  return text.includes("Permission denied") || text.includes("NotAllowedError");
}

// iOS only: deep-links straight to this app's own page in Settings. Once a
// learner has denied microphone access, neither the browser nor a WKWebView
// ever re-prompts — the only real next step is Settings, which is exactly
// what App Review asks apps to offer instead of nagging the learner to
// "try again" (see Guideline 5.1.1(iv)). No Capacitor plugin needed:
// `app-settings:` is a URL scheme iOS itself resolves.
export function openIosAppSettings(): void {
  window.location.href = "app-settings:";
}

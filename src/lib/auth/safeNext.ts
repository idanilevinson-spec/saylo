// Where to send someone after signing in. Only a path on this site: a
// full URL, a protocol-relative "//host", a backslash (browsers read "/\host"
// as "//host"), or anything not starting with "/" (e.g. "@evil.com", which
// after `${origin}${next}` becomes https://saylolearn.com@evil.com, i.e.
// evil.com) falls back. Without this, /login?next=... is an open redirect.
export function safeNext(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

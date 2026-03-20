/**
 * Lightweight client-side URL validation.
 * Heavy validation (DNS resolution, reachability) happens server-side.
 */

const URL_REGEX =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-./?%&=]*)?$/i;

export function isValidUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  return URL_REGEX.test(trimmed);
}

export function normaliseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Derive the client IP from a *trusted* source for rate-limiting.
 *
 * The LEFT-most `x-forwarded-for` token is the value the client sent and is
 * trivially spoofable — rotating it defeats any per-IP limit. The trustworthy
 * signals are `x-real-ip` (set by the edge/proxy to the real peer) and the
 * RIGHT-most `x-forwarded-for` hop (appended by the closest proxy). Prefer
 * those; fall back to "unknown".
 *
 * NOTE: this hardens key derivation only. The limiter store is still in-process
 * (per-instance); a shared store (e.g. Upstash/Redis) is still needed for the
 * limit to hold across serverless instances.
 */
export function getClientIp(req: Request): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff
      .split(",")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);
    if (hops.length > 0) return hops.at(-1) ?? "unknown";
  }

  return "unknown";
}

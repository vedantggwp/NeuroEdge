import { type HTTPRequest } from 'puppeteer';
import { checkHostSafety } from './url-validator.js';

/**
 * Re-validate EVERY http(s) request Chromium makes during a scan — main-frame
 * navigations, redirect hops, AND sub-resources — against the SSRF guard.
 * Hostnames are DNS-resolved (via checkHostSafety), so names that resolve to a
 * private/reserved address are blocked too, not just literal-IP hosts. Verdicts
 * are cached per scan (one lookup per unique host). Non-network schemes (data:,
 * blob:, about:) pass through untouched.
 *
 * Fails CLOSED: any error in the guard aborts the request rather than letting
 * it proceed unvalidated.
 */
export async function guardRequest(
  req: HTTPRequest,
  safeHosts: Map<string, boolean>,
): Promise<void> {
  try {
    const parsed = new URL(req.url());

    // data:, blob:, about:, etc. never hit the network — not SSRF vectors.
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      await req.continue();
      return;
    }

    const host = parsed.hostname.replace(/^\[|\]$/g, '');

    let safe = safeHosts.get(host);
    if (safe === undefined) {
      const verdict = await checkHostSafety(host);
      safe = verdict.valid;
      safeHosts.set(host, safe);
    }

    if (!safe) {
      await req.abort('addressunreachable');
      return;
    }
    await req.continue();
  } catch {
    // Fail closed — never continue() an unvalidated request on error.
    try {
      await req.abort('addressunreachable');
    } catch {
      /* request already handled (e.g. redirect already resolved) */
    }
  }
}

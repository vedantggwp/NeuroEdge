/**
 * SSRF guard for the scan-service accessibility scanner.
 *
 * Blocks private/reserved IPv4 and IPv6 ranges, re-checked on every redirect
 * hop by the scanner (see scanner.ts) to defeat redirect + DNS-rebind bypasses.
 *
 * Public API (unchanged):
 *   validateUrl(input): ValidationResult
 *   validateUrlWithDns(input): Promise<ValidationResult>
 *
 * Added exports:
 *   isPrivateIp(ip): boolean
 *   checkHostSafety(host): Promise<{ valid: true } | { valid: false; reason: string }>
 */
import { URL } from 'url';
import dns from 'dns/promises';
import net from 'net';

export type ValidationResult =
  | { valid: true; url: string }
  | { valid: false; reason: string };

// ─── IPv4 private ranges ────────────────────────────────────────────────────

const PRIVATE_V4_RANGES: ReadonlyArray<{ start: string; end: string }> = [
  { start: '0.0.0.0', end: '0.255.255.255' }, // "this" network
  { start: '10.0.0.0', end: '10.255.255.255' }, // RFC1918
  { start: '100.64.0.0', end: '100.127.255.255' }, // CGNAT (RFC6598)
  { start: '127.0.0.0', end: '127.255.255.255' }, // loopback
  { start: '169.254.0.0', end: '169.254.255.255' }, // link-local + cloud metadata
  { start: '172.16.0.0', end: '172.31.255.255' }, // RFC1918
  { start: '192.0.0.0', end: '192.0.0.255' }, // IETF protocol assignments
  { start: '192.168.0.0', end: '192.168.255.255' }, // RFC1918
  { start: '198.18.0.0', end: '198.19.255.255' }, // benchmarking (RFC2544)
];

function ipv4ToNumber(ip: string): number {
  // `>>> 0` coerces to unsigned 32-bit integer.
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function isPrivateV4(ip: string): boolean {
  const num = ipv4ToNumber(ip);
  return PRIVATE_V4_RANGES.some(
    (range) => num >= ipv4ToNumber(range.start) && num <= ipv4ToNumber(range.end),
  );
}

// ─── IPv6 private ranges ────────────────────────────────────────────────────

/**
 * Expand an IPv6 address (including `::` compression and trailing embedded
 * IPv4) into its 16 bytes. Returns null if it cannot be parsed.
 */
function ipv6ToBytes(ip: string): number[] | null {
  let address = ip;

  // Strip zone index (e.g. fe80::1%eth0).
  const zoneIndex = address.indexOf('%');
  if (zoneIndex !== -1) address = address.slice(0, zoneIndex);

  // Handle an embedded IPv4 tail (e.g. ::ffff:192.168.0.1).
  let tailBytes: number[] = [];
  const lastColon = address.lastIndexOf(':');
  const tail = address.slice(lastColon + 1);
  if (tail.includes('.')) {
    if (!net.isIPv4(tail)) return null;
    tailBytes = tail.split('.').map(Number);
    address = `${address.slice(0, lastColon + 1)}0`; // placeholder hextet
  }

  const halves = address.split('::');
  if (halves.length > 2) return null;

  const parseGroups = (segment: string): number[] | null => {
    if (segment === '') return [];
    const groups: number[] = [];
    for (const part of segment.split(':')) {
      if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
      const value = parseInt(part, 16);
      groups.push((value >> 8) & 0xff, value & 0xff);
    }
    return groups;
  };

  const head = parseGroups(halves[0] ?? '');
  if (head === null) return null;
  const rawTail = halves.length === 2 ? parseGroups(halves[1] ?? '') : [];
  if (rawTail === null) return null;

  // Replace the placeholder hextet with the real embedded-IPv4 bytes.
  const tailGroups = tailBytes.length === 4 ? rawTail.slice(0, -2).concat(tailBytes) : rawTail;

  let bytes: number[];
  if (halves.length === 2) {
    const fill = 16 - head.length - tailGroups.length;
    if (fill < 0) return null;
    bytes = [...head, ...new Array(fill).fill(0), ...tailGroups];
  } else {
    bytes = head;
  }

  return bytes.length === 16 ? bytes : null;
}

function isPrivateV6(ip: string): boolean {
  const bytes = ipv6ToBytes(ip);
  if (!bytes) return true; // unparseable → fail closed

  const allZeroExceptLast = bytes.slice(0, 15).every((b) => b === 0);
  if (allZeroExceptLast && bytes[15] === 1) return true; // ::1 loopback
  if (bytes.every((b) => b === 0)) return true; // :: unspecified

  const b0 = bytes[0] ?? 0;
  const b1 = bytes[1] ?? 0;
  if ((b0 & 0xfe) === 0xfc) return true; // fc00::/7 unique-local
  if (b0 === 0xfe && (b1 & 0xc0) === 0x80) return true; // fe80::/10 link-local

  // ::ffff:0:0/96 IPv4-mapped → validate the embedded IPv4.
  const isMapped =
    bytes.slice(0, 10).every((b) => b === 0) && bytes[10] === 0xff && bytes[11] === 0xff;
  if (isMapped) return isPrivateV4(`${bytes[12]}.${bytes[13]}.${bytes[14]}.${bytes[15]}`);

  return false;
}

// ─── Exported primitives ────────────────────────────────────────────────────

/** True if a *literal* IP address (v4 or v6) is private/reserved/loopback. */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateV4(ip);
  if (net.isIPv6(ip)) return isPrivateV6(ip);
  return false; // not an IP literal
}

// ─── Static URL validation ──────────────────────────────────────────────────

/** Static, synchronous URL validation: shape, scheme, and literal-IP hosts. */
export function validateUrl(input: string): ValidationResult {
  if (!input || input.trim() === '') {
    return { valid: false, reason: 'URL is required' };
  }

  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' };
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, ''); // strip IPv6 brackets

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return { valid: false, reason: 'Private or reserved address' };
  }

  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    return { valid: false, reason: 'Private or reserved address' };
  }

  return { valid: true, url: parsed.toString() };
}

// ─── Async host-safety check ────────────────────────────────────────────────

/**
 * Resolve a hostname (A + AAAA) and reject if *any* resolved address is
 * private. Literal IPs are checked directly without DNS. Also rejects
 * `localhost` / `*.localhost`.
 *
 * Used both as the pre-scan gate (via validateUrlWithDns) and on every
 * redirect hop in scanner.ts to defeat DNS-rebind and redirect bypasses.
 */
export async function checkHostSafety(
  host: string,
): Promise<{ valid: true } | { valid: false; reason: string }> {
  const cleaned = host.replace(/^\[|\]$/g, '');

  if (cleaned === 'localhost' || cleaned.endsWith('.localhost')) {
    return { valid: false, reason: 'Private or reserved address' };
  }

  if (net.isIP(cleaned)) {
    return isPrivateIp(cleaned)
      ? { valid: false, reason: 'Private or reserved address' }
      : { valid: true };
  }

  const [v4, v6] = await Promise.all([
    dns.resolve4(cleaned).catch(() => [] as string[]),
    dns.resolve6(cleaned).catch(() => [] as string[]),
  ]);

  const resolved = [...v4, ...v6];
  if (resolved.length === 0) {
    return { valid: false, reason: 'Could not resolve hostname' };
  }
  if (resolved.some(isPrivateIp)) {
    return { valid: false, reason: 'Hostname resolves to a private or reserved address' };
  }
  return { valid: true };
}

// ─── Full async validation (pre-scan gate) ──────────────────────────────────

/**
 * Full async pre-scan gate: static validation + DNS resolution check (A + AAAA).
 * Preserves the original `validateUrlWithDns` signature used by server.ts.
 */
export async function validateUrlWithDns(input: string): Promise<ValidationResult> {
  const basic = validateUrl(input);
  if (!basic.valid) return basic;

  const parsed = new URL(basic.url);
  const hostname = parsed.hostname.replace(/^\[|\]$/g, '');

  const verdict = await checkHostSafety(hostname);
  if (!verdict.valid) {
    return { valid: false, reason: verdict.reason };
  }

  return { valid: true, url: basic.url };
}

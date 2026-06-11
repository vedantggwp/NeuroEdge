/**
 * SSRF guard for the accessibility scanner.
 *
 * The scanner loads an arbitrary, user-supplied URL in a real browser on the
 * operator's machine. Without guarding, a hostile (or redirecting) URL could
 * reach loopback, the LAN, or cloud metadata endpoints. This module blocks
 * those targets across IPv4 *and* IPv6, and is re-checked on every redirect
 * hop by the scanner (see scanner.ts) to defeat redirect + DNS-rebind bypasses.
 */
import { URL } from 'node:url';
import dns from 'node:dns/promises';
import net from 'node:net';

export type UrlVerdict =
  | { safe: true; url: string }
  | { safe: false; reason: string };

export type HostVerdict =
  | { safe: true }
  | { safe: false; reason: string };

const PRIVATE_V4_RANGES: ReadonlyArray<{ start: string; end: string }> = [
  { start: '0.0.0.0', end: '0.255.255.255' }, // "this" network
  { start: '10.0.0.0', end: '10.255.255.255' }, // RFC1918
  { start: '100.64.0.0', end: '100.127.255.255' }, // CGNAT (RFC6598)
  { start: '127.0.0.0', end: '127.255.255.255' }, // loopback
  { start: '169.254.0.0', end: '169.254.255.255' }, // link-local + cloud metadata
  { start: '172.16.0.0', end: '172.31.255.255' }, // RFC1918
  { start: '192.0.0.0', end: '192.0.0.255' }, // IETF protocol assignments
  { start: '192.168.0.0', end: '192.168.255.255' }, // RFC1918
  { start: '198.18.0.0', end: '198.19.255.255' }, // benchmarking
];

function ipv4ToNumber(ip: string): number {
  // `>>> 0` coerces the final value back to an unsigned 32-bit integer.
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function isPrivateV4(ip: string): boolean {
  const num = ipv4ToNumber(ip);
  return PRIVATE_V4_RANGES.some(
    (range) => num >= ipv4ToNumber(range.start) && num <= ipv4ToNumber(range.end),
  );
}

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
    address = `${address.slice(0, lastColon + 1)}0`; // placeholder hextet, replaced below
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
  if (!bytes) return true; // unparseable → treat as unsafe (fail closed)

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

/** True if a *literal* IP address (v4 or v6) is private/reserved/loopback. */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateV4(ip);
  if (net.isIPv6(ip)) return isPrivateV6(ip);
  return false; // not an IP literal
}

/** Static, synchronous URL validation: shape, scheme, and literal-IP hosts. */
export function validateUrl(input: string): UrlVerdict {
  if (!input || input.trim() === '') {
    return { safe: false, reason: 'URL is required' };
  }

  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return { safe: false, reason: 'Invalid URL format' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, reason: 'Only http and https URLs are allowed' };
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, ''); // strip IPv6 brackets

  if (host === 'localhost' || host.endsWith('.localhost')) {
    return { safe: false, reason: 'Private or reserved address' };
  }
  if (net.isIP(host) && isPrivateIp(host)) {
    return { safe: false, reason: 'Private or reserved address' };
  }

  return { safe: true, url: parsed.toString() };
}

/**
 * Resolve a hostname (A + AAAA) and reject if *any* resolved address is
 * private. Literal IPs are checked directly. Used both before the scan and on
 * every redirect hop, which is what defeats DNS-rebind and redirect bypasses.
 */
export async function checkHostSafety(host: string): Promise<HostVerdict> {
  const cleaned = host.replace(/^\[|\]$/g, '');

  if (cleaned === 'localhost' || cleaned.endsWith('.localhost')) {
    return { safe: false, reason: 'Private or reserved address' };
  }

  if (net.isIP(cleaned)) {
    return isPrivateIp(cleaned)
      ? { safe: false, reason: 'Private or reserved address' }
      : { safe: true };
  }

  const [v4, v6] = await Promise.all([
    dns.resolve4(cleaned).catch(() => [] as string[]),
    dns.resolve6(cleaned).catch(() => [] as string[]),
  ]);

  const resolved = [...v4, ...v6];
  if (resolved.length === 0) {
    return { safe: false, reason: 'Could not resolve hostname' };
  }
  if (resolved.some(isPrivateIp)) {
    return { safe: false, reason: 'Hostname resolves to a private or reserved address' };
  }
  return { safe: true };
}

/** Full async pre-scan gate: static validation + DNS resolution check. */
export async function assertSafeUrl(input: string): Promise<UrlVerdict> {
  const basic = validateUrl(input);
  if (!basic.safe) return basic;

  const host = new URL(basic.url).hostname;
  const hostVerdict = await checkHostSafety(host);
  if (!hostVerdict.safe) return { safe: false, reason: hostVerdict.reason };

  return basic;
}

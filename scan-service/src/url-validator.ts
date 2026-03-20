import { URL } from 'url';
import dns from 'dns/promises';
import net from 'net';

export type ValidationResult =
  | { valid: true; url: string }
  | { valid: false; reason: string };

const BLOCKED_RANGES = [
  { start: '10.0.0.0', end: '10.255.255.255' },
  { start: '172.16.0.0', end: '172.31.255.255' },
  { start: '192.168.0.0', end: '192.168.255.255' },
  { start: '127.0.0.0', end: '127.255.255.255' },
  { start: '169.254.0.0', end: '169.254.255.255' },
  { start: '0.0.0.0', end: '0.255.255.255' },
];

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isPrivateIp(ip: string): boolean {
  if (!net.isIPv4(ip)) return false;
  const num = ipToNumber(ip);
  return BLOCKED_RANGES.some(
    (range) => num >= ipToNumber(range.start) && num <= ipToNumber(range.end),
  );
}

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

  const hostname = parsed.hostname;

  if (hostname === 'localhost' || hostname === '0.0.0.0') {
    return { valid: false, reason: 'Private or reserved address' };
  }

  if (net.isIPv4(hostname) && isPrivateIp(hostname)) {
    return { valid: false, reason: 'Private or reserved address' };
  }

  return { valid: true, url: parsed.toString() };
}

export async function validateUrlWithDns(input: string): Promise<ValidationResult> {
  const basic = validateUrl(input);
  if (!basic.valid) return basic;

  const parsed = new URL(basic.url);
  if (!net.isIPv4(parsed.hostname)) {
    try {
      const addresses = await dns.resolve4(parsed.hostname);
      if (addresses.some(isPrivateIp)) {
        return { valid: false, reason: 'Private or reserved address' };
      }
    } catch {
      return { valid: false, reason: 'Could not resolve hostname' };
    }
  }

  return { valid: true, url: basic.url };
}

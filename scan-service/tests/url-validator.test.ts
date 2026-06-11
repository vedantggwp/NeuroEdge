import { describe, it, expect } from 'vitest';
import { validateUrl, isPrivateIp, checkHostSafety } from '../src/url-validator.js';

// ─── Existing tests (preserved exactly) ─────────────────────────────────────

describe('validateUrl', () => {
  it('accepts valid public HTTP URLs', () => {
    expect(validateUrl('https://example.com')).toEqual({ valid: true, url: 'https://example.com/' });
    expect(validateUrl('http://example.com')).toEqual({ valid: true, url: 'http://example.com/' });
  });

  it('rejects private/reserved IPs', () => {
    expect(validateUrl('http://localhost')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://127.0.0.1')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://10.0.0.1')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://192.168.1.1')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://172.16.0.1')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://169.254.169.254')).toEqual({ valid: false, reason: 'Private or reserved address' });
  });

  it('rejects non-HTTP protocols', () => {
    expect(validateUrl('file:///etc/passwd')).toEqual({ valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' });
    expect(validateUrl('ftp://example.com')).toEqual({ valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' });
  });

  it('rejects empty/invalid input', () => {
    expect(validateUrl('')).toEqual({ valid: false, reason: 'URL is required' });
    expect(validateUrl('not-a-url')).toEqual({ valid: false, reason: 'Invalid URL format' });
  });
});

// ─── New: isPrivateIp — IPv4 (mirrored from mcp-server/tests/url-guard.test.ts) ─

describe('isPrivateIp — IPv4', () => {
  it.each([
    '0.0.0.0',
    '10.0.0.1',
    '100.64.0.1',        // CGNAT (RFC6598)
    '127.0.0.1',
    '169.254.169.254',   // cloud metadata
    '172.16.0.1',
    '172.31.255.255',
    '192.0.0.1',         // IETF protocol assignments
    '192.168.1.1',
    '198.18.0.1',        // benchmarking
    '198.19.255.255',    // benchmarking upper bound
  ])('flags %s as private', (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  it.each(['1.1.1.1', '8.8.8.8', '93.184.216.34', '172.32.0.1'])(
    'allows public %s',
    (ip) => {
      expect(isPrivateIp(ip)).toBe(false);
    },
  );
});

// ─── New: isPrivateIp — IPv6 ─────────────────────────────────────────────────

describe('isPrivateIp — IPv6', () => {
  it.each([
    '::1',                   // loopback
    '::',                    // unspecified
    'fc00::1',               // unique-local
    'fd12:3456:789a::1',     // unique-local (fd range)
    'fe80::1',               // link-local
    '::ffff:127.0.0.1',      // IPv4-mapped loopback
    '::ffff:10.0.0.1',       // IPv4-mapped RFC1918
  ])('flags %s as private', (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  it.each([
    '2606:4700:4700::1111',  // Cloudflare
    '2001:4860:4860::8888',  // Google
  ])('allows public %s', (ip) => {
    expect(isPrivateIp(ip)).toBe(false);
  });
});

// ─── New: validateUrl — IPv6 literal hosts ────────────────────────────────────

describe('validateUrl — IPv6 hosts', () => {
  it('rejects literal private/loopback IPv6 hosts', () => {
    expect(validateUrl('http://[::1]').valid).toBe(false);
    expect(validateUrl('http://[fc00::1]').valid).toBe(false);
    expect(validateUrl('http://[fe80::1]').valid).toBe(false);
    expect(validateUrl('http://[::ffff:127.0.0.1]').valid).toBe(false);
  });

  it('rejects *.localhost', () => {
    expect(validateUrl('http://sub.localhost').valid).toBe(false);
  });
});

// ─── New: checkHostSafety — literal hosts (no DNS) ───────────────────────────

describe('checkHostSafety — literal hosts', () => {
  it('rejects private/loopback literals and localhost', async () => {
    expect((await checkHostSafety('127.0.0.1')).valid).toBe(false);
    expect((await checkHostSafety('::1')).valid).toBe(false);
    expect((await checkHostSafety('169.254.169.254')).valid).toBe(false);
    expect((await checkHostSafety('localhost')).valid).toBe(false);
    expect((await checkHostSafety('100.64.0.1')).valid).toBe(false);
  });

  it('allows public IP literals', async () => {
    expect((await checkHostSafety('1.1.1.1')).valid).toBe(true);
    expect((await checkHostSafety('2606:4700:4700::1111')).valid).toBe(true);
  });
});

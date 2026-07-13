import { describe, it, expect } from 'vitest';
import { validateUrl, isPrivateIp, checkHostSafety } from '@neuroedge/shared';

// --- validateUrl ---

describe('validateUrl', () => {
  it('accepts valid public HTTP URLs', () => {
    expect(validateUrl('https://example.com')).toEqual({ safe: true, url: 'https://example.com/' });
    expect(validateUrl('http://example.com')).toEqual({ safe: true, url: 'http://example.com/' });
  });

  it('rejects private/reserved IPs', () => {
    expect(validateUrl('http://localhost')).toEqual({ safe: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://127.0.0.1')).toEqual({ safe: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://10.0.0.1')).toEqual({ safe: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://192.168.1.1')).toEqual({ safe: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://172.16.0.1')).toEqual({ safe: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://169.254.169.254')).toEqual({ safe: false, reason: 'Private or reserved address' });
  });

  it('rejects non-HTTP protocols', () => {
    expect(validateUrl('file:///etc/passwd')).toEqual({ safe: false, reason: 'Only http and https URLs are allowed' });
    expect(validateUrl('ftp://example.com')).toEqual({ safe: false, reason: 'Only http and https URLs are allowed' });
  });

  it('rejects empty/invalid input', () => {
    expect(validateUrl('')).toEqual({ safe: false, reason: 'URL is required' });
    expect(validateUrl('not-a-url')).toEqual({ safe: false, reason: 'Invalid URL format' });
  });
});

// --- isPrivateIp — IPv4 ---

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

// --- isPrivateIp — IPv6 ---

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

// --- validateUrl — IPv6 literal hosts ---

describe('validateUrl — IPv6 hosts', () => {
  it('rejects literal private/loopback IPv6 hosts', () => {
    expect(validateUrl('http://[::1]').safe).toBe(false);
    expect(validateUrl('http://[fc00::1]').safe).toBe(false);
    expect(validateUrl('http://[fe80::1]').safe).toBe(false);
    expect(validateUrl('http://[::ffff:127.0.0.1]').safe).toBe(false);
  });

  it('rejects *.localhost', () => {
    expect(validateUrl('http://sub.localhost').safe).toBe(false);
  });
});

// --- checkHostSafety — literal hosts (no DNS) ---

describe('checkHostSafety — literal hosts', () => {
  it('rejects private/loopback literals and localhost', async () => {
    expect((await checkHostSafety('127.0.0.1')).safe).toBe(false);
    expect((await checkHostSafety('::1')).safe).toBe(false);
    expect((await checkHostSafety('169.254.169.254')).safe).toBe(false);
    expect((await checkHostSafety('localhost')).safe).toBe(false);
    expect((await checkHostSafety('100.64.0.1')).safe).toBe(false);
  });

  it('allows public IP literals', async () => {
    expect((await checkHostSafety('1.1.1.1')).safe).toBe(true);
    expect((await checkHostSafety('2606:4700:4700::1111')).safe).toBe(true);
  });
});

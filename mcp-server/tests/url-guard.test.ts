import { describe, it, expect } from 'vitest';
import {
  isPrivateIp,
  validateUrl,
  checkHostSafety,
} from '../src/url-guard.js';

describe('isPrivateIp — IPv4', () => {
  it.each([
    '0.0.0.0',
    '10.0.0.1',
    '100.64.0.1', // CGNAT
    '127.0.0.1',
    '169.254.169.254', // cloud metadata
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '198.18.0.1', // benchmarking
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

describe('isPrivateIp — IPv6', () => {
  it.each([
    '::1', // loopback
    '::', // unspecified
    'fc00::1', // unique-local
    'fd12:3456:789a::1', // unique-local
    'fe80::1', // link-local
    '::ffff:127.0.0.1', // IPv4-mapped loopback
    '::ffff:10.0.0.1', // IPv4-mapped RFC1918
  ])('flags %s as private', (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  it.each([
    '2606:4700:4700::1111', // Cloudflare
    '2001:4860:4860::8888', // Google
  ])('allows public %s', (ip) => {
    expect(isPrivateIp(ip)).toBe(false);
  });
});

describe('validateUrl', () => {
  it('accepts public http/https URLs', () => {
    expect(validateUrl('https://example.com')).toEqual({
      safe: true,
      url: 'https://example.com/',
    });
  });

  it('rejects non-http(s) schemes', () => {
    expect(validateUrl('file:///etc/passwd').safe).toBe(false);
    expect(validateUrl('ftp://example.com').safe).toBe(false);
    expect(validateUrl('javascript:alert(1)').safe).toBe(false);
  });

  it('rejects literal private/loopback hosts (v4 and v6)', () => {
    expect(validateUrl('http://127.0.0.1').safe).toBe(false);
    expect(validateUrl('http://10.0.0.1').safe).toBe(false);
    expect(validateUrl('http://[::1]').safe).toBe(false);
    expect(validateUrl('http://localhost').safe).toBe(false);
    expect(validateUrl('http://sub.localhost').safe).toBe(false);
  });

  it('rejects empty/garbage input', () => {
    expect(validateUrl('').safe).toBe(false);
    expect(validateUrl('not a url').safe).toBe(false);
  });
});

describe('checkHostSafety — literal hosts (no DNS)', () => {
  it('rejects private/loopback literals and localhost', async () => {
    expect((await checkHostSafety('127.0.0.1')).safe).toBe(false);
    expect((await checkHostSafety('::1')).safe).toBe(false);
    expect((await checkHostSafety('169.254.169.254')).safe).toBe(false);
    expect((await checkHostSafety('localhost')).safe).toBe(false);
  });

  it('allows public IP literals', async () => {
    expect((await checkHostSafety('1.1.1.1')).safe).toBe(true);
    expect((await checkHostSafety('2606:4700:4700::1111')).safe).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { validateUrl } from '../src/url-validator.js';

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

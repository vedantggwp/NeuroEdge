import { describe, it, expect, vi } from 'vitest';
import type { HTTPRequest } from 'puppeteer';
import { guardRequest } from '../src/request-guard.js';

/** Minimal fake of Puppeteer's HTTPRequest exposing url()/abort()/continue(). */
function makeReq(url: string) {
  const abort = vi.fn(async () => {});
  const cont = vi.fn(async () => {});
  const req = { url: () => url, abort, continue: cont } as unknown as HTTPRequest;
  return { req, abort, cont };
}

describe('guardRequest — SSRF enforcement on every request', () => {
  it('aborts a literal private IP (loopback)', async () => {
    const { req, abort, cont } = makeReq('http://127.0.0.1/');
    await guardRequest(req, new Map());
    expect(abort).toHaveBeenCalledOnce();
    expect(cont).not.toHaveBeenCalled();
  });

  it('aborts the cloud-metadata IP', async () => {
    const { req, abort } = makeReq('http://169.254.169.254/latest/meta-data/');
    await guardRequest(req, new Map());
    expect(abort).toHaveBeenCalledOnce();
  });

  it('aborts localhost', async () => {
    const { req, abort } = makeReq('http://localhost:8080/');
    await guardRequest(req, new Map());
    expect(abort).toHaveBeenCalledOnce();
  });

  it('allows a public literal IP', async () => {
    const { req, cont, abort } = makeReq('http://8.8.8.8/');
    await guardRequest(req, new Map());
    expect(cont).toHaveBeenCalledOnce();
    expect(abort).not.toHaveBeenCalled();
  });

  it('passes through non-network schemes (data:)', async () => {
    const { req, cont, abort } = makeReq('data:text/html,<p>hi</p>');
    await guardRequest(req, new Map());
    expect(cont).toHaveBeenCalledOnce();
    expect(abort).not.toHaveBeenCalled();
  });

  it('fails CLOSED on a malformed URL (aborts, never continues)', async () => {
    const { req, abort, cont } = makeReq('not-a-valid-url');
    await guardRequest(req, new Map());
    expect(abort).toHaveBeenCalledOnce();
    expect(cont).not.toHaveBeenCalled();
  });

  it('caches the verdict per host', async () => {
    const safeHosts = new Map<string, boolean>();
    const a = makeReq('http://8.8.8.8/a');
    await guardRequest(a.req, safeHosts);
    expect(safeHosts.get('8.8.8.8')).toBe(true);
    const b = makeReq('http://127.0.0.1/');
    await guardRequest(b.req, safeHosts);
    expect(safeHosts.get('127.0.0.1')).toBe(false);
  });
});

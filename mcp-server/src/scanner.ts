/**
 * The scan engine: load a URL in headless Chromium, run axe-core, and return
 * structured WCAG findings. Chromium is lazy-loaded on first scan so the MCP
 * server starts instantly and can list its tools without a browser present.
 */
import type { Browser, Page, HTTPRequest } from 'puppeteer';
import type { AxeResults, NodeResult, TagValue } from 'axe-core';
import {
  assertSafeUrl,
  checkHostSafety,
  isPrivateIp,
  calculateScore,
  detectCMS,
  type ScanResult,
  type ScanViolation,
} from '@neuroedge/shared';

const NAV_TIMEOUT_MS = 30_000;
const SCAN_TIMEOUT_MS = 45_000;
const SETTLE_MS = 1_500;
const MAX_SAMPLE_NODES = 3;
const MAX_HTML_CHARS = 200;

const IMPACT_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      const puppeteer = (await import('puppeteer')).default;
      return puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    })().catch((err) => {
      browserPromise = null; // allow retry on next call
      throw err;
    });
  }
  return browserPromise;
}

/** Release the shared browser (used on shutdown). */
export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise.catch(() => null);
    browserPromise = null;
    await browser?.close().catch(() => {});
  }
}

/**
 * Re-validate every main-frame navigation against the SSRF guard, so a public
 * URL that 302-redirects (or DNS-rebinds) to a private address is aborted
 * mid-flight. Literal-IP sub-resources are also cheaply blocked.
 */
async function guardRequest(page: Page, req: HTTPRequest): Promise<void> {
  try {
    const host = new URL(req.url()).hostname;
    const isMainNavigation = req.isNavigationRequest() && req.frame() === page.mainFrame();

    if (isMainNavigation) {
      const verdict = await checkHostSafety(host);
      if (!verdict.safe) {
        await req.abort('addressunreachable');
        return;
      }
    } else if (host && isPrivateIp(host.replace(/^\[|\]$/g, ''))) {
      await req.abort('addressunreachable');
      return;
    }
    await req.continue();
  } catch {
    try {
      await req.continue();
    } catch {
      /* request already handled */
    }
  }
}

async function runScan(url: string): Promise<ScanResult> {
  const gate = await assertSafeUrl(url);
  if (!gate.safe) throw new Error(gate.reason);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    );

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      void guardRequest(page, req);
    });

    await page.goto(gate.url, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT_MS });
    await new Promise<void>((resolve) => setTimeout(resolve, SETTLE_MS));

    const { AxePuppeteer } = await import('@axe-core/puppeteer');
    const results: AxeResults = await new AxePuppeteer(page).analyze();

    const violations: ScanViolation[] = results.violations
      .map((v) => ({
        id: v.id,
        impact: v.impact ?? 'minor',
        description: v.description,
        helpUrl: v.helpUrl,
        nodeCount: v.nodes.length,
        wcagTags: v.tags.filter((t: TagValue) => t.startsWith('wcag')),
        sampleNodes: v.nodes.slice(0, MAX_SAMPLE_NODES).map((n: NodeResult) => ({
          target: n.target.map((t) => (typeof t === 'string' ? t : t.join(' '))),
          html: (n.html ?? '').slice(0, MAX_HTML_CHARS),
          failureSummary: n.failureSummary ?? '',
        })),
      }))
      .sort((a, b) => (IMPACT_ORDER[a.impact] ?? 3) - (IMPACT_ORDER[b.impact] ?? 3));

    const score = calculateScore({
      violations: results.violations.map((v) => ({
        impact: v.impact ?? 'minor',
        nodes: v.nodes,
      })),
      passes: results.passes,
    });

    const cms = await detectCMS(page);

    return {
      url: gate.url,
      score,
      totalViolations: violations.reduce((sum, v) => sum + v.nodeCount, 0),
      violations,
      passedRules: results.passes.length,
      totalRules: results.passes.length + results.violations.length + results.incomplete.length,
      cms,
    };
  } finally {
    await page.close().catch(() => {});
  }
}

/** Scan a URL with an overall hard timeout. */
export async function scanUrl(url: string): Promise<ScanResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Scan timed out after ${SCAN_TIMEOUT_MS / 1000}s`)),
      SCAN_TIMEOUT_MS,
    );
  });
  try {
    return await Promise.race([runScan(url), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

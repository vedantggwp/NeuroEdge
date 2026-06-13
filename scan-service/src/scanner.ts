import puppeteer, { type Browser } from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import type { AxeResults, NodeResult, TagValue } from 'axe-core';
import { validateUrlWithDns } from './url-validator.js';
import { guardRequest } from './request-guard.js';
import { calculateScore } from './score.js';
import { detectCMS } from './cms-detector.js';
import { captureAnnotatedScreenshot } from './screenshot.js';

export interface ScanSampleNode {
  target: string[];
  html: string;
  failureSummary: string;
}

export interface ScanViolation {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  nodeCount: number;
  wcagTags: string[];
  sampleNodes?: ScanSampleNode[];
}

export interface ScanResult {
  url: string;
  score: number;
  totalViolations: number;
  violations: ScanViolation[];
  passedRules: number;
  totalRules: number;
  cms: string;
  screenshots?: {
    fullPage: string;
    annotated: string;
    issueCount: number;
  };
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browser;
}

const IMPACT_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

type AxeViolation = AxeResults['violations'][number];

async function scanUrlInternal(url: string): Promise<ScanResult> {
  const validation = await validateUrlWithDns(url);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    );

    await page.setRequestInterception(true);
    const safeHosts = new Map<string, boolean>();
    page.on('request', (req) => {
      void guardRequest(req, safeHosts);
    });

    await page.goto(validation.url, { waitUntil: 'networkidle2', timeout: 30_000 });
    await new Promise<void>((r) => setTimeout(r, 2000));

    const results: AxeResults = await new AxePuppeteer(page).analyze();

    const MAX_SAMPLE_NODES = 3;
    const MAX_HTML_CHARS = 200;

    const violations: ScanViolation[] = results.violations
      .map((v: AxeViolation) => ({
        id: v.id,
        impact: v.impact ?? 'minor',
        description: v.description,
        helpUrl: v.helpUrl,
        nodeCount: v.nodes.length,
        wcagTags: v.tags.filter((t: TagValue) => t.startsWith('wcag')),
        sampleNodes: v.nodes.slice(0, MAX_SAMPLE_NODES).map((n: NodeResult) => ({
          target: n.target.map((t: string | string[]) =>
            typeof t === 'string' ? t : t.join(' '),
          ),
          html: (n.html ?? '').slice(0, MAX_HTML_CHARS),
          failureSummary: n.failureSummary ?? '',
        })),
      }))
      .sort(
        (a: ScanViolation, b: ScanViolation) =>
          (IMPACT_ORDER[a.impact] ?? 3) - (IMPACT_ORDER[b.impact] ?? 3),
      );

    const score = calculateScore({
      violations: results.violations.map((v: AxeViolation) => ({
        impact: v.impact ?? 'minor',
        nodes: v.nodes,
      })),
      passes: results.passes,
    });

    const cms = await detectCMS(page);

    // Capture annotated screenshot (optional — failures must not break the scan)
    let screenshots: ScanResult['screenshots'];
    try {
      const screenshotViolations = results.violations.map((v: AxeViolation) => ({
        id: v.id,
        impact: v.impact ?? 'minor',
        targets: v.nodes.flatMap((n: NodeResult) =>
          n.target.map((t: string | string[]) => (typeof t === 'string' ? t : t.toString())),
        ),
      }));

      const captured = await captureAnnotatedScreenshot(page, screenshotViolations);

      screenshots = {
        fullPage: captured.fullPage.toString('base64'),
        annotated: captured.annotated.toString('base64'),
        issueCount: captured.issueHighlights.filter((h) => h.boundingBox !== null).length,
      };
    } catch (screenshotError) {
      // Screenshot failure is non-fatal — log and continue
      console.error('Screenshot capture failed:', screenshotError);
    }

    return {
      url: validation.url,
      score,
      totalViolations: violations.reduce((sum, v) => sum + v.nodeCount, 0),
      violations,
      passedRules: results.passes.length,
      totalRules:
        results.passes.length +
        results.violations.length +
        results.incomplete.length,
      cms,
      screenshots,
    };
  } finally {
    await page.close();
  }
}

const SCAN_TIMEOUT_MS = 45_000;

export async function scanUrl(url: string): Promise<ScanResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Scan timed out after ${SCAN_TIMEOUT_MS / 1000}s`)),
      SCAN_TIMEOUT_MS,
    );
  });

  try {
    return await Promise.race([scanUrlInternal(url), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

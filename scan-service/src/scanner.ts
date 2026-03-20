import puppeteer, { type Browser } from 'puppeteer';
import AxePuppeteer from '@axe-core/puppeteer';
import { validateUrlWithDns } from './url-validator.js';
import { calculateScore } from './score.js';

export interface ScanViolation {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  nodeCount: number;
  wcagTags: string[];
}

export interface ScanResult {
  url: string;
  score: number;
  totalViolations: number;
  violations: ScanViolation[];
  passedRules: number;
  totalRules: number;
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

export async function scanUrl(url: string): Promise<ScanResult> {
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

    await page.goto(validation.url, { waitUntil: 'networkidle2', timeout: 30_000 });
    await new Promise<void>((r) => setTimeout(r, 2000));

    const results = await new AxePuppeteer(page).analyze();

    const violations: ScanViolation[] = results.violations
      .map((v) => ({
        id: v.id,
        impact: v.impact ?? 'minor',
        description: v.description,
        helpUrl: v.helpUrl,
        nodeCount: v.nodes.length,
        wcagTags: v.tags.filter((t) => t.startsWith('wcag')),
      }))
      .sort(
        (a, b) => (IMPACT_ORDER[a.impact] ?? 3) - (IMPACT_ORDER[b.impact] ?? 3),
      );

    const score = calculateScore({
      violations: results.violations.map((v) => ({
        impact: v.impact ?? 'minor',
        nodes: v.nodes,
      })),
      passes: results.passes,
    });

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
    };
  } finally {
    await page.close();
  }
}

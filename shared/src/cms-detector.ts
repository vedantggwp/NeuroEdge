/**
 * Heuristic CMS/platform fingerprinting. Best-effort: any failing check is
 * skipped, and an undetected platform returns "unknown". Knowing the platform
 * lets the host AI give CMS-specific "how to fix it yourself" guidance.
 */
/**
 * Minimal subset of Puppeteer's Page used by CMS detection.
 * Avoids a hard dependency on a specific puppeteer version/installation.
 */
export interface CmsDetectorPage {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  evaluate(pageFunction: any, ...args: any[]): Promise<any>;
}

async function hasMetaGenerator(page: CmsDetectorPage, pattern: string): Promise<boolean> {
  return page.evaluate((p: string) => {
    const meta = document.querySelector('meta[name="generator"]');
    const content = meta?.getAttribute('content') ?? '';
    return content.toLowerCase().includes(p.toLowerCase());
  }, pattern);
}

async function hasScriptSrc(page: CmsDetectorPage, pattern: string): Promise<boolean> {
  return page.evaluate((p: string) => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.some((s) => (s.getAttribute('src') ?? '').includes(p));
  }, pattern);
}

async function hasAnySrcOrHref(page: CmsDetectorPage, pattern: string): Promise<boolean> {
  return page.evaluate((p: string) => {
    const elements = Array.from(document.querySelectorAll('[src], [href]'));
    return elements.some((el) => {
      const src = el.getAttribute('src') ?? '';
      const href = el.getAttribute('href') ?? '';
      return src.includes(p) || href.includes(p);
    });
  }, pattern);
}

async function hasMetaNamePrefix(page: CmsDetectorPage, prefix: string): Promise<boolean> {
  return page.evaluate((p: string) => {
    const metas = Array.from(document.querySelectorAll('meta[name]'));
    return metas.some((m) => (m.getAttribute('name') ?? '').startsWith(p));
  }, prefix);
}

interface CmsSignal {
  readonly name: string;
  readonly check: (page: CmsDetectorPage) => Promise<boolean>;
}

const CMS_SIGNALS: readonly CmsSignal[] = [
  {
    name: 'wordpress',
    check: async (page) =>
      (await hasMetaGenerator(page, 'WordPress')) ||
      (await hasAnySrcOrHref(page, 'wp-content/')) ||
      hasAnySrcOrHref(page, 'wp-includes/'),
  },
  {
    name: 'wix',
    check: async (page) =>
      (await hasMetaGenerator(page, 'Wix')) || hasScriptSrc(page, 'static.wixstatic.com'),
  },
  {
    name: 'squarespace',
    check: async (page) =>
      (await hasMetaGenerator(page, 'Squarespace')) || hasScriptSrc(page, 'squarespace-cdn'),
  },
  {
    name: 'shopify',
    check: async (page) =>
      (await hasMetaNamePrefix(page, 'shopify-')) || hasScriptSrc(page, 'cdn.shopify.com'),
  },
  {
    name: 'webflow',
    check: async (page) =>
      (await hasMetaGenerator(page, 'Webflow')) || hasScriptSrc(page, 'webflow.com'),
  },
  {
    name: 'godaddy',
    check: async (page) => hasMetaGenerator(page, 'GoDaddy'),
  },
];

export async function detectCMS(page: CmsDetectorPage): Promise<string> {
  for (const signal of CMS_SIGNALS) {
    try {
      if (await signal.check(page)) return signal.name;
    } catch {
      continue;
    }
  }
  return 'unknown';
}

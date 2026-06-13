import type { Page } from 'puppeteer';

interface CmsSignal {
  readonly name: string;
  readonly check: (page: Page) => Promise<boolean>;
}

async function hasMetaGenerator(page: Page, pattern: string): Promise<boolean> {
  return page.evaluate((p) => {
    const meta = document.querySelector('meta[name="generator"]');
    if (!meta) return false;
    const content = meta.getAttribute('content') ?? '';
    return content.toLowerCase().includes(p.toLowerCase());
  }, pattern);
}

async function hasScriptSrc(page: Page, pattern: string): Promise<boolean> {
  return page.evaluate((p) => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.some((s) => (s.getAttribute('src') ?? '').includes(p));
  }, pattern);
}

async function hasLinkHref(page: Page, pattern: string): Promise<boolean> {
  return page.evaluate((p) => {
    const links = Array.from(document.querySelectorAll('link[href]'));
    return links.some((l) => (l.getAttribute('href') ?? '').includes(p));
  }, pattern);
}

async function hasAnySrcOrHref(page: Page, pattern: string): Promise<boolean> {
  return page.evaluate((p) => {
    const elements = Array.from(document.querySelectorAll('[src], [href]'));
    return elements.some((el) => {
      const src = el.getAttribute('src') ?? '';
      const href = el.getAttribute('href') ?? '';
      return src.includes(p) || href.includes(p);
    });
  }, pattern);
}

async function hasMetaNamePrefix(page: Page, prefix: string): Promise<boolean> {
  return page.evaluate((p) => {
    const metas = Array.from(document.querySelectorAll('meta[name]'));
    return metas.some((m) => (m.getAttribute('name') ?? '').startsWith(p));
  }, prefix);
}

const CMS_SIGNALS: readonly CmsSignal[] = [
  {
    name: 'wordpress',
    check: async (page) => {
      const byGenerator = await hasMetaGenerator(page, 'WordPress');
      if (byGenerator) return true;
      const byContent = await hasAnySrcOrHref(page, 'wp-content/');
      if (byContent) return true;
      return hasAnySrcOrHref(page, 'wp-includes/');
    },
  },
  {
    name: 'wix',
    check: async (page) => {
      const byGenerator = await hasMetaGenerator(page, 'Wix');
      if (byGenerator) return true;
      return hasScriptSrc(page, 'static.wixstatic.com');
    },
  },
  {
    name: 'squarespace',
    check: async (page) => {
      const byGenerator = await hasMetaGenerator(page, 'Squarespace');
      if (byGenerator) return true;
      return hasScriptSrc(page, 'squarespace-cdn');
    },
  },
  {
    name: 'shopify',
    check: async (page) => {
      const byMeta = await hasMetaNamePrefix(page, 'shopify-');
      if (byMeta) return true;
      return hasScriptSrc(page, 'cdn.shopify.com');
    },
  },
  {
    name: 'webflow',
    check: async (page) => {
      const byGenerator = await hasMetaGenerator(page, 'Webflow');
      if (byGenerator) return true;
      return hasScriptSrc(page, 'webflow.com');
    },
  },
  {
    name: 'godaddy',
    check: async (page) => {
      return hasMetaGenerator(page, 'GoDaddy');
    },
  },
];

export async function detectCMS(page: Page): Promise<string> {
  for (const signal of CMS_SIGNALS) {
    try {
      const matched = await signal.check(page);
      if (matched) return signal.name;
    } catch (err) {
      console.warn(`CMS check "${signal.name}" failed:`, err instanceof Error ? err.message : err);
      continue;
    }
  }
  return 'unknown';
}

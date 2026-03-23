import type { Page } from 'puppeteer';

export interface IssueHighlight {
  violationId: string;
  impact: string;
  selector: string;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
}

export interface AnnotatedScreenshot {
  fullPage: Buffer;
  annotated: Buffer;
  issueHighlights: IssueHighlight[];
}

export async function captureAnnotatedScreenshot(
  page: Page,
  violations: ReadonlyArray<{ id: string; impact: string; targets: string[] }>,
): Promise<AnnotatedScreenshot> {
  // 1. Take clean full-page screenshot (viewport only to cap size)
  const fullPage = (await page.screenshot({
    fullPage: false,
    type: 'png',
  })) as Buffer;

  // 2. Collect bounding boxes for violation elements
  const issueHighlights: IssueHighlight[] = [];

  for (const violation of violations.slice(0, 10)) {
    for (const selector of violation.targets.slice(0, 3)) {
      try {
        const box = await page.evaluate((sel: string) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return {
            x: rect.x + window.scrollX,
            y: rect.y + window.scrollY,
            width: rect.width,
            height: rect.height,
          };
        }, selector);

        issueHighlights.push({
          violationId: violation.id,
          impact: violation.impact,
          selector,
          boundingBox: box,
        });
      } catch {
        // Element might not be queryable, skip
      }
    }
  }

  // 3. Inject highlight overlays and take annotated screenshot
  await page.evaluate((highlights: IssueHighlight[]) => {
    const overlay = document.createElement('div');
    overlay.id = 'neuroedge-overlay';
    overlay.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999999;';

    for (const h of highlights) {
      if (!h.boundingBox) continue;
      const { x, y, width, height } = h.boundingBox;

      const colour =
        h.impact === 'critical'
          ? '#DC2626'
          : h.impact === 'serious'
            ? '#D97706'
            : '#2563EB';

      // Red/amber/blue highlight box
      const box = document.createElement('div');
      box.style.cssText = [
        'position:absolute',
        `left:${x}px`,
        `top:${y}px`,
        `width:${width}px`,
        `height:${height}px`,
        `border:3px solid ${colour}`,
        `background:${colour}22`,
        'border-radius:4px',
      ].join(';');

      // Label
      const label = document.createElement('div');
      label.textContent = `${h.impact.toUpperCase()}: ${h.violationId}`;
      label.style.cssText = [
        'position:absolute',
        `left:${x}px`,
        `top:${Math.max(0, y - 24)}px`,
        `background:${colour}`,
        'color:white',
        'font-size:11px',
        'font-family:sans-serif',
        'padding:2px 8px',
        'border-radius:4px',
        'white-space:nowrap',
      ].join(';');

      overlay.appendChild(box);
      overlay.appendChild(label);
    }

    document.body.appendChild(overlay);
  }, issueHighlights);

  const annotated = (await page.screenshot({
    fullPage: false,
    type: 'png',
  })) as Buffer;

  // 4. Clean up overlay
  await page.evaluate(() => {
    document.getElementById('neuroedge-overlay')?.remove();
  });

  return { fullPage, annotated, issueHighlights };
}

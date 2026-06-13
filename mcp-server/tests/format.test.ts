import { describe, it, expect } from 'vitest';
import { formatScanResult, CHARACTER_LIMIT, type ResponseFormat } from '../src/format.js';
import type { ScanResult } from '../src/types.js';

function makeResult(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    url: 'https://example.com/',
    score: 72,
    totalViolations: 5,
    passedRules: 30,
    totalRules: 36,
    cms: 'wordpress',
    violations: [
      {
        id: 'image-alt',
        impact: 'critical',
        description: 'Images must have alternate text',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/image-alt',
        nodeCount: 3,
        wcagTags: ['wcag2a', 'wcag111'],
        sampleNodes: [
          {
            target: ['img.logo'],
            html: '<img class="logo" src="/logo.png">',
            failureSummary: 'Element does not have an alt attribute',
          },
        ],
      },
      {
        id: 'color-contrast',
        impact: 'serious',
        description: 'Elements must meet minimum contrast ratio thresholds',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/color-contrast',
        nodeCount: 2,
        wcagTags: ['wcag2aa', 'wcag143'],
        sampleNodes: [],
      },
    ],
    ...overrides,
  };
}

describe('formatScanResult — markdown', () => {
  it('includes score, band, violation count, and CMS', () => {
    const { text } = formatScanResult(makeResult(), 'markdown', 20);
    expect(text).toContain('72/100');
    expect(text).toContain('Needs attention');
    expect(text).toContain('wordpress');
    expect(text).toContain('image-alt');
  });

  it('shows "Good" band for score >= 80', () => {
    const { text } = formatScanResult(makeResult({ score: 90 }), 'markdown', 20);
    expect(text).toContain('Good');
  });

  it('shows "Urgent" band for score < 50', () => {
    const { text } = formatScanResult(makeResult({ score: 20 }), 'markdown', 20);
    expect(text).toContain('Urgent');
  });

  it('shows no-violations message when violations array is empty', () => {
    const { text } = formatScanResult(makeResult({ violations: [] }), 'markdown', 20);
    expect(text).toContain('No automatically-detectable violations found');
  });

  it('includes sample selector and failure summary', () => {
    const { text } = formatScanResult(makeResult(), 'markdown', 20);
    expect(text).toContain('img.logo');
    expect(text).toContain('Element does not have an alt attribute');
  });

  it('includes WCAG tags', () => {
    const { text } = formatScanResult(makeResult(), 'markdown', 20);
    expect(text).toContain('wcag2a');
  });

  it('includes help URL reference', () => {
    const { text } = formatScanResult(makeResult(), 'markdown', 20);
    expect(text).toContain('dequeuniversity.com');
  });
});

describe('formatScanResult — json', () => {
  it('returns valid JSON with the scan data', () => {
    const { text, structured } = formatScanResult(makeResult(), 'json', 20);
    const parsed = JSON.parse(text);
    expect(parsed.score).toBe(72);
    expect(parsed.url).toBe('https://example.com/');
    expect(structured.score).toBe(72);
  });
});

describe('formatScanResult — max_violations trimming', () => {
  it('trims violations to max_violations', () => {
    const { structured, text } = formatScanResult(makeResult(), 'markdown', 1);
    expect(structured.violations).toHaveLength(1);
    expect(structured.violations[0]?.id).toBe('image-alt');
    expect(text).toContain('and 1 more rule');
  });

  it('does not trim when max >= total violations', () => {
    const { structured, text } = formatScanResult(makeResult(), 'markdown', 100);
    expect(structured.violations).toHaveLength(2);
    expect(text).not.toContain('more rule');
  });
});

describe('formatScanResult — character limit', () => {
  it('exports a sensible CHARACTER_LIMIT constant', () => {
    expect(CHARACTER_LIMIT).toBe(25_000);
  });

  it('reduces violation count when markdown exceeds limit', () => {
    const longViolations = Array.from({ length: 100 }, (_, i) => ({
      id: `rule-${i}`,
      impact: 'moderate',
      description: 'A'.repeat(500),
      helpUrl: `https://example.com/rule-${i}`,
      nodeCount: 1,
      wcagTags: ['wcag2a'],
      sampleNodes: [
        {
          target: [`.el-${i}`],
          html: '<div>' + 'B'.repeat(200) + '</div>',
          failureSummary: 'C'.repeat(300),
        },
      ],
    }));
    const { text } = formatScanResult(
      makeResult({ violations: longViolations }),
      'markdown',
      100,
    );
    expect(text).toContain('Output truncated');
  });

  it('strips sample HTML from oversized JSON output', () => {
    const longViolations = Array.from({ length: 100 }, (_, i) => ({
      id: `rule-${i}`,
      impact: 'serious',
      description: 'D'.repeat(500),
      helpUrl: `https://example.com/rule-${i}`,
      nodeCount: 1,
      wcagTags: ['wcag2a'],
      sampleNodes: [
        {
          target: [`.el-${i}`],
          html: '<div>' + 'E'.repeat(200) + '</div>',
          failureSummary: 'F'.repeat(300),
        },
      ],
    }));
    const { text } = formatScanResult(
      makeResult({ violations: longViolations }),
      'json',
      100,
    );
    const parsed = JSON.parse(text);
    const allHtmlEmpty = parsed.violations.every(
      (v: { sampleNodes: { html: string }[] }) =>
        v.sampleNodes.every((n: { html: string }) => n.html === ''),
    );
    expect(allHtmlEmpty).toBe(true);
  });
});

describe('formatScanResult — structured output consistency', () => {
  it('structured result matches trimmed violations', () => {
    const result = makeResult();
    const { structured } = formatScanResult(result, 'json', 1);
    expect(structured.violations).toHaveLength(1);
    expect(structured.url).toBe(result.url);
    expect(structured.score).toBe(result.score);
  });
});

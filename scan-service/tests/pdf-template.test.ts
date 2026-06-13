import { describe, it, expect } from 'vitest';
import { buildReportHtml, type ReportData } from '../src/pdf/template.js';
import type { TranslatedIssue } from '../src/translator.js';

function makeIssue(overrides: Partial<TranslatedIssue> = {}): TranslatedIssue {
  return {
    id: 'image-alt',
    plainEnglish: 'Some images on your website are missing descriptions.',
    businessImpact: 'Screen reader users cannot understand the images.',
    fixDifficulty: 'easy',
    estimatedFixTime: 'Under 1 hour',
    whatToTellDeveloper: 'Add alt attributes to all img elements.',
    howToFixYourself: 'In your CMS, click each image and add alt text.',
    cmsSpecificSteps: 'In WordPress: Go to Media Library, click image, fill in Alt Text field.',
    canFixYourself: true,
    ...overrides,
  };
}

function makeReport(overrides: Partial<ReportData> = {}): ReportData {
  return {
    scanUrl: 'https://example.com',
    industry: 'restaurant',
    score: 72,
    totalViolations: 5,
    passedRules: 30,
    totalRules: 36,
    issues: [makeIssue()],
    generatedAt: '13 June 2026',
    ...overrides,
  };
}

describe('buildReportHtml', () => {
  it('returns a complete HTML document', () => {
    const html = buildReportHtml(makeReport());
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('includes the scanned URL', () => {
    const html = buildReportHtml(makeReport());
    expect(html).toContain('example.com');
  });

  it('includes the score', () => {
    const html = buildReportHtml(makeReport({ score: 85 }));
    expect(html).toContain('85');
  });

  it('includes the generated-at date', () => {
    const html = buildReportHtml(makeReport());
    expect(html).toContain('13 June 2026');
  });

  it('includes issue details', () => {
    const html = buildReportHtml(makeReport());
    expect(html).toContain('image-alt');
    expect(html).toContain('missing descriptions');
  });

  it('includes developer cheat sheet content', () => {
    const html = buildReportHtml(makeReport());
    expect(html).toContain('Developer Cheat Sheet');
    expect(html).toContain('Add alt attributes');
  });

  it('renders empty developer cheat sheet when no issues', () => {
    const html = buildReportHtml(makeReport({ issues: [] }));
    expect(html).toContain('Developer Cheat Sheet');
    expect(html).toContain('No translated issues');
  });

  it('includes easy-wins section for easy-fix issues', () => {
    const html = buildReportHtml(makeReport());
    expect(html).toContain('Easy wins');
  });

  it('omits easy-wins section when no easy fixes exist', () => {
    const html = buildReportHtml(
      makeReport({ issues: [makeIssue({ fixDifficulty: 'hard' })] }),
    );
    expect(html).not.toContain('Easy wins');
  });

  it('renders self-fix section for canFixYourself issues', () => {
    const html = buildReportHtml(makeReport());
    expect(html).toContain('What You Can Fix Yourself');
    expect(html).toContain('Self-service fix');
  });

  it('renders no-self-fix message when all issues need developer', () => {
    const html = buildReportHtml(
      makeReport({ issues: [makeIssue({ canFixYourself: false })] }),
    );
    expect(html).toContain('No owner-editable fixes');
  });

  it('renders CMS-specific steps callout', () => {
    const html = buildReportHtml(makeReport());
    expect(html).toContain('CMS-specific steps');
    expect(html).toContain('WordPress');
  });

  it('escapes HTML in issue fields', () => {
    const html = buildReportHtml(
      makeReport({
        issues: [makeIssue({ id: '<script>alert("xss")</script>' })],
      }),
    );
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert("xss")</script>');
  });

  it('handles multiple issues', () => {
    const issues = [
      makeIssue({ id: 'image-alt' }),
      makeIssue({ id: 'color-contrast', fixDifficulty: 'medium', canFixYourself: false }),
      makeIssue({ id: 'link-name', fixDifficulty: 'hard' }),
    ];
    const html = buildReportHtml(makeReport({ issues }));
    expect(html).toContain('image-alt');
    expect(html).toContain('color-contrast');
    expect(html).toContain('link-name');
  });
});

describe('buildReportHtml — score rendering', () => {
  it('renders score ring SVG', () => {
    const html = buildReportHtml(makeReport({ score: 72 }));
    expect(html).toContain('<svg');
    expect(html).toContain('72');
  });

  it('clamps score to 0–100 range', () => {
    const highHtml = buildReportHtml(makeReport({ score: 150 }));
    expect(highHtml).toContain('100');

    const lowHtml = buildReportHtml(makeReport({ score: -10 }));
    expect(lowHtml).toContain('0');
  });
});

describe('buildReportHtml — score status text', () => {
  it('shows "Strong foundation" for score >= 80', () => {
    const html = buildReportHtml(makeReport({ score: 90 }));
    expect(html).toContain('Strong foundation');
  });

  it('shows "Needs planned improvements" for score 50-79', () => {
    const html = buildReportHtml(makeReport({ score: 60 }));
    expect(html).toContain('Needs planned improvements');
  });

  it('shows "Requires urgent attention" for score < 50', () => {
    const html = buildReportHtml(makeReport({ score: 30 }));
    expect(html).toContain('Requires urgent attention');
  });
});

describe('buildReportHtml — fix difficulty badges', () => {
  it('renders Easy fix badge', () => {
    const html = buildReportHtml(
      makeReport({ issues: [makeIssue({ fixDifficulty: 'easy' })] }),
    );
    expect(html).toContain('Easy fix');
  });

  it('renders Medium fix badge', () => {
    const html = buildReportHtml(
      makeReport({ issues: [makeIssue({ fixDifficulty: 'medium' })] }),
    );
    expect(html).toContain('Medium fix');
  });

  it('renders Hard fix badge', () => {
    const html = buildReportHtml(
      makeReport({ issues: [makeIssue({ fixDifficulty: 'hard' })] }),
    );
    expect(html).toContain('Hard fix');
  });
});

describe('buildReportHtml — stats rendering', () => {
  it('includes passed/total rules and violation count', () => {
    const html = buildReportHtml(makeReport({ passedRules: 30, totalRules: 36, totalViolations: 5 }));
    expect(html).toContain('30');
    expect(html).toContain('36');
    expect(html).toContain('5');
  });
});

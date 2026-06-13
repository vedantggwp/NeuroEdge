/**
 * Render a ScanResult as either agent-friendly Markdown or machine-readable
 * JSON, capping output size so a violation-heavy page never floods the host
 * model's context window.
 */
import type { ScanResult, ScanViolation } from '@neuroedge/shared';

export const CHARACTER_LIMIT = 25_000;

export type ResponseFormat = 'markdown' | 'json';

function scoreBand(score: number): string {
  if (score >= 80) return 'Good — strong foundation';
  if (score >= 50) return 'Needs attention';
  return 'Urgent — significant barriers';
}

function trimViolations(
  result: ScanResult,
  maxViolations: number,
): { shown: ScanViolation[]; omitted: number } {
  const shown = result.violations.slice(0, maxViolations);
  return { shown, omitted: Math.max(0, result.violations.length - shown.length) };
}

function toMarkdown(result: ScanResult, maxViolations: number): string {
  const { shown, omitted } = trimViolations(result, maxViolations);
  const lines: string[] = [
    `# Accessibility scan: ${result.url}`,
    '',
    `- **Score:** ${result.score}/100 — ${scoreBand(result.score)}`,
    `- **Failing elements:** ${result.totalViolations} across ${result.violations.length} rule(s)`,
    `- **Rules passed:** ${result.passedRules}/${result.totalRules}`,
    `- **Platform:** ${result.cms}`,
    '',
    '## Violations (most severe first)',
    '',
  ];

  if (shown.length === 0) {
    lines.push('No automatically-detectable violations found. 🎉');
  }

  for (const v of shown) {
    lines.push(`### ${v.id} — ${v.impact} (${v.nodeCount} element(s))`);
    lines.push(v.description);
    if (v.wcagTags.length) lines.push(`WCAG: ${v.wcagTags.join(', ')}`);
    const first = v.sampleNodes[0];
    if (first) {
      lines.push(`Example selector: \`${first.target.join(' ') || '(unknown)'}\``);
      if (first.failureSummary) {
        lines.push(`Why: ${first.failureSummary.replace(/\n+/g, ' ')}`);
      }
    }
    lines.push(`Reference: ${v.helpUrl}`);
    lines.push('');
  }

  if (omitted > 0) {
    lines.push(
      `_…and ${omitted} more rule(s). Re-run with a higher \`max_violations\` to see them._`,
    );
  }

  return lines.join('\n');
}

/**
 * Produce the text payload + the structured object for a scan response.
 * Structured data always reflects exactly what is shown in the text.
 */
export function formatScanResult(
  result: ScanResult,
  format: ResponseFormat,
  maxViolations: number,
): { text: string; structured: ScanResult } {
  const { shown } = trimViolations(result, maxViolations);
  const structured: ScanResult = { ...result, violations: shown };

  if (format === 'json') {
    let text = JSON.stringify(structured, null, 2);
    if (text.length > CHARACTER_LIMIT) {
      // Drop verbose sample HTML first, then summaries, to fit the budget.
      const lean: ScanResult = {
        ...structured,
        violations: shown.map((v) => ({
          ...v,
          sampleNodes: v.sampleNodes.map((n) => ({ ...n, html: '' })),
        })),
      };
      text = JSON.stringify(lean, null, 2);
    }
    return { text, structured };
  }

  let text = toMarkdown(result, maxViolations);
  if (text.length > CHARACTER_LIMIT) {
    const fewer = Math.max(1, Math.floor(maxViolations / 2));
    text =
      toMarkdown(result, fewer) +
      `\n\n_Output truncated to fit. ${result.violations.length} rule(s) total._`;
  }
  return { text, structured };
}

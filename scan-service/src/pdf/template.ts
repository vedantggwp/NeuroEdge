import type { TranslatedIssue } from '../translator.js';

export interface ReportData {
  scanUrl: string;
  industry: string;
  score: number;
  totalViolations: number;
  passedRules: number;
  totalRules: number;
  issues: TranslatedIssue[];
  generatedAt: string;
}

const BRAND_NAVY = '#0F2B4C';
const BRAND_TEAL = '#2DD4A8';
const BRAND_AMBER = '#F59E0B';
const BRAND_BG = '#FAFBFC';
const BRAND_CARD = '#FFFFFF';
const BRAND_BORDER = 'rgba(15,43,76,0.06)';
const BRAND_TEXT = '#14263F';
const BRAND_MUTED = '#526277';
const BRAND_SUBTLE = '#7B8794';
const BRAND_RED = '#DC2626';

function escapeHtml(value: string | undefined): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scoreColor(score: number): string {
  if (score >= 80) return BRAND_TEAL;
  if (score >= 50) return BRAND_AMBER;
  return BRAND_RED;
}

function scoreStatus(score: number): string {
  if (score >= 80) return 'Strong foundation';
  if (score >= 50) return 'Needs planned improvements';
  return 'Requires urgent attention';
}

function renderParagraphs(text: string | undefined, className = 'body-copy'): string {
  const paragraphs = (text ?? '')
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return '';

  return paragraphs
    .map(
      (paragraph) =>
        `<p class="${className}">${escapeHtml(paragraph).replace(/\n/g, '<br/>')}</p>`,
    )
    .join('');
}

function extractInstructionItems(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const looksStructured =
    lines.length > 1 || /(^|\s)(step\s*\d+|\d+\.)/i.test(text) || /^[-*]\s+/m.test(text);

  if (!looksStructured) return [];

  return lines
    .map((line) =>
      line
        .replace(/^(step\s*)?\d+[\).\:-]?\s*/i, '')
        .replace(/^[-*]\s*/, '')
        .trim(),
    )
    .filter(Boolean);
}

function renderInstructionContent(
  text: string | undefined,
  fallback: string,
  paragraphClass = 'body-copy',
): string {
  const content = (text ?? '').trim() || fallback;
  if (!content) return '';

  const items = extractInstructionItems(content);
  if (items.length >= 2) {
    return `<ol class="instruction-list">${items
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('')}</ol>`;
  }

  return renderParagraphs(content, paragraphClass);
}

function pill(label: string, tone: 'teal' | 'amber' | 'red' | 'navy' | 'slate'): string {
  return `<span class="pill pill--${tone}">${escapeHtml(label)}</span>`;
}

function severityBadge(difficulty: string): string {
  const label = `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)} fix`;

  if (difficulty === 'easy') return pill(label, 'teal');
  if (difficulty === 'medium') return pill(label, 'amber');
  if (difficulty === 'hard') return pill(label, 'red');
  return pill(label, 'slate');
}

function actionBadge(issue: TranslatedIssue): string {
  return issue.canFixYourself ? pill('You Can Fix This', 'teal') : pill('Send to Developer', 'amber');
}

function scoreRing(score: number, size = 160, strokeWidth = 12): string {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const color = scoreColor(safeScore);
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeScore / 100) * circumference;
  const numberSize = Math.round(size * 0.22);
  const labelSize = Math.round(size * 0.075);

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#DBE3EC" stroke-width="${strokeWidth}"></circle>
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        fill="none"
        stroke="${color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${dashOffset}"
        stroke-linecap="round"
        transform="rotate(-90 ${center} ${center})"
      ></circle>
      <text
        x="${center}"
        y="${center - size * 0.06}"
        text-anchor="middle"
        font-family="'JetBrains Mono', monospace"
        font-size="${numberSize}"
        font-weight="800"
        fill="${BRAND_NAVY}"
      >${safeScore}</text>
      <text
        x="${center}"
        y="${center + size * 0.12}"
        text-anchor="middle"
        font-family="'Plus Jakarta Sans', sans-serif"
        font-size="${labelSize}"
        font-weight="600"
        text-transform="uppercase"
        letter-spacing="0.1em"
        fill="${BRAND_SUBTLE}"
      >out of 100</text>
    </svg>`;
}

function easyWins(issues: TranslatedIssue[]): string {
  const wins = issues.filter((issue) => issue.fixDifficulty === 'easy').slice(0, 3);
  if (wins.length === 0) return '';

  const items = wins
    .map(
      (issue, index) => `
        <li class="quick-win-item">
          <div class="quick-win-index">0${index + 1}</div>
          <div class="quick-win-copy">
            <div class="quick-win-title-row">
              <h3 class="quick-win-title">${escapeHtml(issue.id)}</h3>
              <div class="badge-row">
                ${actionBadge(issue)}
                ${severityBadge(issue.fixDifficulty)}
              </div>
            </div>
            ${renderParagraphs(issue.plainEnglish)}
            <p class="micro-copy">Estimated effort: ${escapeHtml(issue.estimatedFixTime)}</p>
          </div>
        </li>`,
    )
    .join('');

  return `
    <section class="section-shell quick-wins-card">
      <div class="section-header">
        <div class="section-eyebrow">Fastest progress</div>
        <h2 class="section-title">Easy wins to tackle first</h2>
        <p class="section-description">These are the quickest fixes to improve usability, reduce friction, and start lifting your score.</p>
      </div>
      <ul class="quick-win-list">${items}</ul>
    </section>`;
}

function issueCard(issue: TranslatedIssue, index: number): string {
  const fixGuidance = issue.canFixYourself
    ? issue.howToFixYourself?.trim() || 'Use your site editor or CMS to update this item directly.'
    : issue.howToFixYourself?.trim() ||
      'This issue likely needs code changes. Forward the developer note below.';

  const cmsCallout = issue.cmsSpecificSteps?.trim()
    ? `
        <div class="cms-callout">
          <div class="callout-label">CMS-specific steps</div>
          ${renderInstructionContent(issue.cmsSpecificSteps, '')}
        </div>`
    : '';

  return `
    <article class="issue-card">
      <div class="issue-header">
        <div>
          <div class="issue-index">Issue ${index + 1}</div>
          <h3 class="issue-title">${escapeHtml(issue.id)}</h3>
        </div>
        <div class="badge-row">
          ${actionBadge(issue)}
          ${severityBadge(issue.fixDifficulty)}
        </div>
      </div>

      <div class="issue-meta">
        <div class="meta-chip">
          <span class="meta-chip-label">Estimated time</span>
          <span class="meta-chip-value">${escapeHtml(issue.estimatedFixTime)}</span>
        </div>
        <div class="meta-chip">
          <span class="meta-chip-label">Routing</span>
          <span class="meta-chip-value">${issue.canFixYourself ? 'CMS/editor task' : 'Developer task'}</span>
        </div>
      </div>

      <section class="issue-panel">
        <div class="panel-label">What's Wrong</div>
        ${renderParagraphs(issue.plainEnglish)}
        <div class="impact-box">
          <div class="callout-label">Business impact</div>
          ${renderParagraphs(issue.businessImpact, 'impact-copy')}
        </div>
      </section>

      <section class="issue-panel issue-panel--fix">
        <div class="panel-label">How to Fix It</div>
        <div class="fix-box ${issue.canFixYourself ? 'fix-box--teal' : 'fix-box--amber'}">
          <div class="callout-label">${issue.canFixYourself ? 'Owner-friendly action plan' : 'Needs developer support'}</div>
          ${renderInstructionContent(fixGuidance, '')}
        </div>
        ${cmsCallout}
        <div class="developer-box">
          <div class="callout-label">What to tell your developer</div>
          ${renderParagraphs(issue.whatToTellDeveloper, 'developer-copy')}
        </div>
      </section>
    </article>`;
}

function selfFixSummary(issues: TranslatedIssue[]): string {
  const selfFixIssues = issues.filter((issue) => issue.canFixYourself);

  const content =
    selfFixIssues.length === 0
      ? `
          <div class="empty-state">
            <h3>No owner-editable fixes were identified in this scan.</h3>
            <p>Everything in this report currently looks like a developer-led change. Use the Developer Cheat Sheet on the next page to brief your team quickly.</p>
          </div>`
      : selfFixIssues
          .map(
            (issue) => `
              <article class="summary-card">
                <div class="summary-card-header">
                  <div>
                    <div class="summary-eyebrow">Self-service fix</div>
                    <h3 class="summary-title">${escapeHtml(issue.id)}</h3>
                  </div>
                  <div class="badge-row">
                    ${actionBadge(issue)}
                    ${severityBadge(issue.fixDifficulty)}
                  </div>
                </div>
                ${renderParagraphs(issue.plainEnglish)}
                <div class="cms-callout">
                  <div class="callout-label">CMS steps</div>
                  ${renderInstructionContent(
                    issue.cmsSpecificSteps,
                    issue.howToFixYourself?.trim() ||
                      'Open your page editor or CMS and update this item directly.',
                  )}
                </div>
              </article>`,
          )
          .join('');

  return `
    <section class="section-shell break-before">
      <div class="section-header">
        <div class="section-eyebrow">Owner action list</div>
        <h2 class="section-title">What You Can Fix Yourself</h2>
        <p class="section-description">This section only includes issues that look safe for a non-technical owner or marketer to resolve inside a CMS or page editor.</p>
      </div>
      <div class="summary-grid">${content}</div>
    </section>`;
}

function developerCheatSheet(issues: TranslatedIssue[]): string {
  if (issues.length === 0) {
    return `
      <section class="section-shell">
        <div class="section-header">
          <div class="section-eyebrow">Technical handoff</div>
          <h2 class="section-title">Developer Cheat Sheet</h2>
          <p class="section-description">No translated issues were available for the technical handoff table.</p>
        </div>
      </section>`;
  }

  const rows = issues
    .map(
      (issue, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="table-issue-title">${escapeHtml(issue.id)}</div>
            <div class="table-issue-subtitle">${escapeHtml(issue.estimatedFixTime)}</div>
          </td>
          <td>${escapeHtml(issue.whatToTellDeveloper)}</td>
          <td>${severityBadge(issue.fixDifficulty)}</td>
          <td>${actionBadge(issue)}</td>
        </tr>`,
    )
    .join('');

  return `
    <section class="section-shell">
      <div class="section-header">
        <div class="section-eyebrow">Technical handoff</div>
        <h2 class="section-title">Developer Cheat Sheet</h2>
        <p class="section-description">Copy this page into an email, ticket, or sprint brief so your developer has the issue IDs, business context, and routing at a glance.</p>
      </div>
      <div class="table-wrap">
        <table class="cheat-sheet-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Issue</th>
              <th>What to tell your developer</th>
              <th>Difficulty</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

export function buildReportHtml(data: ReportData): string {
  const { scanUrl, industry, score, totalViolations, passedRules, totalRules, issues, generatedAt } =
    data;

  const easyCount = issues.filter((issue) => issue.fixDifficulty === 'easy').length;
  const mediumCount = issues.filter((issue) => issue.fixDifficulty === 'medium').length;
  const hardCount = issues.filter((issue) => issue.fixDifficulty === 'hard').length;
  const selfFixCount = issues.filter((issue) => issue.canFixYourself).length;
  const developerOnlyCount = issues.length - selfFixCount;

  const issueCards = issues.length
    ? issues.map((issue, index) => issueCard(issue, index)).join('')
    : `
        <div class="empty-state">
          <h3>No translated issues were returned for this report.</h3>
          <p>If the scan found violations, rerun the translation step so the plain-English issue cards can be generated.</p>
        </div>`;

  const wins = easyWins(issues);
  const selfFixSection = selfFixSummary(issues);
  const cheatSheet = developerCheatSheet(issues);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NeuroEdge Accessibility Report - ${escapeHtml(scanUrl)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --navy: ${BRAND_NAVY};
      --teal: ${BRAND_TEAL};
      --amber: ${BRAND_AMBER};
      --bg: ${BRAND_BG};
      --card: ${BRAND_CARD};
      --border: ${BRAND_BORDER};
      --text: ${BRAND_TEXT};
      --muted: ${BRAND_MUTED};
      --subtle: ${BRAND_SUBTLE};
      --red: ${BRAND_RED};
      --navy-soft: #ECF2F8;
      --teal-soft: #E8FBF5;
      --amber-soft: #FFF5DD;
      --red-soft: #FEE2E2;
      --shadow: 0 18px 40px rgba(15, 43, 76, 0.08);
      --radius-lg: 20px;
      --radius-md: 14px;
      --radius-sm: 10px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      background: var(--bg);
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    @page {
      size: A4;
      margin: 18mm 14mm;
    }

    h1, h2, h3, h4 {
      color: var(--navy);
      line-height: 1.2;
    }

    p {
      color: var(--muted);
    }

    .report-shell {
      width: 100%;
    }

    .cover-page {
      page-break-after: always;
      break-after: page;
      min-height: 240mm;
    }

    .cover-card {
      background: linear-gradient(180deg, #FFFFFF 0%, #F4F7FA 100%);
      border: 1px solid var(--border);
      border-radius: 26px;
      box-shadow: var(--shadow);
      min-height: 240mm;
      overflow: hidden;
      position: relative;
    }

    .cover-ribbon {
      background: linear-gradient(90deg, var(--navy) 0%, #173C66 100%);
      min-height: 82px;
      padding: 24px 28px;
      position: relative;
    }

    .cover-ribbon::after {
      background: rgba(45, 212, 168, 0.14);
      border-radius: 999px;
      content: '';
      height: 180px;
      position: absolute;
      right: -44px;
      top: -92px;
      width: 180px;
    }

    .brand-lockup {
      align-items: center;
      display: flex;
      gap: 14px;
      position: relative;
      z-index: 1;
    }

    .brand-mark {
      align-items: center;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      color: #FFFFFF;
      display: flex;
      font-size: 16px;
      font-weight: 800;
      height: 46px;
      justify-content: center;
      letter-spacing: 0.08em;
      width: 46px;
    }

    .brand-name {
      color: #FFFFFF;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.04em;
    }

    .brand-tagline {
      color: rgba(255, 255, 255, 0.72);
      font-size: 12px;
      margin-top: 4px;
    }

    .cover-body {
      padding: 28px 32px 34px;
      position: relative;
    }

    .cover-eyebrow,
    .section-eyebrow,
    .issue-index,
    .summary-eyebrow {
      color: var(--subtle);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .cover-title {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.05em;
      margin-top: 10px;
      max-width: 460px;
    }

    .cover-url-block {
      background: rgba(15, 43, 76, 0.04);
      border: 1px solid rgba(15, 43, 76, 0.08);
      border-radius: 18px;
      margin-top: 22px;
      padding: 18px 20px;
    }

    .cover-url-label {
      color: var(--subtle);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .cover-url {
      color: var(--navy);
      font-size: 19px;
      font-weight: 700;
      margin-top: 8px;
      overflow-wrap: anywhere;
    }

    .cover-grid {
      align-items: center;
      display: grid;
      gap: 24px;
      grid-template-columns: 1.1fr 0.9fr;
      margin-top: 30px;
    }

    .cover-score {
      align-items: center;
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      justify-content: center;
      min-height: 260px;
      padding: 24px;
      text-align: center;
    }

    .cover-score-caption {
      color: var(--subtle);
      font-size: 12px;
      font-weight: 600;
    }

    .cover-score-status {
      color: var(--navy);
      font-size: 14px;
      font-weight: 700;
    }

    .cover-detail-grid {
      display: grid;
      gap: 14px;
    }

    .detail-card {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 16px 18px;
    }

    .detail-label {
      color: var(--subtle);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .detail-value {
      color: var(--navy);
      font-size: 16px;
      font-weight: 700;
      margin-top: 8px;
      overflow-wrap: anywhere;
    }

    .detail-note {
      color: var(--muted);
      font-size: 12px;
      margin-top: 8px;
    }

    .cover-stat-grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-top: 26px;
    }

    .cover-stat {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 16px;
    }

    .cover-stat-value {
      color: var(--navy);
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.04em;
    }

    .cover-stat-label {
      color: var(--subtle);
      font-size: 12px;
      margin-top: 4px;
    }

    .section-shell {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      margin-bottom: 22px;
      overflow: hidden;
      padding: 26px 28px;
    }

    .section-header {
      margin-bottom: 18px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.04em;
      margin-top: 8px;
    }

    .section-description {
      color: var(--muted);
      font-size: 13px;
      margin-top: 8px;
      max-width: 620px;
    }

    .overview-grid {
      align-items: center;
      display: grid;
      gap: 24px;
      grid-template-columns: 180px 1fr;
    }

    .overview-copy h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.04em;
      margin-bottom: 10px;
    }

    .overview-copy p {
      font-size: 13px;
      max-width: 560px;
    }

    .overview-status {
      align-items: center;
      display: flex;
      gap: 10px;
      margin-top: 14px;
    }

    .stat-grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-top: 20px;
    }

    .stat-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      min-height: 104px;
      padding: 16px;
    }

    .stat-card-value {
      color: var(--navy);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.04em;
    }

    .stat-card-value--teal {
      color: var(--teal);
    }

    .stat-card-value--amber {
      color: var(--amber);
    }

    .stat-card-value--red {
      color: var(--red);
    }

    .stat-card-label {
      color: var(--subtle);
      font-size: 12px;
      margin-top: 4px;
    }

    .stat-card-copy {
      color: var(--muted);
      font-size: 11px;
      margin-top: 10px;
    }

    .legal-card {
      background: linear-gradient(135deg, var(--navy-soft) 0%, #F8FBFE 100%);
    }

    .legal-panel {
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(15, 43, 76, 0.1);
      border-left: 4px solid var(--navy);
      border-radius: 16px;
      padding: 16px 18px;
    }

    .quick-wins-card {
      background: linear-gradient(180deg, #FFFFFF 0%, #F7FBFA 100%);
    }

    .quick-win-list {
      list-style: none;
    }

    .quick-win-item {
      border-top: 1px solid var(--border);
      display: grid;
      gap: 14px;
      grid-template-columns: 54px 1fr;
      padding: 16px 0;
    }

    .quick-win-item:first-child {
      border-top: none;
      padding-top: 0;
    }

    .quick-win-item:last-child {
      padding-bottom: 0;
    }

    .quick-win-index {
      align-items: center;
      background: var(--teal-soft);
      border-radius: 16px;
      color: var(--navy);
      display: flex;
      font-size: 16px;
      font-weight: 800;
      height: 54px;
      justify-content: center;
      width: 54px;
    }

    .quick-win-title-row {
      align-items: flex-start;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .quick-win-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-right: 12px;
    }

    .issue-card {
      background: linear-gradient(180deg, #FFFFFF 0%, #FCFDFE 100%);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: 0 10px 24px rgba(15, 43, 76, 0.05);
      margin-bottom: 18px;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
      padding: 22px 24px;
    }

    .issue-card:last-child {
      margin-bottom: 0;
    }

    .issue-header {
      align-items: flex-start;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .issue-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.04em;
      margin-top: 6px;
    }

    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }

    .pill {
      border-radius: 999px;
      display: inline-flex;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      padding: 6px 12px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .pill--teal {
      background: var(--teal-soft);
      color: #047857;
    }

    .pill--amber {
      background: var(--amber-soft);
      color: #B45309;
    }

    .pill--red {
      background: var(--red-soft);
      color: #B91C1C;
    }

    .pill--navy {
      background: var(--navy-soft);
      color: var(--navy);
    }

    .pill--slate {
      background: #EEF2F7;
      color: #556374;
    }

    .issue-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 18px;
    }

    .meta-chip {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 999px;
      display: inline-flex;
      gap: 8px;
      padding: 7px 12px;
    }

    .meta-chip-label {
      color: var(--subtle);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .meta-chip-value {
      color: var(--navy);
      font-size: 12px;
      font-weight: 700;
    }

    .issue-panel {
      background: var(--bg);
      border: 1px solid rgba(15, 43, 76, 0.08);
      border-radius: 16px;
      margin-top: 14px;
      padding: 18px;
    }

    .issue-panel--fix {
      background: linear-gradient(180deg, #FFFFFF 0%, #FBFCFD 100%);
    }

    .panel-label {
      color: var(--navy);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .body-copy,
    .impact-copy,
    .developer-copy,
    .micro-copy {
      color: var(--muted);
      font-size: 13px;
      margin-top: 8px;
    }

    .body-copy:first-child,
    .impact-copy:first-child,
    .developer-copy:first-child {
      margin-top: 0;
    }

    .micro-copy {
      color: var(--subtle);
      font-size: 12px;
      margin-top: 10px;
    }

    .impact-box,
    .cms-callout,
    .developer-box,
    .fix-box {
      border-radius: 14px;
      margin-top: 14px;
      padding: 14px 16px;
    }

    .impact-box {
      background: rgba(15, 43, 76, 0.05);
      border: 1px solid rgba(15, 43, 76, 0.08);
    }

    .fix-box {
      border: 1px solid rgba(15, 43, 76, 0.08);
      background: #FFFFFF;
    }

    .fix-box--teal {
      background: linear-gradient(180deg, #FFFFFF 0%, #F3FCF8 100%);
      border-color: rgba(45, 212, 168, 0.28);
    }

    .fix-box--amber {
      background: linear-gradient(180deg, #FFFFFF 0%, #FFF9EC 100%);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .cms-callout {
      background: linear-gradient(180deg, #FFFFFF 0%, #F8FBFE 100%);
      border: 1px solid rgba(15, 43, 76, 0.1);
      border-left: 4px solid var(--navy);
    }

    .developer-box {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.18);
    }

    .callout-label {
      color: var(--navy);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .instruction-list {
      color: var(--muted);
      margin: 10px 0 0 18px;
      padding: 0;
    }

    .instruction-list li {
      margin: 0 0 8px 0;
      padding-left: 4px;
    }

    .instruction-list li:last-child {
      margin-bottom: 0;
    }

    .revenue-grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-top: 18px;
    }

    .revenue-card {
      background: linear-gradient(180deg, #FFFFFF 0%, #F8FBFD 100%);
    }

    .revenue-stat {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      min-height: 122px;
      padding: 18px;
    }

    .revenue-stat-value {
      color: var(--navy);
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.04em;
    }

    .revenue-stat-value--amber {
      color: var(--amber);
    }

    .revenue-stat-value--teal {
      color: var(--teal);
    }

    .revenue-stat-label {
      color: var(--muted);
      font-size: 12px;
      margin-top: 8px;
    }

    .summary-grid {
      display: grid;
      gap: 14px;
    }

    .summary-card {
      background: linear-gradient(180deg, #FFFFFF 0%, #FBFCFD 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
      padding: 18px;
    }

    .summary-card-header {
      align-items: flex-start;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .summary-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-top: 6px;
    }

    .empty-state {
      background: linear-gradient(180deg, #FFFFFF 0%, #F8FBFE 100%);
      border: 1px dashed rgba(15, 43, 76, 0.18);
      border-radius: 16px;
      padding: 20px;
    }

    .empty-state h3 {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .empty-state p {
      font-size: 13px;
      max-width: 560px;
    }

    .table-wrap {
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
    }

    .cheat-sheet-table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
    }

    .cheat-sheet-table thead {
      display: table-header-group;
    }

    .cheat-sheet-table th {
      background: linear-gradient(90deg, var(--navy) 0%, #163B65 100%);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 12px 14px;
      text-align: left;
      text-transform: uppercase;
    }

    .cheat-sheet-table th:nth-child(1) { width: 7%; }
    .cheat-sheet-table th:nth-child(2) { width: 19%; }
    .cheat-sheet-table th:nth-child(3) { width: 44%; }
    .cheat-sheet-table th:nth-child(4) { width: 15%; }
    .cheat-sheet-table th:nth-child(5) { width: 15%; }

    .cheat-sheet-table td {
      border-bottom: 1px solid var(--border);
      color: var(--muted);
      font-size: 12px;
      overflow-wrap: anywhere;
      padding: 12px 14px;
      vertical-align: top;
    }

    .cheat-sheet-table tbody tr:nth-child(even) {
      background: #FBFCFD;
    }

    .cheat-sheet-table tbody tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .cheat-sheet-table tbody tr:last-child td {
      border-bottom: none;
    }

    .table-issue-title {
      color: var(--navy);
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 4px;
    }

    .table-issue-subtitle {
      color: var(--subtle);
      font-size: 11px;
    }

    .closing-note {
      background: transparent;
      color: var(--subtle);
      font-size: 12px;
      margin-top: 8px;
      padding: 8px 2px 0;
    }

    .closing-note strong {
      color: var(--navy);
    }

    .break-before {
      page-break-before: always;
      break-before: page;
    }

    .print-footer {
      bottom: -10mm;
      color: var(--subtle);
      font-size: 10px;
      left: 0;
      position: fixed;
      right: 0;
      text-align: center;
      letter-spacing: 0.05em;
    }

    .print-footer-page::after {
      content: counter(page) ' / ' counter(pages);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="print-footer">
    NeuroEdge &middot; Page <span class="print-footer-page"></span>
  </div>

  <main class="report-shell">
    <section class="cover-page">
      <div class="cover-card">
        <div class="cover-ribbon">
          <div class="brand-lockup">
            <div class="brand-mark">NE</div>
            <div>
              <div class="brand-name">NeuroEdge</div>
              <div class="brand-tagline">Accessibility Intelligence for UK Business</div>
            </div>
          </div>
        </div>

        <div class="cover-body">
          <div class="cover-eyebrow">Clean Authority report</div>
          <h1 class="cover-title">Website Accessibility Report</h1>

          <div class="cover-url-block">
            <div class="cover-url-label">Scanned website</div>
            <div class="cover-url">${escapeHtml(scanUrl)}</div>
          </div>

          <div class="cover-grid">
            <div class="cover-detail-grid">
              <div class="detail-card">
                <div class="detail-label">Date generated</div>
                <div class="detail-value">${escapeHtml(generatedAt)}</div>
                <div class="detail-note">Prepared for rapid owner review and technical handoff.</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Industry</div>
                <div class="detail-value">${escapeHtml(industry)}</div>
                <div class="detail-note">Benchmarked against accessibility essentials that affect trust, conversion, and usability.</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Current status</div>
                <div class="detail-value">${escapeHtml(scoreStatus(score))}</div>
                <div class="detail-note">${passedRules} of ${totalRules} rules passed in this scan.</div>
              </div>
            </div>

            <div class="cover-score">
              ${scoreRing(score, 214, 16)}
              <div class="cover-score-caption">Accessibility score</div>
              <div class="cover-score-status">${escapeHtml(scoreStatus(score))}</div>
            </div>
          </div>

          <div class="cover-stat-grid">
            <div class="cover-stat">
              <div class="cover-stat-value">${totalViolations}</div>
              <div class="cover-stat-label">Element-level violations found</div>
            </div>
            <div class="cover-stat">
              <div class="cover-stat-value">${easyCount}</div>
              <div class="cover-stat-label">Easy fixes identified</div>
            </div>
            <div class="cover-stat">
              <div class="cover-stat-value">${selfFixCount}</div>
              <div class="cover-stat-label">Issues you may fix yourself</div>
            </div>
            <div class="cover-stat">
              <div class="cover-stat-value">${developerOnlyCount}</div>
              <div class="cover-stat-label">Issues to route to a developer</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-shell">
      <div class="overview-grid">
        <div>${scoreRing(score, 164, 12)}</div>
        <div class="overview-copy">
          <div class="section-eyebrow">Score overview</div>
          <h1>Accessibility Score Summary</h1>
          <p>${passedRules} rules passed out of ${totalRules} total, with ${totalViolations} element-level violations requiring attention. This report prioritises the issues that most affect trust, usability, and customer reach.</p>
          <div class="overview-status">
            ${pill(scoreStatus(score), score >= 80 ? 'teal' : score >= 50 ? 'amber' : 'red')}
            ${pill(`${selfFixCount} self-fix options`, 'navy')}
          </div>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card-value stat-card-value--teal">${easyCount}</div>
          <div class="stat-card-label">Easy fixes</div>
          <div class="stat-card-copy">Quick improvements with the least implementation effort.</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value stat-card-value--amber">${mediumCount}</div>
          <div class="stat-card-label">Medium fixes</div>
          <div class="stat-card-copy">Important issues that need a planned pass to resolve well.</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value stat-card-value--red">${hardCount}</div>
          <div class="stat-card-label">Hard fixes</div>
          <div class="stat-card-copy">Likely developer-led work involving code or component changes.</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${selfFixCount}</div>
          <div class="stat-card-label">Fixable in your CMS</div>
          <div class="stat-card-copy">Owner-friendly items you may be able to correct without code.</div>
        </div>
      </div>
    </section>

    <section class="section-shell legal-card">
      <div class="section-header">
        <div class="section-eyebrow">Risk and compliance</div>
        <h2 class="section-title">UK Legal Context</h2>
        <p class="section-description">Accessibility is not just a UX improvement. It affects legal exposure, brand trust, and whether customers can complete basic actions on your site.</p>
      </div>
      <div class="legal-panel">
        <p class="body-copy">The Public Sector Bodies Accessibility Regulations 2018 and the Equality Act 2010 set a clear expectation that websites should be usable by people with disabilities. Non-compliance can lead to complaints, reputational damage, and lost revenue from customers who cannot complete journeys independently.</p>
        <p class="body-copy">Improving accessibility helps you serve the roughly 1 in 5 people in the UK who live with a disability, while also improving clarity and ease of use for everyone else.</p>
      </div>
    </section>

    ${wins}

    <section class="section-shell">
      <div class="section-header">
        <div class="section-eyebrow">Detailed findings</div>
        <h2 class="section-title">All Issues Found</h2>
        <p class="section-description">Each issue is split into what is wrong and how to fix it, with owner-friendly routing, CMS guidance, and a clean developer handoff.</p>
      </div>
      ${issueCards}
    </section>

    <section class="section-shell revenue-card">
      <div class="section-header">
        <div class="section-eyebrow">Commercial upside</div>
        <h2 class="section-title">Revenue Opportunity</h2>
        <p class="section-description">Accessibility improvements reduce drop-off, expand your reachable market, and make your site easier for more customers to trust and use.</p>
      </div>
      <div class="revenue-grid">
        <div class="revenue-stat">
          <div class="revenue-stat-value revenue-stat-value--amber">GBP 1.8B</div>
          <div class="revenue-stat-label">Estimated annual revenue left on the table by UK businesses because inaccessible sites block customers.</div>
        </div>
        <div class="revenue-stat">
          <div class="revenue-stat-value revenue-stat-value--teal">71%</div>
          <div class="revenue-stat-label">Share of disabled users who leave websites that are difficult to use or inaccessible.</div>
        </div>
        <div class="revenue-stat">
          <div class="revenue-stat-value">20%</div>
          <div class="revenue-stat-label">Approximate share of the UK population who may benefit directly from better accessibility.</div>
        </div>
      </div>
    </section>

    ${selfFixSection}
    ${cheatSheet}

    <section class="closing-note">
      <p><strong>NeuroEdge</strong> provides this report for informational planning purposes. Final remediation should still be validated by a qualified accessibility professional before sign-off.</p>
    </section>
  </main>
</body>
</html>`;
}

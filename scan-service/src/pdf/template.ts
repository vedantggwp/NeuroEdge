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

const BRAND_TEAL = '#00C9A7';
const BRAND_DARK = '#0D1B2A';
const BRAND_OFFWHITE = '#F8F9FA';
const SEVERITY_COLORS: Record<string, string> = {
  easy: '#00C9A7',
  medium: '#F59E0B',
  hard: '#EF4444',
};

function scoreColor(score: number): string {
  if (score >= 80) return '#00C9A7';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function severityBadge(difficulty: string): string {
  const color = SEVERITY_COLORS[difficulty] ?? '#6B7280';
  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;background:${color}20;color:${color};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">${label} fix</span>`;
}

function scoreRing(score: number): string {
  const color = scoreColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  return `
    <svg width="140" height="140" viewBox="0 0 140 140" style="display:block;">
      <circle cx="70" cy="70" r="${radius}" fill="none" stroke="#E5E7EB" stroke-width="10"/>
      <circle cx="70" cy="70" r="${radius}" fill="none" stroke="${color}" stroke-width="10"
        stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
        stroke-linecap="round" transform="rotate(-90 70 70)"/>
      <text x="70" y="65" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter, sans-serif" font-size="28" font-weight="700" fill="${BRAND_DARK}">${score}</text>
      <text x="70" y="88" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter, sans-serif" font-size="11" fill="#6B7280">out of 100</text>
    </svg>`;
}

function easyWins(issues: TranslatedIssue[]): string {
  const wins = issues.filter((i) => i.fixDifficulty === 'easy').slice(0, 3);
  if (wins.length === 0) return '';

  const items = wins
    .map(
      (w) => `
      <li style="margin:0 0 10px 0;padding:0 0 10px 0;border-bottom:1px solid #E5E7EB;">
        <strong style="color:${BRAND_DARK};">${w.id}</strong>
        <span style="color:#374151;margin-left:8px;">${w.plainEnglish}</span>
        <span style="color:#6B7280;font-size:12px;display:block;margin-top:2px;">${w.estimatedFixTime}</span>
      </li>`,
    )
    .join('');

  return `
  <section style="background:#E6FBF6;border-left:4px solid ${BRAND_TEAL};border-radius:8px;padding:20px 24px;margin:24px 0;">
    <h3 style="margin:0 0 14px 0;font-size:16px;font-weight:700;color:${BRAND_TEAL};">Quick Wins — Fix These First</h3>
    <ul style="list-style:none;padding:0;margin:0;">${items}</ul>
  </section>`;
}

function issueCard(issue: TranslatedIssue, index: number): string {
  return `
  <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:20px 24px;margin:16px 0;page-break-inside:avoid;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
      <div>
        <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Issue ${index + 1}</span>
        <h3 style="margin:2px 0 0 0;font-size:15px;font-weight:700;color:${BRAND_DARK};">${issue.id}</h3>
      </div>
      <div>${severityBadge(issue.fixDifficulty)}</div>
    </div>
    <p style="margin:0 0 10px 0;color:#374151;font-size:14px;line-height:1.6;">${issue.plainEnglish}</p>
    <div style="background:#FEF9EC;border-radius:6px;padding:10px 14px;margin:10px 0;">
      <span style="font-size:12px;font-weight:600;color:#92400E;">Business Impact:</span>
      <p style="margin:4px 0 0 0;font-size:13px;color:#78350F;">${issue.businessImpact}</p>
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px dashed #E5E7EB;">
      <span style="font-size:12px;font-weight:600;color:#4B5563;">Tell your developer:</span>
      <p style="margin:4px 0 0 0;font-size:13px;color:#374151;font-style:italic;">"${issue.whatToTellDeveloper}"</p>
    </div>
    <div style="margin-top:8px;">
      <span style="font-size:12px;color:#6B7280;">Estimated time: ${issue.estimatedFixTime}</span>
    </div>
  </div>`;
}

function developerCheatSheet(issues: TranslatedIssue[]): string {
  const rows = issues
    .map(
      (i, idx) => `
    <tr style="border-bottom:1px solid #E5E7EB;">
      <td style="padding:8px 12px;font-size:12px;color:#374151;">${idx + 1}</td>
      <td style="padding:8px 12px;font-size:12px;font-weight:600;color:${BRAND_DARK};">${i.id}</td>
      <td style="padding:8px 12px;font-size:12px;color:#374151;">${i.whatToTellDeveloper}</td>
      <td style="padding:8px 12px;">${severityBadge(i.fixDifficulty)}</td>
    </tr>`,
    )
    .join('');

  return `
  <section style="margin:32px 0;page-break-before:always;">
    <h2 style="font-size:18px;font-weight:700;color:${BRAND_DARK};margin:0 0 16px 0;">Developer Cheat Sheet</h2>
    <p style="color:#6B7280;font-size:13px;margin:0 0 16px 0;">Copy and paste this list when briefing your web developer.</p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:${BRAND_DARK};color:#fff;">
          <th style="padding:10px 12px;font-size:12px;text-align:left;width:30px;">#</th>
          <th style="padding:10px 12px;font-size:12px;text-align:left;">Issue ID</th>
          <th style="padding:10px 12px;font-size:12px;text-align:left;">What to tell your developer</th>
          <th style="padding:10px 12px;font-size:12px;text-align:left;">Difficulty</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

export function buildReportHtml(data: ReportData): string {
  const { scanUrl, industry, score, totalViolations, passedRules, totalRules, issues, generatedAt } =
    data;

  const easyCount = issues.filter((i) => i.fixDifficulty === 'easy').length;
  const mediumCount = issues.filter((i) => i.fixDifficulty === 'medium').length;
  const hardCount = issues.filter((i) => i.fixDifficulty === 'hard').length;

  const issueCards = issues.map((issue, idx) => issueCard(issue, idx)).join('');
  const cheatSheet = developerCheatSheet(issues);
  const wins = easyWins(issues);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NeuroEdge Accessibility Report — ${scanUrl}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, -apple-system, sans-serif; background: ${BRAND_OFFWHITE}; color: ${BRAND_DARK}; font-size: 14px; line-height: 1.5; }
    @page { margin: 20mm 15mm; size: A4; }
  </style>
</head>
<body style="max-width:820px;margin:0 auto;padding:0 24px 48px;">

  <!-- Header -->
  <header style="background:${BRAND_DARK};color:#fff;padding:32px 32px 28px;border-radius:0 0 16px 16px;margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:${BRAND_TEAL};">NeuroEdge</div>
        <div style="font-size:12px;color:#9CA3AF;margin-top:2px;">Accessibility Intelligence for UK Business</div>
      </div>
      <div style="font-size:11px;color:#6B7280;text-align:right;">
        Generated: ${generatedAt}<br/>
        Industry: ${industry}
      </div>
    </div>
    <div style="margin-top:24px;">
      <div style="font-size:13px;color:#9CA3AF;margin-bottom:4px;">Report for</div>
      <div style="font-size:17px;font-weight:600;color:#fff;word-break:break-all;">${scanUrl}</div>
    </div>
  </header>

  <!-- Score overview -->
  <section style="background:#fff;border-radius:12px;padding:28px 32px;margin-bottom:24px;display:flex;align-items:center;gap:32px;border:1px solid #E5E7EB;">
    <div style="flex-shrink:0;">${scoreRing(score)}</div>
    <div style="flex:1;">
      <h1 style="font-size:20px;font-weight:800;margin-bottom:6px;">Accessibility Score</h1>
      <p style="color:#6B7280;font-size:13px;margin-bottom:16px;">
        ${passedRules} rules passed out of ${totalRules} total. ${totalViolations} element-level violations found.
      </p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <div style="text-align:center;background:${BRAND_OFFWHITE};padding:10px 18px;border-radius:8px;min-width:80px;">
          <div style="font-size:20px;font-weight:700;color:#00C9A7;">${easyCount}</div>
          <div style="font-size:11px;color:#6B7280;margin-top:2px;">Easy fixes</div>
        </div>
        <div style="text-align:center;background:${BRAND_OFFWHITE};padding:10px 18px;border-radius:8px;min-width:80px;">
          <div style="font-size:20px;font-weight:700;color:#F59E0B;">${mediumCount}</div>
          <div style="font-size:11px;color:#6B7280;margin-top:2px;">Medium fixes</div>
        </div>
        <div style="text-align:center;background:${BRAND_OFFWHITE};padding:10px 18px;border-radius:8px;min-width:80px;">
          <div style="font-size:20px;font-weight:700;color:#EF4444;">${hardCount}</div>
          <div style="font-size:11px;color:#6B7280;margin-top:2px;">Harder fixes</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Legal context -->
  <section style="background:#EFF6FF;border-left:4px solid #3B82F6;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
    <h3 style="font-size:14px;font-weight:700;color:#1E40AF;margin-bottom:6px;">UK Legal Context</h3>
    <p style="font-size:13px;color:#1D4ED8;line-height:1.6;">
      The Public Sector Bodies Accessibility Regulations 2018 and the Equality Act 2010 require websites to be accessible to people with disabilities.
      Non-compliance can result in legal action, complaints, and lost customers.
      Fixing these issues improves your reach to <strong>1 in 5 people in the UK</strong> who have a disability.
    </p>
  </section>

  <!-- Easy wins callout -->
  ${wins}

  <!-- All issues -->
  <section style="margin-bottom:24px;">
    <h2 style="font-size:18px;font-weight:700;color:${BRAND_DARK};margin-bottom:4px;">All Issues Found</h2>
    <p style="color:#6B7280;font-size:13px;margin-bottom:16px;">Issues are listed in plain English with guidance on how to fix them.</p>
    ${issueCards}
  </section>

  <!-- Revenue uplift -->
  <section style="background:${BRAND_DARK};color:#fff;border-radius:12px;padding:28px 32px;margin-bottom:24px;">
    <h2 style="font-size:18px;font-weight:700;margin-bottom:10px;">Revenue Opportunity</h2>
    <p style="font-size:13px;color:#9CA3AF;line-height:1.6;margin-bottom:16px;">
      Approximately <strong style="color:${BRAND_TEAL};">1 in 5 people in the UK</strong> have a disability.
      Many use assistive technologies to browse the web. By fixing these accessibility issues, you could
      unlock a significant portion of customers who currently cannot use your website effectively.
    </p>
    <div style="display:flex;gap:20px;flex-wrap:wrap;">
      <div style="background:rgba(255,255,255,0.07);border-radius:8px;padding:14px 20px;flex:1;min-width:180px;">
        <div style="font-size:24px;font-weight:800;color:${BRAND_TEAL};">£1.8B</div>
        <div style="font-size:12px;color:#9CA3AF;margin-top:4px;">Lost to UK businesses annually due to inaccessible websites</div>
      </div>
      <div style="background:rgba(255,255,255,0.07);border-radius:8px;padding:14px 20px;flex:1;min-width:180px;">
        <div style="font-size:24px;font-weight:800;color:${BRAND_TEAL};">71%</div>
        <div style="font-size:12px;color:#9CA3AF;margin-top:4px;">Of disabled users leave a website that is not accessible</div>
      </div>
      <div style="background:rgba(255,255,255,0.07);border-radius:8px;padding:14px 20px;flex:1;min-width:180px;">
        <div style="font-size:24px;font-weight:800;color:${BRAND_TEAL};">20%</div>
        <div style="font-size:12px;color:#9CA3AF;margin-top:4px;">Of the UK population are potential new customers</div>
      </div>
    </div>
  </section>

  <!-- Developer cheat sheet -->
  ${cheatSheet}

  <!-- Footer -->
  <footer style="text-align:center;padding-top:24px;border-top:1px solid #E5E7EB;color:#9CA3AF;font-size:12px;">
    <div style="font-weight:700;color:${BRAND_TEAL};margin-bottom:4px;">NeuroEdge</div>
    <div>Accessibility Intelligence for UK Business · neuroedge.co.uk</div>
    <div style="margin-top:4px;">This report is provided for informational purposes. Results should be verified by a qualified accessibility professional.</div>
  </footer>

</body>
</html>`;
}

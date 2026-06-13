import { Resend } from 'resend';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getResendClient(): Resend {
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }
  return new Resend(apiKey);
}

export async function sendReport(
  email: string,
  pdfBuffer: Buffer,
  scanUrl: string,
  score: number,
): Promise<void> {
  const resend = getResendClient();

  const scoreLabel = score >= 80 ? 'Good' : score >= 50 ? 'Needs Attention' : 'Urgent Action Needed';
  const scoreColor = score >= 80 ? '#00C9A7' : score >= 50 ? '#F59E0B' : '#EF4444';

  const { error } = await resend.emails.send({
    from: 'NeuroEdge <reports@neuroedge.co.uk>',
    to: email,
    subject: `Your NeuroEdge Accessibility Report — Score: ${score}/100`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="font-family:Inter,-apple-system,sans-serif;background:#F8F9FA;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <div style="background:#0D1B2A;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
      <div style="font-size:22px;font-weight:800;color:#00C9A7;letter-spacing:-0.5px;">NeuroEdge</div>
      <div style="font-size:12px;color:#6B7280;margin-top:4px;">Accessibility Intelligence for UK Business</div>
    </div>

    <div style="background:#fff;padding:32px;border:1px solid #E5E7EB;border-top:none;">
      <h1 style="font-size:20px;font-weight:700;color:#0D1B2A;margin:0 0 8px 0;">Your accessibility report is ready</h1>
      <p style="color:#6B7280;font-size:14px;margin:0 0 24px 0;">
        We've completed the scan for <strong style="color:#0D1B2A;">${escapeHtml(scanUrl)}</strong>
      </p>

      <div style="background:#F8F9FA;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
        <div style="font-size:13px;color:#6B7280;margin-bottom:6px;">Accessibility Score</div>
        <div style="font-size:48px;font-weight:800;color:${scoreColor};">${score}</div>
        <div style="font-size:13px;color:#6B7280;">out of 100</div>
        <div style="display:inline-block;margin-top:8px;padding:4px 14px;border-radius:20px;background:${scoreColor}20;color:${scoreColor};font-size:12px;font-weight:600;">${scoreLabel}</div>
      </div>

      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
        Your full report is attached as a PDF. It includes:
      </p>
      <ul style="color:#374151;font-size:14px;line-height:1.8;margin:0 0 24px 20px;">
        <li>Plain English explanations of every issue</li>
        <li>Business impact for each problem</li>
        <li>A developer cheat sheet to share with your web team</li>
        <li>Quick wins you can tackle today</li>
      </ul>

      <div style="background:#E6FBF6;border-left:4px solid #00C9A7;border-radius:6px;padding:14px 18px;margin-bottom:24px;">
        <strong style="font-size:13px;color:#00C9A7;">Did you know?</strong>
        <p style="font-size:13px;color:#065F46;margin:4px 0 0 0;">
          1 in 5 people in the UK have a disability. Fixing these issues could significantly increase your customer reach.
        </p>
      </div>
    </div>

    <div style="background:#F8F9FA;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border:1px solid #E5E7EB;border-top:none;">
      <p style="font-size:12px;color:#9CA3AF;margin:0;">
        Sent by <strong style="color:#00C9A7;">NeuroEdge</strong> · neuroedge.co.uk<br/>
        This report is for informational purposes only.
      </p>
    </div>

  </div>
</body>
</html>`,
    attachments: [
      {
        filename: 'NeuroEdge-Accessibility-Report.pdf',
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

import { Resend } from 'resend';

const ALERT_EMAIL = 'ved@neuroedge.co.uk';

export async function notifyFailure(reportId: string, error: string): Promise<void> {
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: 'NeuroEdge Alerts <alerts@neuroedge.co.uk>',
    to: ALERT_EMAIL,
    subject: `Report ${reportId.slice(0, 8)} failed`,
    text: `Report ID: ${reportId}\nError: ${error}\nTime: ${new Date().toISOString()}`,
  }).catch((err: unknown) => {
    console.error('Failed to send failure alert:', err instanceof Error ? err.message : err);
  });
}

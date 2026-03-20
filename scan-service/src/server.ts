import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { scanUrl } from './scanner.js';
import { translateViolations } from './translator.js';
import { generatePdf } from './pdf/generator.js';
import { sendReport } from './emailer.js';
import { db } from './db.js';

const app = Fastify({ logger: true });

let activeScanCount = 0;
const MAX_CONCURRENT_SCANS = 5;

await app.register(cors, { origin: true });
await app.register(rateLimit, {
  max: 10,
  timeWindow: '1 minute',
});

app.post('/api/scan', async (request, reply) => {
  const body = request.body as Record<string, unknown>;
  const url = typeof body?.url === 'string' ? body.url : '';

  if (!url) {
    return reply.status(400).send({ error: 'URL is required' });
  }

  if (activeScanCount >= MAX_CONCURRENT_SCANS) {
    return reply
      .status(429)
      .send({ error: 'Too many scans in progress. Please try again shortly.' });
  }

  activeScanCount++;
  try {
    const result = await scanUrl(url);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scan failed';
    return reply.status(422).send({ error: message });
  } finally {
    activeScanCount--;
  }
});

app.post('/api/generate-report', async (request, reply) => {
  const body = request.body as Record<string, unknown>;
  const reportId = typeof body?.reportId === 'string' ? body.reportId : '';

  if (!reportId) {
    return reply.status(400).send({ error: 'reportId is required' });
  }

  // Mark report as generating
  const { error: statusError } = await db
    .from('reports')
    .update({ status: 'generating' })
    .eq('id', reportId);

  if (statusError) {
    return reply.status(500).send({ error: 'Failed to update report status' });
  }

  try {
    // Fetch scan data
    const { data: scanRow, error: scanError } = await db
      .from('scans')
      .select('url, score, violations, passed_rules, total_rules, total_violations')
      .eq('report_id', reportId)
      .single();

    if (scanError || !scanRow) {
      throw new Error('Scan data not found');
    }

    // Fetch report for email and industry
    const { data: reportRow, error: reportError } = await db
      .from('reports')
      .select('email, industry')
      .eq('id', reportId)
      .single();

    if (reportError || !reportRow) {
      throw new Error('Report record not found');
    }

    const violations: Array<{
      id: string;
      impact: string;
      description: string;
      helpUrl: string;
      nodeCount: number;
    }> = Array.isArray(scanRow.violations) ? scanRow.violations : [];

    // Translate violations to plain English via Claude
    const translatedIssues = await translateViolations(
      violations,
      scanRow.url,
      reportRow.industry ?? 'general',
    );

    // Generate PDF
    const pdfBuffer = await generatePdf({
      scanUrl: scanRow.url,
      industry: reportRow.industry ?? 'general',
      score: scanRow.score,
      totalViolations: scanRow.total_violations ?? violations.reduce((s, v) => s + v.nodeCount, 0),
      passedRules: scanRow.passed_rules ?? 0,
      totalRules: scanRow.total_rules ?? 0,
      issues: translatedIssues,
      generatedAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    });

    // Send email with PDF attachment
    await sendReport(reportRow.email, pdfBuffer, scanRow.url, scanRow.score);

    // Mark report as sent
    await db.from('reports').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', reportId);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Report generation failed';
    app.log.error({ reportId, error: message }, 'generate-report failed');

    // Mark report as failed — do not swallow the DB error here
    await db.from('reports').update({ status: 'failed', error_message: message }).eq('id', reportId);

    return reply.status(500).send({ error: message });
  }
});

app.get('/health', async () => ({ status: 'ok' }));

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

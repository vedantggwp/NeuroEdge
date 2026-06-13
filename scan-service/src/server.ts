import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { scanUrl } from './scanner.js';
import { translateViolations } from './translator.js';
import { generatePdf } from './pdf/generator.js';
import { sendReport } from './emailer.js';
import { notifyFailure } from './notify.js';
import { db } from './db.js';

const app = Fastify({ logger: true });

let activeScanCount = 0;
const MAX_CONCURRENT_SCANS = 5;

const ALLOWED_ORIGINS = (process.env['ALLOWED_ORIGINS'] ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

await app.register(cors, {
  origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : false,
});
await app.register(rateLimit, {
  max: 10,
  timeWindow: '1 minute',
});

const API_KEY = process.env['API_KEY'] ?? '';

app.addHook('onRequest', async (request, reply) => {
  if (request.url === '/health') return;
  if (API_KEY && request.headers['x-api-key'] !== API_KEY) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
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
    // Fetch report row first (has scan_id, email, industry)
    const { data: reportRow, error: reportError } = await db
      .from('reports')
      .select('scan_id, email, industry')
      .eq('id', reportId)
      .single();

    if (reportError || !reportRow) {
      throw new Error('Report record not found');
    }

    // Now fetch scan data using report's scan_id
    const { data: scanRow, error: scanError } = await db
      .from('scans')
      .select('url, score, violations, passed_rules, total_rules, total_violations, cms')
      .eq('id', reportRow.scan_id)
      .single();

    if (scanError || !scanRow) {
      throw new Error('Scan data not found');
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
      scanRow.cms ?? 'unknown',
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

    await notifyFailure(reportId, message);

    return reply.status(500).send({ error: message });
  }
});

app.get('/health', async () => ({ status: 'ok' }));

app.addHook('onSend', async (_request, reply, payload) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('Cache-Control', 'no-store');
  return payload;
});

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

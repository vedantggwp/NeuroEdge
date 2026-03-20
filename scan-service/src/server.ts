import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { scanUrl } from './scanner.js';

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

app.get('/health', async () => ({ status: 'ok' }));

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

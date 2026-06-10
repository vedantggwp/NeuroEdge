/**
 * NeuroEdge MCP server definition.
 *
 * Exposes a single, focused tool — `neuroedge_scan_website` — that runs a real
 * axe-core accessibility audit and returns structured WCAG findings. It does
 * NO language-model work itself: the host AI (whichever the user runs) reads
 * the structured output and explains/prioritises it. That's the "bring your
 * own AI" design.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { scanUrl } from './scanner.js';
import { formatScanResult, type ResponseFormat } from './format.js';
import type { ScanResult } from './types.js';

const sampleNodeSchema = z.object({
  target: z.array(z.string()),
  html: z.string(),
  failureSummary: z.string(),
});

const violationSchema = z.object({
  id: z.string(),
  impact: z.string(),
  description: z.string(),
  helpUrl: z.string(),
  nodeCount: z.number(),
  wcagTags: z.array(z.string()),
  sampleNodes: z.array(sampleNodeSchema),
});

const scanInputSchema = z
  .object({
    url: z
      .string()
      .min(1, 'A website URL is required')
      .describe(
        'Public website URL to audit, e.g. "https://example.com". Only http/https on publicly-resolvable hosts are allowed; localhost, private, and reserved addresses are rejected.',
      ),
    max_violations: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .describe('Maximum number of distinct violation rules to return (default 20).'),
    response_format: z
      .enum(['markdown', 'json'])
      .default('markdown')
      .describe(
        "'markdown' (default) for a human-readable report, 'json' for machine-readable structured data.",
      ),
  })
  .strict();

const scanOutputSchema = z.object({
  url: z.string(),
  score: z.number(),
  totalViolations: z.number(),
  violations: z.array(violationSchema),
  passedRules: z.number(),
  totalRules: z.number(),
  cms: z.string(),
});

const SCAN_DESCRIPTION = `Run a live accessibility audit of a public web page and return structured WCAG findings.

Loads the URL in a real headless browser, runs the axe-core accessibility engine, scores the page 0–100, and returns every detected violation with severity, affected-element count, example CSS selectors, WCAG tags, and a documentation link. It also fingerprints the site platform (WordPress, Shopify, Wix, etc.) when detectable.

This tool does NOT interpret the results for the user — it returns raw findings so YOU (the assistant) can explain them in plain English, prioritise them, estimate fix effort, and give platform-specific guidance.

Args:
  - url (string): Public http/https URL to scan. Private/localhost/reserved hosts are refused.
  - max_violations (number, 1–100, default 20): Cap on distinct rules returned.
  - response_format ('markdown' | 'json', default 'markdown'): Output shape.

Returns: a score, pass/total rule counts, detected platform, and a severity-sorted list of violations (id, impact, description, nodeCount, wcagTags, helpUrl, sampleNodes).

Use when: the user asks whether a website is accessible, wants a WCAG/a11y audit, or asks what to fix. After calling, translate the findings for a non-technical owner and suggest concrete next steps.`;

export interface BuildServerOptions {
  /** Override the scanner (used by tests to avoid launching Chromium). */
  scan?: (url: string) => Promise<ScanResult>;
}

export function buildServer(options: BuildServerOptions = {}): McpServer {
  const scan = options.scan ?? scanUrl;

  const server = new McpServer({
    name: 'neuroedge-mcp-server',
    version: '0.1.0',
  });

  server.registerTool(
    'neuroedge_scan_website',
    {
      title: 'Scan a website for accessibility issues',
      description: SCAN_DESCRIPTION,
      inputSchema: scanInputSchema,
      outputSchema: scanOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ url, max_violations, response_format }) => {
      try {
        const result = await scan(url);
        const { text, structured } = formatScanResult(
          result,
          response_format as ResponseFormat,
          max_violations,
        );
        return {
          content: [{ type: 'text', text }],
          // ScanResult is a closed interface; the SDK types structuredContent
          // as an open record, so widen it here (shape is enforced by outputSchema).
          structuredContent: structured as unknown as Record<string, unknown>,
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: 'text', text: toActionableError(error) }],
        };
      }
    },
  );

  return server;
}

function toActionableError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/private or reserved|could not resolve|only http/i.test(message)) {
    return `Cannot scan this URL: ${message}. NeuroEdge only scans public websites reachable over http/https.`;
  }
  if (/timed out/i.test(message)) {
    return `The scan timed out: ${message}. The site may be very large or slow; try again, or scan a specific lighter page.`;
  }
  if (/could not find|executable|browser was not found|chrome/i.test(message)) {
    return `The headless browser is not installed. Run "npx puppeteer browsers install chrome" once, or set PUPPETEER_EXECUTABLE_PATH to an existing Chrome/Chromium binary. (Original error: ${message})`;
  }
  return `Scan failed: ${message}`;
}

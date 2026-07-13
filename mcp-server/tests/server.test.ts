import { describe, it, expect } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { buildServer } from '../src/server.js';
import type { ScanResult } from '@neuroedge/shared';

const FAKE_RESULT: ScanResult = {
  url: 'https://example.com/',
  score: 72,
  totalViolations: 4,
  passedRules: 30,
  totalRules: 36,
  cms: 'wordpress',
  violations: [
    {
      id: 'image-alt',
      impact: 'critical',
      description: 'Images must have alternate text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/image-alt',
      nodeCount: 3,
      wcagTags: ['wcag2a', 'wcag111'],
      sampleNodes: [
        {
          target: ['img.logo'],
          html: '<img class="logo" src="/logo.png">',
          failureSummary: 'Element does not have an alt attribute',
        },
      ],
    },
    {
      id: 'color-contrast',
      impact: 'serious',
      description: 'Elements must meet minimum contrast ratio thresholds',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/color-contrast',
      nodeCount: 1,
      wcagTags: ['wcag2aa', 'wcag143'],
      sampleNodes: [],
    },
  ],
};

async function connectClient(scan: (url: string) => Promise<ScanResult>): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = buildServer({ scan });
  await server.connect(serverTransport);

  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await client.connect(clientTransport);
  return client;
}

describe('neuroedge-mcp-server', () => {
  it('registers the scan tool with read-only annotations', async () => {
    const client = await connectClient(async () => FAKE_RESULT);
    const { tools } = await client.listTools();

    const tool = tools.find((t) => t.name === 'neuroedge_scan_website');
    expect(tool).toBeDefined();
    expect(tool?.annotations?.readOnlyHint).toBe(true);
    expect(tool?.annotations?.openWorldHint).toBe(true);
    expect(tool?.inputSchema).toBeDefined();
  });

  it('returns structured findings and a readable report on success', async () => {
    const client = await connectClient(async () => FAKE_RESULT);

    const res = await client.callTool({
      name: 'neuroedge_scan_website',
      arguments: { url: 'https://example.com', response_format: 'markdown' },
    });

    expect(res.isError).toBeFalsy();
    const structured = res.structuredContent as ScanResult;
    expect(structured.score).toBe(72);
    expect(structured.cms).toBe('wordpress');
    expect(structured.violations[0]?.id).toBe('image-alt');

    const text = (res.content as Array<{ type: string; text: string }>)[0]?.text ?? '';
    expect(text).toContain('Accessibility scan');
    expect(text).toContain('72/100');
    expect(text).toContain('image-alt');
  });

  it('respects max_violations', async () => {
    const client = await connectClient(async () => FAKE_RESULT);

    const res = await client.callTool({
      name: 'neuroedge_scan_website',
      arguments: { url: 'https://example.com', max_violations: 1 },
    });

    const structured = res.structuredContent as ScanResult;
    expect(structured.violations).toHaveLength(1);
  });

  it('maps a blocked-URL scan error to an actionable message', async () => {
    const client = await connectClient(async () => {
      throw new Error('Private or reserved address');
    });

    const res = await client.callTool({
      name: 'neuroedge_scan_website',
      arguments: { url: 'http://169.254.169.254' },
    });

    expect(res.isError).toBe(true);
    const text = (res.content as Array<{ type: string; text: string }>)[0]?.text ?? '';
    expect(text).toMatch(/only scans public/i);
  });
});

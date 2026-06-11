#!/usr/bin/env node
/**
 * Entry point: run the NeuroEdge MCP server over stdio so it can be spawned by
 * any MCP host (Claude Desktop, Cursor, etc.). Logs go to stderr only — stdout
 * is reserved for the JSON-RPC protocol stream.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { buildServer } from './server.js';
import { closeBrowser } from './scanner.js';

async function main(): Promise<void> {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('neuroedge-mcp-server running on stdio');
}

async function shutdown(): Promise<void> {
  await closeBrowser();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

main().catch((error) => {
  console.error('Fatal: failed to start neuroedge-mcp-server:', error);
  process.exit(1);
});

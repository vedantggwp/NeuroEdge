# neuroedge-mcp-server

> An open-source MCP server that gives **any AI** a website accessibility auditor. Bring your own model.

NeuroEdge runs the [axe-core](https://github.com/dequelabs/axe-core) accessibility engine against a live web page in a real headless browser and returns **structured WCAG findings** — score, violations, severities, example selectors, and docs links. It does no language-model work itself. Your AI host (Claude Desktop, Cursor, or any [MCP](https://modelcontextprotocol.io) client) reads the findings and explains them in plain English, prioritises fixes, and gives platform-specific advice.

That's the whole idea: **the deterministic scan is the tool; your chosen AI is the brain.** No API keys, no vendor lock-in, nothing sent to us.

## Why this design

A traditional accessibility tool bakes in one AI provider to translate jargon. This one doesn't — it hands raw, structured results to whatever model you already use. Swap Claude for a local model and nothing changes. That also means **zero server-side LLM cost and zero data leaving your machine.**

## What it does

One focused tool:

| Tool | Description |
|---|---|
| `neuroedge_scan_website` | Load a public URL in headless Chromium, run axe-core, return a 0–100 score and a severity-sorted list of violations (id, impact, affected-element count, example selectors, WCAG tags, docs link) plus the detected platform (WordPress, Shopify, Wix, …). |

The tool is **read-only** and only scans **public** sites — `localhost`, private, and reserved addresses (IPv4 **and** IPv6) are refused, and the guard is re-checked on every redirect to prevent SSRF/DNS-rebind bypasses.

## Quick start

**Prerequisites:** Node.js ≥ 18, and a Chromium build for Puppeteer.

```bash
git clone <this-repo> && cd mcp-server
npm install
npx puppeteer browsers install chrome   # one-time: downloads Chromium
npm run build
```

Already have Chrome/Chromium? Skip the download and set `PUPPETEER_EXECUTABLE_PATH=/path/to/chrome` instead.

### Use it in Claude Desktop

Add to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`):

```json
{
  "mcpServers": {
    "neuroedge": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop, then ask: **"Is https://example.com accessible? What are the top things to fix?"** — Claude calls the tool and explains the results.

### Use it in other MCP hosts

Any MCP client that supports stdio servers works the same way: run `node dist/index.js` as the server command. Cursor, Continue, and the MCP Inspector (`npx @modelcontextprotocol/inspector node dist/index.js`) are all supported.

## Tool reference

**`neuroedge_scan_website`**

| Param | Type | Default | Description |
|---|---|---|---|
| `url` | string (required) | — | Public http/https URL to audit. |
| `max_violations` | number 1–100 | 20 | Cap on distinct rules returned. |
| `response_format` | `"markdown"` \| `"json"` | `"markdown"` | Output shape. |

Returns structured content: `{ url, score, totalViolations, violations[], passedRules, totalRules, cms }`.

## Example prompts

- "Audit acme.co.uk and tell me which issues a non-technical owner could fix themselves vs. which need a developer."
- "Scan these three pages and rank them by how urgent their accessibility problems are."
- "Run an accessibility scan of my Shopify store and give me copy-paste fixes for the top 3 issues."

## Security & privacy

- **No data collection.** The server is stateless; nothing is stored or transmitted anywhere except the page you scan.
- **SSRF-hardened.** Only public http/https hosts are scanned; private/loopback/link-local/CGNAT/metadata ranges are blocked across IPv4 and IPv6, and re-validated on every redirect.
- **Read-only & sandboxed.** Chromium runs headless with no special privileges; the tool never writes to your machine.

## Development

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest (SSRF guard, scoring, MCP round-trip)
npm run dev         # tsx watch
```

## Provenance

Extracted from the [NeuroEdge](https://github.com/) accessibility platform. The scanning, scoring, and SSRF-guard logic is shared with the hosted product; this package is the standalone, BYO-AI, open-source core.

## License

MIT

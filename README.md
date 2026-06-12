# NeuroEdge

> Open-source website accessibility scanner. Enter a URL, get a WCAG score and a plain-English, prioritised fix list — in about 30 seconds.

NeuroEdge loads a page in headless Chromium, runs [axe-core](https://github.com/dequelabs/axe-core) against it, scores the result, and turns the technical violations into plain-English findings ranked by what to fix first. Two ways to use it:

- **Hosted demo** — **https://app-beta-fawn.vercel.app** — free, no sign-up (rate-limited for demo use).
- **MCP server** — [`mcp-server/`](mcp-server/) — a standalone, dependency-light server that gives *any* MCP-compatible AI (Claude Desktop, Cursor, …) an accessibility-audit tool. No API keys, no server-side LLM: the host model explains the findings. **Bring your own AI.** (Publishable to npm as `neuroedge-mcp-server`.)

> This is a portfolio / demonstration project, hosted for limited demo use — not a commercial service. It is fully open source.

---

## How it works

1. You enter a website URL.
2. The **scan-service** loads the page in headless Chromium (Puppeteer), runs axe-core, and fingerprints the CMS.
3. Violations are scored (pass-ratio 60% + a hyperbolic deduction penalty 40%) and ranked by impact.
4. You get a score ring, a prioritised issue list with fix guidance, and an optional revenue-impact estimate — all on one page, free.

## Architecture

A monorepo with three deployable parts:

| Directory | What it is | Where it runs |
|---|---|---|
| [`app/`](app/) | Next.js frontend + API routes (scan, results, revenue estimate). | Vercel |
| [`scan-service/`](scan-service/) | Node/Fastify engine: Puppeteer + axe-core scanner, scoring, SSRF-hardened URL guard. | VPS (Caddy → `:3001`, `neuroedge-scan` systemd unit) |
| [`mcp-server/`](mcp-server/) | Standalone MCP server exposing the scanner as one tool (`neuroedge_scan_website`). | Anywhere (stdio) |
| [`supabase/`](supabase/) | Postgres migrations (RLS lockdown + indexes). | Supabase |

```
visitor → app (Next.js / Vercel) → scan-service (Fastify / VPS) → Puppeteer + axe-core
                                          ↓
                                   Supabase (scan results)
```

The scan-service is **SSRF-hardened**: every request it makes (navigation, redirect hop, and sub-resource) is DNS-resolved and aborted if it targets a private/reserved address. Full contract in [`scan-service/ENGINE.md`](scan-service/ENGINE.md).

## Tech stack

- **Frontend:** Next.js (App Router, TypeScript), Tailwind.
- **Engine:** Fastify, Puppeteer, axe-core; optional plain-English LLM translation (Gemini in production, set via `LLM_PROVIDER`).
- **Data:** Supabase (Postgres + Row-Level Security).
- **MCP server:** `@modelcontextprotocol/sdk`, axe-core, Puppeteer.

## Local development

```bash
# Frontend
cd app && npm install && npm run dev            # http://localhost:3000

# Scan engine (separate terminal)
cd scan-service && npm install && npm run dev    # http://localhost:3001
npm test                                         # Vitest

# MCP server
cd mcp-server && npm install && npm test
```

Copy each package's env template and fill in keys (Supabase; optionally Gemini/Resend for the engine). The frontend reads the scan-service URL from `SCAN_SERVICE_URL`.

## Deployment

- **Frontend** → Vercel (project `app`): `vercel --prod` from `app/`. The `app-beta-fawn.vercel.app` alias tracks the latest production deploy. (No GitHub auto-deploy — publish manually.)
- **scan-service** → VPS behind Caddy (`:80 → localhost:3001`), managed by the `neuroedge-scan` systemd unit.
- **mcp-server** → `npm publish` (dist-only, MIT), then `npx neuroedge-mcp-server` or add to your MCP host config.

## Repository map

See [`MANIFEST.md`](MANIFEST.md) for a file-by-file index.

## License

MIT (see [`mcp-server/LICENSE`](mcp-server/LICENSE)).

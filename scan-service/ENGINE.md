# NeuroEdge Scan Engine

Fastify service that runs axe-core via Puppeteer and returns scored, structured accessibility findings. (It also carries legacy plain-English translation + PDF/email report code — unused since the product went free/OSS on 2026-06-13; see `/api/generate-report` below.)

## API

All routes require `Content-Type: application/json`. If `API_KEY` is set in the environment, non-`/health` requests must include `x-api-key`.

### POST /api/scan
Request:
```json
{ "url": "https://example.com" }
```
Response (200):
```json
{
  "url": "https://example.com/",
  "score": 68,
  "totalViolations": 40,
  "violations": [{
    "id": "color-contrast",
    "impact": "serious",
    "description": "...",
    "helpUrl": "https://dequeuniversity.com/...",
    "nodeCount": 34,
    "wcagTags": ["wcag2aa", "wcag143"],
    "sampleNodes": [{ "target": ["..."], "html": "<h2>...</h2>", "failureSummary": "Fix any of the following: ..." }]
  }],
  "passedRules": 47,
  "totalRules": 53,
  "cms": "wordpress",
  "screenshots": { "fullPage": "<base64>", "annotated": "<base64>", "issueCount": 5 }
}
```
Errors: 400 (URL required), 422 (scan failed), 429 (>5 concurrent).

### POST /api/generate-report (legacy — unused in the free demo)
Request: `{ "reportId": "<uuid>" }`. Looks up `reports` and `scans` rows in Supabase, runs the translator, generates a PDF, sends via Resend, and marks the report `sent` or `failed`. The paid flow that triggered this (Stripe webhook) was removed on 2026-06-13 — the route still exists but nothing in the app calls it.

### GET /health
`{"status": "ok"}`. Bypasses API key check.

## Environment

Required in `.env`:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `LLM_PROVIDER` - one of `anthropic`, `openai`, `gemini`, `github` (VPS uses `gemini`; local source currently supports only `anthropic` - see Drift below)
- One of: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `GITHUB_TOKEN` matching the provider

Optional:
- `API_KEY` - if set, gates all non-`/health` routes via `x-api-key` header
- `PORT` - default `3001`

## Scoring formula (src/score.ts)

```
passRatio = passes / (passes + violations)
deductionWeight = sum(impactWeight[v.impact] * v.nodes) for v in violations
deductionPenalty = deductionWeight / (deductionWeight + totalRules * 2)
rawScore = (passRatio * 0.6 + (1 - deductionPenalty) * 0.4) * 100
```

Impact weights: `critical=10`, `serious=5`, `moderate=3`, `minor=1`.

The hyperbolic curve `d / (d + 2R)` never saturates, so incremental fixes always move the score. Previously the penalty was hard-capped at 1, which flattened the score for any site with many contrast failures.

## Industry detector (src/industry-detector.ts)

Two-pass heuristic:
1. Schema.org `@type` match via `SCHEMA_TYPE_MAP` - decisive.
2. Word-boundary regex scoring across title, meta, H1s, nav, body, and URL. Threshold 2 matches. Falls back to `"other"`.

Multi-word phrases (e.g. `"order online"`, `"gas safe"`) match with boundary anchors at each end. Substring false matches (e.g. `"bar"` inside `"barrister"`) are excluded.

The scanner currently does not call this on the public scan path - industry is taken from the user-submitted form via `reports.industry`. The detector is kept for future use and is unit-tested.

## Node-level detail

axe-core returns one entry per failing element with `target` (CSS selector), `html` (element snippet), and `failureSummary`. The scanner preserves the first 3 per violation in `sampleNodes`, and the translator prompt includes these so `whatToTellDeveloper` can reference real selectors.

## Deployment notes (VPS: openclaw)

- Code lives in `/opt/neuroedge/scan-service/` (deployed by copy/scp — NOT a git checkout). Node is `/usr/bin/node` (v22).
- Managed by the **`neuroedge-scan` systemd unit** (auto-restart on failure, boot-start; sources `.env` then `exec node dist/server.js`; logs to `/var/log/neuroedge-scan.log`). Manage with `systemctl {status,restart,stop} neuroedge-scan`. (Before 2026-06-12 it was a hand-started `nohup` process with no supervisor — a reboot would have left it down.)
- Caddy (`/etc/caddy/Caddyfile`) reverse-proxies `:80` → `localhost:3001`. The Vercel app reaches the engine at `http://65.21.185.228` (the VPS IPv4); the port is intentionally public so Vercel's server-side fetch can call it.

### TRANSLATOR LANDMINE — surgical deploys only
- VPS `dist/translator.js` is a hand-patched multi-provider build (Anthropic + OpenAI + Gemini + GitHub Models); local `src/translator.ts` is Anthropic-only, and the VPS only has `GEMINI_API_KEY`. **Never blanket-overwrite the VPS scan-service with master** — it clobbers the Gemini translator and breaks translation. Deploy ONLY the specific changed `dist/*.js` (+ matching `src/*.ts`), back up first, then `systemctl restart neuroedge-scan`.
- Last surgical deploy (2026-06-12): shipped the SSRF hardening — `url-validator.js`, `scanner.js`, and the new `request-guard.js` (validates every http(s) request — nav, redirect, sub-resource — via a DNS-resolving host check; fails closed). Verified live: `POST /api/scan {"url":"http://test.localtest.me/"}` → rejected `"Hostname resolves to a private or reserved address"`. Prior surgical deploy: 2026-04-19 (score/industry/cms/screenshot only).

## Tests

```
cd scan-service
npx vitest run
```

Vitest suite covers `score`, `industry-detector`, `translator` (output schema validation), and `url-validator`. Scanner itself is not unit-tested; the integration is exercised by running a real scan against a known URL.

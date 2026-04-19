# NeuroEdge Scan Engine

Fastify service that runs axe-core via Puppeteer, translates violations into plain English, and emails a PDF report.

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

### POST /api/generate-report
Request: `{ "reportId": "<uuid>" }`. Looks up `reports` and `scans` rows in Supabase, runs the translator, generates a PDF, sends via Resend, and marks the report `sent` or `failed`.

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

- Code lives in `/opt/neuroedge/scan-service/`.
- Service is started with `nohup node dist/server.js` - no supervisor. Restart manually after deploy.
- Caddy (`/etc/caddy/Caddyfile`) reverse-proxies `:80` to `localhost:3001`.
- Log file: `/var/log/neuroedge-scan.log`.
- Current process binds `0.0.0.0:3001` - Caddy fronts it but the port is also directly reachable on the public IP. Firewall or bind to loopback when revisiting.

### Known drift between source and VPS
- VPS `dist/translator.js` was hand-patched to support Anthropic + OpenAI + Gemini + GitHub Models. Local `src/translator.ts` is single-provider Anthropic. Do not rebuild-and-deploy `translator.js` until source is reconciled - it will break report generation since VPS only has `GEMINI_API_KEY` set.
- VPS `dist/server.js` does not include the API_KEY middleware or the `reports.scan_id` schema. Deploying the current `src/server.ts` requires the DB migration that adds `reports.scan_id` and `scans.cms` columns - confirm migrations are applied before shipping.
- Last surgical deploy (2026-04-19): industry-detector, score, scanner, cms-detector, screenshot only. translator and server left alone.

## Tests

```
cd scan-service
npx vitest run
```

Vitest suite covers `score`, `industry-detector`, `translator` (output schema validation), and `url-validator`. Scanner itself is not unit-tested; the integration is exercised by running a real scan against a known URL.

# Manifest

## Key Files

### Top level
- `README.md` - Root project README (product overview, architecture, local dev, deploy status).
- `app/` - Next.js frontend. Deployed on Vercel; public URL `app-beta-fawn.vercel.app` (intended domain `neuroedge.co.uk` is DOWN — DNS zone broken, see health-check 2026-05-23).
- `scan-service/` - Node/Fastify engine. Deployed on VPS (openclaw) behind Caddy.
- `supabase/` - DB migrations (`001_initial.sql`, `002_add_columns_rls_indexes.sql`).
- `docs/` - Plans, playbooks, audit reports.
- `brand/`, `concepts/`, `PitchDeck/` - Pitch and brand assets.
- `video/` - Pitch video Remotion project.
- `DESIGN-BRIEF.md` - Product design brief.

### scan-service
- `scan-service/src/server.ts` - Fastify app. Routes: `POST /api/scan`, `POST /api/generate-report`, `GET /health`. Optional `x-api-key` header gate.
- `scan-service/src/scanner.ts` - Puppeteer + axe-core runner. Returns score, violations (with sampleNodes), CMS, screenshots.
- `scan-service/src/industry-detector.ts` - Schema.org + keyword-based industry classification. Word-boundary regex matching (fixed 2026-04-19).
- `scan-service/src/score.ts` - Accessibility score formula. Pass-ratio 60% + deduction penalty 40% using hyperbolic curve `d / (d + k*R)` (fixed 2026-04-19).
- `scan-service/src/translator.ts` - LLM plain-English + business-impact translation. Local source is Anthropic-only; VPS runs a multi-provider patched version.
- `scan-service/src/cms-detector.ts` - Heuristic CMS fingerprinting (WordPress, Shopify, Wix, etc.).
- `scan-service/src/screenshot.ts` - Full-page + annotated screenshot capture with issue bounding boxes.
- `scan-service/src/emailer.ts` - Resend integration for report delivery.
- `scan-service/src/notify.ts` - Failure alert emails to ved@neuroedge.co.uk.
- `scan-service/src/url-validator.ts` - Pre-scan URL + DNS validation.
- `scan-service/src/db.ts` - Supabase client (service role).
- `scan-service/src/pdf/` - PDF report generator.
- `scan-service/Caddyfile` - `scan.neuroedge.co.uk -> localhost:3001` (local reference; VPS uses `/etc/caddy/Caddyfile` with `:80`).
- `scan-service/tests/` - Vitest unit tests. Covers score, industry-detector, translator (schema), url-validator.
- `scan-service/ENGINE.md` - API contract, env vars, deployment notes.

## Recent Changes
- 2026-05-28: Created root `README.md`; set GitHub homepage to `app-beta-fawn.vercel.app` and default branch to `master`; corrected stale `neuroedge.co.uk` live-URL claim.
- 2026-05-23: Created `docs/health-check-2026-05-23.md` - prod outage audit. P0: `neuroedge.co.uk` DNS zone dead (Route 53 delegation broken). Includes fix plan + proposed PR list.
- 2026-04-19: Fixed `src/industry-detector.ts` - word-boundary regex instead of substring match; added `tests/industry-detector.test.ts` (6 cases).
- 2026-04-19: Fixed `src/score.ts` - replaced hard-capped `min(d/(2R), 1)` with hyperbolic `d/(d + 2R)`; no saturation at high deductions.
- 2026-04-19: Updated `src/scanner.ts` and `src/translator.ts` - preserve top-3 axe node details (target, html, failureSummary) end-to-end.
- 2026-04-19: Created `scan-service/ENGINE.md` - engine documentation.
- 2026-04-19: Created this MANIFEST.md.

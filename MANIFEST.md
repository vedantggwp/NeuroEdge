# Manifest

## Key Files

### Top level
- `README.md` - Root project README (OSS-demo overview, architecture, local dev, deploy).
- `CHANGELOG.md` - Project history, newest first (Keep a Changelog style) with an "Ops" lane for live-infra changes (deploys, migrations).
- `app/` - Next.js frontend: free scan → results → revenue estimate (paid checkout/report/admin REMOVED 2026-06-13 — now a free OSS demo). Deployed on Vercel project `app`; canonical URL `app-beta-fawn.vercel.app`. (There is no `neuroedge.co.uk` — it was always a Vercel-only deployment, never a real domain.)
- `scan-service/` - Node/Fastify engine. Deployed on VPS (openclaw) behind Caddy.
- `mcp-server/` - Open-source, standalone MCP server (BYO-AI accessibility auditor). Self-contained; no Supabase/LLM deps. Stdio transport.
- `supabase/` - DB migrations (`001_initial.sql`, `002_*.sql`, `003_lockdown_rls.sql`, `004_reports_unique_session.sql`). `003` applied to live DB 2026-06-10: revokes all anon/authenticated grants + enables RLS (closed the world-writable/PII-readable hole). Anon now has zero table access; all app reads go server-side via service role. `004` applied to live DB 2026-06-11 (restore→apply→verify→re-pause): adds UNIQUE on `reports.stripe_session_id` (NULLs distinct) for webhook idempotency.
- `docs/` - Plans, playbooks, audit reports.
- `brand/`, `concepts/`, `PitchDeck/` - Pitch and brand assets.
- `video/` - Pitch video Remotion project.
- `DESIGN-BRIEF.md` - Product design brief.

### scan-service
- `scan-service/src/server.ts` - Fastify app. Routes: `POST /api/scan`, `POST /api/generate-report`, `GET /health`. Optional `x-api-key` header gate.
- `scan-service/src/scanner.ts` - Puppeteer + axe-core runner. Returns score, violations (with sampleNodes), CMS, screenshots. Delegates per-request SSRF interception to `request-guard.ts`.
- `scan-service/src/request-guard.ts` - SSRF guard for Puppeteer requests: validates every http(s) request (nav, redirect, AND sub-resource) via DNS-resolving `checkHostSafety`; fails CLOSED; per-scan host cache. Extracted from scanner.ts 2026-06-11.
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

### mcp-server (open-source MCP server)
- `mcp-server/src/index.ts` - Entry point; runs `McpServer` over stdio. Graceful Chromium shutdown on SIGINT/SIGTERM.
- `mcp-server/src/server.ts` - `buildServer()`; registers the `neuroedge_scan_website` tool (Zod in/out schemas, read-only). Scanner is injectable for tests. Returns structured findings for the host AI to translate (BYO-AI).
- `mcp-server/src/scanner.ts` - Puppeteer + axe-core runner. Lazy-loads Chromium; re-validates every redirect against the SSRF guard.
- `mcp-server/src/url-guard.ts` - SSRF guard. Blocks private/reserved IPv4 AND IPv6 (loopback, ULA, link-local, CGNAT, metadata, IPv4-mapped); resolves A+AAAA; re-checked per redirect.
- `mcp-server/src/score.ts` - Accessibility score (shared formula with scan-service).
- `mcp-server/src/cms-detector.ts` - Heuristic CMS fingerprinting (shared logic with scan-service).
- `mcp-server/src/format.ts` - Markdown/JSON rendering with a CHARACTER_LIMIT cap.
- `mcp-server/src/types.ts` - ScanResult / ScanViolation interfaces.
- `mcp-server/tests/` - Vitest: url-guard (IPv4/IPv6 SSRF), score, full MCP round-trip via InMemoryTransport. 37 tests.
- `mcp-server/README.md` - OSS docs: BYO-AI rationale, Claude Desktop config, tool reference, security.

## Recent Changes
- 2026-06-13: docs — added `CHANGELOG.md` (full project history, Keep-a-Changelog style with an Ops lane); refreshed `scan-service/ENGINE.md` (systemd `neuroedge-scan` supervision, 2026-06-12 SSRF surgical deploy, marked `/api/generate-report` legacy/unused); README repo-map links the changelog.
- 2026-06-13: Pivoted to a **free open-source demo** — REMOVED the entire paid subsystem: `app/app/(admin)/`, `app/app/api/{checkout,webhook,coupon-validate,admin-login,regenerate,report-status}`, `app/app/report/[id]`, `app/components/ReportCTA.tsx`, `app/lib/{admin-auth,stripe}.ts`, and the `stripe`/`@stripe/stripe-js` deps. Stripped the `ReportCTA` paywall from `scan/[id]/page.tsx`. App is now scan → results only; `next build` green (routes: `/`, `/scan/[id]`, `/api/{scan,scans/[id],estimate}`, static). Rewrote README as an OSS-demo doc and corrected the `neuroedge.co.uk` myth (it never existed; `app-beta-fawn.vercel.app` is canonical).
- 2026-06-11: Created `scan-service/src/request-guard.ts` + `tests/request-guard.test.ts` — extracted SSRF guard from scanner.ts; now validates EVERY http(s) request (sub-resources too, DNS-resolved), fails CLOSED, per-host cache. 7 unit tests. Closes sub-resource SSRF + fail-open holes from the PR #1 review. (DNS-rebind IP-pinning still tracked as a follow-up — needs an integration harness.)
- 2026-06-11: Created `app/lib/client-ip.ts` (`getClientIp`) — derives client IP from `x-real-ip` / last XFF hop, not the spoofable left-most `x-forwarded-for`; adopted across all 6 rate-limited routes (admin-login, scan, coupon-validate, estimate, regenerate, report-status).
- 2026-06-11: Updated `app/app/api/webhook/route.ts` — return 500 on non-23505 insert failures so Stripe retries (a 200 silently dropped a *paid* report).
- 2026-06-11: Applied `supabase/migrations/004_reports_unique_session.sql` to live DB — `reports_stripe_session_id_key UNIQUE (stripe_session_id)` live, old index dropped, table empty; project re-paused.
- 2026-06-11: Created `app/lib/admin-auth.ts` — HMAC-SHA256 signed token helpers (`issueToken`, `verifyToken`) replacing plaintext-password cookie (C5 fix).
- 2026-06-11: Updated `app/app/api/admin-login/route.ts` — rate-limited (5/15 min), timing-safe password check, cookie set to signed token.
- 2026-06-11: Updated `app/app/(admin)/layout.tsx` — verify cookie with `verifyToken()` instead of comparing raw password.
- 2026-06-11: Updated `app/app/api/coupon-validate/route.ts`, `app/app/api/estimate/route.ts`, `app/app/api/regenerate/route.ts` — added `checkRateLimit` (20/60s) to each (C3 fix).
- 2026-06-11: Updated `app/app/api/webhook/route.ts` — increment coupon usage once per Stripe session on `checkout.session.completed` (C4 fix for paid coupons). Idempotent via pre-insert lookup + Postgres 23505 (unique-violation) handling on insert; only increments after a confirmed brand-new insert.
- 2026-06-11: Created `supabase/migrations/004_reports_unique_session.sql` — UNIQUE on `reports.stripe_session_id` (NULLs distinct, so 100%-off NULL-session rows unaffected) for webhook idempotency. NOT yet applied to live DB.
- 2026-06-11: Updated `.gitignore` — allowlist `.github/` + `.github/**` so CI workflow is tracked (the default-deny `*` had hidden it).
- 2026-06-11: Created `.github/workflows/ci.yml` — CI for mcp-server, scan-service, and app on push/PR.
- 2026-06-10: Created `supabase/migrations/003_lockdown_rls.sql` + applied to live DB — revoke anon/authenticated grants, enable RLS on scans/reports/coupons, harden `increment_coupon_usage` search_path. Verified: anon privileges `(none)`, RLS on, advisor `rls_disabled_in_public` cleared. Project re-paused.
- 2026-06-10: Added `app/app/api/scans/[id]/route.ts` + `app/app/api/report-status/route.ts` (service-role reads); refactored `app/app/scan/[id]/page.tsx` + `app/app/report/[id]/page.tsx` to fetch via these routes instead of the anon Supabase client. Required because RLS now denies anon. NOTE: live app must be redeployed (Vercel) for results/report pages to work against the locked DB.
- 2026-06-10: Created `mcp-server/` - open-source, standalone MCP server wrapping the scan engine (BYO-AI). One tool `neuroedge_scan_website`; SSRF-hardened (IPv6 + redirect re-validation); 37 tests pass; built + stdio handshake verified. Chromium download skipped in this build env (end users install normally).
- 2026-06-10: Verified live Supabase (`jlxyhxbcdvaryhusteku`) has RLS DISABLED on scans/reports/coupons with anon full CRUD (advisor `rls_disabled_in_public` ERROR ×3). Migration 002 never applied. Launch-blocker; project re-paused after read-only check.
- 2026-05-28: Created root `README.md`; set GitHub homepage to `app-beta-fawn.vercel.app` and default branch to `master`; corrected stale `neuroedge.co.uk` live-URL claim.
- 2026-05-23: Created `docs/health-check-2026-05-23.md` - prod outage audit. P0: `neuroedge.co.uk` DNS zone dead (Route 53 delegation broken). Includes fix plan + proposed PR list.
- 2026-04-19: Fixed `src/industry-detector.ts` - word-boundary regex instead of substring match; added `tests/industry-detector.test.ts` (6 cases).
- 2026-04-19: Fixed `src/score.ts` - replaced hard-capped `min(d/(2R), 1)` with hyperbolic `d/(d + 2R)`; no saturation at high deductions.
- 2026-04-19: Updated `src/scanner.ts` and `src/translator.ts` - preserve top-3 axe node details (target, html, failureSummary) end-to-end.
- 2026-04-19: Created `scan-service/ENGINE.md` - engine documentation.
- 2026-04-19: Created this MANIFEST.md.

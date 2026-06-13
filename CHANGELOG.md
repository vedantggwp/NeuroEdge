# Changelog

All notable changes to NeuroEdge, newest first. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/). The project isn't formally
versioned (it's a demo), so entries are grouped by date. **Ops** entries are live
infrastructure changes that don't appear as code commits (deploys, migrations,
service config).

## 2026-06-13 — Free, open-source demo

### Changed
- **Pivoted from a paid product to a free, open-source demo.** NeuroEdge is now a
  free accessibility scanner hosted for demonstration; the open-source MCP server
  is the headline. (PR #4)

### Removed
- The **entire paid subsystem**: Stripe checkout + webhook, coupon codes, the
  admin panel, paid report pages/routes, the `ReportCTA` paywall, and the
  `lib/admin-auth` + `lib/stripe` modules. Dropped the `stripe` and
  `@stripe/stripe-js` dependencies. The results page is now scan → score → issues
  → free revenue estimate.

### Docs
- Rewrote the README as an OSS-demo doc (leads with the MCP server); refreshed
  `MANIFEST.md` and `scan-service/ENGINE.md`; added this changelog.
- Corrected a long-standing myth in the docs: **`neuroedge.co.uk` never existed** —
  the app was always a Vercel deployment. `app-beta-fawn.vercel.app` is canonical.

## 2026-06-12 — Went live, end to end (Ops)

- **Deployed the app to Vercel** (project `app`). The live build had been **81 days
  stale**; the current code (RLS-aware server-side reads, hardened APIs) is now live.
- **Deployed the SSRF-hardened scan engine to the VPS** — it had been running a
  ~2-month-old build missing *all* SSRF protection — and promoted it from a
  hand-started `nohup` process to a **`neuroedge-scan` systemd unit** (auto-restart,
  boot-start).
- **Unpaused Supabase** and reconciled schema drift: migration **002 had never been
  applied**, so `scans` lacked `passed_rules` / `total_rules` / `revenue_estimate`
  and every scan save failed. Added the missing columns — without re-opening the
  anon RLS policies that migration 003 deliberately closed.
- **First-ever live end-to-end scan verified**: a real scan through
  `app-beta-fawn.vercel.app` ran on the VPS engine, saved to Supabase, and read
  back through the RLS-locked route.

## 2026-06-11 — Security hardening (PR #1, PR #2)

### Security
- **Locked down Supabase RLS** (migration 003): the live DB had RLS *disabled* and
  the public anon key held full CRUD on customer data. Revoked anon/authenticated
  grants, enabled RLS with deny-by-default, hardened `increment_coupon_usage`, and
  moved the two client-side reads server-side (service role).
- **SSRF-hardened the scan engine**: blocks private/reserved IPv4 **and** IPv6,
  resolves A+AAAA, re-validates every redirect hop **and** sub-resource via a
  DNS-resolving host check, and **fails closed**. Extracted to `request-guard.ts`
  with offline unit tests.
- **Webhook idempotency** (migration 004): UNIQUE on `reports.stripe_session_id`
  so retried Stripe events can't double-insert or double-increment coupons; the
  webhook returns 500 (not 200) on genuine insert failures so Stripe retries.
- **Rate-limit key** derived from a trusted source (`x-real-ip` / last
  `x-forwarded-for` hop) instead of the spoofable left-most token.
- **Admin auth** moved to a timing-safe comparison + HMAC-signed cookie (was a
  plaintext-password cookie). *(The admin panel was removed entirely on 2026-06-13.)*
- Added a **CI workflow** — typecheck + test + build across all three packages.

### Added
- **`neuroedge-mcp-server`** — a standalone, open-source MCP server that gives any
  MCP-compatible AI an accessibility-audit tool (bring-your-own-AI; no server-side
  LLM, no API keys). 37 tests; SSRF-hardened with its own URL guard.

> Each security PR was reviewed by independent sub-agents and verified before merge.

## 2026-03 – 2026-04 — Initial build

### Added
- Next.js frontend ("Clean Authority" design), a Fastify + Puppeteer + axe-core
  scan engine, a transparent scoring formula, an interactive revenue-impact
  estimate, CMS + industry detection, annotated violation screenshots, and (at the
  time) a Stripe-paid PDF "fix kit" with LLM translation and email delivery.

### Fixed
- Scoring switched to a non-saturating hyperbolic curve so incremental fixes always
  move the score; industry detector switched to word-boundary matching; mobile
  responsiveness and accessibility polish.

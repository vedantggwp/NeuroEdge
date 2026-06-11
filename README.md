# NeuroEdge

> AI-powered website accessibility audit tool for UK small businesses.

NeuroEdge scans a website, scores its accessibility against [axe-core](https://github.com/dequelabs/axe-core) rules, and translates the technical violations into plain-English, business-impact language — plus a downloadable PDF "fix kit" that separates issues you can fix yourself from issues to hand to a developer.

**Live (current public URL):** https://app-beta-fawn.vercel.app

> ⚠️ The intended canonical domain `neuroedge.co.uk` is **down** — its Route 53 DNS zone delegation is broken (P0). The Vercel alias above is the working public URL until DNS is restored. See [`docs/health-check-2026-05-23.md`](docs/health-check-2026-05-23.md) for the full diagnosis and recovery plan.

---

## What it does

1. A visitor enters a website URL on the frontend.
2. The **scan-service** loads the page in headless Chromium (Puppeteer), runs axe-core, fingerprints the CMS, classifies the industry, and captures annotated screenshots of each violation.
3. Violations are scored (pass-ratio 60% + deduction penalty 40%) and translated by an LLM into plain-English findings with business impact.
4. The visitor sees a score ring and ranked issues; an optional paid report generates a branded PDF fix kit delivered by email.

## Architecture

This is a monorepo with three deployable parts plus supporting assets.

| Directory | What it is | Where it runs |
|---|---|---|
| [`app/`](app/) | Next.js frontend + API routes (Stripe checkout, report status, admin). | Vercel |
| [`scan-service/`](scan-service/) | Node/Fastify engine: Puppeteer + axe-core scanner, scoring, LLM translation, PDF, email. | VPS (Caddy reverse proxy) |
| [`supabase/`](supabase/) | Postgres migrations (RLS, indexes). | Supabase |
| `docs/` | Plans, playbooks, audit & health-check reports. | — |
| `brand/`, `concepts/`, `PitchDeck/`, `video/` | Pitch and brand assets. | — |

```
visitor → app (Next.js / Vercel) → scan-service (Fastify / VPS) → Puppeteer + axe-core
                                          ↓
                              Supabase (results)  ·  Resend (email)  ·  Stripe (payment)
```

### scan-service API

| Route | Purpose |
|---|---|
| `POST /api/scan` | Run an accessibility scan; returns score, violations, CMS, screenshots. |
| `POST /api/generate-report` | Build and email the PDF fix kit. |
| `GET /health` | Liveness check. |

An optional `x-api-key` header gates the service. Full contract in [`scan-service/ENGINE.md`](scan-service/ENGINE.md).

## Tech stack

- **Frontend:** Next.js (App Router, TypeScript), Tailwind, Stripe.
- **Engine:** Fastify, Puppeteer, axe-core, LLM translation (Gemini in production; provider set via `LLM_PROVIDER`), Resend (email).
- **Data:** Supabase (Postgres + RLS).
- **Design system:** "Clean Authority" — see [`DESIGN-BRIEF.md`](DESIGN-BRIEF.md).

## Local development

```bash
# Frontend
cd app
npm install
npm run dev            # http://localhost:3000

# Scan engine (separate terminal)
cd scan-service
npm install
npm run dev            # http://localhost:3001
npm test               # Vitest unit tests
```

Copy the env templates in each package and fill in keys (Supabase, Stripe, Anthropic, Resend) before running. The frontend expects the scan-service URL via env.

## Deployment notes

- **Frontend** deploys to Vercel (project `app`): run `vercel --prod` from `app/`; the `app-beta-fawn.vercel.app` alias tracks the latest production deployment. GitHub auto-deploy is **not** currently wired, so a merge to `master` does not publish on its own — deploy manually.
- **scan-service** runs on a VPS behind Caddy (`scan.neuroedge.co.uk → localhost:3001`).
- Production is currently degraded — see the health check linked above before assuming a URL is reachable.

## Repository map

See [`MANIFEST.md`](MANIFEST.md) for a file-by-file index of the codebase.

# External Integrations

**Analysis Date:** 2026-03-07

## APIs & External Services

**Google Fonts:**
- Google Fonts CDN - Font loading for both video and pitch deck
  - SDK/Client: `@remotion/google-fonts` (video), direct CDN link (PitchDeck)
  - Auth: None required (public CDN)
  - Fonts used: DM Serif Display, DM Sans, JetBrains Mono
  - Video font loading: `video/src/lib/fonts.ts`
  - PitchDeck font loading: `PitchDeck/index.html` (line 7, Google Fonts CSS link)

## Data Storage

**Databases:**
- None - This is a static video/presentation project with no data persistence

**File Storage:**
- Local filesystem only
- Static image assets in `video/public/` (e.g., `shashwati.jpeg`)
- Rendered video output in `video/out/`

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Not applicable - No user-facing application, no auth required

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Remotion CLI stdout/stderr only

## CI/CD & Deployment

**Hosting:**
- Not deployed - Video renders locally to file
- `PitchDeck/index.html` is a standalone static file (can be opened directly in browser)

**CI Pipeline:**
- None detected (no GitHub Actions, no CI config files)

## Environment Configuration

**Required env vars:**
- None

**Secrets location:**
- No secrets required

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Summary

This is a self-contained content generation project with minimal external dependencies. The only external integration is Google Fonts (loaded via `@remotion/google-fonts` package in the video project and via CDN link in the static pitch deck). There are no APIs, databases, authentication systems, or deployment pipelines.

---

*Integration audit: 2026-03-07*

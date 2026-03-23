# NeuroEdge Production Hardening Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every audit issue — critical bugs, security gaps, missing monitoring/analytics/admin, legal pages, and design consistency — so NeuroEdge is a complete, production-quality product ready for public launch.

**Architecture:** Next.js 16 frontend on Vercel, Fastify scan-service on Hetzner VPS (pm2 + Caddy), Supabase (Postgres + Auth), Gemini API for LLM, Resend for email. Design system: Ethereal Glass (OLED black #050508, teal #2DD4A8, Plus Jakarta Sans, double-bezel glass cards).

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Supabase, Fastify, Puppeteer, GSAP, PostHog (analytics)

**Branch:** `ui/redesign-concepts`

**Parallelization:** 5 independent streams. Streams 1-5 have NO code dependencies on each other and MUST run as parallel agents. Each agent works on different files with zero overlap.

---

## File Ownership Map (NO OVERLAP between agents)

| Agent | Owns These Files (exclusive) |
|-------|------------------------------|
| Agent 1 (DB+Backend+VPS Security) | `scan-service/src/server.ts` (ALL changes), `scan-service/src/notify.ts` (new), `supabase/migrations/002_*.sql` (new), `app/app/api/scan/route.ts` (ALL changes: insert columns + timeout + rate limiting + API key) |
| Agent 2 (Security: Other API Routes) | `app/app/api/checkout/route.ts`, `app/app/api/regenerate/route.ts`, `app/app/api/webhook/route.ts`, `app/lib/rate-limit.ts` (new), `scan-service/src/scanner.ts`, `.gitignore` |
| Agent 3 (Monitoring+Admin) | `app/app/layout.tsx`, `app/app/(admin)/` (new dir), `app/app/api/admin-login/route.ts` (new) |
| Agent 4 (Legal+UX) | `app/app/privacy/page.tsx` (new), `app/app/terms/page.tsx` (new), `app/app/accessibility/page.tsx` (new), `app/app/scan/[id]/layout.tsx` (new), `app/components/Footer.tsx`, `app/lib/constants.ts` (adds CONTACT_EMAIL) |
| Agent 5 (FM Migration) | `app/app/scan/[id]/page.tsx`, `app/app/report/[id]/page.tsx`, `app/components/ScoreRing.tsx`, `app/components/IssueCard.tsx`, `app/components/ReportCTA.tsx`, `app/components/RevenueForm.tsx`, `app/components/RevenueResult.tsx`, `app/components/ScanProgress.tsx`, `app/components/IssueList.tsx`, `app/components/GsapAnimations.tsx` (modify: add scan/report page reveals), `app/app/globals.css` (add fade-up keyframe) |

**Cross-agent dependency:** Agent 5 Task 5.4 imports `CONTACT_EMAIL` from constants — Agent 4 creates this (Task 4.1). Both agents create new exports/files so there's no file conflict. If Agent 5 finishes first, the build will temporarily fail until Agent 4 completes. This is acceptable — final build verification happens after ALL agents complete.

**Note on `scan-service/src/server.ts`:** Agent 1 owns this file exclusively. The API key validation hook (previously Agent 2 Task 2.5) is now in Agent 1's scope to eliminate file conflicts.

---

## AGENT 1: Critical DB + Backend Fixes

### Task 1.1: Fix report generation query bug

**Files:**
- Modify: `scan-service/src/server.ts:47-135`

- [ ] **Step 1: Read the current generate-report handler**

The bug is at line 67-71. The code queries `scans` table with `.eq('report_id', reportId)` but `scans` has no `report_id` column. The join goes: `reports.scan_id → scans.id`.

- [ ] **Step 2: Fix the query order — fetch report FIRST, then use scan_id to get scan**

Replace lines 65-86 with:

```typescript
    // Fetch report row first (has scan_id, email, industry)
    const { data: reportRow, error: reportError } = await db
      .from('reports')
      .select('scan_id, email, industry')
      .eq('id', reportId)
      .single();

    if (reportError || !reportRow) {
      throw new Error('Report record not found');
    }

    // Now fetch scan data using report's scan_id
    const { data: scanRow, error: scanError } = await db
      .from('scans')
      .select('url, score, violations, passed_rules, total_rules, total_violations')
      .eq('id', reportRow.scan_id)
      .single();

    if (scanError || !scanRow) {
      throw new Error('Scan data not found');
    }
```

- [ ] **Step 3: Verify the rest of the handler still works**

Lines 88-134 reference `scanRow.url`, `scanRow.score`, `scanRow.violations`, `reportRow.email`, `reportRow.industry` — all of which are now correctly fetched. No other changes needed.

- [ ] **Step 4: Build scan-service to verify no TS errors**

```bash
cd /Users/ved/Downloads/NeuroEdge/scan-service && npx tsc --noEmit
```

- [ ] **Step 5: Run existing tests**

```bash
cd /Users/ved/Downloads/NeuroEdge/scan-service && npx vitest run
```

---

### Task 1.2: Create Supabase migration for missing columns + RLS + indexes

**Files:**
- Create: `supabase/migrations/002_add_columns_rls_indexes.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- 002_add_columns_rls_indexes.sql
-- Add missing columns, RLS policies, and performance indexes

-- Missing columns on reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS industry text;

-- Missing columns on scans
ALTER TABLE scans ADD COLUMN IF NOT EXISTS passed_rules integer;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS total_rules integer;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS revenue_estimate jsonb;

-- Enable RLS on all tables
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Scans: anon can SELECT (IDs are UUIDs, unguessable), service_role has full access
CREATE POLICY "anon_read_scans" ON scans FOR SELECT TO anon USING (true);
CREATE POLICY "service_all_scans" ON scans FOR ALL TO service_role USING (true);

-- Reports: anon can SELECT (looked up by ID or email), service_role has full access
CREATE POLICY "anon_read_reports" ON reports FOR SELECT TO anon USING (true);
CREATE POLICY "service_all_reports" ON reports FOR ALL TO service_role USING (true);

-- Coupons: anon can only read active coupons, service_role manages
CREATE POLICY "anon_read_active_coupons" ON coupons FOR SELECT TO anon USING (active = true);
CREATE POLICY "service_all_coupons" ON coupons FOR ALL TO service_role USING (true);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_reports_scan_email ON reports(scan_id, email);
CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
```

- [ ] **Step 2: Document that this SQL must be run in Supabase Dashboard SQL Editor**

Add a comment at top of file:
```sql
-- RUN THIS IN SUPABASE DASHBOARD > SQL EDITOR
-- Project: jlxyhxbcdvaryhusteku
-- After running, verify with: SELECT column_name FROM information_schema.columns WHERE table_name = 'reports';
```

---

### Task 1.3: Persist passed_rules and total_rules on scan insert

**Files:**
- Modify: `app/app/api/scan/route.ts:59-67` (ONLY the insert object — Agent 2 owns the rest of this file)

- [ ] **Step 1: Add the two missing columns to the Supabase insert**

Change the insert at lines 61-67 from:

```typescript
    .insert({
      url,
      score: result.score,
      total_violations: result.totalViolations,
      violations: result.violations,
      top_issues: result.violations?.slice(0, 5) ?? [],
    })
```

to:

```typescript
    .insert({
      url,
      score: result.score,
      total_violations: result.totalViolations,
      violations: result.violations,
      top_issues: result.violations?.slice(0, 5) ?? [],
      passed_rules: result.passedRules ?? 0,
      total_rules: result.totalRules ?? 0,
    })
```

The scan-service already returns `passedRules` and `totalRules` (scanner.ts lines 89-93).

---

### Task 1.4: Add failure notification email

**Files:**
- Create: `scan-service/src/notify.ts`
- Modify: `scan-service/src/server.ts:126-133`

- [ ] **Step 1: Create notify.ts**

```typescript
import { Resend } from 'resend';

const ALERT_EMAIL = 'ved@neuroedge.co.uk';

export async function notifyFailure(reportId: string, error: string): Promise<void> {
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: 'NeuroEdge Alerts <alerts@neuroedge.co.uk>',
    to: ALERT_EMAIL,
    subject: `Report ${reportId.slice(0, 8)} failed`,
    text: `Report ID: ${reportId}\nError: ${error}\nTime: ${new Date().toISOString()}`,
  }).catch(() => {}); // best-effort, never throw
}
```

- [ ] **Step 2: Import and call in server.ts catch block**

At top of server.ts, add:
```typescript
import { notifyFailure } from './notify.js';
```

At line 131, after the `await db.from('reports').update(...)` line, add:
```typescript
    await notifyFailure(reportId, message);
```

- [ ] **Step 3: Build and test**

```bash
cd /Users/ved/Downloads/NeuroEdge/scan-service && npx tsc --noEmit && npx vitest run
```

---

### Task 1.5: Add API key validation middleware on scan-service

**Files:**
- Modify: `scan-service/src/server.ts:10-19` (between app creation and route registration)

- [ ] **Step 1: Add API key validation hook after rate-limit registration**

After line 19 (after rate-limit registration), add:

```typescript
const API_KEY = process.env['API_KEY'] ?? '';

app.addHook('onRequest', async (request, reply) => {
  if (request.url === '/health') return;
  if (API_KEY && request.headers['x-api-key'] !== API_KEY) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
});
```

- [ ] **Step 2: Build and test**

```bash
cd /Users/ved/Downloads/NeuroEdge/scan-service && npx tsc --noEmit && npx vitest run
```

---

### Task 1.6: Add AbortController timeout + rate limiting + API key to scan proxy

**Files:**
- Modify: `app/app/api/scan/route.ts` (FULL FILE — Agent 1 owns this entirely)

- [ ] **Step 1: Add rate-limit import and check at top of POST handler**

```typescript
import { checkRateLimit } from "@/lib/rate-limit";
```

First lines inside POST:
```typescript
const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
if (!checkRateLimit(clientIp, 5, 60_000)) {
  return NextResponse.json(
    { error: "Too many requests. Please wait a minute and try again." },
    { status: 429 },
  );
}
```

- [ ] **Step 2: Replace the bare fetch with timeout + API key header**

Replace lines 33-46 with the AbortController version (see Task 2.2 code below for the exact snippet). Add `"X-API-Key": process.env.SCAN_SERVICE_API_KEY ?? ""` to headers.

- [ ] **Step 3: Add passed_rules + total_rules to Supabase insert**

In the insert object, add:
```typescript
passed_rules: result.passedRules ?? 0,
total_rules: result.totalRules ?? 0,
```

- [ ] **Step 4: Build frontend**

```bash
cd /Users/ved/Downloads/NeuroEdge/app && npx next build 2>&1 | tail -10
```

---

## AGENT 2: Security + Hardening (API Routes + Scanner)

**Note:** Agent 2 does NOT touch `scan-service/src/server.ts` or `app/app/api/scan/route.ts` — those are Agent 1's.

### Task 2.1: Add .env patterns to .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Append env file patterns after line 43**

```
# Environment files (never commit)
**/.env
**/.env.*
!**/.env.example
```

---

### Task 2.2: Add rate limiting utility

**Files:**
- Create: `app/lib/rate-limit.ts`

- [ ] **Step 1: Create in-memory rate limiter**

```typescript
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  max: number = 5,
  windowMs: number = 60_000,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;
  store.set(key, { count: entry.count + 1, resetAt: entry.resetAt });
  return true;
}
```

- [ ] **Step 2: Add cleanup for expired entries to prevent memory leaks**

Add to the `checkRateLimit` function, at the start:
```typescript
  // Periodic cleanup: remove expired entries every 100 calls
  if (store.size > 100) {
    for (const [k, v] of store) {
      if (now > v.resetAt) store.delete(k);
    }
  }
```

Note: Agent 1 applies rate limiting to `/api/scan`. Agent 2 creates the utility file only.

---

### Task 2.3: Add X-API-Key header to all VPS fetch calls

**Files:**
- Modify: `app/app/api/checkout/route.ts:88-96`
- Modify: `app/app/api/regenerate/route.ts:61-65`
- Modify: `app/app/api/webhook/route.ts:71-75`

- [ ] **Step 1: In checkout route.ts, add X-API-Key header at line 90**

Change:
```typescript
        headers: { "Content-Type": "application/json" },
```
to:
```typescript
        headers: { "Content-Type": "application/json", "X-API-Key": process.env.SCAN_SERVICE_API_KEY ?? "" },
```

- [ ] **Step 2: Same change in regenerate/route.ts line 63**

- [ ] **Step 3: Same change in webhook/route.ts line 74**

---

### Task 2.4: Add scan timeout wrapper

**Files:**
- Modify: `scan-service/src/scanner.ts:43-98`

- [ ] **Step 1: Rename scanUrl to scanUrlInternal and create a timeout wrapper**

Rename the existing `export async function scanUrl` to `async function scanUrlInternal` (remove export).

Add a new exported wrapper above it:

```typescript
const SCAN_TIMEOUT_MS = 45_000;

export async function scanUrl(url: string): Promise<ScanResult> {
  return Promise.race([
    scanUrlInternal(url),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Scan timed out after 45 seconds. The website may be too slow to scan.')), SCAN_TIMEOUT_MS)
    ),
  ]);
}
```

- [ ] **Step 2: Build and test**

```bash
cd /Users/ved/Downloads/NeuroEdge/scan-service && npx tsc --noEmit && npx vitest run
```

---

## AGENT 3: Monitoring + Analytics + Admin

### Task 3.1: Add PostHog analytics script to layout

**Files:**
- Modify: `app/app/layout.tsx`

- [ ] **Step 1: Add Script import and PostHog snippet**

Add import at top:
```typescript
import Script from "next/script";
```

Add after the skip-to-content `<a>` tag, inside `<body>`:
```tsx
{process.env.NEXT_PUBLIC_POSTHOG_KEY ? (
  <Script
    strategy="afterInteractive"
    src="https://us-assets.i.posthog.com/static/array.js"
    data-api-host="https://us.i.posthog.com"
    data-project-api-key={process.env.NEXT_PUBLIC_POSTHOG_KEY}
  />
) : null}
```

PostHog is cookieless by default — no GDPR banner needed.

---

### Task 3.2: Build admin panel

**Files:**
- Create: `app/app/(admin)/layout.tsx`
- Create: `app/app/(admin)/admin/page.tsx`
- Create: `app/app/(admin)/admin/reports/page.tsx`
- Create: `app/app/(admin)/admin/coupons/page.tsx`
- Create: `app/app/api/admin-login/route.ts`

- [ ] **Step 1: Create admin layout with password gate**

`app/app/(admin)/layout.tsx`:
```typescript
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const COOKIE_NAME = "neuroedge-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!ADMIN_PASSWORD) {
    return <div className="p-8 text-text-primary">Admin not configured. Set ADMIN_PASSWORD env var.</div>;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token !== ADMIN_PASSWORD) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <nav className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <span className="font-extrabold">Neuro<span className="text-accent">Edge</span> Admin</span>
          <div className="flex gap-6 text-sm">
            <a href="/admin" className="text-text-secondary hover:text-text-primary transition-colors">Dashboard</a>
            <a href="/admin/reports" className="text-text-secondary hover:text-text-primary transition-colors">Reports</a>
            <a href="/admin/coupons" className="text-text-secondary hover:text-text-primary transition-colors">Coupons</a>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <form action="/api/admin-login" method="POST" className="w-80 space-y-4">
        <h1 className="text-xl font-bold text-text-primary">Admin Login</h1>
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-border bg-bg-surface px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
        <button type="submit" className="w-full rounded-xl bg-accent py-3 font-bold text-text-inverse">
          Log in
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create admin login API route**

`app/app/api/admin-login/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = form.get("password")?.toString() ?? "";
  const correct = process.env.ADMIN_PASSWORD ?? "";

  if (!correct || password !== correct) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set("neuroedge-admin", correct, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
```

- [ ] **Step 3: Create admin dashboard page**

`app/app/(admin)/admin/page.tsx`:
```typescript
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const db = createServerClient();

  const [
    { count: totalScans },
    { count: totalReports },
    { data: failedReports },
    { data: recentScans },
  ] = await Promise.all([
    db.from("scans").select("*", { count: "exact", head: true }),
    db.from("reports").select("*", { count: "exact", head: true }),
    db.from("reports").select("id, scan_id, email, status, error_message, created_at").eq("status", "failed").order("created_at", { ascending: false }).limit(10),
    db.from("scans").select("id, url, score, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Scans" value={totalScans ?? 0} />
        <StatCard label="Total Reports" value={totalReports ?? 0} />
        <StatCard label="Failed Reports" value={failedReports?.length ?? 0} accent={true} />
        <StatCard label="Scan Service" value="Check UptimeRobot" />
      </div>

      {failedReports && failedReports.length > 0 ? (
        <section>
          <h2 className="text-lg font-bold mb-4 text-severity-critical">Failed Reports</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bg-surface text-text-secondary">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Error</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {failedReports.map((r: Record<string, unknown>) => (
                  <tr key={String(r.id)} className="border-t border-border">
                    <td className="px-4 py-3 text-text-primary">{String(r.email)}</td>
                    <td className="px-4 py-3 text-text-secondary">{String(r.error_message ?? "Unknown")}</td>
                    <td className="px-4 py-3 text-text-tertiary">{new Date(String(r.created_at)).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-bold mb-4">Recent Scans</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface text-text-secondary">
              <tr>
                <th className="px-4 py-3 text-left">URL</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentScans ?? []).map((s: Record<string, unknown>) => (
                <tr key={String(s.id)} className="border-t border-border">
                  <td className="px-4 py-3 text-accent">{String(s.url)}</td>
                  <td className="px-4 py-3 font-mono text-text-primary">{String(s.score)}/100</td>
                  <td className="px-4 py-3 text-text-tertiary">{new Date(String(s.created_at)).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent ? "text-severity-critical" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create reports page**

`app/app/(admin)/admin/reports/page.tsx` — server component that queries all reports with status filter, shows table with email, URL (via join), status, dates. Include a regenerate form for failed reports.

- [ ] **Step 5: Create coupons page**

`app/app/(admin)/admin/coupons/page.tsx` — server component that lists all coupons with usage counts. Include a form to create new coupons.

- [ ] **Step 6: Build to verify**

```bash
cd /Users/ved/Downloads/NeuroEdge/app && npx next build 2>&1 | tail -20
```

---

## AGENT 4: Legal + UX Completions

### Task 4.1: Add CONTACT_EMAIL to constants

**Files:**
- Modify: `app/lib/constants.ts`

- [ ] **Step 1: Add constant**

Add after the `SITE` object:
```typescript
export const CONTACT_EMAIL = "ved@neuroedge.co.uk";
```

---

### Task 4.2: Create Privacy Policy page

**Files:**
- Create: `app/app/privacy/page.tsx`

- [ ] **Step 1: Write privacy policy**

Server component using Ethereal Glass design. Must cover:
- Data collected: email addresses, website URLs, scan results, industry selection
- Legal basis: legitimate interest (scan), consent (email for report)
- Storage: Supabase (cloud, EU region)
- Third parties: Supabase, Vercel, Google Gemini (for AI translation), Resend (email), Stripe (payments)
- Retention: 12 months, then deleted
- Rights: access, deletion, portability (GDPR Articles 15-20)
- Contact: CONTACT_EMAIL
- No cookies, no tracking cookies
- Analytics: cookieless, no personal data collected

Style: use the glass Card component, section headers with the teal accent label pattern (same as landing page), proper semantic HTML.

---

### Task 4.3: Create Terms of Service page

**Files:**
- Create: `app/app/terms/page.tsx`

- [ ] **Step 1: Write terms**

Cover:
- Scan results are automated and informational, not legal compliance guarantee
- No warranty of accuracy or completeness
- Free tier limitations
- Acceptable use (no scanning sites you don't own/have permission for)
- UK law jurisdiction
- Contact: CONTACT_EMAIL

---

### Task 4.4: Create Accessibility Statement page

**Files:**
- Create: `app/app/accessibility/page.tsx`

- [ ] **Step 1: Write accessibility statement**

Cover:
- Target: WCAG 2.1 Level AA
- What we do: semantic HTML, keyboard navigation, screen reader support, color contrast, focus management, skip navigation link, reduced-motion support
- Known issues (if any from self-scan)
- Contact for accessibility issues: CONTACT_EMAIL
- Compliance with UK Equality Act 2010

---

### Task 4.5: Add footer legal links

**Files:**
- Modify: `app/components/Footer.tsx`

- [ ] **Step 1: Add privacy, terms, accessibility links**

After the tagline and before the location text, add:

```tsx
<div className="flex gap-4 text-xs text-text-tertiary">
  <a href="/privacy" className="hover:text-text-secondary transition-colors">Privacy</a>
  <a href="/terms" className="hover:text-text-secondary transition-colors">Terms</a>
  <a href="/accessibility" className="hover:text-text-secondary transition-colors">Accessibility</a>
</div>
```

---

### Task 4.6: Add dynamic OG meta tags for scan results

**Files:**
- Create: `app/app/scan/[id]/layout.tsx`

- [ ] **Step 1: Create server layout with generateMetadata**

```typescript
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { SITE } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = createServerClient();
  const { data } = await db.from("scans").select("url, score").eq("id", id).single();

  const title = data
    ? `Score: ${data.score}/100 for ${data.url}`
    : "Scan Results";
  const description = data
    ? `NeuroEdge accessibility scan for ${data.url}. Score: ${data.score}/100. See what your site is missing.`
    : SITE.description;

  return {
    title: `${title} | ${SITE.name}`,
    description,
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      siteName: SITE.name,
      type: "website",
    },
  };
}

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

---

### Task 4.7: Build to verify all new pages

```bash
cd /Users/ved/Downloads/NeuroEdge/app && npx next build 2>&1 | tail -20
```

---

## AGENT 5: Framer-Motion to GSAP/CSS Migration

### Task 5.0: Update GsapAnimations to handle scan/report pages

**Files:**
- Modify: `app/components/GsapAnimations.tsx`
- Modify: `app/app/globals.css`

- [ ] **Step 1: Read the existing GsapAnimations.tsx**

This component already exists and handles `.reveal` elements on the landing page. It needs to also work on `/scan/[id]` and `/report/[id]` pages where we're replacing `motion.div` with `.reveal` divs.

The existing code already targets `section:not(#hero) .reveal` for scroll-triggered reveals, which will work for scan/report pages automatically. No changes needed to GsapAnimations.tsx — the existing logic is generic enough.

- [ ] **Step 2: Add fade-up keyframe to globals.css**

Add before the `@media (prefers-reduced-motion)` block:

```css
/* ── CSS-only fade animations (for components that don't use GSAP) ── */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-up {
  animation: fade-up 0.4s ease-out forwards;
}
```

This is used by IssueCard and other components that need staggered entry without GSAP.

---

### Task 5.1: Migrate ScoreRing.tsx

**Files:**
- Modify: `app/components/ScoreRing.tsx`

- [ ] **Step 1: Replace framer-motion with GSAP + useEffect**

Remove all framer-motion imports. Replace `motion.circle` with plain `<circle>` and animate `strokeDashoffset` via `gsap.to()` in a `useEffect`. Replace `motion.text` with plain `<text>`. Implement count-up via `gsap.to()` with `onUpdate` writing to a ref.

The component must still:
- Accept `score`, `size`, `strokeWidth`, `label` props
- Animate the ring arc from 0 to score
- Count up the number
- Respect `prefers-reduced-motion` (skip animation, show final state)
- Use `scoreColor()` for color based on score ranges

---

### Task 5.2: Migrate IssueCard.tsx

**Files:**
- Modify: `app/components/IssueCard.tsx`

- [ ] **Step 1: Replace motion.div with CSS transitions**

Remove framer-motion import. Replace `<motion.div>` with a plain `<div>` that uses CSS animation via `style={{ animationDelay: \`${index * 100}ms\` }}` and a CSS class `animate-fade-up`.

Add to the component:
```tsx
<div
  className="animate-fade-up opacity-0"
  style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
>
```

Add the `@keyframes fade-up` to globals.css (or inline style):
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up 0.4s ease-out;
}
```

---

### Task 5.3: Migrate scan/[id]/page.tsx

**Files:**
- Modify: `app/app/scan/[id]/page.tsx`

- [ ] **Step 1: Remove framer-motion imports**

Remove `import { motion, useReducedMotion } from "framer-motion"`.

- [ ] **Step 2: Replace all motion.div/motion.section with plain divs**

Replace `<motion.div>` with `<div className="reveal">`. The GsapAnimations component (already in page.tsx parent) will handle scroll reveals.

For the header (lines 123-142): `<div className="reveal mb-10 text-center">`
For the score ring (lines 145-156): `<div className="reveal mb-12 flex justify-center">`
For the revenue section (lines 178-219): `<section className="reveal space-y-8">`
For the report CTA (lines 222-230): `<section className="reveal mt-16">`

- [ ] **Step 3: Remove all font-serif references**

Replace `font-serif` with `font-sans` in all heading classNames (lines 108, 129, 188).

- [ ] **Step 4: Add "Scan another site" button and bookmark note**

After the ScoreRing section, add:
```tsx
<p className="mb-10 text-center text-xs text-text-tertiary">
  Bookmark this page to return to your results anytime.
</p>
```

At the top of the results section (after h1), add:
```tsx
<a href="/" className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline">
  Scan another site
</a>
```

---

### Task 5.4: Migrate report/[id]/page.tsx

**Files:**
- Modify: `app/app/report/[id]/page.tsx`

- [ ] **Step 1: Remove framer-motion imports**

Remove `import { motion, AnimatePresence, useReducedMotion } from "framer-motion"`.

- [ ] **Step 2: Replace motion wrappers with CSS transitions**

Replace `<AnimatePresence>` blocks with conditional rendering. Replace `<motion.div>` with plain `<div>`. Use CSS `transition-all duration-300` for state changes.

- [ ] **Step 3: Replace all font-serif with font-sans**

Replace all instances of `font-serif` in this file.

- [ ] **Step 4: Replace hardcoded email with CONTACT_EMAIL**

```typescript
import { CONTACT_EMAIL } from "@/lib/constants";
```

Replace all instances of `"ved@neuroedge.co.uk"` with `{CONTACT_EMAIL}`.

---

### Task 5.5: Migrate remaining components

**Files:**
- Modify: `app/components/ReportCTA.tsx` — remove framer-motion, replace AnimatePresence with conditional CSS
- Modify: `app/components/RevenueForm.tsx` — remove framer-motion, replace with CSS
- Modify: `app/components/RevenueResult.tsx` — remove framer-motion, replace with CSS, remove font-serif
- Modify: `app/components/ScanProgress.tsx` — remove framer-motion, use CSS @keyframes
- Modify: `app/components/IssueList.tsx` — remove font-serif references

---

### Task 5.6: Remove framer-motion dependency

- [ ] **Step 1: Verify no remaining imports**

```bash
cd /Users/ved/Downloads/NeuroEdge/app && grep -r "framer-motion" --include="*.tsx" --include="*.ts" -l | grep -v node_modules
```

Expected output: empty (no files)

- [ ] **Step 2: Uninstall**

```bash
cd /Users/ved/Downloads/NeuroEdge/app && npm uninstall framer-motion
```

- [ ] **Step 3: Build to verify**

```bash
cd /Users/ved/Downloads/NeuroEdge/app && npx next build 2>&1 | tail -20
```

---

## POST-AGENT: Manual Steps (Ved)

These require access to external services and MUST be done by Ved after all agents complete:

### Supabase
- [ ] Run `002_add_columns_rls_indexes.sql` in Supabase Dashboard SQL Editor
- [ ] Verify columns exist: `SELECT column_name FROM information_schema.columns WHERE table_name = 'reports';`
- [ ] Verify RLS: `SELECT tablename, policyname FROM pg_policies;`

### Vercel
- [ ] Set env var: `SCAN_SERVICE_API_KEY` = generate a UUID
- [ ] Set env var: `NEXT_PUBLIC_POSTHOG_KEY` = get from PostHog dashboard
- [ ] Set env var: `ADMIN_PASSWORD` = choose a strong password
- [ ] Deploy

### VPS (ssh openclaw)
- [ ] Set env var: `API_KEY` = same UUID as SCAN_SERVICE_API_KEY
- [ ] rsync updated scan-service, rebuild, pm2 restart
- [ ] Verify: `curl -H "X-API-Key: <key>" http://localhost:3001/health`

### External Services
- [ ] Sign up PostHog Cloud (free, 1M events/mo): posthog.com
- [ ] Sign up UptimeRobot (free, 50 monitors): uptimerobot.com
  - Monitor 1: VPS health `http://65.21.185.228/health`
  - Monitor 2: Frontend `https://app-beta-fawn.vercel.app`
- [ ] Rotate Supabase service role key (exposed in .env.production on disk)
- [ ] Rotate Resend API key
- [ ] Rotate Gemini API key

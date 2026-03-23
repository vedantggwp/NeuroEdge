# NeuroEdge Web App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a free accessibility scan tool + paid PDF report behind Stripe, with Linear-grade design, for LinkedIn launch.

**Architecture:** Next.js App Router on Vercel (frontend + API proxy) + Node.js scan service on VPS (Puppeteer + axe-core + Claude API + PDF generation + email). Supabase for persistence. Stripe for payments with coupon support. Design follows `.impeccable.md` — Capable, Approachable, Empowering.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 4, Framer Motion, Supabase (Postgres), Stripe Checkout, Puppeteer, @axe-core/puppeteer, Anthropic Claude API, React-PDF or Puppeteer HTML-to-PDF, Resend (email), Inter + serif display font.

---

## File Structure

### Frontend (Next.js on Vercel) — `app/`

```
app/
├── layout.tsx                    # Root layout, fonts, metadata, theme provider
├── page.tsx                      # Landing page — hero, URL input, social proof
├── scan/[id]/page.tsx            # Results page — score, top 5, interactive form, CTA
├── report/[id]/page.tsx          # Report status — check delivery, re-trigger
├── api/
│   ├── scan/route.ts             # POST: proxy URL to VPS scan service
│   ├── estimate/route.ts         # POST: calculate revenue uplift from form data
│   ├── checkout/route.ts         # POST: create Stripe checkout session
│   └── webhook/route.ts          # POST: Stripe webhook → trigger report generation
├── globals.css                   # Tailwind base + custom properties
└── providers.tsx                 # Theme provider, Framer Motion config

components/
├── ui/                           # Base UI primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Progress.tsx
│   └── ThemeToggle.tsx
├── ScanForm.tsx                  # URL input with validation + submit
├── ScanProgress.tsx              # Real-time scan progress animation
├── ScoreRing.tsx                 # Animated circular score display
├── IssueCard.tsx                 # Single issue in plain English
├── IssueList.tsx                 # Top 5 issues staggered display
├── RevenueForm.tsx               # Interactive: industry, traffic, avg value
├── RevenueResult.tsx             # Personalised uplift with visible math
├── ReportCTA.tsx                 # Get full report CTA + coupon input
├── Hero.tsx                      # Landing page hero section
├── SocialProof.tsx               # "30/30 Liverpool SMEs failed" stats
└── Footer.tsx

lib/
├── supabase.ts                   # Supabase client (server + browser)
├── stripe.ts                     # Stripe client + helpers
├── revenue.ts                    # Revenue uplift calculation (shared logic)
├── url-validate.ts               # Client-side URL validation
└── constants.ts                  # Industry benchmarks, copy, config
```

### VPS Scan Service — `scan-service/`

```
scan-service/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts                 # Fastify server, routes, rate limiting
│   ├── scanner.ts                # Puppeteer + axe-core scan engine
│   ├── url-validator.ts          # SSRF protection — block private IPs
│   ├── translator.ts             # Claude API: violations → plain English
│   ├── score.ts                  # Calculate accessibility score from violations
│   ├── pdf/
│   │   ├── generator.ts          # HTML template → PDF via Puppeteer
│   │   └── template.ts           # PDF report HTML template
│   ├── emailer.ts                # Resend: send PDF attachment
│   └── db.ts                     # Supabase client for storing scans
├── tests/
│   ├── url-validator.test.ts     # SSRF protection tests
│   ├── score.test.ts             # Score calculation tests
│   ├── revenue.test.ts           # Revenue estimate tests
│   └── translator.test.ts        # Claude output validation tests
└── Dockerfile                    # For VPS deployment
```

### Shared

```
supabase/
└── migrations/
    └── 001_initial.sql           # scans, reports, coupons tables
```

---

## Task 1: Project Scaffolding + Supabase Schema

**Wave: 1 (parallel with Task 2)**

**Files:**
- Create: `app/package.json`, `app/tsconfig.json`, `app/tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder)
- Create: `scan-service/package.json`, `scan-service/tsconfig.json`
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Init Next.js app**

```bash
cd /Users/ved/Downloads/NeuroEdge
npx create-next-app@latest app --typescript --tailwind --app --src-dir=false --import-alias="@/*" --no-eslint
```

- [ ] **Step 2: Install frontend deps**

```bash
cd app
npm install framer-motion @supabase/supabase-js stripe @stripe/stripe-js
npm install -D @types/node
```

- [ ] **Step 3: Init scan-service**

```bash
cd /Users/ved/Downloads/NeuroEdge
mkdir -p scan-service/src scan-service/tests
cd scan-service
npm init -y
npm install fastify @fastify/cors @fastify/rate-limit puppeteer @axe-core/puppeteer @anthropic-ai/sdk resend @supabase/supabase-js
npm install -D typescript @types/node vitest
```

- [ ] **Step 4: Create Supabase migration**

```sql
-- supabase/migrations/001_initial.sql

-- Scans table: every scan (free + paid)
create table scans (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  score integer,
  total_violations integer,
  violations jsonb,
  top_issues jsonb,
  industry text,
  estimated_traffic integer,
  avg_order_value numeric(10,2),
  revenue_uplift_low numeric(10,2),
  revenue_uplift_high numeric(10,2),
  created_at timestamptz default now()
);

-- Reports table: paid reports
create table reports (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id) not null,
  email text not null,
  stripe_session_id text,
  stripe_payment_intent text,
  coupon_code text,
  status text not null default 'pending', -- pending, generating, sent, failed
  pdf_url text,
  plain_english_violations jsonb,
  created_at timestamptz default now(),
  sent_at timestamptz
);

-- Coupons table
create table coupons (
  code text primary key,
  discount_percent integer not null default 100,
  max_uses integer,
  current_uses integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Index for report status lookup by email
create index idx_reports_email on reports(email);
create index idx_reports_stripe_session on reports(stripe_session_id);

-- Function: atomically increment coupon usage
create or replace function increment_coupon_usage(coupon_code text)
returns void as $$
begin
  update coupons
  set current_uses = current_uses + 1
  where code = coupon_code and active = true;
end;
$$ language plpgsql;
```

- [ ] **Step 5: Commit**

```bash
git add app/ scan-service/ supabase/
git commit -m "feat: scaffold Next.js app, scan service, and Supabase schema"
```

---

## Task 2: VPS Scan Engine (Core)

**Wave: 1 (after Task 1 Step 3 — requires scan-service/ to be initialised with npm deps)**

**Files:**
- Create: `scan-service/src/url-validator.ts`
- Create: `scan-service/src/scanner.ts`
- Create: `scan-service/src/score.ts`
- Create: `scan-service/src/server.ts`
- Create: `scan-service/tests/url-validator.test.ts`
- Create: `scan-service/tests/score.test.ts`

- [ ] **Step 1: Write SSRF protection tests**

```typescript
// scan-service/tests/url-validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateUrl } from '../src/url-validator';

describe('validateUrl', () => {
  it('accepts valid public HTTP URLs', () => {
    expect(validateUrl('https://example.com')).toEqual({ valid: true, url: 'https://example.com' });
    expect(validateUrl('http://example.com')).toEqual({ valid: true, url: 'http://example.com' });
  });

  it('rejects private/reserved IPs', () => {
    expect(validateUrl('http://localhost')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://127.0.0.1')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://10.0.0.1')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://192.168.1.1')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://172.16.0.1')).toEqual({ valid: false, reason: 'Private or reserved address' });
    expect(validateUrl('http://169.254.169.254')).toEqual({ valid: false, reason: 'Private or reserved address' });
  });

  it('rejects non-HTTP protocols', () => {
    expect(validateUrl('file:///etc/passwd')).toEqual({ valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' });
    expect(validateUrl('ftp://example.com')).toEqual({ valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' });
  });

  it('rejects empty/invalid input', () => {
    expect(validateUrl('')).toEqual({ valid: false, reason: 'URL is required' });
    expect(validateUrl('not-a-url')).toEqual({ valid: false, reason: 'Invalid URL format' });
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd scan-service && npx vitest run tests/url-validator.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement URL validator**

```typescript
// scan-service/src/url-validator.ts
import { URL } from 'url';
import dns from 'dns/promises';
import net from 'net';

type ValidationResult =
  | { valid: true; url: string }
  | { valid: false; reason: string };

const BLOCKED_RANGES = [
  { start: '10.0.0.0', end: '10.255.255.255' },
  { start: '172.16.0.0', end: '172.31.255.255' },
  { start: '192.168.0.0', end: '192.168.255.255' },
  { start: '127.0.0.0', end: '127.255.255.255' },
  { start: '169.254.0.0', end: '169.254.255.255' },
  { start: '0.0.0.0', end: '0.255.255.255' },
];

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isPrivateIp(ip: string): boolean {
  if (!net.isIPv4(ip)) return false;
  const num = ipToNumber(ip);
  return BLOCKED_RANGES.some(
    (range) => num >= ipToNumber(range.start) && num <= ipToNumber(range.end)
  );
}

export function validateUrl(input: string): ValidationResult {
  if (!input || input.trim() === '') {
    return { valid: false, reason: 'URL is required' };
  }

  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' };
  }

  const hostname = parsed.hostname;

  // Block localhost variants
  if (hostname === 'localhost' || hostname === '0.0.0.0') {
    return { valid: false, reason: 'Private or reserved address' };
  }

  // Block IP addresses in private ranges
  if (net.isIPv4(hostname) && isPrivateIp(hostname)) {
    return { valid: false, reason: 'Private or reserved address' };
  }

  return { valid: true, url: parsed.toString() };
}

// DNS-level check for hostnames that resolve to private IPs
export async function validateUrlWithDns(input: string): Promise<ValidationResult> {
  const basic = validateUrl(input);
  if (!basic.valid) return basic;

  const parsed = new URL(basic.url);
  if (!net.isIPv4(parsed.hostname)) {
    try {
      const addresses = await dns.resolve4(parsed.hostname);
      if (addresses.some(isPrivateIp)) {
        return { valid: false, reason: 'Private or reserved address' };
      }
    } catch {
      return { valid: false, reason: 'Could not resolve hostname' };
    }
  }

  return { valid: true, url: basic.url };
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd scan-service && npx vitest run tests/url-validator.test.ts
```
Expected: PASS

- [ ] **Step 5: Write score calculation tests**

```typescript
// scan-service/tests/score.test.ts
import { describe, it, expect } from 'vitest';
import { calculateScore } from '../src/score';

describe('calculateScore', () => {
  it('returns 100 for no violations', () => {
    expect(calculateScore({ violations: [], passes: new Array(50) })).toBe(100);
  });

  it('returns 0 for all critical violations no passes', () => {
    const violations = new Array(20).fill({ impact: 'critical', nodes: [{}] });
    expect(calculateScore({ violations, passes: [] })).toBe(0);
  });

  it('weighs critical higher than minor', () => {
    const critical = [{ impact: 'critical', nodes: [{}, {}] }];
    const minor = [{ impact: 'minor', nodes: [{}, {}] }];
    const passes = new Array(10).fill({});
    expect(calculateScore({ violations: critical, passes }))
      .toBeLessThan(calculateScore({ violations: minor, passes }));
  });

  it('clamps between 0 and 100', () => {
    const score = calculateScore({ violations: [], passes: [] });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

- [ ] **Step 6: Implement score calculator**

```typescript
// scan-service/src/score.ts
const IMPACT_WEIGHTS: Record<string, number> = {
  critical: 10,
  serious: 5,
  moderate: 3,
  minor: 1,
};

interface ScoringInput {
  violations: Array<{ impact: string; nodes: unknown[] }>;
  passes: unknown[];
}

export function calculateScore(input: ScoringInput): number {
  const { violations, passes } = input;

  if (violations.length === 0 && passes.length === 0) return 100;

  const totalDeductions = violations.reduce((sum, v) => {
    const weight = IMPACT_WEIGHTS[v.impact] ?? 1;
    return sum + weight * v.nodes.length;
  }, 0);

  const totalRules = passes.length + violations.length;
  if (totalRules === 0) return 100;

  // Score is pass ratio penalised by weighted deductions
  const passRatio = passes.length / totalRules;
  const deductionPenalty = Math.min(totalDeductions / (totalRules * 2), 1);
  const raw = (passRatio * 0.6 + (1 - deductionPenalty) * 0.4) * 100;

  return Math.max(0, Math.min(100, Math.round(raw)));
}
```

- [ ] **Step 7: Run tests — verify pass**

```bash
cd scan-service && npx vitest run
```
Expected: All PASS

- [ ] **Step 8: Implement scanner (adapted from existing audit.js)**

```typescript
// scan-service/src/scanner.ts
import puppeteer, { Browser } from 'puppeteer';
import AxePuppeteer from '@axe-core/puppeteer';
import { validateUrlWithDns } from './url-validator';
import { calculateScore } from './score';

export interface ScanResult {
  url: string;
  score: number;
  totalViolations: number;
  violations: Array<{
    id: string;
    impact: string;
    description: string;
    helpUrl: string;
    nodeCount: number;
    wcagTags: string[];
  }>;
  passedRules: number;
  totalRules: number;
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browser;
}

export async function scanUrl(url: string): Promise<ScanResult> {
  const validation = await validateUrlWithDns(url);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(validation.url, { waitUntil: 'networkidle2', timeout: 30_000 });
    await new Promise((r) => setTimeout(r, 2000));

    const results = await new AxePuppeteer(page).analyze();

    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? 'minor',
      description: v.description,
      helpUrl: v.helpUrl,
      nodeCount: v.nodes.length,
      wcagTags: v.tags.filter((t) => t.startsWith('wcag')),
    }));

    const score = calculateScore({
      violations: results.violations.map((v) => ({
        impact: v.impact ?? 'minor',
        nodes: v.nodes,
      })),
      passes: results.passes,
    });

    return {
      url: validation.url,
      score,
      totalViolations: violations.reduce((sum, v) => sum + v.nodeCount, 0),
      violations: violations.sort((a, b) => {
        const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
        return (impactOrder[a.impact as keyof typeof impactOrder] ?? 3) -
               (impactOrder[b.impact as keyof typeof impactOrder] ?? 3);
      }),
      passedRules: results.passes.length,
      totalRules: results.passes.length + results.violations.length + results.incomplete.length,
    };
  } finally {
    await page.close();
  }
}
```

- [ ] **Step 9: Implement Fastify server**

```typescript
// scan-service/src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { scanUrl } from './scanner';

const app = Fastify({ logger: true });

// Max 5 concurrent scans
let activeScanCount = 0;
const MAX_CONCURRENT_SCANS = 5;

await app.register(cors, { origin: true });
await app.register(rateLimit, {
  max: 10,
  timeWindow: '1 minute',
});

app.post('/api/scan', async (request, reply) => {
  const { url } = request.body as { url: string };

  if (!url) {
    return reply.status(400).send({ error: 'URL is required' });
  }

  if (activeScanCount >= MAX_CONCURRENT_SCANS) {
    return reply.status(429).send({ error: 'Too many scans in progress. Please try again shortly.' });
  }

  activeScanCount++;
  try {
    const result = await scanUrl(url);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scan failed';
    return reply.status(422).send({ error: message });
  } finally {
    activeScanCount--;
  }
});

app.get('/health', async () => ({ status: 'ok' }));

const PORT = parseInt(process.env.PORT ?? '3001', 10);
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
```

- [ ] **Step 10: Commit**

```bash
git add scan-service/
git commit -m "feat: VPS scan engine with SSRF protection, scoring, and rate limiting"
```

---

## Task 3: Landing Page + Design System

**Wave: 2 (after Task 1 scaffolding)**

**Design reference:** Follow `.impeccable.md` strictly. Light mode default, warm off-white bg, teal accent, Inter body, serif headlines. Cal.com + Resend aesthetic. Use Impeccable `/polish` after building.

**Files:**
- Create/Modify: `app/layout.tsx`, `app/globals.css`, `app/providers.tsx`
- Create: `app/page.tsx` (landing)
- Create: `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/Card.tsx`, `components/ui/ThemeToggle.tsx`
- Create: `components/Hero.tsx`, `components/ScanForm.tsx`, `components/SocialProof.tsx`, `components/Footer.tsx`
- Create: `lib/constants.ts`

- [ ] **Step 1: Set up design tokens in globals.css**

Tailwind CSS 4 custom properties. Light/dark mode via `data-theme` attribute. Color palette from `.impeccable.md`: warm off-white bg, teal accent, amber warnings.

- [ ] **Step 2: Create base UI components**

`Button.tsx` — primary (teal), secondary (outline), ghost variants. Rounded-lg, medium weight, subtle hover transitions.
`Input.tsx` — large URL input with rounded-xl, focus ring in teal, placeholder styling.
`Card.tsx` — soft shadow, rounded-xl (16px), white bg on light, card bg on dark.
`ThemeToggle.tsx` — sun/moon icon toggle, persists to localStorage.

- [ ] **Step 3: Build Hero section**

```
"How much more could your website be making?"
"Free 30-second scan. See what you're missing."
[Enter your website URL _______________] [Scan Free →]
```

Large heading in serif display font. Subheading in Inter. Single URL input with CTA button. Nothing else above the fold except the NeuroEdge wordmark. Generous whitespace.

- [ ] **Step 4: Build SocialProof section**

Below the fold. Three stat blocks:
- "30/30 Liverpool businesses we scanned had failures"
- "24% of UK visitors have a disability"
- "71% leave sites they can't use"

Source citations below each stat. Subtle fade-in on scroll via Framer Motion.

- [ ] **Step 5: Build Footer**

Minimal. NeuroEdge wordmark, "Built with care in Liverpool", link to pitch video.

- [ ] **Step 6: Wire layout with fonts, theme provider, metadata**

Import Inter + display serif (Instrument Serif or Lora). Wire theme provider. Set meta title: "NeuroEdge — How much more could your website be making?"

- [ ] **Step 7: Run Impeccable `/polish` on landing page**

Invoke the Impeccable polish skill to audit and refine the landing page against `.impeccable.md` principles.

- [ ] **Step 8: Commit**

```bash
git add app/
git commit -m "feat: landing page with design system, hero, social proof"
```

---

## Task 4: Scan Flow + Results Page

**Wave: 2 (parallel with Task 3 if design system is extracted first)**

**Files:**
- Create: `app/api/scan/route.ts`
- Create: `app/scan/[id]/page.tsx`
- Create: `components/ScanProgress.tsx`, `components/ScoreRing.tsx`
- Create: `components/IssueCard.tsx`, `components/IssueList.tsx`
- Create: `lib/supabase.ts`, `lib/url-validate.ts`

- [ ] **Step 1: Create Supabase client**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side client with service role for API routes
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

- [ ] **Step 2: Create API route that proxies to VPS**

```typescript
// app/api/scan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

const SCAN_SERVICE_URL = process.env.SCAN_SERVICE_URL!;

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Call VPS scan service
  const scanResponse = await fetch(`${SCAN_SERVICE_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!scanResponse.ok) {
    const err = await scanResponse.json();
    return NextResponse.json(err, { status: scanResponse.status });
  }

  const result = await scanResponse.json();

  // Store in Supabase
  const db = createServerClient();
  const { data: scan, error: insertError } = await db
    .from('scans')
    .insert({
      url,
      score: result.score,
      total_violations: result.totalViolations,
      violations: result.violations,
      top_issues: result.violations.slice(0, 5),
    })
    .select('id')
    .single();

  if (insertError || !scan) {
    console.error('Failed to store scan:', insertError);
    return NextResponse.json({ error: 'Failed to save scan results' }, { status: 500 });
  }

  return NextResponse.json({ ...result, scanId: scan.id });
}
```

- [ ] **Step 3: Build ScanProgress component**

Animated loading state. Real phases: "Connecting to your website..." → "Checking accessibility..." → "Analysing results..." Framer Motion transitions between phases. Progress bar that advances based on elapsed time (calibrated to ~15s typical scan).

- [ ] **Step 4: Build ScoreRing component**

Circular SVG progress ring. Score animates from 0 to final value over 1.5s using Framer Motion `useMotionValue` + `useTransform`. Color shifts: 0-30 red, 31-60 amber, 61-80 teal, 81-100 green. Large number in centre, label below.

- [ ] **Step 5: Build IssueCard + IssueList**

IssueCard: impact badge (critical/serious/moderate/minor), plain-English description from axe-core `description` field, node count ("affects 12 elements"). IssueList: top 5 issues with staggered fade-in (100ms delay between each).

- [ ] **Step 6: Wire scan/[id]/page.tsx**

On mount: show ScanProgress. On completion: animate in ScoreRing + IssueList. Below issues: render placeholder sections for revenue estimate form and report CTA (these will be wired in Tasks 5 and 6). Use a simple "Full report coming soon" placeholder for now.

- [ ] **Step 7: Commit**

```bash
git add app/ components/ lib/
git commit -m "feat: scan flow with progress animation, score ring, issue display"
```

---

## Task 5: Interactive Revenue Estimate

**Wave: 3 (after Task 4)**

**Files:**
- Create: `app/api/estimate/route.ts`
- Create: `components/RevenueForm.tsx`
- Create: `components/RevenueResult.tsx`
- Create: `lib/revenue.ts`
- Create: `lib/constants.ts` (industry benchmarks)

- [ ] **Step 1: Define industry benchmarks**

```typescript
// lib/constants.ts
export const INDUSTRY_BENCHMARKS = {
  restaurant: { label: 'Restaurant / Cafe', avgOrderValue: 35, conversionRate: 0.03 },
  salon: { label: 'Hair Salon / Beauty', avgOrderValue: 45, conversionRate: 0.05 },
  professional: { label: 'Professional Services', avgOrderValue: 200, conversionRate: 0.02 },
  trades: { label: 'Trades / Home Services', avgOrderValue: 150, conversionRate: 0.04 },
  retail: { label: 'Retail / E-commerce', avgOrderValue: 50, conversionRate: 0.03 },
  health: { label: 'Health / Dental / Gym', avgOrderValue: 60, conversionRate: 0.04 },
  property: { label: 'Estate Agent / Property', avgOrderValue: 500, conversionRate: 0.01 },
  other: { label: 'Other', avgOrderValue: 75, conversionRate: 0.03 },
} as const;

// Sources: all figures used in revenue calculation
export const ACCESSIBILITY_STATS = {
  disabledPopulationPercent: 0.24,   // 24% of UK population — Family Resources Survey 2023
  clickAwayRate: 0.71,               // 71% leave inaccessible sites — Click-Away Pound Survey
  recoveryRateLow: 0.14,            // Conservative: fixing top issues recovers 14% of lost visitors
  recoveryRateHigh: 0.25,           // Optimistic: recovers 25%
  source: 'Family Resources Survey 2023, Click-Away Pound Survey 2019, WebAIM Million 2025',
};
```

- [ ] **Step 2: Implement revenue calculation**

```typescript
// lib/revenue.ts
import { ACCESSIBILITY_STATS } from './constants';

export interface RevenueInput {
  monthlyVisitors: number;
  avgOrderValue: number;
  conversionRate: number;
}

export interface RevenueEstimate {
  disabledVisitors: number;
  lostVisitors: number;
  recoveredLow: number;
  recoveredHigh: number;
  revenueUpliftLow: number;
  revenueUpliftHigh: number;
  formula: string;
}

export function calculateRevenueUplift(input: RevenueInput): RevenueEstimate {
  const { monthlyVisitors, avgOrderValue, conversionRate } = input;
  const { disabledPopulationPercent, clickAwayRate, recoveryRateLow, recoveryRateHigh } = ACCESSIBILITY_STATS;

  const disabledVisitors = Math.round(monthlyVisitors * disabledPopulationPercent);
  const lostVisitors = Math.round(disabledVisitors * clickAwayRate);
  const recoveredLow = Math.round(lostVisitors * recoveryRateLow);
  const recoveredHigh = Math.round(lostVisitors * recoveryRateHigh);
  const revenueUpliftLow = Math.round(recoveredLow * conversionRate * avgOrderValue);
  const revenueUpliftHigh = Math.round(recoveredHigh * conversionRate * avgOrderValue);

  const formula = `${monthlyVisitors.toLocaleString()} visitors × ${(disabledPopulationPercent * 100)}% disabled = ${disabledVisitors.toLocaleString()} → ${(clickAwayRate * 100)}% leave = ${lostVisitors.toLocaleString()} lost → fixing top issues recovers ${(recoveryRateLow * 100)}-${(recoveryRateHigh * 100)}% → at ${(conversionRate * 100)}% conversion × £${avgOrderValue} avg order`;

  return {
    disabledVisitors,
    lostVisitors,
    recoveredLow,
    recoveredHigh,
    revenueUpliftLow,
    revenueUpliftHigh,
    formula,
  };
}
```

- [ ] **Step 3: Write revenue calc tests**

Note: `calculateRevenueUplift` lives in `app/lib/revenue.ts` (frontend). To test it with Vitest in the scan-service, copy the function and constants to `scan-service/src/revenue.ts` as a shared module, OR create a separate `app/__tests__/revenue.test.ts` using the Next.js test setup. For this plan, we co-locate the test with the frontend code.

```typescript
// app/__tests__/revenue.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRevenueUplift } from '../lib/revenue';

describe('calculateRevenueUplift', () => {
  it('calculates correct uplift for a restaurant', () => {
    const result = calculateRevenueUplift({
      monthlyVisitors: 2000,
      avgOrderValue: 35,
      conversionRate: 0.03,
    });
    // 2000 × 0.24 = 480 disabled
    // 480 × 0.71 = 341 lost
    // low: 341 × 0.14 = 48 recovered → 48 × 0.03 × 35 = £50
    // high: 341 × 0.25 = 85 recovered → 85 × 0.03 × 35 = £89
    expect(result.disabledVisitors).toBe(480);
    expect(result.lostVisitors).toBe(341);
    expect(result.revenueUpliftLow).toBeGreaterThan(0);
    expect(result.revenueUpliftHigh).toBeGreaterThan(result.revenueUpliftLow);
  });

  it('returns zero for zero visitors', () => {
    const result = calculateRevenueUplift({
      monthlyVisitors: 0,
      avgOrderValue: 35,
      conversionRate: 0.03,
    });
    expect(result.revenueUpliftLow).toBe(0);
    expect(result.revenueUpliftHigh).toBe(0);
  });
});
```

- [ ] **Step 4: Build RevenueForm component**

Three inputs, conversational style (not grid):
1. "What's your industry?" — Select dropdown with INDUSTRY_BENCHMARKS
2. "About how many visitors does your website get per month?" — Number input with suggestions (500, 1000, 2000, 5000)
3. "What's your average sale or booking value?" — Prefilled from industry benchmark, editable

[Calculate My Uplift →] button. Form uses Framer Motion for smooth transitions.

- [ ] **Step 5: Build RevenueResult component**

Large headline: "You could be making £X – £Y more per month"
Below: the full formula breakdown, every number visible:
- "2,000 visitors × 24% with disabilities = 480 disabled visitors"
- "71% leave when they can't use the site = 341 lost visitors"
- "Fixing your top issues recovers 14-25% = 48-85 visitors"
- "At 3% conversion × £35 average order = £50 – £89/month"

Source citations below. Framer Motion count-up animation on the headline number.

- [ ] **Step 6: Wire form into scan results page**

RevenueForm appears below IssueList on scan/[id]/page.tsx. On submit: calculate client-side (no API needed — the math is transparent). Also POST to /api/estimate to save estimates back to the scan record in Supabase.

- [ ] **Step 7: Commit**

```bash
git add components/ lib/ app/
git commit -m "feat: interactive revenue estimate with transparent formula"
```

---

## Task 6: Stripe Checkout + Coupon Codes

**Wave: 3 (parallel with Task 5)**

**Files:**
- Create: `app/api/checkout/route.ts`
- Create: `app/api/webhook/route.ts`
- Create: `components/ReportCTA.tsx`
- Create: `lib/stripe.ts`

- [ ] **Step 1: Create Stripe helpers**

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});
```

- [ ] **Step 2: Implement checkout route**

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { scanId, email, couponCode } = await req.json();

  if (!scanId || !email) {
    return NextResponse.json({ error: 'Scan ID and email are required' }, { status: 400 });
  }

  // Validate coupon if provided
  let discountPercent = 0;
  if (couponCode) {
    const db = createServerClient();
    const { data: coupon } = await db
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase().trim())
      .eq('active', true)
      .single();

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
    }
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({ error: 'Coupon has been fully redeemed' }, { status: 400 });
    }
    discountPercent = coupon.discount_percent;
  }

  // If 100% discount, skip Stripe entirely
  if (discountPercent === 100) {
    const db = createServerClient();

    // Increment coupon usage
    await db.rpc('increment_coupon_usage', { coupon_code: couponCode.toUpperCase().trim() });

    // Create report record directly
    const { data: report } = await db
      .from('reports')
      .insert({
        scan_id: scanId,
        email,
        coupon_code: couponCode.toUpperCase().trim(),
        status: 'pending',
      })
      .select('id')
      .single();

    // Trigger report generation on VPS
    await fetch(`${process.env.SCAN_SERVICE_URL}/api/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: report?.id, scanId }),
    });

    return NextResponse.json({ reportId: report?.id, free: true });
  }

  // Create Stripe checkout session
  const unitAmount = 2900; // £29.00
  const finalAmount = Math.round(unitAmount * (1 - discountPercent / 100));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'NeuroEdge Full Accessibility Report',
            description: 'Plain-English report with every issue, fix priorities, and revenue impact',
          },
          unit_amount: finalAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/report/${scanId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/scan/${scanId}`,
    metadata: { scanId, couponCode: couponCode ?? '' },
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 3: Implement Stripe webhook**

```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { scanId, couponCode } = session.metadata ?? {};

    const db = createServerClient();

    // Create report record
    const { data: report } = await db
      .from('reports')
      .insert({
        scan_id: scanId,
        email: session.customer_email,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
        coupon_code: couponCode || null,
        status: 'pending',
      })
      .select('id')
      .single();

    // Trigger report generation on VPS
    await fetch(`${process.env.SCAN_SERVICE_URL}/api/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: report?.id, scanId }),
    });
  }

  return NextResponse.json({ received: true });
}

// Note: App Router does not use Pages Router `config.api.bodyParser` export.
// Raw body access via req.text() works by default in App Router route handlers.
```

- [ ] **Step 4: Build ReportCTA component**

Section below RevenueResult on scan page:
- Headline: "Get your full report"
- Bullet points: "Every issue explained in plain English", "Fix priorities ranked by revenue impact", "Easy wins section — fixes under 1 hour", "What to tell your web developer"
- Email input
- Optional coupon code input (collapsed by default, "Have a coupon code?" link)
- [Get Full Report — £29] button
- If coupon = 100% off: [Get Free Report] button instead

- [ ] **Step 5: Commit**

```bash
git add app/ components/ lib/
git commit -m "feat: Stripe checkout with coupon codes and webhook handler"
```

---

## Task 7: PDF Report Generation + Email Delivery

**Wave: 4 (after Tasks 5+6)**

**Files:**
- Create: `scan-service/src/translator.ts`
- Create: `scan-service/src/pdf/template.ts`
- Create: `scan-service/src/pdf/generator.ts`
- Create: `scan-service/src/emailer.ts`
- Create: `scan-service/tests/translator.test.ts`
- Modify: `scan-service/src/server.ts` (add /api/generate-report route)

- [ ] **Step 1: Write translator tests**

```typescript
// scan-service/tests/translator.test.ts
import { describe, it, expect } from 'vitest';
import { validateTranslation } from '../src/translator';

describe('validateTranslation', () => {
  it('rejects output missing required fields', () => {
    expect(validateTranslation({ issues: [] })).toBe(false);
  });

  it('accepts well-formed translation', () => {
    const valid = {
      issues: [{
        id: 'color-contrast',
        plainEnglish: 'Some text on your website is hard to read.',
        businessImpact: 'Visitors with low vision may leave.',
        fixDifficulty: 'easy',
        estimatedFixTime: 'Under 1 hour',
      }],
    };
    expect(validateTranslation(valid)).toBe(true);
  });
});
```

- [ ] **Step 2: Implement Claude API translator**

```typescript
// scan-service/src/translator.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface TranslatedIssue {
  id: string;
  plainEnglish: string;
  businessImpact: string;
  fixDifficulty: 'easy' | 'medium' | 'hard';
  estimatedFixTime: string;
  whatToTellDeveloper: string;
}

export function validateTranslation(output: unknown): output is { issues: TranslatedIssue[] } {
  if (!output || typeof output !== 'object') return false;
  const obj = output as Record<string, unknown>;
  if (!Array.isArray(obj.issues)) return false;
  return obj.issues.every((issue: unknown) => {
    if (!issue || typeof issue !== 'object') return false;
    const i = issue as Record<string, unknown>;
    return i.id && i.plainEnglish && i.businessImpact && i.fixDifficulty;
  });
}

export async function translateViolations(
  violations: Array<{ id: string; impact: string; description: string; helpUrl: string; nodeCount: number }>,
  url: string,
  industry: string
): Promise<TranslatedIssue[]> {
  const prompt = `You are NeuroEdge, an accessibility audit tool for UK small businesses. Translate these WCAG violations into plain English that a non-technical business owner can understand.

Website: ${url}
Industry: ${industry}

Violations:
${violations.map((v) => `- ${v.id} (${v.impact}): ${v.description} — affects ${v.nodeCount} elements`).join('\n')}

For each violation, return a JSON array with:
- id: the violation ID
- plainEnglish: explain what's wrong in simple language (no jargon, no WCAG codes)
- businessImpact: explain how this affects their customers and revenue
- fixDifficulty: "easy" (under 1 hour), "medium" (1-4 hours), or "hard" (needs a developer)
- estimatedFixTime: human-readable estimate
- whatToTellDeveloper: one sentence a business owner can copy-paste to their web developer

Respond ONLY with valid JSON: { "issues": [...] }`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const parsed = JSON.parse(text);
    if (validateTranslation(parsed)) {
      return parsed.issues;
    }
    console.warn('Claude response failed validation, retrying with stricter prompt');
  } catch (parseError) {
    console.warn('Claude response was not valid JSON, retrying:', parseError);
  }

  // Retry once with stricter system prompt
  try {
    const retryResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      system: 'You MUST respond with ONLY valid JSON. No markdown, no explanation, no code fences. Just the JSON object.',
      messages: [{ role: 'user', content: prompt }],
    });
    const retryText = retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
    const retryParsed = JSON.parse(retryText);
    if (validateTranslation(retryParsed)) {
      return retryParsed.issues;
    }
  } catch (retryError) {
    console.error('Claude retry also failed, falling back to raw descriptions:', retryError);
  }

  // Fallback: return raw descriptions formatted without AI
  return violations.map((v) => ({
    id: v.id,
    plainEnglish: v.description,
    businessImpact: `This ${v.impact} issue affects ${v.nodeCount} elements on your website.`,
    fixDifficulty: v.impact === 'critical' || v.impact === 'serious' ? 'medium' as const : 'easy' as const,
    estimatedFixTime: 'Varies',
    whatToTellDeveloper: `Please fix: ${v.id} — ${v.description}`,
  }));
}
```

- [ ] **Step 3: Implement PDF template + generator**

HTML template styled to match NeuroEdge brand. Puppeteer `page.pdf()` for conversion. Include: score ring, all issues in plain English, revenue uplift section, easy wins callout, legal context, "what to tell your developer" cheat sheet.

- [ ] **Step 4: Implement emailer**

```typescript
// scan-service/src/emailer.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReport(email: string, pdfBuffer: Buffer, scanUrl: string, score: number) {
  await resend.emails.send({
    from: 'NeuroEdge <reports@neuroedge.co.uk>',
    to: email,
    subject: `Your NeuroEdge Accessibility Report — Score: ${score}/100`,
    html: `
      <h1>Your accessibility report is ready</h1>
      <p>We've scanned <strong>${scanUrl}</strong> and found opportunities to reach more customers.</p>
      <p>Your full report is attached as a PDF.</p>
      <p>— The NeuroEdge Team</p>
    `,
    attachments: [{
      filename: 'NeuroEdge-Accessibility-Report.pdf',
      content: pdfBuffer,
    }],
  });
}
```

- [ ] **Step 5: Create scan-service Supabase client**

```typescript
// scan-service/src/db.ts
import { createClient } from '@supabase/supabase-js';

export const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

- [ ] **Step 6: Add /api/generate-report route to server.ts**

```typescript
// Add this route to scan-service/src/server.ts
import { db } from './db';
import { translateViolations } from './translator';
import { generatePdf } from './pdf/generator';
import { sendReport } from './emailer';

app.post('/api/generate-report', async (request, reply) => {
  const { reportId, scanId } = request.body as { reportId: string; scanId: string };

  if (!reportId || !scanId) {
    return reply.status(400).send({ error: 'reportId and scanId are required' });
  }

  // Update status to generating
  await db.from('reports').update({ status: 'generating' }).eq('id', reportId);

  try {
    // Read scan data
    const { data: scan, error: scanError } = await db
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      throw new Error(`Scan not found: ${scanId}`);
    }

    // Read report for email
    const { data: report } = await db
      .from('reports')
      .select('email')
      .eq('id', reportId)
      .single();

    if (!report?.email) {
      throw new Error(`Report not found: ${reportId}`);
    }

    // Translate violations via Claude API
    const translatedIssues = await translateViolations(
      scan.violations ?? [],
      scan.url,
      scan.industry ?? 'other'
    );

    // Generate PDF
    const pdfBuffer = await generatePdf({
      url: scan.url,
      score: scan.score,
      issues: translatedIssues,
      revenueUpliftLow: scan.revenue_uplift_low,
      revenueUpliftHigh: scan.revenue_uplift_high,
      industry: scan.industry,
    });

    // Send email
    await sendReport(report.email, pdfBuffer, scan.url, scan.score);

    // Update report status
    await db.from('reports').update({
      status: 'sent',
      plain_english_violations: translatedIssues,
      sent_at: new Date().toISOString(),
    }).eq('id', reportId);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Report generation failed';
    app.log.error(`Report generation failed for ${reportId}: ${message}`);
    await db.from('reports').update({ status: 'failed' }).eq('id', reportId);
    return reply.status(500).send({ error: message });
  }
});
```

- [ ] **Step 7: Commit**

```bash
git add scan-service/
git commit -m "feat: PDF report generation with Claude translation and email delivery"
```

---

## Task 8: Report Status Page (Webhook Safety Net)

**Wave: 4 (parallel with Task 7)**

**Files:**
- Create: `app/report/[id]/page.tsx`

- [ ] **Step 1: Build report status page**

URL: `/report/[scanId]?session_id=...`

On load:
1. If `session_id` param: look up Stripe session → find report in Supabase
2. If no `session_id`: show email input → look up reports by email

Display states:
- **pending**: "Your report is being generated. This usually takes 2-3 minutes. We'll email it to [email]."
- **generating**: "Almost there... translating your results into plain English."
- **sent**: "Your report was sent to [email] on [date]. Check your inbox (and spam folder)."
- **failed**: "Something went wrong. We're on it. Email ved@neuroedge.co.uk and we'll sort this out personally."

Auto-refresh every 10 seconds while pending/generating.

- [ ] **Step 2: Add manual re-trigger**

If status is 'failed' or stuck in 'pending' for >5 minutes, show a "Regenerate Report" button that POSTs to `/api/generate-report` again.

- [ ] **Step 3: Commit**

```bash
git add app/
git commit -m "feat: report status page with auto-refresh and re-trigger"
```

---

## Task 9: Polish + Accessibility Audit + Final Wiring

**Wave: 5 (final)**

- [ ] **Step 1: Run Impeccable `/polish` on all pages**

Invoke the polish skill to audit every page against `.impeccable.md`.

- [ ] **Step 2: Run Impeccable `/audit` for accessibility**

The tool must pass its own accessibility audit. WCAG 2.2 AA. Keyboard navigation, focus indicators, screen reader labels, sufficient contrast, prefers-reduced-motion.

- [ ] **Step 3: Add environment variables**

```
# Vercel (frontend)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
SCAN_SERVICE_URL=

# VPS (scan service)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
PORT=3001
```

- [ ] **Step 4: Deploy frontend to Vercel**

```bash
cd app && npx vercel --prod
```

- [ ] **Step 5: Deploy scan service to VPS**

Docker build + run, or PM2. Ensure Puppeteer deps installed on VPS (chromium, fonts).

- [ ] **Step 6: Create initial coupon codes in Supabase**

```sql
INSERT INTO coupons (code, discount_percent, max_uses)
VALUES
  ('LINKEDIN100', 100, 50),
  ('LAUNCH50', 50, 100);
```

- [ ] **Step 7: End-to-end test**

Manual walkthrough: Enter URL → scan → see score → fill form → see uplift → apply coupon → get report → check email.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "feat: production deploy with env config, coupons, and accessibility audit"
```

---

## Dependency Graph

```
Wave 1 (sequential): Task 1 (scaffold) → Task 2 (scan engine, needs T1 Step 3)
                         │
Wave 2 (parallel):  Task 3 (landing page + design system) ║ Task 4 (scan flow + results)
                         │                                        │
Wave 3 (parallel):  Task 5 (revenue form)  ║  Task 6 (Stripe + coupons)
                         │                      │
Wave 4 (parallel):  Task 7 (PDF + Claude + email) ║  Task 8 (status page)
                         │                              │
Wave 5:             Task 9 (polish + deploy + e2e)
```

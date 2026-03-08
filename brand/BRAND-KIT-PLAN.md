# NeuroEdge Brand Kit — Execution Plan

## Source of Truth
- `PitchDeck/index.html` — ALL data comes from here
- If ambiguous or missing, ASK the user before proceeding

## Pipeline
```
Step 1: Positioning → Step 2: Brand Voice → Step 3: Copywriting → Step 4: Design Kit
```
Each step is sequential. User must approve output before next step begins.

---

## Step 1: Positioning
- **Skill:** positioning-basics
- **Input:** PitchDeck/index.html
- **Output:** `brand/POSITIONING.md`
- **Key tasks:**
  - Answer Core 5 Questions (WHO, WHAT, HOW, WHY, SO WHAT) from pitch deck
  - Competitive mapping with real names: WAVE/axe (free), Siteimprove/Level Access (enterprise), accessiBe/UserWay (overlays)
  - Positioning statement using template
  - One-liner (10 words max)
  - Elevator pitch (~75 words)
  - Quick positioning test (5 checks)
  - Self-critique pass
- **Status:** DONE — committed `02f8ca8`

## Step 2: Brand Voice
- **Skill:** market-brand
- **Input:** `brand/POSITIONING.md` + PitchDeck/index.html
- **Output:** `brand/BRAND-VOICE.md`
- **Key tasks:**
  - 4 voice dimensions scored 1-10 (formal/casual, serious/playful, technical/simple, reserved/bold)
  - Brand personality archetype (from 5 options: Authority, Innovator, Friend, Rebel, Guide)
  - Tone spectrum mapping by context
  - Vocabulary analysis (words we use / words we avoid / signature phrases)
  - Voice chart (IS / IS NOT)
  - Writing do's and don'ts
  - Brand messaging hierarchy (tagline, value props, elevator pitch, boilerplate)
  - 8 copy samples in brand voice
  - Competitor voice comparison
- **Status:** DONE — 2026-03-08. Output: `brand/BRAND-VOICE.md`

## Step 3: Copywriting
- **Skill:** copywriting
- **Input:** `brand/POSITIONING.md` + `brand/BRAND-VOICE.md`
- **Output:** `brand/COPY-SYSTEM.md`
- **Key tasks:**
  - Homepage headline options (3-5)
  - Subheadline options
  - Value propositions (benefit-led, not feature-led)
  - CTA copy (strong action verbs)
  - Problem/pain framing copy
  - Solution/benefit copy
  - How-it-works copy
  - Social proof framing
  - Taglines
  - Meta content (SEO title, description)
- **Status:** NOT STARTED

## Step 4: Visual Design Kit
- **Skill:** frontend-design:frontend-design
- **Input:** `brand/POSITIONING.md` + `brand/BRAND-VOICE.md` + `brand/COPY-SYSTEM.md`
- **Output:** `brand/DESIGN-KIT.html` (browseable living design system)
- **Key tasks:**
  - Color palette (primary, accent, semantic, neutrals)
  - Typography system (distinctive display + body fonts)
  - Spacing/sizing scale
  - Component patterns (cards, buttons, stats blocks, CTAs, forms)
  - Motion/animation guidelines
  - Dark + light theme tokens
  - All rendered as interactive HTML page
- **Status:** NOT STARTED

---

## How to Resume After Context Clear
1. Read this file: `brand/BRAND-KIT-PLAN.md`
2. Check Status of each step
3. If a step says DONE, read its output file
4. Pick up from the first NOT STARTED step
5. Source of truth is ALWAYS `PitchDeck/index.html`

## Log
- **Step 1 (Positioning):** DONE — 2026-03-08, commit `02f8ca8`. Output: `brand/POSITIONING.md`. User approved.
- **Step 2 (Brand Voice):** DONE — 2026-03-08. Output: `brand/BRAND-VOICE.md`. Awaiting user approval.

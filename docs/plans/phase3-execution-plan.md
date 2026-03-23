# Phase 3 Execution Plan — Scene Rewrites with Data Fidelity

**Created:** 2026-03-08
**Deadline:** 2026-03-08 23:55
**Rule:** PitchDeck/index.html is the SINGLE SOURCE OF TRUTH. Every number, stat, and claim in the video MUST match the PitchDeck exactly. No truncation. No paraphrasing of data. No rounding.

---

## Wave 1: Complete Rewrites (S01, S10)

### S01_ColdOpen.tsx — COMPLETE REWRITE
- **Duration:** 750 frames (currently 600 — increase)
- **Remove:** Current "imagine you run a small business" content entirely
- **New content:** Sarah's story per design doc
- **Uses:** CinematicText, FloristWebsite (light BrowserMockup), ScreenReaderCursor (fail mode)
- **Data points:** NONE — pure story, no stats
- **Transition:** fade from black in, blur-dissolve out

### S10_AskAndClose.tsx — COMPLETE REWRITE
- **Duration:** 600 frames (unchanged)
- **Remove:** Current impact cards + simple logo close
- **New content per design doc:** FloristWebsite revisited, ScreenReaderCursor (success mode), ScoreTransition 34->91, "The flowers arrive" CinematicText, then logo+ask
- **CRITICAL DATA that is currently MISSING from this scene (from PitchDeck Slide 17):**
  - Headline: "£5,000 to build, pilot, and launch NeuroEdge"
  - "By month 5, we're generating revenue from paid reports and monitoring subscriptions."
  - "The business is designed to be self-sustaining from month 6."
  - Founder names + roles + degrees
  - "University of Liverpool · Design Your Future 2026"

---

## Wave 2: Significant Rework (S02, S04)

### S02_ProblemStats.tsx — ADD BRIDGE + MISSING STAT
- **Duration:** 600 frames (unchanged)
- **Remove:** "THE PROBLEM" section label
- **Add:** CinematicText "Sarah isn't alone." at the start (frames 0-60)
- **Keep:** 94.8%, 51 errors, 24% stats — VERIFIED match PitchDeck Slide 2
- **MISSING DATA to add (from PitchDeck Slide 2):**
  - "30/30 Liverpool SMEs we scanned had accessibility failures. Zero passed. Average: 37 errors per site." (Source: NeuroEdge primary research, March 2026 [12])
- **Fix bottom text:**
  - CURRENT: "Most businesses have no idea their websites are shutting these people out."
  - PITCHDECK: "Most SMEs don't know their websites are inaccessible. They don't know it's a legal obligation. And they don't know what they're losing."
  - ACTION: Use PitchDeck text exactly

### S04_Solution.tsx — REFERENCE FLORIST + ADD GAP TEXT
- **Duration:** 750 frames (unchanged)
- **Remove:** "OUR SOLUTION" section label
- **Add:** CinematicText "They're not bad people. They just didn't know." before product intro
- **Fix URL:** "www.example-shop.co.uk" -> "www.bloomandpetal.co.uk"
- **MISSING DATA to add (from PitchDeck Slide 5):**
  - "The gap we fill:" section — "Existing tools either spit out developer jargon that SMEs can't understand, or cost £5,000+ for a professional consultancy audit. We sit in the middle — affordable, human-readable, business-framed."
- **Keep exact:** Both comparison cards match PitchDeck ✓

---

## Wave 3: Data Sync + Label Removal (S03, S05, S06, S07, S08, S09)

### S03_MarketAndLaw.tsx — ADD 2 MISSING STATS + FIX CARD TEXT
- **Duration:** 750 -> 600 frames
- **Remove:** "WHAT IT'S COSTING THEM" label
- **MISSING DATA to add (from PitchDeck Slide 3):**
  - "81%" — "of businesses are unaware of the value of the purple pound" (Source: House of Commons Women & Equalities Committee [5])
  - "86% of disabled consumers have paid more for a product on an accessible site rather than buying cheaper on an inaccessible one." (Source: Scope / Click-Away Pound [8])
- **Fix source for £274B:** Add "House of Commons Women & Equalities Committee" source
- **Fix legal card text to match PitchDeck Slide 4 EXACTLY:**
  - Equality Act 2010: "Section 20 imposes a duty to make 'reasonable adjustments' including providing information in accessible formats. Failure is discrimination. Applies to all service providers, public and private."
  - PSBAR 2018: "Public sector websites must meet WCAG 2.2 AA standards. GDS monitors compliance annually. Failure is a breach of the Equality Act, enforceable by the EHRC."
  - European Accessibility Act: "In force since June 2025 across EU. UK businesses selling into the EU must comply. Covers e-commerce, banking, transport ticketing, and more."

### S05_HowItWorks.tsx — FIX BOTTOM TEXT
- **Duration:** 600 -> 450 frames
- **Remove:** "HOW IT WORKS" section label
- **Fix bottom text to match PitchDeck Slide 6 EXACTLY:**
  - CURRENT: "Free tier shows the score + top 3 issues. Paid tier delivers the full PDF report."
  - PITCHDECK: "Free tier shows the score + top 3 issues on screen. Paid tier (from £29) delivers the full PDF report. Monitoring agent (£19/month) repeats this scan weekly and alerts on new issues."
  - ACTION: Use PitchDeck text exactly

### S06_CustomerAndPricing.tsx — ADD PURPOSE LABELS + GO-TO-MARKET + UNIT ECONOMICS
- **Duration:** 750 -> 600 frames
- **Remove:** "IDEAL CUSTOMER" section label
- **MISSING DATA to add (from PitchDeck Slides 8-9):**
  1. **Purpose labels on each pricing card:**
     - FREE Quick Score: "Purpose: Lead generation"
     - £29-49 Full Report: "Purpose: Core revenue"
     - £99 Report + Walkthrough: "Purpose: Premium, relationship"
     - £19/mo Monitoring Agent: "Purpose: Recurring revenue"
  2. **"How we get customers" section (from PitchDeck Slide 9):**
     - "Free scans at Liverpool networking events and business meetups"
     - "LinkedIn content: 'We scanned 30 Liverpool businesses — here's what we found'"
     - "Workshops for SMEs: 'Is your website losing disabled customers?'"
     - "Referral partnerships with local web agencies — they refer, we audit"
  3. **Unit economics (from PitchDeck Slide 9):**
     - "Each report costs under 50p in compute — 98% gross margin."
     - "100 monitoring subscribers = £1,900/month = £22,800 ARR"
     - "This is a software business, not a services business. It scales without us."
- **Keep exact:** Pricing card text matches ✓, ARR calculation matches ✓

### S07_Competition.tsx — REMOVE LABEL ONLY
- **Duration:** 450 frames (unchanged)
- **Remove:** "COMPETITIVE POSITIONING" section label
- **Data verified against PitchDeck Slide 10:** All competitor names, pricing, descriptions match ✓
- **Fix closing text to match PitchDeck:**
  - CURRENT: "Overlay tools don't fix root causes. We take the honest approach: audit and explain."
  - PITCHDECK: "Accessibility overlay tools (accessiBe, UserWay) are widely criticised by the disability community for not actually fixing underlying issues. We take the honest approach: audit and explain, not mask."
  - ACTION: Use PitchDeck text exactly

### S08_Team.tsx — FIX BIOS TO MATCH PITCHDECK
- **Duration:** 600 -> 450 frames
- **Remove:** "THE TEAM" section label
- **Fix Shashwati bio to match PitchDeck Slide 11 EXACTLY:**
  - CURRENT: "MSc Advanced Marketing, University of Liverpool. Background in ad optimisation, conversion testing, and disability-inclusive marketing. Designs the scoring methodology, report framework, and plain-English fix recommendations."
  - PITCHDECK: "MSc Advanced Marketing, University of Liverpool. Professional background in ad optimisation, conversion testing, and web page UX. Research focus on disability-inclusive marketing and experiential marketing. Designs the scoring methodology, report framework, and plain-English fix recommendations. Leads client relationships and outreach."
  - ACTION: Use PitchDeck text exactly
- **Fix Vedant bio to match PitchDeck Slide 11 EXACTLY:**
  - CURRENT: "MSc Computer Science, University of Liverpool. Former agency co-founder. Scored 92/100 on Accenture's AI consulting programme. Builds the scanning engine, AI pipeline, and product."
  - PITCHDECK: "MSc Computer Science, University of Liverpool. Former business strategist and digital marketing agency co-founder. Scored 92/100 on Accenture's AI consulting programme. Built a functional product (Discovery Simulator) in 12 hours. Builds the web application, scanning engine integration, AI interpretation pipeline, and PDF report generation."
  - ACTION: Use PitchDeck text exactly

### S09_RoadmapAndFunds.tsx — FIX BUDGET LABEL + ROADMAP DESCRIPTIONS
- **Duration:** 750 -> 600 frames
- **Remove:** "USE OF FUNDS" section label
- **Fix budget label:**
  - CURRENT: "Founder stipends"
  - PITCHDECK: "Founder milestone payments (MVP, 20 audits, first 10 customers)" = £1,500
  - ACTION: Use "Founder milestone payments" (can abbreviate the parenthetical for space but keep "milestone" not "stipends")
- **Verify all budget math sums to £5,000:**
  - £1,500 + £1,000 + £500 + £500 + £400 + £350 + £250 + £500 = £5,000 ✓
- **Fix roadmap descriptions to include key details from PitchDeck Slide 13:**
  - M1: "Finalise branding. Build MVP (scanner + AI + PDF). Deploy portal. Define scoring."
  - M2: "20 free audits for Liverpool SMEs. Refine AI prompts. Document 3+ case studies."
  - M3: "Launch freemium model. LinkedIn content campaign. University enterprise events."
  - M4: "Workshops for local business groups. Chamber of commerce outreach. Build monitoring agent."
  - M5: "Convert pilots to paid. Launch £19/mo monitoring. Agency partnerships. Submit blog + video to university."
  - M6: "100 paying customers, 30 monitoring subscribers (£6,840 monitoring ARR), 3 agency referral partnerships."
- **Fix revenue projections — BOTH must be present:**
  - £5,000+ = 6-month total revenue (reports + monitoring) — proves ROI on ask
  - £22,800 ARR = monitoring ARR at scale (100 subs x £19/mo x 12) — shows growth potential

---

## After All Scenes: Update Video.tsx

Update `<Series>` durations:
- S01: 600 -> 750
- S02: 600 (unchanged)
- S03: 750 -> 600
- S04: 750 (unchanged)
- S05: 600 -> 450
- S06: 750 -> 600
- S07: 450 (unchanged)
- S08: 600 -> 450
- S09: 750 -> 600
- S10: 600 (unchanged)
- **New total: 5,850 frames = 195s = 3:15**

---

## Financial Data Cross-Reference (MUST ALL MATCH)

| Figure | PitchDeck Location | Video Scene | Verified |
|--------|-------------------|-------------|----------|
| £274B purple pound | Slide 3 | S03 | ✓ |
| 81% unaware of purple pound | Slide 3 | S03 | MISSING — add |
| 86% paid more on accessible site | Slide 3 | S03 | MISSING — add |
| £29-49 Full Report | Slide 9 | S06 | ✓ |
| £99 Report + Walkthrough | Slide 9 | S06 | ✓ |
| £19/mo Monitoring Agent | Slide 9 | S06 | ✓ |
| 98% gross margin | Slide 9 | S06 | MISSING — add |
| £1,900/month at 100 subs | Slide 9 | S06 | MISSING — add |
| £22,800 ARR at 100 subs | Slide 9 | S06, S09 | ✓ |
| £6,840 monitoring ARR (30 subs) | Slide 13 | S09 | MISSING — add to M6 text |
| £5,000 total budget | Slide 15 | S09 | ✓ |
| £1,500 founder milestone payments | Slide 15 | S09 | Label wrong — fix |
| £1,000 marketing | Slide 15 | S09 | ✓ |
| £500 user research | Slide 15 | S09 | ✓ |
| £500 contingency | Slide 15 | S09 | ✓ |
| £400 Claude API | Slide 15 | S09 | ✓ |
| £350 workshops + pilot | Slide 15 | S09 | ✓ (consolidated) |
| £250 design & branding | Slide 15 | S09 | ✓ |
| £500 hosting+platform+legal+agent | Slide 15 | S09 | ✓ (consolidated) |
| £5,000 the ask | Slide 17 | S10 | MISSING — add |
| Revenue by month 5 | Slide 17 | S10 | MISSING — add |
| Self-sustaining month 6 | Slide 17 | S10 | MISSING — add |

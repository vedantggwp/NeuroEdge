# Positioning: NeuroEdge

## Positioning Statement

For UK SMEs with 5-50 employees who have a website but no in-house developer and no idea their site is legally required to be accessible, NeuroEdge is an AI-powered accessibility audit tool that scans any website and delivers a plain-English business impact report — not WCAG error codes. Unlike WAVE/axe (free developer tools), Siteimprove/Level Access (enterprise platforms at £5,000+/yr), and accessiBe/UserWay (controversial overlay widgets), we translate accessibility violations into language a non-technical business owner can understand, framed around revenue at risk and legal exposure, at a price point of £29-99.

## One-Liner (max 10 words)

Plain-English accessibility audits for UK small businesses.

## Elevator Pitch (~75 words / 30 seconds)

94.8% of websites fail accessibility standards, and it's a legal obligation under the Equality Act 2010. But SMEs can't understand developer error codes, and professional audits cost £5,000+. NeuroEdge scans any website using axe-core and Pa11y, then uses AI to translate the results into a plain-English business report — showing revenue at risk and priority fixes, not WCAG jargon. Reports start at £29. Ongoing monitoring is £19/month.

## Key Differentiators

1. Unlike WAVE/axe (free tools), we translate WCAG error codes into plain-English explanations with business impact — "Your contact form is invisible to screen readers. Estimated impact: 10-15% of potential leads lost" instead of "Missing aria-label on input element [WCAG 2.2 SC 1.3.1]."
2. Unlike Siteimprove/Level Access, we serve SMEs at £29-99 per report instead of £5,000+/yr — affordable, human-readable, business-framed.
3. Unlike accessiBe/UserWay, we audit and explain rather than mask problems with overlay widgets that are widely criticised by the disability community for not actually fixing underlying issues.
4. Unlike DIY/status quo, we surface legal risk (Equality Act 2010, PSBAR 2018, European Accessibility Act) and quantify revenue at risk from the £274 billion disabled household spending power that inaccessible sites are losing.

## Target Customer Profile

A UK SME owner or marketing manager at a local service business (restaurant, salon, professional services, trades, retail) with 5-50 employees. They have a website — typically built on WordPress or Squarespace — but didn't build it themselves and don't have an in-house developer. They don't know what WCAG stands for, don't know website accessibility is a legal requirement under the Equality Act 2010, and don't know they're losing disabled customers. They can afford £29-99 but not £5,000. They care about their customers and about legal risk. The trigger event is learning — often for the first time — that their website is broken for 24% of the UK population and that 7 in 10 disabled customers click away from difficult sites.

## Competitive Position

NeuroEdge fills the gap between free developer tools (WAVE/axe) that output unreadable WCAG codes and enterprise platforms (Siteimprove/Level Access) that cost £5,000+/yr — delivering affordable, plain-English accessibility reports for SMEs who've never heard of WCAG.

## Competitive Map

| | NeuroEdge | WAVE / axe (free tools) | Siteimprove / Level Access | accessiBe / UserWay | DIY / Status Quo |
|---|---|---|---|---|---|
| **Best for** | SMEs with 5-50 employees, no developer | Developers who can read WCAG codes | Enterprise companies with accessibility teams | Any website wanting a quick overlay fix | Businesses unaware of the problem |
| **Approach** | AI-powered scan + plain-English business impact report + monitoring agent | Browser extensions showing WCAG error codes | Full audit + remediation platform | Overlay widget injected onto site | Ignore the problem entirely |
| **Output** | Branded PDF with score, priority fixes, revenue at risk, plain-English explanations | WCAG error codes (e.g. "Missing aria-label on input element [WCAG 2.2 SC 1.3.1]") | Full audit + remediation guidance | Widget that attempts to auto-fix presentation | Nothing — site remains inaccessible |
| **Price** | £29-99 one-off + £19/mo monitoring | Free | £5,000+/yr | £40-80/mo | £0 (but losing £274B market) |
| **Readable by non-technical owner?** | Yes | No — technical jargon | Varies | N/A — doesn't produce a report | N/A |
| **Tradeoff** | Automated tools catch ~30-40% of issues (upfront about this); does not fix the site | Requires developer to interpret and act on results | Cost prohibitive for SMEs | Widely criticised by disability community; doesn't fix root causes | Legal risk under Equality Act 2010; losing disabled customers |
| **They win when** | The customer wants to understand what's wrong in business terms and can't afford an enterprise audit | The customer has a developer who can read WCAG codes | The customer is enterprise-scale with budget and an accessibility team | The customer wants the fastest possible "fix" without understanding the problem | The customer doesn't know accessibility is a legal requirement |

## Core 5 Questions -- Detail

### 1. WHO

**Primary:** UK SMEs with 5-50 employees — local service businesses (restaurants, salons, professional services, trades, retail). They have a website (often WordPress/Squarespace) but have never considered accessibility. They don't know it's a legal requirement. They don't have an in-house developer. They can afford £29-99, not £5,000.

**Secondary:** E-commerce SMEs losing disabled customers at checkout, especially those selling into the EU (now legally required to comply with the European Accessibility Act since June 2025).

**Tertiary:** Web agencies who build websites for clients but don't currently offer accessibility audits. NeuroEdge white-labels the report so they can upsell to their client base.

**Not our customer:** Enterprise companies (they use Siteimprove, Level Access). Developers who can read WCAG error codes themselves. Companies that already have an accessibility team.

**What they use today:** Nothing. Most don't know their website is inaccessible. 30/30 Liverpool SMEs scanned had accessibility failures — zero passed, averaging 37 errors per site.

### 2. WHAT

**The pain:** 94.8% of the top 1 million homepages have detectable WCAG accessibility failures (WebAIM Million, Feb 2025), averaging 51 distinct errors per homepage. 24% of UK people are now disabled — up from 16% in 2013. 7 in 10 disabled customers click away from websites they find difficult to use. 86% of disabled consumers have paid more for a product on an accessible site rather than buying cheaper on an inaccessible one.

**The trigger:** Learning that website accessibility is a legal obligation under the Equality Act 2010 (Section 20 — duty to make reasonable adjustments), PSBAR 2018 (WCAG 2.2 AA for public sector), and the European Accessibility Act (in force since June 2025 for EU trade). Oxford Academic research found virtually no public sector websites were fully compliant — the private sector is even further behind.

**The cost of doing nothing:** Missing out on the £274 billion annual spending power of disabled households in the UK. 81% of businesses are unaware of the value of the purple pound. Legal risk of discrimination claims under the Equality Act. 7 in 10 disabled customers leaving for competitors.

### 3. HOW

Five-step process: (1) User enters their website URL on the NeuroEdge portal. (2) axe-core + Pa11y run WCAG 2.2 checks on the page. (3) Claude API (Anthropic's language model) translates raw violations into plain-English explanations with business context. (4) Branded PDF report generated with accessibility score, priority fixes, and estimated revenue at risk. (5) Optional: 30-minute human video walkthrough of findings (premium tier at £99).

**Tech stack:** axe-core (open-source, MIT, powers Google Lighthouse and Microsoft Accessibility Insights), Pa11y (open-source, LGPL-3.0, used by BBC, Financial Times, GOV.UK), Claude API (AI interpretation layer), Lovable + React/Node.js (portal and frontend), automated PDF generation.

**Unit economics:** Each report costs under 50p in compute — 98% gross margin. 100 monitoring subscribers = £1,900/month = £22,800 ARR.

### 4. WHY

**Only we translate WCAG violations into plain-English business impact reports because** our methodology combines Shashwati's marketing and conversion expertise (MSc Advanced Marketing, professional background in ad optimisation, conversion testing, and web page UX) with Vedant's technical execution (MSc Computer Science, built a functional product in 12 hours, scored 92/100 on Accenture's AI consulting programme).

**The gap we fill:** Existing tools either spit out developer jargon that SMEs can't understand, or cost £5,000+ for a professional consultancy audit. NeuroEdge sits in the middle — affordable, human-readable, business-framed.

**What competitors can't replicate:** The dataset. After 1,000+ real accessibility scans mapped to business impact through Shashwati's scoring methodology, NeuroEdge will fine-tune a proprietary model. Cost per scan drops, accuracy rises. Already scanned 30 Liverpool SMEs — 1,098 errors across 10 industries. After 500 scans, the plan is to publish the UK SME Accessibility Index: benchmarks by industry and CMS.

### 5. SO WHAT

**The transformation:** A business owner who had no idea their website was inaccessible — and no idea it was a legal obligation — receives a plain-English report showing exactly what's wrong, why it matters, which fixes to prioritise, and how much revenue they're leaving on the table. They go from ignorance to actionable understanding in the time it takes to enter a URL.

**Measurable outcomes:**
- SMEs understand their accessibility posture for the first time
- Legal risk surfaced and quantified before enforcement action
- Revenue at risk estimated (share of £274B disabled spending power)
- Priority fixes ranked by business impact, not WCAG severity
- Ongoing monitoring catches regressions weekly via AI agent (£19/mo)
- At scale: 100 paying customers, 30 monitoring subscribers (£6,840 monitoring ARR), 3 agency referral partnerships by month 6

**Broader impact:** Every audit highlights barriers that, when fixed, give disabled people better access to goods and services they're currently excluded from. Not a social enterprise — a business that makes the web more accessible as a direct byproduct of its revenue model.

## Quick Positioning Test

- **Specific:** PASS -- Names UK SMEs with 5-50 employees, local service businesses, no in-house developer, never heard of WCAG. Not "businesses" generically.
- **Differentiated:** PASS -- "Plain-English business impact report" is something WAVE/axe, Siteimprove, and accessiBe cannot claim. The translation layer from WCAG codes to business language is the core differentiator.
- **Credible:** PASS -- Built on proven open-source tools (axe-core powers Google Lighthouse; Pa11y used by BBC and GOV.UK). Primary research: 30/30 Liverpool SMEs scanned had failures. Team combines marketing methodology (MSc Advanced Marketing) with technical execution (MSc Computer Science).
- **Meaningful:** PASS -- Addresses legal risk under the Equality Act 2010, potential loss of £274B market, and 7-in-10 disabled customer click-away rate. SMEs would pay £29-99 to understand and mitigate this.
- **Memorable:** PASS -- "We scan your website and tell you in plain English what's broken for disabled visitors, what it's costing you, and what to fix first." Passes the dinner party test.

## Self-Critique Notes

- **Automated tool limitation:** The pitch deck is upfront that automated tools catch ~30-40% of accessibility issues. The positioning should never overclaim full compliance certification. This honesty is a strength but must be framed carefully.
- **"Plain English" is the core claim:** If the AI-generated explanations aren't genuinely clear to a non-technical reader, the entire positioning collapses. Quality of the Claude API output is the single biggest execution risk.
- **Competitor moat is time-limited:** The tech stack (axe-core + Pa11y + LLM) is reproducible. The moat depends on accumulating 1,000+ scans to fine-tune a proprietary model. Until then, defensibility is weak.
- **ICP validation needed:** The 30 Liverpool SME scans proved the problem exists. Still unvalidated: whether these SMEs will pay £29-99 for a report once they see their score for free. Conversion from free scan to paid report is the critical funnel metric.
- **"Revenue at risk" estimates:** The pitch deck references "10-15% of potential leads lost" — the methodology for these estimates needs to be rigorous and defensible, not hand-wavy.
- **Web agency channel:** The white-label/referral play with web agencies is listed as tertiary but could be the highest-leverage growth channel. Worth testing early.
- **Geographic focus:** Starting in Liverpool City Region is smart for density and local credibility, but the positioning statement should work nationally from day one since the product is digital.

# NeuroEdge Pitch Video — Design Document

**Date:** 2026-03-07
**Competition:** Design Your Future Pitching Competition 2026, University of Liverpool
**Constraint:** Strict 6-minute limit (targeting ~3:35)
**Approach:** Remotion component-per-scene architecture (Approach A)

---

## Context

NeuroEdge is an AI-powered website accessibility audit tool for UK SMEs. The video pitch is the first filter — if shortlisted, founders deliver a live 3-minute elevator pitch + 5-min Q&A on March 19th.

Judges evaluate: How funding helps, what impact, who benefits. The video must be compelling enough to shortlist, not exhaustive.

## Architecture

### Tech Stack

- **Remotion** — React-based programmatic video framework
- **TypeScript** — all components
- **@remotion/google-fonts** — DM Sans, DM Serif Display, JetBrains Mono
- **AI TTS** (OpenAI TTS or ElevenLabs) — placeholder voiceover, swapped for real recordings later
- **Royalty-free audio** — ambient background music + 3-4 SFX (whoosh, tick, pulse)

### Composition Config

| Property | Value |
|----------|-------|
| Resolution | 1920x1080 (Full HD 16:9) |
| FPS | 30 |
| Total duration | ~215 seconds / 6,450 frames |

### Project Structure

```
NeuroEdge/video/
├── src/
│   ├── Root.tsx                    # Remotion root, registers composition
│   ├── Video.tsx                   # Main composition, sequences all scenes
│   ├── scenes/
│   │   ├── S01_ColdOpen.tsx
│   │   ├── S02_ProblemStats.tsx
│   │   ├── S03_MarketAndLaw.tsx
│   │   ├── S04_Solution.tsx
│   │   ├── S05_HowItWorks.tsx
│   │   ├── S06_CustomerAndPricing.tsx
│   │   ├── S07_Competition.tsx
│   │   ├── S08_Team.tsx
│   │   ├── S09_RoadmapAndFunds.tsx
│   │   └── S10_AskAndClose.tsx
│   ├── components/
│   │   ├── AnimatedText.tsx        # Kinetic typography (word/line stagger)
│   │   ├── CountUp.tsx             # Animated number counter
│   │   ├── StatBlock.tsx           # Stat card with counter + label
│   │   ├── Card.tsx                # Info card with slide-in
│   │   ├── FlowStep.tsx            # Process flow step with connector
│   │   ├── TimelineItem.tsx        # Roadmap timeline entry
│   │   ├── TeamMember.tsx          # Avatar + bio card
│   │   ├── GradientBackground.tsx  # Animated mesh gradient
│   │   ├── NoiseOverlay.tsx        # Subtle film grain
│   │   ├── ProgressBar.tsx         # Scene progress indicator
│   │   ├── SceneTransition.tsx     # Cross-fade/zoom transition wrapper
│   │   ├── DonutChart.tsx          # Self-drawing SVG donut
│   │   ├── BarChart.tsx            # Rising bar comparison
│   │   ├── BrowserMockup.tsx       # Fake browser chrome + content
│   │   ├── TextHighlight.tsx       # Animated underline/marker sweep
│   │   └── FloatingOrbs.tsx        # Background particle layer
│   ├── lib/
│   │   ├── theme.ts               # Colors, fonts, spacing constants
│   │   ├── animations.ts          # Shared spring configs & interpolation helpers
│   │   └── fonts.ts               # Font loading
│   └── assets/
│       ├── audio/
│       │   ├── bgm.mp3
│       │   ├── sfx/               # whoosh.mp3, tick.mp3, pulse.mp3
│       │   ├── shashwati/         # Voiceover clips per scene
│       │   └── vedant/            # Voiceover clips per scene
│       └── images/
│           ├── shashwati.jpeg
│           └── vedant.jpeg
├── package.json
├── remotion.config.ts
└── tsconfig.json
```

## Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `bg.dark` | `#0B1222` | Primary background |
| `bg.card` | `#131D33` | Card surfaces |
| `accent` | `#00C9A7` | Primary accent (teal) |
| `accentDim` | `#0A7B66` | Accent muted |
| `warning` | `#FF6B6B` | Problem/danger callouts |
| `gold` | `#FFD93D` | Revenue/money highlights |
| `text.primary` | `#E8ECF4` | Headlines |
| `text.secondary` | `#A8B2C4` | Body text |
| `text.muted` | `#7B8AA0` | Source labels |

### Typography

- **Headlines:** DM Serif Display
- **Body:** DM Sans (400, 500, 700)
- **Data/Labels:** JetBrains Mono (400, 500)

### Animation Language

- **Enter:** Fade in + translateY(20px) with 0.1s stagger between siblings
- **Stats:** Count up from 0 over ~1s with spring easing
- **Scene transitions:** 15-frame cross-fade, 3% scale-down on exit / scale-up on enter
- **Background:** Mesh gradient with slow drift
- **Highlights:** Animated underline sweep synced to voiceover timing
- **Sound:** Whoosh on transitions, tick on stat landing, soft pulse on highlights

## Scene Breakdown

### Scene 1: Cold Open (20s / 600 frames)
**Speaker:** Shashwati

**Script:**
> "Imagine you run a small business. You've got a website. Customers visit every day. But what you don't know... is that one in four of them can't actually use it."

**Visuals:**
- Black screen -> slow fade into gradient mesh with floating orbs
- Kinetic typography: key phrases appear as spoken
- "can't actually use it" lands in large warning red with subtle shake
- Text highlight sweeps under "one in four"
- No cards, no stats — pure emotional hook

---

### Scene 2: Problem Stats (20s / 600 frames)
**Speaker:** Vedant

**Script:**
> "94.8% of the top million websites have accessibility failures. That's 51 errors per homepage. And in the UK, 24% of the population — 16 million people — are now disabled. Most businesses have no idea their websites are shutting these people out."

**Visuals:**
- Three StatBlock components animate in with stagger
- DonutChart fills to 94.8% in accent teal
- Counters roll up to 51 and 24%
- Sources as small monospace labels (WebAIM, DWP)
- Floating orbs continue drifting

---

### Scene 3: Market & Legal Pressure (25s / 750 frames)
**Speaker:** Shashwati

**Script:**
> "Those 16 million people? They control 274 billion pounds in annual spending. 7 in 10 disabled customers click away from websites they can't use. And here's what most business owners don't realise — website accessibility isn't optional. It's a legal obligation under the Equality Act 2010. The European Accessibility Act is now in force. This isn't coming. It's here."

**Visuals:**
- 274B counter rolls up in gold, large, centre-screen
- "7 in 10 click away" animated stat card
- Three law cards slide in: Equality Act, PSBAR, EAA with icons
- Text highlight on "legal obligation"
- Whoosh on card transitions

---

### Scene 4: The Solution (25s / 750 frames)
**Speaker:** Vedant

**Script:**
> "That's where NeuroEdge comes in. We're an AI-powered tool that scans any website for accessibility issues — and translates the results into plain English. Not WCAG error codes. Not developer jargon. A business impact report that tells you: what's broken, who's affected, and how much revenue you're losing."

**Visuals:**
- NeuroEdge name animates in large, centred
- BrowserMockup: simulated scan running (URL -> loading -> results)
- Split comparison cards: raw WCAG error (red) vs plain English (teal)
- Text highlight on "plain English"
- Tick sound when mockup scan completes

---

### Scene 5: How It Works (20s / 600 frames)
**Speaker:** Shashwati

**Script:**
> "It's five steps. Enter a URL. We run automated WCAG 2.2 scans. AI interprets the results. You get a branded PDF with a score, priority fixes, and estimated revenue at risk. And for premium clients — a personal video walkthrough of findings."

**Visuals:**
- Five FlowStep components animate left-to-right with connecting arrows drawing
- Each step lights up (teal glow pulse) as mentioned
- Step icons: link -> search -> robot -> document -> video
- Smooth horizontal pan across the flow
- Whoosh on each step connection

---

### Scene 6: Customer & Pricing (25s / 750 frames)
**Speaker:** Vedant

**Script:**
> "We built this for UK SMEs with 5 to 50 employees — businesses that have a website but have never heard of WCAG. Our free tier gives them an instant score and top 3 issues. The full report is 29 to 49 pounds. A video walkthrough, 99 pounds. And our monitoring agent scans weekly for 19 pounds a month — that's recurring revenue. 100 subscribers gets us to 22,800 pounds annual recurring revenue."

**Visuals:**
- Customer profile card with animated checkmark list
- Four pricing tier cards animate with stagger (Free, 29-49, 99, 19/mo)
- 19/mo card has accent border glow (recurring revenue emphasis)
- 22,800 ARR counter rolls up in gold
- Tick sound on ARR landing

---

### Scene 7: Competitive Positioning (15s / 450 frames)
**Speaker:** Shashwati

**Script:**
> "We're not competing with enterprise tools. Free tools like WAVE give developers error codes they already understand. Enterprise platforms cost 5,000 pounds a year. Overlay widgets are controversial and don't fix the actual problems. We sit in the gap — affordable, readable, honest."

**Visuals:**
- BarChart: four horizontal bars comparing solutions on price and readability
- Competitors fade to muted grey, NeuroEdge row highlights in accent teal
- Readability badge pulses
- Clean, confident, no clutter

---

### Scene 8: The Team (20s / 600 frames)
**Speaker:** Both (Shashwati first, then Vedant)

**Script:**
> **Shashwati:** "I'm Shashwati — MSc Advanced Marketing. My background is in ad optimisation, conversion testing, and disability-inclusive marketing. I design the methodology and lead client relationships."
>
> **Vedant:** "I'm Vedant — MSc Computer Science. Former agency co-founder. I build the scanning engine, AI pipeline, and the product itself."

**Visuals:**
- TeamMember cards animate in one at a time
- Real photos with circular crop and teal border glow
- Role titles in accent colour
- Key credentials as animated tags
- Subtle gradient shift when switching speakers

---

### Scene 9: Roadmap & Use of Funds (25s / 750 frames)
**Speaker:** Shashwati

**Script:**
> "We're asking for 5,000 pounds — and every pound is accounted for. 500 goes to user research with disabled testers. 1,000 to marketing and outreach. 400 to AI infrastructure. The rest covers design, legal setup, workshops, and founder stipends. Our 6-month roadmap: April we build the MVP. May we pilot with 20 Liverpool SMEs. June we launch publicly. By September — 100 paying customers, 30 monitoring subscribers, and 6,840 pounds in monitoring ARR. Over 5,000 pounds recovered within 6 months."

**Visuals:**
- Budget table animates row-by-row, amounts counter up
- Total row lands with emphasis (border flash, tick sound)
- Timeline switches in, TimelineItem components stagger vertically M1-M6
- Each month lights up as mentioned
- September target stats pulse in gold

---

### Scene 10: The Ask & Close (20s / 600 frames)
**Speaker:** Both

**Script:**
> **Vedant:** "NeuroEdge makes the web more accessible — not as charity, but as a direct result of its business model. Every audit we sell is a barrier identified, a customer unlocked, and a legal risk reduced."
>
> **Shashwati:** "5,000 pounds to build, pilot, and launch. We'll be generating revenue by month five. This is NeuroEdge."

**Visuals:**
- Three impact cards fade in: Disabled consumers, Small businesses, The university
- Cards dissolve into final frame
- "NeuroEdge" large DM Serif Display, centred
- Tagline: "AI-powered accessibility audits for UK SMEs"
- Founders' names + University of Liverpool below
- Floating orbs slow to near-still, background dims
- 2 seconds of held logo with silence

## Audio Architecture

| Layer | Source | Notes |
|-------|--------|-------|
| Background music | Royalty-free ambient/electronic | Low volume, no vocals, subtle build, drops for emotional moments |
| Voiceover | AI TTS placeholder -> swap for real recordings | One audio file per scene per speaker |
| Sound effects | 3-4 SFX: whoosh, tick, soft pulse | Reused throughout for cohesion |

Background music spans entire composition. Volume ducks during speech via Remotion's `<Audio>` volume interpolation.

## Rendering

- Render via `npx remotion render` to MP4 (H.264)
- Output under 2GB (WeTransfer limit per competition rules)
- Final file emailed to startup@liverpool.ac.uk

## Voiceover Workflow

1. Generate AI TTS for all 10 scenes (placeholder)
2. Preview full video with AI voices
3. Record real voiceover (Shashwati + Vedant) following the script + timings
4. Drop real audio files into `assets/audio/`, re-render

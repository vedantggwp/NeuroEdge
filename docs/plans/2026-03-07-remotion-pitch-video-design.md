# NeuroEdge Pitch Video v2 — Design Document

**Date:** 2026-03-07
**Version:** v2 (storytelling rewrite)
**Competition:** Design Your Future Pitching Competition 2026, University of Liverpool
**Constraint:** Strict 6-minute limit (targeting ~3:15)
**Approach:** Remotion component-per-scene architecture
**Previous version:** `2026-03-07-remotion-pitch-video-design-v1.md`

---

## Narrative Concept

**Structure:** Bookend storytelling. A fictional but vivid persona — Sarah — opens and closes the video. The middle sections are a direct business pitch delivered by the founders. Sarah's story provides emotional stakes; the pitch provides credibility.

**Persona:** Sarah, 34, partially sighted, lives in Liverpool. She uses a screen reader. She wants to order birthday flowers for her mum from a local florist's website ("Bloom & Petal"). The checkout button has no accessible label. Her screen reader can't find it. She gives up.

**Resolution:** In the final scene, the florist runs a NeuroEdge audit, fixes 23 issues. Sarah visits again. This time, the flowers arrive.

**Why this works for judges:** The competition evaluates impact, funding use, and who benefits. Sarah makes "who benefits" visceral and memorable. The bookend gives the pitch an emotional arc that a slide-deck format cannot.

---

## Speaking Split

**Shashwati Bhosale** (Lead Founder — ~60%):
- S01: Sarah's morning (story opener)
- S02: Sarah isn't alone (bridges story to stats)
- S03: The money & the law (market + legal urgency)
- S06: Who we serve & what it costs (customer + pricing)
- S09: The plan & the ask (lead founder makes the ask)
- S10: The flowers arrive (story resolution + close)

**Vedant Gaikwad** (Co-founder — ~40%):
- S04: Enter NeuroEdge (product introduction)
- S05: How it works (technical process)
- S07: Where we sit (competitive positioning)

**Both:**
- S08: The team (each introduces themselves)

---

## Composition Config

| Property | Value |
|----------|-------|
| Resolution | 1920x1080 (Full HD 16:9) |
| FPS | 30 |
| Target duration | ~195 seconds / ~5,850 frames |

---

## Design System

### Colors (unchanged from v1)

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

### Typography (unchanged)

- **Headlines:** DM Serif Display
- **Body:** DM Sans (400, 500, 700)
- **Data/Labels:** JetBrains Mono (400, 500)

### Animation Language (evolved from v1)

- **Story scenes (S01, S10):** Slower reveals. CinematicText — line-at-a-time with blur-fade. No word-stagger. Deliberate pacing.
- **Data scenes (S02-S09):** Word-stagger AnimatedText (existing). Stats count up. Cards slide in.
- **Transitions:** Varied per scene — not the same 15-frame fade everywhere. Options: fade, blur-dissolve, wipe-up, zoom-pull.
- **Background:** Mesh gradient + floating orbs throughout (unchanged).
- **Sound:** Volume-ducked background music. 3 SFX: UI click (S01 failure), tick (stat landings), chime (S10 score change).

### Accessibility of the video itself

The video must practice what NeuroEdge preaches:
- All text meets WCAG AA contrast ratio (4.5:1 for body, 3:1 for large text) against the dark background
- Minimum text size: 14px body, 18px for key information (at 1080p)
- No text appears for less than 3 seconds (readable pace)
- No flashing content above 3 flashes per second
- Color is never the sole indicator of meaning (always paired with shape, text, or position)
- Sufficient spacing between text elements — no cramped layouts

---

## Component Architecture

### Existing components (keep as-is)

| Component | Used in |
|-----------|---------|
| `GradientBackground` | All scenes |
| `FloatingOrbs` | All scenes |
| `NoiseOverlay` | All scenes |
| `AnimatedText` | S02-S09 |
| `TextHighlight` | S03, S04 |
| `CountUp` | S03, S06 |
| `StatBlock` | S02, S03 |
| `DonutChart` | S02 |
| `Card` | S03, S06 |
| `FlowStep` | S05 |
| `BarChart` | S07 |
| `TeamMember` | S08 |
| `TimelineItem` | S09 |
| `BrowserMockup` | S04 |

### New components to build

| Component | Purpose | Used in |
|-----------|---------|---------|
| `CinematicText` | Single-line dramatic text reveals with blur-fade-in. Slower, more filmic than AnimatedText. Accepts `lines: string[]` and reveals them sequentially. | S01, S10 |
| `FloristWebsite` | Mockup of "Bloom & Petal" florist website interior. Warm colors (cream, sage green, blush pink). Product grid with flower images (CSS illustrations — colored circles/shapes, not real photos). Checkout button. | S01, S04, S10 |
| `ScreenReaderCursor` | Animated focus ring (blue/teal outline) that moves between page elements. In S01 it stutters and fails at the checkout. In S10 it flows smoothly through. Props: `elements: {x, y, w, h, delay}[]`, `failAtIndex?: number`. | S01, S10 |
| `ScoreTransition` | Animated score badge that morphs from one value to another (34 -> 91) with color shift (warning -> accent). | S10 |

### Modified components

| Component | Change |
|-----------|--------|
| `SceneTransition` | Add `variant` prop: `"fade"` (default, existing), `"blur-dissolve"`, `"wipe-up"`, `"zoom-pull"`. Each scene specifies its transition type. |
| `BrowserMockup` | Add `variant` prop: `"dark"` (existing NeuroEdge scan UI) and `"light"` (for embedding FloristWebsite in a browser chrome with light theme). |

---

## Scene Breakdown

### Scene 1: Sarah's Morning (25s / 750 frames)

**Speaker:** Shashwati
**Transition in:** Fade from black (slow, 30 frames)
**Transition out:** Blur-dissolve

**Script:**
> "This is Sarah. She's 34, she lives in Liverpool, and she's partially sighted. This morning, she wants to order birthday flowers for her mum. She finds a local florist online — Bloom and Petal. Beautiful website. But when her screen reader hits the checkout button... nothing happens. No label. No focus. The page just stops. Sarah tries three more times. Then she closes the tab."

**Visual sequence:**
1. Frames 0-90: Dark screen. CinematicText reveals: "This is Sarah." then "She's 34. She lives in Liverpool." then "She's partially sighted." — one line at a time, gentle blur-fade.
2. Frames 90-180: FloristWebsite appears inside a light BrowserMockup. Warm, inviting. ScreenReaderCursor begins moving through elements — navigation, product grid. Smooth, confident.
3. Frames 180-420: Cursor reaches the checkout button area. Stutters. Focus ring flashes red twice. No label found. Cursor jumps erratically. Voiceover: "nothing happens."
4. Frames 420-600: The BrowserMockup fades, as if the tab is closing. Screen dims.
5. Frames 600-750: Brief pause on dark screen. Emotional beat before transition.

**Key visual details:**
- The FloristWebsite should feel warm and real — cream background, sage green accents, blush pink flowers. It should look like a *nice* website. The point is that even nice-looking sites can be inaccessible.
- The ScreenReaderCursor should be a visible blue focus ring that the audience can follow. When it fails, the ring turns red/warning and stutters.
- No data visualizations. No cards. No stats. Pure story.

---

### Scene 2: Sarah Isn't Alone (20s / 600 frames)

**Speaker:** Shashwati
**Transition in:** Wipe-up (from Sarah's dark screen to data view)
**Transition out:** Fade

**Script:**
> "Sarah isn't alone. 94.8% of the top million websites have accessibility failures. That's 51 errors per homepage. And in the UK, 24% of the population — 16 million people — are now disabled. Most businesses have no idea their websites are shutting them out."

**Visual sequence:**
1. Frames 0-60: CinematicText: "Sarah isn't alone." — large, centred. Bridges the story to data.
2. Frames 60-450: Transition into data layout. DonutChart fills to 94.8%. Three StatBlocks animate in with stagger: 94.8%, 51 errors, 24%. Sources in monospace.
3. Frames 450-600: Bottom text fades in: "Most businesses have no idea..."

**Changes from v1:** Opening line bridges from Sarah's story. Removes the monospace "THE PROBLEM" section label. Otherwise same data, same components.

---

### Scene 3: The Money & The Law (20s / 600 frames)

**Speaker:** Shashwati
**Transition in:** Fade
**Transition out:** Zoom-pull (pulls back as if zooming out, then into S04)

**Script:**
> "Those 16 million people control 274 billion pounds a year in spending. 7 in 10 of them click away from sites they can't use. And here's what most business owners don't realise — this isn't optional. The Equality Act 2010 makes it a legal obligation. The European Accessibility Act is now in force. This isn't coming. It's here."

**Visual sequence:**
- Phase 1 (frames 0-280): 274B counter in gold. "7 in 10 click away" stat.
- Phase 2 (frames 280-600): "It's not optional — it's the law." Three law cards: Equality Act, PSBAR, EAA. "This isn't coming. It's here."

**Changes from v1:** Tightened from 750 to 600 frames (was too slow). Removed "WHAT IT'S COSTING THEM" monospace label. Now Shashwati delivers this (was Shashwati in v1 too — no change in speaker).

---

### Scene 4: Enter NeuroEdge (25s / 750 frames)

**Speaker:** Vedant
**Transition in:** Zoom-pull (continues from S03's exit)
**Transition out:** Fade

**Script:**
> "That florist had no idea their checkout was broken. They're not bad people — they just didn't know. That's where NeuroEdge comes in. We scan any website for accessibility issues and translate the results into plain English. Not error codes. Not developer jargon. A report that says: your checkout button is invisible to screen readers. Disabled visitors can't complete purchases. Here's how to fix it."

**Visual sequence:**
1. Frames 0-90: CinematicText: "They're not bad people. They just didn't know." — empathetic bridge.
2. Frames 90-180: NeuroEdge name animates in. Accent teal.
3. Frames 180-450: BrowserMockup (dark variant) shows the florist's URL being scanned. Typing animation: "www.bloomandpetal.co.uk". Scan runs. Results appear.
4. Frames 450-750: Two-column comparison. Left card (warning border): raw WCAG error code. Right card (accent border): "Your checkout button is invisible to screen readers. Disabled visitors can't complete purchases."

**Changes from v1:** References Sarah's florist specifically. Opens with an empathetic line, not a section label. The before/after comparison is tied to Sarah's actual problem.

---

### Scene 5: How It Works (15s / 450 frames)

**Speaker:** Vedant
**Transition in:** Fade
**Transition out:** Fade

**Script:**
> "Five steps. Enter a URL. We run WCAG 2.2 scans. AI interprets the results. You get a branded report with a score, priority fixes, and revenue at risk. For premium clients — a personal walkthrough."

**Visual sequence:**
- Same FlowStep horizontal process as v1
- Tightened from 600 to 450 frames
- Removed monospace "HOW IT WORKS" label — the flow itself is self-explanatory
- Each step lights up as mentioned

**Changes from v1:** Shorter. No section label. Same components.

---

### Scene 6: Who We Serve & What It Costs (20s / 600 frames)

**Speaker:** Shashwati
**Transition in:** Fade
**Transition out:** Fade

**Script:**
> "We built this for UK SMEs — 5 to 50 employees, businesses that have never heard of WCAG. A free scan gives them their score and top 3 issues. Full report: 29 to 49 pounds. Video walkthrough: 99 pounds. And our monitoring agent checks weekly for 19 pounds a month — recurring revenue. 100 subscribers gets us to 22,800 pounds ARR."

**Visual sequence:**
- Same pricing cards grid (4 cards) + ARR counter
- Removed "IDEAL CUSTOMER" monospace label
- Tightened from 750 to 600 frames

**Changes from v1:** Now Shashwati delivers this (was Vedant). Tighter timing.

---

### Scene 7: Where We Sit (15s / 450 frames)

**Speaker:** Vedant
**Transition in:** Fade
**Transition out:** Fade

**Script:**
> "We're not competing with enterprise tools that cost thousands. We're not another overlay that hides problems without fixing them. We sit in the gap — affordable, honest, readable. Audit and explain."

**Visual sequence:**
- Same BarChart comparison as v1
- Removed "COMPETITIVE POSITIONING" label
- Removed the closing paragraph (now folded into voiceover)
- Same 450 frame duration

**Changes from v1:** Tighter script. No section label. Same visuals.

---

### Scene 8: The Team (15s / 450 frames)

**Speaker:** Both
**Transition in:** Fade
**Transition out:** Fade

**Script:**
> **Shashwati:** "I'm Shashwati — MSc Advanced Marketing. I design the audit methodology, the reports, and the go-to-market."
>
> **Vedant:** "I'm Vedant — MSc Computer Science, former agency co-founder. I build the scanning engine, the AI pipeline, and the product."

**Visual sequence:**
- Same TeamMember cards, side by side
- Tighter bios (shorter text than v1)
- Removed "THE TEAM" label
- Tightened from 600 to 450 frames

**Changes from v1:** Shorter bios. Tighter timing. No section label.

---

### Scene 9: The Plan & The Ask (20s / 600 frames)

**Speaker:** Shashwati
**Transition in:** Fade
**Transition out:** Blur-dissolve (into the emotional close)

**Script:**
> "We're asking for 5,000 pounds. 500 for user research with disabled testers. 1,000 for marketing. 400 for AI infrastructure. The rest for design, legal, and workshops. April: build the MVP. May: pilot with 20 Liverpool SMEs. By September — 100 customers and 22,800 pounds in annual revenue."

**Visual sequence:**
- Phase 1 (frames 0-280): Budget table animates row by row. Total row lands with emphasis.
- Phase 2 (frames 280-600): Timeline M1-M6. September pulses in gold. ARR counter.

**Changes from v1:** Now Shashwati delivers this (was Shashwati in v1 too). Tightened slightly. Same components.

---

### Scene 10: The Flowers Arrive (20s / 600 frames)

**Speaker:** Shashwati
**Transition in:** Blur-dissolve (from S09)
**Transition out:** Slow fade to black (30 frames)

**Script:**
> "Three weeks later, the florist at Bloom and Petal runs a NeuroEdge audit. Scores 34 out of 100. Fixes 23 issues — including that checkout button. Sarah visits again. This time, the flowers arrive on her mum's birthday. Every audit we sell is a barrier removed, a customer unlocked, and a legal risk reduced. This is NeuroEdge."

**Visual sequence:**
1. Frames 0-90: FloristWebsite reappears in light BrowserMockup. ScreenReaderCursor moves through — this time smoothly, confidently. No stutter. Focus rings are green/accent.
2. Frames 90-180: ScoreTransition animates: 34 (warning red) morphs to 91 (accent teal). Chime sound effect.
3. Frames 180-300: Brief warm moment — CinematicText: "The flowers arrive." Simple. No over-design.
4. Frames 300-500: "NeuroEdge" in large DM Serif Display, centred. Tagline below: "AI-powered accessibility audits for UK SMEs". Founders' names. "University of Liverpool - Design Your Future 2026".
5. Frames 500-600: Hold on logo. Music resolves. Fade to black.

**Key visual details:**
- The contrast between S01's failing cursor and S10's smooth cursor is the emotional payoff. Same website, same cursor component — different outcome.
- The score transition (34->91) should feel satisfying. Spring animation with slight overshoot.
- "The flowers arrive." is the simplest, most human line in the entire video. Don't over-animate it.
- Final logo hold: floating orbs slow to near-still, gradient dims, music piano resolves to a final chord.

---

## Audio Architecture

### Background Music

**Style:** Cinematic minimal. Soft piano opening, ambient pads build through middle sections, piano resolves at close.
**Source:** Royalty-free. One continuous track with internal dynamics.
**Reference mood:** Nils Frahm, Olafur Arnalds — warm, sparse, sincere. Not corporate. Not techy.

**Volume behaviour across scenes:**

| Scene | Music level | Behaviour |
|-------|------------|-----------|
| S01: Sarah's morning | 40% | Piano. Emotional space. Ducks further during voiceover. |
| S02: Stats | 25% | Pads begin. Low under data. |
| S03: Money & law | 30% | Subtle tension build. |
| S04: Solution | 30% | Confident. Steady. |
| S05: How it works | 25% | Unobtrusive. |
| S06: Pricing | 25% | Unobtrusive. |
| S07: Competition | 30% | Slight lift. |
| S08: Team | 35% | Warmth. Personal. |
| S09: Plan & ask | 35% | Building momentum. |
| S10: Flowers arrive | 50% -> 70% | Piano returns. Swells for close. Loudest at final hold. |

Music volume is controlled via Remotion `<Audio>` volume interpolation per frame.

### Sound Effects

Three SFX, reused sparingly:

| SFX | File | Used in |
|-----|------|---------|
| UI click (soft failure) | `sfx/ui-fail.mp3` | S01: when screen reader cursor fails |
| Tick (stat landing) | `sfx/tick.mp3` | S02, S03, S06: when counters/stats land |
| Chime (positive) | `sfx/chime.mp3` | S10: when score transitions 34->91 |

### Voiceover

**Engine:** ElevenLabs API (preset voices, not cloned)
**Voice selection:**
- Shashwati's sections: Female voice, British accent, warm and clear. Natural pace, not rushed.
- Vedant's sections: Male voice, British accent, confident and measured.

**Delivery style:** Conversational, not presentational. As if explaining to a friend, not reading to an audience. Slight pauses at emotional beats (S01: "nothing happens", S10: "the flowers arrive").

**File structure:**
```
video/src/assets/audio/
  bgm.mp3                    # Background music (full track)
  sfx/
    ui-fail.mp3
    tick.mp3
    chime.mp3
  voiceover/
    s01-sarahs-morning.mp3
    s02-sarah-isnt-alone.mp3
    s03-money-and-law.mp3
    s04-enter-neuroedge.mp3
    s05-how-it-works.mp3
    s06-pricing.mp3
    s07-competition.mp3
    s08-team-shashwati.mp3
    s08-team-vedant.mp3
    s09-plan-and-ask.mp3
    s10-flowers-arrive.mp3
```

Each voiceover file is generated independently. Scene durations are adjusted after voiceover generation to match actual audio length (voiceover drives timing, not the other way around).

---

## Implementation Phases

### Phase 1: Script & Design (this document)
- Write v2 design doc
- Back up v1 design doc
- Commit

### Phase 2: New Components (parallelisable)
Build new components needed for v2. Each is independent.

**Subagent 2A: CinematicText**
- New component: `video/src/components/CinematicText.tsx`
- Props: `lines: string[]`, `delayBetweenLines: number`, `startDelay: number`, `fontSize: number`, `color: string`
- Each line fades in with a subtle blur-to-sharp transition (CSS filter blur 4px -> 0px over 20 frames)
- Previous lines stay visible but dim slightly when next line appears

**Subagent 2B: FloristWebsite**
- New component: `video/src/components/FloristWebsite.tsx`
- A warm, light-themed mockup of a florist website interior
- Color palette: cream (#FFF8F0), sage green (#7A9E7E), blush pink (#F4C2C2), warm brown (#8B7355)
- Elements: navigation bar ("Home | Shop | About | Contact"), product grid (3 flower cards with colored circle "images" and names), checkout button area
- Props: `showCheckout: boolean` (whether the checkout area is visible)
- Must look like a real, attractive small business website — not a wireframe

**Subagent 2C: ScreenReaderCursor**
- New component: `video/src/components/ScreenReaderCursor.tsx`
- An animated focus ring (3px outline) that moves between positioned elements
- Props: `steps: {x, y, width, height, delay, duration}[]`, `failAtIndex?: number`, `successMode?: boolean`
- Normal mode: blue (#4A90D9) focus ring moves smoothly between steps with spring animation
- Fail mode: at `failAtIndex`, ring turns warning red, stutters (oscillates position), flashes twice, then fades
- Success mode: ring is accent teal, moves smoothly through all steps without failure
- Ring should have a subtle glow/shadow

**Subagent 2D: ScoreTransition + SceneTransition upgrade**
- New component: `video/src/components/ScoreTransition.tsx`
  - Animated score badge: shows a number morphing from one value to another
  - Props: `from: number`, `to: number`, `delay: number`, `duration: number`
  - Color interpolates from warning to accent as value increases
  - Spring animation with slight overshoot
  - Format: "XX / 100" with the number being the animated part
- Modify existing: `video/src/components/SceneTransition.tsx`
  - Add `variant` prop: `"fade"` | `"blur-dissolve"` | `"wipe-up"` | `"zoom-pull"`
  - `fade`: existing behaviour (default)
  - `blur-dissolve`: opacity fade + CSS filter blur (0 -> 4px on exit, 4px -> 0 on enter)
  - `wipe-up`: clip-path rectangle that slides up to reveal
  - `zoom-pull`: scale from 1.0 to 0.9 + opacity on exit, 1.1 to 1.0 on enter

### Phase 3: Scene Rewrites (parallelisable, after Phase 2)
Rewrite all 10 scenes. Each is independent once components exist.

**Wave 1 (complete rewrites — do first):**
- Subagent 3A: S01_ColdOpen.tsx (complete rewrite — Sarah's morning)
- Subagent 3B: S10_AskAndClose.tsx (complete rewrite — flowers arrive)

**Wave 2 (significant rework):**
- Subagent 3C: S02_ProblemStats.tsx (add "Sarah isn't alone" bridge, remove section label)
- Subagent 3D: S04_Solution.tsx (reference florist, empathetic bridge, scan bloomandpetal.co.uk)

**Wave 3 (light adaptation — can run in parallel):**
- Subagent 3E: S03_MarketAndLaw.tsx (tighten to 600f, remove label)
- Subagent 3F: S05_HowItWorks.tsx (tighten to 450f, remove label)
- Subagent 3G: S06_CustomerAndPricing.tsx (tighten to 600f, remove label)
- Subagent 3H: S07_Competition.tsx (remove label, tighten script)
- Subagent 3I: S08_Team.tsx (tighten to 450f, shorter bios, remove label)
- Subagent 3J: S09_RoadmapAndFunds.tsx (tighten to 600f, remove label, transition variant)

**After all scenes:** Update `Video.tsx` with new durations and scene order.

### Phase 4: Voiceover Generation (after Phase 1, parallel with Phase 2-3)
Generate ElevenLabs voiceover for each scene.

- Select appropriate preset voices (one female British, one male British)
- Generate 11 audio files (S08 has two — one per speaker)
- Save to `video/src/assets/audio/voiceover/`
- Measure actual durations of each file
- Create a timing manifest: `video/src/lib/voiceover-timing.ts` with frame offsets

### Phase 5: Audio Integration (after Phase 3 + 4)
Wire all audio into the video.

- Source royalty-free background music track (cinematic minimal piano/ambient)
- Source or generate 3 SFX files (ui-fail, tick, chime)
- Add `<Audio>` elements to Video.tsx for BGM with volume interpolation
- Add `<Audio>` elements per scene for voiceover files
- Add `<Audio>` elements for SFX at specific frame offsets
- Adjust scene durations to match voiceover lengths (voiceover drives timing)

### Phase 6: Polish & Render (after Phase 5)
Final quality pass.

- Visual QA: render stills at key frames across all 10 scenes
- Contrast check: verify all text meets WCAG AA against backgrounds
- Timing check: ensure no text appears for less than 3 seconds
- Audio sync: verify voiceover aligns with visual reveals
- Full preview in Remotion Studio
- Final render: `npx remotion render NeuroEdgePitch out/neuroedge-pitch.mp4`
- Verify output < 2GB (WeTransfer limit)

---

## Rendering

- Render via `npx remotion render` to MP4 (H.264)
- Output under 2GB (WeTransfer limit per competition rules)
- Final file emailed to startup@liverpool.ac.uk
- Deadline: March 8, 2026 at 23:55

# Codebase Structure

**Analysis Date:** 2026-03-07

## Directory Layout

```
NeuroEdge/
├── video/                    # Remotion pitch video project (primary codebase)
│   ├── src/
│   │   ├── index.ts          # Remotion entry point (registerRoot)
│   │   ├── Root.tsx           # Composition definition (fps, resolution, duration)
│   │   ├── Video.tsx          # Scene orchestration (Series of 10 sequences)
│   │   ├── scenes/            # Individual pitch video scenes (S01-S10)
│   │   ├── components/        # Reusable animated UI components
│   │   ├── lib/               # Design tokens and animation utilities
│   │   └── assets/            # Media assets (images, audio)
│   ├── public/                # Static files served by Remotion (team photos)
│   ├── out/                   # Rendered video output (git-ignored)
│   ├── node_modules/          # Dependencies (git-ignored)
│   ├── package.json           # Project manifest and scripts
│   └── tsconfig.json          # TypeScript configuration
├── PitchDeck/
│   └── index.html             # Standalone HTML pitch deck
├── docs/
│   └── plans/                 # Design and implementation planning documents
├── .claude/
│   └── settings.local.json    # Claude Code local settings
├── .planning/
│   └── codebase/              # Codebase analysis documents
├── DYF Pitching Competition Application 2026.docx  # Competition application
└── shashwati.jpeg             # Team member photo
```

## Directory Purposes

**`video/src/scenes/`:**
- Purpose: Contains all 10 pitch video scenes, each a self-contained visual narrative
- Contains: `.tsx` files, one per scene
- Key files:
  - `S01_ColdOpen.tsx` (135 lines) - Opening hook about web accessibility
  - `S02_ProblemStats.tsx` (134 lines) - Statistics on accessibility problems
  - `S03_MarketAndLaw.tsx` (193 lines) - Market size and legal landscape
  - `S04_Solution.tsx` (241 lines) - NeuroEdge product demo with browser mockup
  - `S05_HowItWorks.tsx` (165 lines) - 5-step flow diagram
  - `S06_CustomerAndPricing.tsx` (166 lines) - Target customers and pricing tiers
  - `S07_Competition.tsx` (113 lines) - Competitive landscape
  - `S08_Team.tsx` (103 lines) - Founder profiles
  - `S09_RoadmapAndFunds.tsx` (260 lines) - Timeline and fund allocation
  - `S10_AskAndClose.tsx` (166 lines) - Call to action and closing

**`video/src/components/`:**
- Purpose: Reusable animated building blocks shared across scenes
- Contains: 15 `.tsx` component files
- Key files:
  - `AnimatedText.tsx` - Word-by-word spring-animated text reveal
  - `SceneTransition.tsx` - Fade+scale in/out wrapper for scenes
  - `GradientBackground.tsx` - Animated radial gradient background
  - `FloatingOrbs.tsx` - Ambient animated bokeh circles
  - `NoiseOverlay.tsx` - Subtle grain texture overlay
  - `Card.tsx` - Content card with optional icon, badge, border accent
  - `StatBlock.tsx` - Animated statistic display with CountUp
  - `CountUp.tsx` - Animated number counter
  - `FlowStep.tsx` - Numbered step in a horizontal flow
  - `TimelineItem.tsx` - Milestone item with marker badge
  - `DonutChart.tsx` - SVG animated donut/ring chart
  - `BarChart.tsx` - Animated horizontal bar chart
  - `BrowserMockup.tsx` - Fake browser window chrome with loading bar
  - `TextHighlight.tsx` - Underline highlight animation
  - `TeamMember.tsx` - Team profile card with photo, bio, tags

**`video/src/lib/`:**
- Purpose: Shared design tokens, font loading, and animation utilities
- Contains: 3 `.ts` utility files
- Key files:
  - `theme.ts` - Color palette (`colors`) and spacing constants (`spacing`)
  - `fonts.ts` - Google Font loading (DM Serif Display, DM Sans, JetBrains Mono) and `fonts` object
  - `animations.ts` - Spring configs (`SPRING_CONFIG`, `SPRING_GENTLE`), animation helpers (`fadeInUp`, `fadeInScale`, `sceneFade`, `staggerDelay`)

**`video/src/assets/`:**
- Purpose: Media files for the video
- Contains: Subdirectories for images and audio (currently empty, placeholder structure)
- Key directories:
  - `assets/images/` - Empty, reserved for scene imagery
  - `assets/audio/sfx/` - Empty, reserved for sound effects
  - `assets/audio/vedant/` - Empty, reserved for voiceover audio
  - `assets/audio/shashwati/` - Empty, reserved for voiceover audio

**`video/public/`:**
- Purpose: Static files accessible via Remotion's `staticFile()` helper
- Contains: `shashwati.jpeg` (team member photo used in S08_Team scene)

**`PitchDeck/`:**
- Purpose: Standalone HTML pitch deck (separate from the video)
- Contains: Single `index.html` file (66KB, self-contained)

**`docs/plans/`:**
- Purpose: Planning and design documentation
- Contains: Remotion video design doc and implementation plan

## Key File Locations

**Entry Points:**
- `video/src/index.ts`: Remotion root registration
- `video/src/Root.tsx`: Composition config (1920x1080, 30fps, 215 seconds)
- `video/src/Video.tsx`: Scene sequencing with frame durations

**Configuration:**
- `video/package.json`: Dependencies, scripts (start/build/preview)
- `video/tsconfig.json`: TypeScript config (ES2022, strict, react-jsx)
- `.claude/settings.local.json`: Claude Code settings

**Core Logic:**
- `video/src/lib/animations.ts`: All animation physics and helper functions
- `video/src/lib/theme.ts`: Design system color and spacing tokens
- `video/src/lib/fonts.ts`: Typography system with 3 Google Fonts

**Testing:**
- No test files exist in the codebase

## Naming Conventions

**Files:**
- Scene files: `S{NN}_{PascalCaseName}.tsx` (e.g., `S01_ColdOpen.tsx`, `S09_RoadmapAndFunds.tsx`)
- Component files: `PascalCase.tsx` matching the exported component name (e.g., `AnimatedText.tsx`)
- Library files: `camelCase.ts` (e.g., `theme.ts`, `fonts.ts`, `animations.ts`)

**Directories:**
- Lowercase plural nouns: `scenes/`, `components/`, `assets/`
- Lowercase singular nouns: `lib/`, `public/`

**Exports:**
- Named exports only (no default exports anywhere in the codebase)
- Component names match file names exactly: `AnimatedText.tsx` exports `AnimatedText`
- Constants use `camelCase`: `colors`, `fonts`, `spacing`
- Animation configs use `SCREAMING_SNAKE_CASE`: `SPRING_CONFIG`, `SPRING_GENTLE`

**Props Interfaces:**
- Named `{ComponentName}Props` (e.g., `AnimatedTextProps`, `CardProps`, `FlowStepProps`)
- Defined in the same file as the component

## Where to Add New Code

**New Scene:**
- Create: `video/src/scenes/S{NN}_{SceneName}.tsx`
- Follow the scene template: import background stack, wrap in `SceneTransition`, use `AbsoluteFill`
- Register in `video/src/Video.tsx` as a new `<Series.Sequence>` with frame duration
- Update total `DURATION_SECONDS` in `video/src/Root.tsx` if adding frames

**New Reusable Component:**
- Create: `video/src/components/{ComponentName}.tsx`
- Define a `{ComponentName}Props` interface
- Accept a `delay` prop for animation staggering
- Use `useCurrentFrame()` and `spring()` for frame-driven animation
- Import `colors` from `../lib/theme` and `fonts` from `../lib/fonts`

**New Animation Helper:**
- Add to: `video/src/lib/animations.ts`
- Follow existing pattern: accept `(frame, fps, delay)`, return style object or number
- Use `spring()` with one of the existing configs or define a new named config

**New Design Tokens:**
- Colors: Add to `colors` object in `video/src/lib/theme.ts`
- Spacing: Add to `spacing` object in `video/src/lib/theme.ts`
- Fonts: Add loading and export in `video/src/lib/fonts.ts`

**New Static Assets:**
- Images for `staticFile()`: Place in `video/public/`
- Images for direct import: Place in `video/src/assets/images/`
- Audio files: Place in `video/src/assets/audio/{speaker}/` or `video/src/assets/audio/sfx/`

**New Utilities:**
- Add to `video/src/lib/` as a new `.ts` file
- Use `camelCase` naming for the file

## Special Directories

**`video/out/`:**
- Purpose: Rendered video output from `npx remotion render`
- Generated: Yes (by Remotion render pipeline)
- Committed: No (git-ignored)

**`video/node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (git-ignored)

**`video/public/`:**
- Purpose: Static assets accessible via `staticFile()` at runtime
- Generated: No (manually placed)
- Committed: Yes

**`.planning/`:**
- Purpose: GSD planning and codebase analysis documents
- Generated: By analysis tools
- Committed: Yes

---

*Structure analysis: 2026-03-07*

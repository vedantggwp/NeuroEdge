# Architecture

**Analysis Date:** 2026-03-07

## Pattern Overview

**Overall:** Component-based Remotion video composition

**Key Characteristics:**
- Declarative React components rendered to video frames via Remotion
- Scene-based sequential narrative structure using `Series` for temporal ordering
- Shared design tokens (theme, fonts, animations) consumed by all visual components
- No server, no API, no state management -- purely a build-time video rendering pipeline

## Layers

**Entry / Registration Layer:**
- Purpose: Register the Remotion root and define the composition (resolution, FPS, duration)
- Location: `video/src/index.ts`, `video/src/Root.tsx`
- Contains: `registerRoot()` call, single `<Composition>` declaration
- Depends on: `Video` component
- Used by: Remotion CLI (`npx remotion studio`, `npx remotion render`)

**Composition Layer:**
- Purpose: Orchestrate all scenes in sequential order with precise frame durations
- Location: `video/src/Video.tsx`
- Contains: `<Series>` with 10 `<Series.Sequence>` wrappers, one per scene
- Depends on: All scene components (`S01`-`S10`)
- Used by: `Root.tsx` via `<Composition component={Video}>`

**Scene Layer:**
- Purpose: Self-contained visual narratives, each representing one section of the pitch
- Location: `video/src/scenes/S01_ColdOpen.tsx` through `video/src/scenes/S10_AskAndClose.tsx`
- Contains: Layout, content text, animation timing, scene-specific sub-components
- Depends on: Reusable components, `lib/theme`, `lib/fonts`, `lib/animations`
- Used by: `Video.tsx`

**Reusable Component Layer:**
- Purpose: Shared visual building blocks with animation capabilities
- Location: `video/src/components/`
- Contains: 15 components for text, charts, cards, layout, and visual effects
- Depends on: `lib/theme`, `lib/fonts`, `lib/animations`, Remotion hooks
- Used by: Scene components

**Design Token / Utility Layer:**
- Purpose: Centralized visual constants and animation helpers
- Location: `video/src/lib/`
- Contains: Color palette, font definitions, spring configs, animation functions
- Depends on: Remotion `interpolate`/`spring`, `@remotion/google-fonts`
- Used by: All components and scenes

## Data Flow

**Frame Rendering Pipeline:**

1. Remotion calls `Video` component for each frame number
2. `<Series>` calculates which `<Series.Sequence>` is active based on cumulative frame offsets
3. Active scene component receives the frame via `useCurrentFrame()` (frame is local to the sequence, starting at 0)
4. Scene passes `delay` props to child components to stagger animations
5. Components compute `spring()` / `interpolate()` values from the current frame
6. CSS styles (opacity, transform) are set declaratively based on computed values
7. Remotion captures the React render as a video frame

**Animation Data Flow:**

1. `useCurrentFrame()` provides the current local frame number
2. `useVideoConfig()` provides `fps` for spring physics calculations
3. `spring({ frame: frame - delay, fps, config })` produces a 0-to-1 progress value
4. `interpolate(progress, inputRange, outputRange)` maps progress to CSS values
5. Animation helpers (`fadeInUp`, `fadeInScale`, `sceneFade`) encapsulate common patterns

**State Management:**
- No application state. All visual state is a pure function of the frame number.
- Each component independently reads `useCurrentFrame()` and computes its own styles.
- No props drilling beyond one level (scene -> component). No context providers.

## Key Abstractions

**Scene:**
- Purpose: A time-bounded visual segment of the pitch video
- Examples: `video/src/scenes/S01_ColdOpen.tsx`, `video/src/scenes/S04_Solution.tsx`, `video/src/scenes/S09_RoadmapAndFunds.tsx`
- Pattern: Each scene is a stateless `React.FC` that uses `AbsoluteFill` for full-frame layout. Every scene wraps content in the standard background stack (`GradientBackground` + `FloatingOrbs` + `NoiseOverlay`) and a `SceneTransition` wrapper for fade in/out.

**Background Stack:**
- Purpose: Consistent cinematic dark-mode background across all scenes
- Examples: `video/src/components/GradientBackground.tsx`, `video/src/components/FloatingOrbs.tsx`, `video/src/components/NoiseOverlay.tsx`
- Pattern: Three layers composited via `AbsoluteFill` with `pointerEvents: "none"`. `GradientBackground` provides animated radial gradients, `FloatingOrbs` adds moving bokeh-like circles, `NoiseOverlay` adds subtle grain texture.

**Animated Primitive:**
- Purpose: Reusable building blocks that animate based on frame-driven spring physics
- Examples: `video/src/components/AnimatedText.tsx`, `video/src/components/CountUp.tsx`, `video/src/components/Card.tsx`
- Pattern: Accept a `delay` prop, compute spring progress from `useCurrentFrame() - delay`, apply opacity/transform styles. All use `SPRING_CONFIG` from `video/src/lib/animations.ts`.

**Data Visualization:**
- Purpose: Animated charts for presenting statistics
- Examples: `video/src/components/DonutChart.tsx`, `video/src/components/BarChart.tsx`, `video/src/components/StatBlock.tsx`
- Pattern: SVG or CSS-based rendering with spring-driven fill progress. Accept data as props, animate from zero to target value.

## Entry Points

**Remotion Studio (Development):**
- Location: `video/src/index.ts`
- Triggers: `npx remotion studio` (defined in `video/package.json` as `start` script)
- Responsibilities: Opens browser preview with timeline scrubbing, hot reload

**Remotion Render (Production):**
- Location: `video/src/index.ts`
- Triggers: `npx remotion render NeuroEdgePitch` (defined in `video/package.json` as `build` script)
- Responsibilities: Renders all 6,450 frames (215 seconds at 30fps) to video file in `video/out/`

**Static HTML Pitch Deck:**
- Location: `PitchDeck/index.html`
- Triggers: Open in browser
- Responsibilities: Standalone HTML pitch deck (separate from the video project, no build step)

## Error Handling

**Strategy:** None required -- this is a declarative video rendering project

**Patterns:**
- Remotion validates composition configs (fps, dimensions, duration) at registration
- `interpolate()` uses `extrapolateRight: "clamp"` / `extrapolateLeft: "clamp"` to prevent out-of-range values
- Spring animations naturally clamp between 0 and 1 via physics simulation

## Cross-Cutting Concerns

**Logging:** Not applicable (no runtime)
**Validation:** Remotion validates composition metadata at studio startup
**Authentication:** Not applicable

**Visual Consistency:**
- All colors sourced from `video/src/lib/theme.ts` (`colors` object)
- All fonts sourced from `video/src/lib/fonts.ts` (`fonts` object with heading/body/mono)
- All animation physics sourced from `video/src/lib/animations.ts` (`SPRING_CONFIG`, `SPRING_GENTLE`)
- Every scene uses the same background stack pattern (GradientBackground + FloatingOrbs + NoiseOverlay)

---

*Architecture analysis: 2026-03-07*

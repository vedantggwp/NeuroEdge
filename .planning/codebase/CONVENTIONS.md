# Coding Conventions

**Analysis Date:** 2026-03-07

## Naming Patterns

**Files:**
- Components: PascalCase single-word or compound — `AnimatedText.tsx`, `GradientBackground.tsx`, `BrowserMockup.tsx`
- Scenes: Numbered prefix with PascalCase descriptor — `S01_ColdOpen.tsx`, `S04_Solution.tsx`, `S09_RoadmapAndFunds.tsx`
- Library modules: camelCase — `theme.ts`, `fonts.ts`, `animations.ts`
- Entry points: lowercase — `index.ts`

**Components:**
- Use PascalCase for all React component names: `AnimatedText`, `SceneTransition`, `FloatingOrbs`
- Match file name to exported component name exactly

**Functions:**
- Use camelCase for utility/animation functions: `fadeInUp`, `fadeInScale`, `sceneFade`, `staggerDelay`
- Helper components defined inline within scene files use PascalCase: `ScanContent` in `S04_Solution.tsx`, `BudgetRow` in `S09_RoadmapAndFunds.tsx`

**Variables:**
- Constants use UPPER_SNAKE_CASE: `SPRING_CONFIG`, `SPRING_GENTLE`, `DURATION`, `FPS`, `ORBS`, `BUDGET_ITEMS`, `ROADMAP_ITEMS`
- Local variables use camelCase: `labelProgress`, `contentOpacity`, `loadProgress`

**Types/Interfaces:**
- PascalCase with descriptive `Props` suffix for component props: `AnimatedTextProps`, `CardProps`, `StatBlockProps`, `FlowStepProps`
- Data interfaces use plain PascalCase: `Orb`, `BarItem`, `BudgetLineItem`, `RoadmapEntry`

## Code Style

**Formatting:**
- No ESLint, Prettier, or Biome configuration detected — formatting is manual
- Use 2-space indentation throughout
- Semicolons are used consistently on all statements
- Double quotes for string imports, both single and double quotes appear in JSX string attributes

**Linting:**
- No linter configured
- TypeScript strict mode is enabled in `video/tsconfig.json` (`"strict": true`)

## Import Organization

**Order:**
1. React import: `import React from "react"`
2. Remotion framework imports: `import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion"`
3. Local components: `import { AnimatedText } from "../components/AnimatedText"`
4. Local library modules: `import { colors } from "../lib/theme"`, `import { fonts } from "../lib/fonts"`, `import { fadeInUp, SPRING_CONFIG } from "../lib/animations"`

**Path Aliases:**
- No path aliases configured — all imports use relative paths with `../`

**Import Style:**
- Named exports exclusively — no default exports anywhere in the codebase
- Each component file exports exactly one component via named export

## Component Patterns

**Functional Components Only:**
- All components use `React.FC` or `React.FC<Props>` typing
- Arrow function syntax with const declaration: `export const Card: React.FC<CardProps> = ({ ... }) => { ... }`

**Props Pattern:**
- Define a TypeScript interface above the component
- Use destructuring in the parameter list with default values inline
- Optional props use `?` in the interface and defaults in destructuring

```typescript
// Standard component pattern from video/src/components/Card.tsx
interface CardProps {
  icon?: string;
  title: string;
  body: string;
  delay?: number;
  borderColor?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  icon, title, body, delay = 0, borderColor, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);
  // ...
};
```

**Scene Pattern:**
- Every scene defines a `DURATION` constant at the top
- Every scene wraps content in `AbsoluteFill > GradientBackground + FloatingOrbs + NoiseOverlay + SceneTransition > AbsoluteFill (content)`
- Scenes use a section label pattern: monospace uppercase text with letter-spacing animated via `spring()`

```typescript
// Standard scene structure from video/src/scenes/S08_Team.tsx
const DURATION = 600;

export const S08_Team: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelProgress = spring({ frame, fps, config: SPRING_CONFIG });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />
      <SceneTransition durationInFrames={DURATION}>
        <AbsoluteFill style={{ padding: "64px 100px", display: "flex", flexDirection: "column" }}>
          {/* Section label */}
          {/* Headline via AnimatedText */}
          {/* Scene-specific content */}
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};
```

## Animation Patterns

**Spring-based animations:**
- Use shared spring configs from `video/src/lib/animations.ts`: `SPRING_CONFIG` (snappy) and `SPRING_GENTLE` (slower)
- Apply via helper functions `fadeInUp()`, `fadeInScale()`, `sceneFade()` which return style objects
- Stagger animations using `staggerDelay(index, baseDelay)` or manual `delay + i * N`

**Delay convention:**
- All animatable components accept an optional `delay` prop (defaults to `0`)
- Delay values are in frames (at 30fps)
- Stagger between sibling elements is typically 6-10 frames

**Interpolation:**
- Use `interpolate()` for linear transitions with `extrapolateRight: "clamp"` / `extrapolateLeft: "clamp"`
- Use `spring()` for physics-based easing

## Styling Approach

**Inline Styles Only:**
- No CSS files, CSS modules, or styled-components
- All styles are inline `style={{ ... }}` objects
- Use `React.CSSProperties` type for style variables

**Design Tokens:**
- Colors: always reference `colors` from `video/src/lib/theme.ts` — never hardcode hex values (exception: browser mockup dots in `BrowserMockup.tsx`)
- Fonts: always reference `fonts` from `video/src/lib/fonts.ts` — `fonts.heading`, `fonts.body`, `fonts.mono`
- Spacing: page padding is `64px 100px` on all scenes; gap sizes use `spacing` from theme or literal pixel values

**Opacity for semi-transparent colors:**
- Append hex opacity to color strings: `${colors.accent}20`, `${colors.accent}40`
- Use `rgba()` for one-off transparent whites: `rgba(255,255,255,0.06)`

## Data Constants

**Immutable data arrays:**
- Use `as const` assertions for readonly data arrays
- Define data interfaces with `readonly` properties for structured constants
- Place data constants at module top-level, above the component

```typescript
// Pattern from video/src/scenes/S09_RoadmapAndFunds.tsx
interface BudgetLineItem {
  readonly label: string;
  readonly amount: string;
  readonly delay: number;
}

const BUDGET_ITEMS: readonly BudgetLineItem[] = [
  { label: "User research with disabled testers", amount: "\u00A3500", delay: 30 },
  // ...
] as const;
```

## Error Handling

**Patterns:**
- No explicit error handling exists — the codebase is a Remotion video composition with no user input, API calls, or async operations
- No try/catch blocks anywhere
- No error boundaries

## Logging

**Framework:** None — no console.log, no logging utilities

## Comments

**When to Comment:**
- Section divider comments in scenes to separate visual regions: `{/* Section label */}`, `{/* Headline */}`, `{/* Phase 2: Roadmap */}`
- Phase transition comments for multi-phase scenes: `// Phase 1 fade-out (frames 330-350)`

**JSDoc/TSDoc:**
- Not used anywhere in the codebase

## Function Design

**Size:** All functions are under 50 lines; most components are 20-60 lines total
**Parameters:** Animation helpers take `(frame, fps, delay)` consistently
**Return Values:** Animation helpers return `{ opacity, transform }` style objects or single numeric values

## Module Design

**Exports:** Named exports exclusively — one primary export per file
**Barrel Files:** Not used — each file is imported directly by path

---

*Convention analysis: 2026-03-07*

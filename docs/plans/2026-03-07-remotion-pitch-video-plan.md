# NeuroEdge Remotion Pitch Video — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a cinematic 3:35 pitch video for the DYF Pitching Competition using Remotion, with 10 scenes, dual-founder voiceover, background music, and SF-startup-quality motion graphics.

**Architecture:** Remotion component-per-scene. Shared design system (theme, fonts, animation helpers). 16 reusable components compose into 10 scene files. Main `Video.tsx` sequences scenes with `<Series>`. Audio layers: background music (full span, volume-ducked), voiceover (per-scene clips), SFX (whoosh/tick/pulse).

**Tech Stack:** Remotion 4.x, TypeScript, React, @remotion/google-fonts, @remotion/paths (SVG animation)

**Design doc:** `docs/plans/2026-03-07-remotion-pitch-video-design.md`

---

## Phase 1: Foundation

### Task 1: Scaffold Remotion Project

**Files:**
- Create: `video/` (entire directory via Remotion CLI)
- Modify: `video/src/Root.tsx`
- Modify: `video/package.json`

**Step 1: Create Remotion project**

```bash
cd /Users/ved/Downloads/NeuroEdge
npx create-video@latest video --template blank
cd video
npm install
```

If `create-video` is unavailable, use:
```bash
npx remotion init video
```

**Step 2: Verify it runs**

```bash
cd /Users/ved/Downloads/NeuroEdge/video
npx remotion preview
```

Expected: Browser opens with Remotion preview player.

**Step 3: Create directory structure**

```bash
cd /Users/ved/Downloads/NeuroEdge/video/src
mkdir -p scenes components lib assets/audio/sfx assets/audio/shashwati assets/audio/vedant assets/images
```

**Step 4: Copy team photos into assets**

```bash
cp /Users/ved/Downloads/NeuroEdge/shashwati.jpeg /Users/ved/Downloads/NeuroEdge/video/src/assets/images/
```

Note: Vedant's photo needs to be sourced separately and placed at `src/assets/images/vedant.jpeg`.

**Step 5: Install additional dependencies**

```bash
cd /Users/ved/Downloads/NeuroEdge/video
npm install @remotion/google-fonts @remotion/paths
```

**Step 6: Update Root.tsx with composition config**

```tsx
// video/src/Root.tsx
import { Composition } from "remotion";
import { Video } from "./Video";

const FPS = 30;
const DURATION_SECONDS = 215;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NeuroEdgePitch"
      component={Video}
      durationInFrames={FPS * DURATION_SECONDS}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
```

**Step 7: Create placeholder Video.tsx**

```tsx
// video/src/Video.tsx
import { AbsoluteFill } from "remotion";

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1222" }}>
      <h1 style={{ color: "white", margin: "auto" }}>NeuroEdge Pitch</h1>
    </AbsoluteFill>
  );
};
```

**Step 8: Verify preview loads with new composition**

```bash
npx remotion preview
```

Expected: "NeuroEdge Pitch" text on dark background in preview player.

**Step 9: Commit**

```bash
git add video/
git commit -m "feat: scaffold Remotion project with composition config"
```

---

### Task 2: Design System — Theme, Fonts, Animations

**Files:**
- Create: `video/src/lib/theme.ts`
- Create: `video/src/lib/fonts.ts`
- Create: `video/src/lib/animations.ts`

**Step 1: Create theme.ts**

```ts
// video/src/lib/theme.ts
export const colors = {
  bg: {
    dark: "#0B1222",
    card: "#131D33",
    light: "#F4F6FA",
  },
  accent: "#00C9A7",
  accentDim: "#0A7B66",
  warning: "#FF6B6B",
  gold: "#FFD93D",
  text: {
    primary: "#E8ECF4",
    secondary: "#A8B2C4",
    muted: "#7B8AA0",
    dark: "#1A1F2E",
  },
} as const;

export const spacing = {
  page: { x: 100, y: 64 },
  gap: {
    sm: 12,
    md: 24,
    lg: 48,
  },
} as const;
```

**Step 2: Create fonts.ts**

```ts
// video/src/lib/fonts.ts
import {
  loadFont as loadDMSerif,
  fontFamily as dmSerifFamily,
} from "@remotion/google-fonts/DMSerifDisplay";
import {
  loadFont as loadDMSans,
  fontFamily as dmSansFamily,
} from "@remotion/google-fonts/DMSans";
import {
  loadFont as loadJetBrains,
  fontFamily as jetBrainsFamily,
} from "@remotion/google-fonts/JetBrainsMono";

loadDMSerif();
loadDMSans();
loadJetBrains();

export const fonts = {
  heading: dmSerifFamily,
  body: dmSansFamily,
  mono: jetBrainsFamily,
} as const;
```

Check the exact export names from `@remotion/google-fonts` — they may differ slightly. Run `npx remotion preview` after creating this file to verify no import errors.

**Step 3: Create animations.ts**

```ts
// video/src/lib/animations.ts
import { interpolate, spring, Easing } from "remotion";

export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 120,
  mass: 0.5,
};

export const SPRING_GENTLE = {
  damping: 30,
  stiffness: 80,
  mass: 0.8,
};

/** Fade in + slide up, with optional delay in frames */
export function fadeInUp(
  frame: number,
  fps: number,
  delay: number = 0
): { opacity: number; transform: string } {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG,
  });
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
  };
}

/** Fade in + scale up from center */
export function fadeInScale(
  frame: number,
  fps: number,
  delay: number = 0
): { opacity: number; transform: string } {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG,
  });
  return {
    opacity: progress,
    transform: `scale(${interpolate(progress, [0, 1], [0.95, 1])})`,
  };
}

/** Cross-fade transition: returns opacity 0->1 for enter, 1->0 for exit */
export function sceneFade(
  frame: number,
  durationInFrames: number,
  transitionFrames: number = 15
): number {
  const enterOpacity = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  return Math.min(enterOpacity, exitOpacity);
}

/** Stagger delay for child index */
export function staggerDelay(index: number, baseDelay: number = 6): number {
  return index * baseDelay;
}
```

**Step 4: Verify — import all three in Video.tsx temporarily**

Add to `Video.tsx`:
```tsx
import { colors } from "./lib/theme";
import "./lib/fonts";
import { fadeInUp } from "./lib/animations";
```

Run `npx remotion preview`. Expected: No errors, same display.

Remove the temporary imports (they'll be used by components later).

**Step 5: Commit**

```bash
git add video/src/lib/
git commit -m "feat: add design system — theme, fonts, animation helpers"
```

---

### Task 3: Core Layout Components

**Files:**
- Create: `video/src/components/GradientBackground.tsx`
- Create: `video/src/components/NoiseOverlay.tsx`
- Create: `video/src/components/FloatingOrbs.tsx`
- Create: `video/src/components/SceneTransition.tsx`

**Step 1: Create GradientBackground.tsx**

Animated mesh gradient with slow drift, matching the HTML deck but smoother.

```tsx
// video/src/components/GradientBackground.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "../lib/theme";

export const GradientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const x1 = interpolate(frame % 750, [0, 375, 750], [20, 22, 20]);
  const y1 = interpolate(frame % 900, [0, 450, 900], [50, 47, 50]);
  const x2 = interpolate(frame % 600, [0, 300, 600], [80, 78, 80]);
  const y2 = interpolate(frame % 1050, [0, 525, 1050], [20, 23, 20]);

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at ${x1}% ${y1}%, rgba(0,201,167,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at ${x2}% ${y2}%, rgba(10,123,102,0.1) 0%, transparent 45%),
          radial-gradient(ellipse at 60% 80%, rgba(6,90,130,0.09) 0%, transparent 50%),
          ${colors.bg.dark}
        `,
      }}
    />
  );
};
```

**Step 2: Create NoiseOverlay.tsx**

Subtle film grain using an SVG noise filter.

```tsx
// video/src/components/NoiseOverlay.tsx
import React from "react";
import { AbsoluteFill } from "remotion";

export const NoiseOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        pointerEvents: "none",
      }}
    />
  );
};
```

**Step 3: Create FloatingOrbs.tsx**

Slow-moving luminous spheres drifting in the background. 5-7 orbs with different sizes, positions, and speeds.

```tsx
// video/src/components/FloatingOrbs.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "../lib/theme";

interface Orb {
  x: number;       // base x position (%)
  y: number;       // base y position (%)
  size: number;    // diameter in px
  speed: number;   // frames per full cycle
  color: string;
  blur: number;
}

const ORBS: Orb[] = [
  { x: 15, y: 25, size: 200, speed: 600, color: colors.accent, blur: 80 },
  { x: 75, y: 15, size: 160, speed: 800, color: colors.accentDim, blur: 60 },
  { x: 50, y: 70, size: 240, speed: 1000, color: "rgba(6,90,130,0.6)", blur: 100 },
  { x: 85, y: 60, size: 120, speed: 700, color: colors.accent, blur: 50 },
  { x: 30, y: 80, size: 180, speed: 900, color: colors.accentDim, blur: 70 },
];

export const FloatingOrbs: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {ORBS.map((orb, i) => {
        const xOffset = interpolate(
          frame % orb.speed,
          [0, orb.speed / 2, orb.speed],
          [0, 30, 0]
        );
        const yOffset = interpolate(
          frame % (orb.speed * 1.3),
          [0, (orb.speed * 1.3) / 2, orb.speed * 1.3],
          [0, -20, 0]
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${orb.x + xOffset * 0.1}%`,
              top: `${orb.y + yOffset * 0.1}%`,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: orb.color,
              opacity: 0.15,
              filter: `blur(${orb.blur}px)`,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
```

**Step 4: Create SceneTransition.tsx**

Wrapper that handles cross-fade + subtle scale for scene enter/exit.

```tsx
// video/src/components/SceneTransition.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface SceneTransitionProps {
  children: React.ReactNode;
  durationInFrames: number;
  transitionFrames?: number;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  durationInFrames,
  transitionFrames = 15,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(enterOpacity, exitOpacity);

  const enterScale = interpolate(frame, [0, transitionFrames], [1.03, 1], {
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0.97],
    { extrapolateLeft: "clamp" }
  );
  const scale = frame < durationInFrames / 2 ? enterScale : exitScale;

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};
```

**Step 5: Verify — create a test scene in Video.tsx using all four**

```tsx
// video/src/Video.tsx
import { AbsoluteFill } from "remotion";
import { GradientBackground } from "./components/GradientBackground";
import { NoiseOverlay } from "./components/NoiseOverlay";
import { FloatingOrbs } from "./components/FloatingOrbs";
import { SceneTransition } from "./components/SceneTransition";

export const Video: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />
      <SceneTransition durationInFrames={300}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}>
          <h1 style={{ color: "#E8ECF4", fontSize: 64, fontFamily: "DM Serif Display" }}>
            NeuroEdge
          </h1>
        </div>
      </SceneTransition>
    </AbsoluteFill>
  );
};
```

Run `npx remotion preview`. Expected: Dark gradient background with drifting orbs, subtle grain, "NeuroEdge" text fading in and out.

**Step 6: Commit**

```bash
git add video/src/components/ video/src/Video.tsx
git commit -m "feat: add core layout components — gradient, noise, orbs, transitions"
```

---

## Phase 2: Animation Components

### Task 4: AnimatedText + TextHighlight

**Files:**
- Create: `video/src/components/AnimatedText.tsx`
- Create: `video/src/components/TextHighlight.tsx`

**Step 1: Create AnimatedText.tsx**

Kinetic typography — splits text into words, animates each with stagger.

```tsx
// video/src/components/AnimatedText.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { fonts } from "../lib/fonts";
import { colors } from "../lib/theme";
import { SPRING_CONFIG, staggerDelay } from "../lib/animations";

interface AnimatedTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  delay?: number;       // delay in frames before animation starts
  staggerFrames?: number;
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  fontSize = 56,
  color = colors.text.primary,
  fontFamily = fonts.heading,
  delay = 0,
  staggerFrames = 3,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em", ...style }}>
      {words.map((word, i) => {
        const wordDelay = delay + i * staggerFrames;
        const progress = spring({
          frame: frame - wordDelay,
          fps,
          config: SPRING_CONFIG,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize,
              fontFamily,
              color,
              opacity: progress,
              transform: `translateY(${(1 - progress) * 15}px)`,
              lineHeight: 1.2,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
```

**Step 2: Create TextHighlight.tsx**

Animated underline/marker sweep that expands from left to right.

```tsx
// video/src/components/TextHighlight.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../lib/theme";
import { SPRING_GENTLE } from "../lib/animations";

interface TextHighlightProps {
  children: React.ReactNode;
  delay?: number;
  color?: string;
  highlightHeight?: number;
}

export const TextHighlight: React.FC<TextHighlightProps> = ({
  children,
  delay = 0,
  color = colors.accent,
  highlightHeight = 6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_GENTLE,
  });

  const width = interpolate(progress, [0, 1], [0, 100]);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span
        style={{
          position: "absolute",
          bottom: -2,
          left: 0,
          width: `${width}%`,
          height: highlightHeight,
          background: color,
          opacity: 0.4,
          borderRadius: 3,
        }}
      />
    </span>
  );
};
```

**Step 3: Verify in preview** — temporarily render both in Video.tsx. Expected: words animate in with stagger, highlight sweeps under text.

**Step 4: Commit**

```bash
git add video/src/components/AnimatedText.tsx video/src/components/TextHighlight.tsx
git commit -m "feat: add AnimatedText and TextHighlight components"
```

---

### Task 5: CountUp + StatBlock

**Files:**
- Create: `video/src/components/CountUp.tsx`
- Create: `video/src/components/StatBlock.tsx`

**Step 1: Create CountUp.tsx**

Animated number counter that rolls from 0 to target value.

```tsx
// video/src/components/CountUp.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { fonts } from "../lib/fonts";
import { colors } from "../lib/theme";
import { SPRING_CONFIG } from "../lib/animations";

interface CountUpProps {
  value: number;
  prefix?: string;    // e.g. "£"
  suffix?: string;    // e.g. "%", "B"
  fontSize?: number;
  color?: string;
  delay?: number;
  decimals?: number;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  prefix = "",
  suffix = "",
  fontSize = 44,
  color = colors.accent,
  delay = 0,
  decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { ...SPRING_CONFIG, stiffness: 60 },
  });

  const displayValue = (value * Math.min(progress, 1)).toFixed(decimals);

  return (
    <span
      style={{
        fontFamily: fonts.heading,
        fontSize,
        color,
        display: "inline-block",
      }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
```

**Step 2: Create StatBlock.tsx**

Stat card containing a CountUp, label, and optional source.

```tsx
// video/src/components/StatBlock.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { CountUp } from "./CountUp";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

interface StatBlockProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source?: string;
  delay?: number;
  decimals?: number;
  color?: string;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  value,
  prefix,
  suffix,
  label,
  source,
  delay = 0,
  decimals,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);

  return (
    <div
      style={{
        background: colors.bg.card,
        borderRadius: 14,
        padding: "32px 28px",
        borderLeft: `3px solid ${colors.accent}`,
        flex: 1,
        minWidth: 280,
        ...anim,
      }}
    >
      <CountUp
        value={value}
        prefix={prefix}
        suffix={suffix}
        delay={delay + 6}
        decimals={decimals}
        color={color}
      />
      <div
        style={{
          fontSize: 15,
          color: colors.text.secondary,
          lineHeight: 1.5,
          marginTop: 8,
          fontFamily: fonts.body,
        }}
      >
        {label}
      </div>
      {source && (
        <div
          style={{
            fontSize: 12,
            color: colors.text.muted,
            marginTop: 8,
            fontFamily: fonts.mono,
          }}
        >
          {source}
        </div>
      )}
    </div>
  );
};
```

**Step 3: Verify in preview.** Expected: Card fades in, number rolls up.

**Step 4: Commit**

```bash
git add video/src/components/CountUp.tsx video/src/components/StatBlock.tsx
git commit -m "feat: add CountUp and StatBlock components"
```

---

### Task 6: Card + FlowStep + TimelineItem

**Files:**
- Create: `video/src/components/Card.tsx`
- Create: `video/src/components/FlowStep.tsx`
- Create: `video/src/components/TimelineItem.tsx`

**Step 1: Create Card.tsx**

Generic info card with slide-in animation. Supports icon, title, body, optional border color.

```tsx
// video/src/components/Card.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

interface CardProps {
  icon?: string;
  title: string;
  body: string;
  delay?: number;
  borderColor?: string;
  source?: string;
  badge?: string;
  badgeColor?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  icon,
  title,
  body,
  delay = 0,
  borderColor,
  source,
  badge,
  badgeColor = colors.accent,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);

  return (
    <div
      style={{
        background: colors.bg.card,
        borderRadius: 14,
        padding: 32,
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeft: borderColor ? `3px solid ${borderColor}` : undefined,
        ...anim,
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: 28, display: "block", marginBottom: 14 }}>{icon}</span>}
      <h4
        style={{
          fontSize: 17,
          fontWeight: 700,
          marginBottom: 12,
          color: colors.text.primary,
          fontFamily: fonts.body,
        }}
      >
        {title}
        {badge && (
          <span
            style={{
              display: "inline-block",
              background: `${badgeColor}20`,
              color: badgeColor,
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              marginLeft: 8,
            }}
          >
            {badge}
          </span>
        )}
      </h4>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: colors.text.secondary, fontFamily: fonts.body }}>
        {body}
      </p>
      {source && (
        <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 10, fontFamily: fonts.mono }}>
          {source}
        </div>
      )}
    </div>
  );
};
```

**Step 2: Create FlowStep.tsx**

Process flow step with step number, title, description, and animated connector arrow.

```tsx
// video/src/components/FlowStep.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SPRING_CONFIG } from "../lib/animations";

interface FlowStepProps {
  stepNum: string;   // "01", "02", etc.
  title: string;
  description: string;
  delay?: number;
  showArrow?: boolean;
  isActive?: boolean;
}

export const FlowStep: React.FC<FlowStepProps> = ({
  stepNum,
  title,
  description,
  delay = 0,
  showArrow = true,
  isActive = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame: frame - delay, fps, config: SPRING_CONFIG });
  const glowOpacity = isActive ? 0.3 : 0;

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
      <div
        style={{
          flex: 1,
          background: colors.bg.card,
          borderRadius: 12,
          padding: "24px 20px",
          textAlign: "center",
          border: `1px solid rgba(255,255,255,0.05)`,
          opacity: progress,
          transform: `translateY(${(1 - progress) * 20}px)`,
          boxShadow: isActive ? `0 0 30px ${colors.accent}40` : "none",
          transition: "box-shadow 0.3s",
        }}
      >
        <span style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, color: colors.accent, marginBottom: 10, display: "block" }}>
          {stepNum}
        </span>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: colors.text.primary, marginBottom: 8, fontFamily: fonts.body }}>
          {title}
        </h4>
        <p style={{ fontSize: 13, lineHeight: 1.45, color: colors.text.secondary, fontFamily: fonts.body }}>
          {description}
        </p>
      </div>
      {showArrow && (
        <div style={{ display: "flex", alignItems: "center", color: colors.accent, fontSize: 20, opacity: progress }}>
          →
        </div>
      )}
    </div>
  );
};
```

**Step 3: Create TimelineItem.tsx**

Roadmap timeline entry with marker and content.

```tsx
// video/src/components/TimelineItem.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

interface TimelineItemProps {
  marker: string;    // "M1", "M2", etc.
  title: string;
  description: string;
  delay?: number;
  isActive?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  marker,
  title,
  description,
  delay = 0,
  isActive = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", ...anim }}>
      <div
        style={{
          minWidth: 48,
          height: 32,
          background: isActive ? colors.accent : colors.accentDim,
          color: "white",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: fonts.mono,
        }}
      >
        {marker}
      </div>
      <div>
        <h4 style={{ fontSize: 17, fontWeight: 700, color: colors.text.primary, marginBottom: 4, fontFamily: fonts.body }}>
          {title}
        </h4>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: colors.text.secondary, fontFamily: fonts.body }}>
          {description}
        </p>
      </div>
    </div>
  );
};
```

**Step 4: Verify all three in preview.**

**Step 5: Commit**

```bash
git add video/src/components/Card.tsx video/src/components/FlowStep.tsx video/src/components/TimelineItem.tsx
git commit -m "feat: add Card, FlowStep, and TimelineItem components"
```

---

### Task 7: DonutChart + BarChart

**Files:**
- Create: `video/src/components/DonutChart.tsx`
- Create: `video/src/components/BarChart.tsx`

**Step 1: Create DonutChart.tsx**

Self-drawing SVG donut chart that fills to a target percentage.

```tsx
// video/src/components/DonutChart.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { colors } from "../lib/theme";
import { SPRING_CONFIG } from "../lib/animations";

interface DonutChartProps {
  value: number;        // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  delay?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  value,
  size = 160,
  strokeWidth = 12,
  color = colors.accent,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { ...SPRING_CONFIG, stiffness: 40 },
  });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference * Math.min(progress, 1);
  const offset = circumference - filled;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Filled ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};
```

**Step 2: Create BarChart.tsx**

Horizontal bar comparison chart. Each row has a label and a bar that grows to its relative width.

```tsx
// video/src/components/BarChart.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SPRING_CONFIG, staggerDelay } from "../lib/animations";

interface BarItem {
  label: string;
  sublabel?: string;
  value: number;       // relative value (0-100 scale)
  highlight?: boolean;
}

interface BarChartProps {
  items: BarItem[];
  delay?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ items, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item, i) => {
        const barDelay = delay + staggerDelay(i, 8);
        const progress = spring({
          frame: frame - barDelay,
          fps,
          config: SPRING_CONFIG,
        });
        const barColor = item.highlight ? colors.accent : colors.text.muted;
        const textColor = item.highlight ? colors.text.primary : colors.text.secondary;

        return (
          <div key={i} style={{ opacity: progress }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
              fontFamily: fonts.body,
              fontSize: 14,
              color: textColor,
              fontWeight: item.highlight ? 700 : 400,
            }}>
              <span>{item.label}</span>
              {item.sublabel && <span style={{ color: colors.text.muted, fontSize: 13 }}>{item.sublabel}</span>}
            </div>
            <div style={{
              height: 8,
              borderRadius: 4,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${item.value * progress}%`,
                background: barColor,
                borderRadius: 4,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

**Step 3: Verify both in preview.**

**Step 4: Commit**

```bash
git add video/src/components/DonutChart.tsx video/src/components/BarChart.tsx
git commit -m "feat: add DonutChart and BarChart data visualization components"
```

---

### Task 8: BrowserMockup + TeamMember

**Files:**
- Create: `video/src/components/BrowserMockup.tsx`
- Create: `video/src/components/TeamMember.tsx`

**Step 1: Create BrowserMockup.tsx**

Fake browser chrome with URL bar and content area. Shows a simulated NeuroEdge scan.

```tsx
// video/src/components/BrowserMockup.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SPRING_CONFIG } from "../lib/animations";

interface BrowserMockupProps {
  url?: string;
  delay?: number;
  children?: React.ReactNode;
}

export const BrowserMockup: React.FC<BrowserMockupProps> = ({
  url = "https://neuroedge.co.uk/scan",
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: SPRING_CONFIG });

  // Simulated loading bar
  const loadProgress = interpolate(
    frame - delay - 15,
    [0, 45],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        background: "#1a1f2e",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: progress,
        transform: `scale(${interpolate(progress, [0, 1], [0.95, 1])})`,
        width: "100%",
        maxWidth: 700,
      }}
    >
      {/* Browser chrome */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 16px",
        background: "rgba(0,0,0,0.3)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
        </div>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 6,
          padding: "6px 12px",
          fontSize: 12,
          color: colors.text.muted,
          fontFamily: fonts.mono,
        }}>
          {url}
        </div>
      </div>
      {/* Loading bar */}
      {loadProgress < 100 && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
          <div style={{ height: "100%", width: `${loadProgress}%`, background: colors.accent }} />
        </div>
      )}
      {/* Content area */}
      <div style={{ padding: 24, minHeight: 200 }}>
        {children}
      </div>
    </div>
  );
};
```

**Step 2: Create TeamMember.tsx**

Avatar photo + bio card with role and credentials.

```tsx
// video/src/components/TeamMember.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
  delay?: number;
  tags?: string[];
}

export const TeamMember: React.FC<TeamMemberProps> = ({
  name,
  role,
  bio,
  imageSrc,
  delay = 0,
  tags = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        padding: 24,
        background: colors.bg.card,
        borderRadius: 12,
        ...anim,
      }}
    >
      <Img
        src={staticFile(imageSrc)}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          objectFit: "cover",
          border: `2px solid ${colors.accent}40`,
          flexShrink: 0,
        }}
      />
      <div>
        <h4 style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, fontFamily: fonts.body, marginBottom: 2 }}>
          {name}
        </h4>
        <div style={{ fontSize: 14, color: colors.accent, marginBottom: 10, fontFamily: fonts.body }}>
          {role}
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: colors.text.secondary, fontFamily: fonts.body }}>
          {bio}
        </p>
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {tags.map((tag, i) => (
              <span key={i} style={{
                background: `${colors.accent}20`,
                color: colors.accent,
                padding: "3px 10px",
                borderRadius: 16,
                fontSize: 12,
                fontFamily: fonts.mono,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

Note: Team photos must be placed in `video/public/` for `staticFile()` to work:
```bash
cp src/assets/images/shashwati.jpeg /Users/ved/Downloads/NeuroEdge/video/public/shashwati.jpeg
```

Same for vedant.jpeg when available. The `imageSrc` prop would be `"shashwati.jpeg"` (relative to public/).

**Step 3: Verify both in preview.**

**Step 4: Commit**

```bash
git add video/src/components/BrowserMockup.tsx video/src/components/TeamMember.tsx
git commit -m "feat: add BrowserMockup and TeamMember components"
```

---

## Phase 3: Scenes

Each scene follows the same structure:
1. `SceneTransition` wrapper with `durationInFrames`
2. `GradientBackground` + `FloatingOrbs` + `NoiseOverlay` as base layers
3. Content layer with scene-specific components
4. All timing uses `useCurrentFrame()` relative to the scene start (Remotion handles this via `<Series>`)

### Task 9: Scene 1 — Cold Open

**Files:**
- Create: `video/src/scenes/S01_ColdOpen.tsx`

**Duration:** 600 frames (20s)

Build the scene following the design doc (Scene 1). Key elements:
- Black screen for first 15 frames, then slow fade into gradient mesh
- `AnimatedText` for "Imagine you run a small business." (delay: 20)
- `AnimatedText` for "You've got a website." (delay: 60)
- `AnimatedText` for "Customers visit every day." (delay: 100)
- Pause — then "But what you don't know..." (delay: 160, smaller text, secondary color)
- "one in four of them can't actually use it." (delay: 210, large, `colors.warning`, with `TextHighlight` on "one in four")
- Subtle shake on the warning text: use `interpolate` to create a small horizontal oscillation on frames 220-235

**Commit:** `feat: add Scene 1 — Cold Open`

---

### Task 10: Scene 2 — Problem Stats

**Files:**
- Create: `video/src/scenes/S02_ProblemStats.tsx`

**Duration:** 600 frames (20s)

Key elements:
- Section label `h3`: "THE PROBLEM" in accent, uppercase, letter-spacing 4px (delay: 0)
- `AnimatedText` headline: "95% of websites are broken for 16 million people" (delay: 10)
- Row of three `StatBlock` components with stagger (delay: 30, 42, 54):
  - 94.8 / suffix "%" / "of the top 1 million homepages..." / source: "WebAIM Million, Feb 2025"
  - 51 / no suffix / "average distinct accessibility errors per homepage" / source: "WebAIM Million, Feb 2025"
  - 24 / suffix "%" / "of UK people are now disabled — up from 16% in 2013" / source: "DWP Family Resources Survey 2023-24"
- `DonutChart` positioned to the left of the first stat, fills to 94.8 (delay: 35)
- Bottom text line (delay: 80): "Most businesses have no idea..."

**Commit:** `feat: add Scene 2 — Problem Stats`

---

### Task 11: Scene 3 — Market & Legal

**Files:**
- Create: `video/src/scenes/S03_MarketAndLaw.tsx`

**Duration:** 750 frames (25s)

Key elements:
- First half (frames 0-350): Market stats
  - Giant `CountUp` centre-screen: value 274, prefix "£", suffix "B", color `colors.gold`, fontSize 80 (delay: 10)
  - Label: "annual spending power of disabled households" (delay: 25)
  - "7 in 10" `StatBlock` (delay: 40)
- Second half (frames 350-750): Legal pressure
  - `AnimatedText` headline with `TextHighlight` on "legal obligation" (delay: 360)
  - Three `Card` components in a row (delay: 380, 395, 410):
    - icon "⚖️", title "Equality Act 2010"
    - icon "🏛️", title "PSBAR 2018"
    - icon "🇪🇺", title "European Accessibility Act"
  - Closing text: "This isn't coming. It's here." (delay: 440, accent color)

**Commit:** `feat: add Scene 3 — Market and Legal Pressure`

---

### Task 12: Scene 4 — The Solution

**Files:**
- Create: `video/src/scenes/S04_Solution.tsx`

**Duration:** 750 frames (25s)

Key elements:
- Section label: "OUR SOLUTION" (delay: 0)
- `AnimatedText` headline: "NeuroEdge makes accessibility understandable and actionable" (delay: 10)
  - "understandable" and "actionable" in accent color
- `BrowserMockup` centred (delay: 30) with children showing:
  - A URL input field, then a simulated loading bar, then results text appearing
  - Use frame-based conditional rendering: frames 45-60 show URL, 60-90 show loading, 90+ show results
- Split comparison at frame ~120 (delay: 120):
  - Left `Card` with `borderColor: colors.warning`: title "What they see today", body shows WCAG error code in monospace
  - Right `Card` with `borderColor: colors.accent`: title "What we show them", body shows plain English translation
- `TextHighlight` on "plain English" in the body text

**Commit:** `feat: add Scene 4 — The Solution`

---

### Task 13: Scene 5 — How It Works

**Files:**
- Create: `video/src/scenes/S05_HowItWorks.tsx`

**Duration:** 600 frames (20s)

Key elements:
- Section label: "HOW IT WORKS" (delay: 0)
- `AnimatedText` headline: "URL in. Report out. Five steps." (delay: 10)
- Five `FlowStep` components in a horizontal row with stagger (delay: 30, 55, 80, 105, 130):
  - "01" / "Enter URL" / "User enters their website address"
  - "02" / "Automated Scan" / "axe-core + Pa11y run WCAG 2.2 checks"
  - "03" / "AI Interpretation" / "AI translates violations into plain English"
  - "04" / "Score + Report" / "Branded PDF with score, priority fixes, revenue at risk"
  - "05" / "Walkthrough" / "Optional: human video walkthrough (premium)"
- Each step gets `isActive={true}` when the voiceover mentions it (use frame ranges)
- Last step has `showArrow={false}`

**Commit:** `feat: add Scene 5 — How It Works`

---

### Task 14: Scene 6 — Customer & Pricing

**Files:**
- Create: `video/src/scenes/S06_CustomerAndPricing.tsx`

**Duration:** 750 frames (25s)

Key elements:
- Section label: "IDEAL CUSTOMER" (delay: 0)
- `AnimatedText` headline: "UK SMEs with 5-50 employees who've never heard of WCAG" (delay: 10)
- Four pricing `Card` components in a row (delay: 40, 55, 70, 85):
  - badge "FREE" / title "Quick Score" / body: instant score + top 3 issues
  - badge "£29-49" / title "Full Report" / border accent / body: full PDF
  - badge "£99" / title "Report + Walkthrough" / body: 30-min video call
  - badge "£19/mo" / title "Monitoring Agent" / body: weekly scans, alerts
- The £19/mo card gets `style={{ border: '1px solid ' + colors.accent }}` and a glow effect
- `CountUp` for ARR: value 22800, prefix "£", suffix " ARR", color gold (delay: 120)

**Commit:** `feat: add Scene 6 — Customer and Pricing`

---

### Task 15: Scene 7 — Competition

**Files:**
- Create: `video/src/scenes/S07_Competition.tsx`

**Duration:** 450 frames (15s)

Key elements:
- Section label: "COMPETITIVE POSITIONING" (delay: 0)
- `AnimatedText` headline: "We're not competing with enterprise tools. We're filling the gap below them." (delay: 10)
- `BarChart` with four items (delay: 30):
  - "WAVE / axe (free)" / sublabel: "Developers" / value: 20
  - "Siteimprove / Level Access" / sublabel: "£5,000+/yr" / value: 90
  - "accessiBe / UserWay" / sublabel: "Controversial" / value: 50
  - "NeuroEdge" / sublabel: "£29-99" / value: 40 / highlight: true
- Simple, clean — no clutter

**Commit:** `feat: add Scene 7 — Competitive Positioning`

---

### Task 16: Scene 8 — The Team

**Files:**
- Create: `video/src/scenes/S08_Team.tsx`

**Duration:** 600 frames (20s)

Key elements:
- Section label: "THE TEAM" (delay: 0)
- `AnimatedText` headline: "Conversion expertise + rapid technical execution" (delay: 10)
- `TeamMember` for Shashwati (delay: 30):
  - name, role "Lead Founder — Strategy & Methodology"
  - bio from design doc
  - imageSrc: "shashwati.jpeg"
  - tags: ["Ad Optimisation", "Conversion Testing", "Disability-Inclusive Marketing"]
- `TeamMember` for Vedant (delay: 90, appears when his voiceover starts):
  - name, role "Co-founder — Technical"
  - bio from design doc
  - imageSrc: "vedant.jpeg"
  - tags: ["Product Engineering", "AI Pipeline", "Agency Co-founder"]

**Commit:** `feat: add Scene 8 — The Team`

---

### Task 17: Scene 9 — Roadmap & Funds

**Files:**
- Create: `video/src/scenes/S09_RoadmapAndFunds.tsx`

**Duration:** 750 frames (25s)

Key elements:
- Section label: "USE OF FUNDS" (delay: 0)
- `AnimatedText` headline: "£5,000 — every pound accounted for" (delay: 10)
- Budget items as a simple list with `CountUp` for amounts (delays staggered 20, 26, 32, 38):
  - User research: £500
  - Marketing & outreach: £1,000
  - AI infrastructure: £400
  - "Design, legal, workshops, stipends" (remaining)
  - Total: £5,000 (bold, accent border flash)
- Transition at frame ~350 to roadmap:
  - Six `TimelineItem` components (stagger delay: 360, 375, 390, 405, 420, 435):
    - M1 April — Foundation
    - M2 May — Pilot
    - M3 June — Public Launch
    - M4 July — Outreach + Agent Build
    - M5 August — Revenue + Agent Launch
    - M6 September — Target (isActive: true, gold highlight)
  - September targets: 100 customers, 30 subscribers, 3 agency partnerships
  - Two `CountUp` side by side in gold: £5,000+ (6-month revenue) and £22,800 ARR (at 100 subscribers)

**Commit:** `feat: add Scene 9 — Roadmap and Use of Funds`

---

### Task 18: Scene 10 — The Ask & Close

**Files:**
- Create: `video/src/scenes/S10_AskAndClose.tsx`

**Duration:** 600 frames (20s)

Key elements:
- First half (frames 0-300): Impact
  - Three `Card` components in a row (delay: 10, 25, 40):
    - icon "♿" / title "Disabled consumers" / body: barriers identified, access improved
    - icon "🏪" / title "Small businesses" / body: legal obligations, £274B market, under £100
    - icon "🎓" / title "The university" / body: student venture, measurable impact
- Second half (frames 300-600): Close
  - Cards fade out (use opacity interpolation from frame 280-310)
  - "NeuroEdge" large text (DM Serif Display, 72px) fades in centred (delay: 320)
  - Tagline: "AI-powered accessibility audits for UK SMEs" (delay: 345, smaller, secondary color)
  - Founders' names + "University of Liverpool" + "Design Your Future 2026" (delay: 370)
  - Hold for final 60 frames (2 seconds) with everything static
  - Floating orbs slow down (reduce speed multiplier in the last 90 frames)

**Commit:** `feat: add Scene 10 — The Ask and Close`

---

## Phase 4: Composition & Audio

### Task 19: Wire Up Video.tsx with Series

**Files:**
- Modify: `video/src/Video.tsx`

**Step 1: Import all scenes and wire with `<Series>`**

```tsx
// video/src/Video.tsx
import { Series } from "remotion";
import { S01_ColdOpen } from "./scenes/S01_ColdOpen";
import { S02_ProblemStats } from "./scenes/S02_ProblemStats";
import { S03_MarketAndLaw } from "./scenes/S03_MarketAndLaw";
import { S04_Solution } from "./scenes/S04_Solution";
import { S05_HowItWorks } from "./scenes/S05_HowItWorks";
import { S06_CustomerAndPricing } from "./scenes/S06_CustomerAndPricing";
import { S07_Competition } from "./scenes/S07_Competition";
import { S08_Team } from "./scenes/S08_Team";
import { S09_RoadmapAndFunds } from "./scenes/S09_RoadmapAndFunds";
import { S10_AskAndClose } from "./scenes/S10_AskAndClose";

export const Video: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={600}>
        <S01_ColdOpen />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <S02_ProblemStats />
      </Series.Sequence>
      <Series.Sequence durationInFrames={750}>
        <S03_MarketAndLaw />
      </Series.Sequence>
      <Series.Sequence durationInFrames={750}>
        <S04_Solution />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <S05_HowItWorks />
      </Series.Sequence>
      <Series.Sequence durationInFrames={750}>
        <S06_CustomerAndPricing />
      </Series.Sequence>
      <Series.Sequence durationInFrames={450}>
        <S07_Competition />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <S08_Team />
      </Series.Sequence>
      <Series.Sequence durationInFrames={750}>
        <S09_RoadmapAndFunds />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <S10_AskAndClose />
      </Series.Sequence>
    </Series>
  );
};
```

Total: 600+600+750+750+600+750+450+600+750+600 = 6,450 frames = 215 seconds = 3:35

**Step 2: Preview full video end-to-end**

```bash
npx remotion preview
```

Scrub through all scenes. Verify transitions, timing, and visual quality.

**Step 3: Commit**

```bash
git add video/src/Video.tsx
git commit -m "feat: wire all 10 scenes into Video composition with Series"
```

---

### Task 20: Audio Integration

**Files:**
- Modify: `video/src/Video.tsx` (add `<Audio>` elements)
- Add: audio files to `video/public/audio/`

**Step 1: Source audio assets**

Background music: Find a royalty-free ambient/electronic track (suggestions: Pixabay, freesound.org, or YouTube Audio Library). Download and place at `video/public/audio/bgm.mp3`.

Sound effects: Find subtle whoosh, tick, and pulse sounds. Place at:
- `video/public/audio/sfx/whoosh.mp3`
- `video/public/audio/sfx/tick.mp3`
- `video/public/audio/sfx/pulse.mp3`

**Step 2: Generate AI TTS placeholder voiceover**

Use OpenAI TTS API or ElevenLabs to generate voiceover for each scene. Use the scripts from the design doc. Generate one file per scene per speaker:

- `video/public/audio/shashwati/s01.mp3`
- `video/public/audio/vedant/s02.mp3`
- `video/public/audio/shashwati/s03.mp3`
- `video/public/audio/vedant/s04.mp3`
- `video/public/audio/shashwati/s05.mp3`
- `video/public/audio/vedant/s06.mp3`
- `video/public/audio/shashwati/s07.mp3`
- `video/public/audio/shashwati/s08.mp3` + `video/public/audio/vedant/s08.mp3`
- `video/public/audio/shashwati/s09.mp3`
- `video/public/audio/vedant/s10a.mp3` + `video/public/audio/shashwati/s10b.mp3`

**Step 3: Add audio to Video.tsx**

```tsx
import { Audio, staticFile, interpolate, useCurrentFrame } from "remotion";

// Inside Video component, before <Series>:
const frame = useCurrentFrame();
const bgmVolume = interpolate(frame, [0, 30, 6420, 6450], [0, 0.15, 0.15, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// Add before <Series>:
<Audio src={staticFile("audio/bgm.mp3")} volume={bgmVolume} />
```

Add voiceover `<Audio>` elements inside each `<Series.Sequence>` or use `<Sequence>` with frame offsets for precise placement.

For scenes with two speakers (S08, S10), place two `<Audio>` elements with appropriate `startFrom` offsets.

**Step 4: Preview with audio**

```bash
npx remotion preview
```

Verify audio sync, volume levels, and ducking.

**Step 5: Commit**

```bash
git add video/public/audio/ video/src/Video.tsx
git commit -m "feat: add audio layers — background music, voiceover, SFX"
```

---

### Task 21: Final Render

**Step 1: Render to MP4**

```bash
cd /Users/ved/Downloads/NeuroEdge/video
npx remotion render NeuroEdgePitch out/neuroedge-pitch.mp4
```

**Step 2: Verify output**

- Check file size (must be under 2GB for WeTransfer)
- Watch full video end-to-end
- Verify audio sync
- Check total duration is under 6 minutes

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: render final pitch video"
```

---

## Audio File Swap (Post-Recording)

Once Shashwati and Vedant record real voiceovers:

1. Replace AI TTS files in `video/public/audio/shashwati/` and `video/public/audio/vedant/` with real recordings
2. Adjust frame timings in scenes if real recordings have different pacing
3. Re-render: `npx remotion render NeuroEdgePitch out/neuroedge-pitch-final.mp4`

---

## Summary

| Phase | Tasks | What |
|-------|-------|------|
| 1: Foundation | 1-3 | Scaffold, design system, core layout components |
| 2: Components | 4-8 | Animation components (text, stats, charts, mockup, team) |
| 3: Scenes | 9-18 | All 10 scenes |
| 4: Audio & Render | 19-21 | Wire composition, integrate audio, render |

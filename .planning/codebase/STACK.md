# Technology Stack

**Analysis Date:** 2026-03-07

## Languages

**Primary:**
- TypeScript 5.7+ - All source code in `video/src/`
- HTML/CSS - Static pitch deck in `PitchDeck/index.html`

**Secondary:**
- None

## Runtime

**Environment:**
- Node.js (required by Remotion CLI)
- Remotion rendering engine (Chromium-based headless rendering)

**Package Manager:**
- npm
- Lockfile: `video/package-lock.json` (present)

## Frameworks

**Core:**
- Remotion 4.0.434 - Programmatic video generation using React components
- React 19.0.0 - UI component framework (used as Remotion's rendering layer)
- React DOM 19.0.0 - DOM rendering for Remotion Studio preview

**Testing:**
- Not detected (no test framework configured)

**Build/Dev:**
- TypeScript 5.7+ - Type checking and compilation
- Remotion CLI (`@remotion/cli` 4.0.434) - Studio dev server and video rendering
- tsconfig target: ES2022, module resolution: bundler

## Key Dependencies

**Critical:**
- `remotion` 4.0.434 - Core video composition API (Composition, Series, AbsoluteFill, useCurrentFrame, interpolate, spring)
- `@remotion/cli` 4.0.434 - Development studio and render pipeline
- `@remotion/google-fonts` ^4.0.434 - Font loading (DM Serif Display, DM Sans, JetBrains Mono)
- `@remotion/paths` ^4.0.434 - SVG path utilities for animations

**Infrastructure:**
- `@types/react` ^19.0.0 - TypeScript type definitions for React

## Configuration

**TypeScript:**
- Config: `video/tsconfig.json`
- Target: ES2022
- JSX: react-jsx
- Strict mode enabled
- Output: `video/dist/`

**Build:**
- Render command: `npx remotion render NeuroEdgePitch`
- Dev studio: `npx remotion studio`
- Preview: `npx remotion preview`

**Video Output:**
- Resolution: 1920x1080 (Full HD)
- Frame rate: 30 FPS
- Duration: 215 seconds (~3.5 minutes)
- Composition ID: `NeuroEdgePitch`
- Output directory: `video/out/`

**Environment:**
- No `.env` files detected
- No environment variables required
- No secrets or API keys needed

## Platform Requirements

**Development:**
- Node.js (version not pinned, Remotion 4.x requires Node 18+)
- npm for dependency management
- Chromium (bundled by Remotion for rendering)

**Production:**
- Renders to static video file (MP4/WebM)
- No server deployment needed
- `PitchDeck/index.html` is a standalone static HTML file (no build step)

---

*Stack analysis: 2026-03-07*

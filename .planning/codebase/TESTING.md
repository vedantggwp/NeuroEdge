# Testing Patterns

**Analysis Date:** 2026-03-07

## Test Framework

**Runner:**
- None configured

**Assertion Library:**
- None installed

**Run Commands:**
```bash
# No test commands available
# package.json scripts: start, build, preview only
```

## Test File Organization

**Location:**
- No test files exist anywhere in the codebase

**Naming:**
- Not established — no `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files found

**Structure:**
- Not applicable

## Current State

This codebase has **zero test coverage**. There are no test files, no test framework dependencies, no test configuration, and no test-related npm scripts.

The `video/package.json` contains only runtime and type dependencies:
- `remotion`, `@remotion/cli`, `@remotion/google-fonts`, `@remotion/paths`
- `react`, `react-dom`
- `@types/react`, `typescript`

No testing libraries (Jest, Vitest, Playwright, Testing Library, etc.) are installed.

## Recommended Setup

If testing is added to this project, the following approach aligns with the Remotion ecosystem:

**Framework:** Vitest (fast, TypeScript-native, compatible with Remotion's bundler)

**Config file:** `video/vitest.config.ts`

**Install:**
```bash
npm install -D vitest @testing-library/react jsdom
```

**Recommended test script in `video/package.json`:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## What Could Be Tested

**Unit Tests (highest value):**
- Animation helper functions in `video/src/lib/animations.ts` — pure functions (`fadeInUp`, `fadeInScale`, `sceneFade`, `staggerDelay`) with deterministic outputs
- Theme constants in `video/src/lib/theme.ts` — snapshot tests to prevent accidental color/spacing changes

**Component Tests (medium value):**
- Reusable components (`AnimatedText`, `Card`, `StatBlock`, `CountUp`, `DonutChart`, `BarChart`) — render with known props and assert output structure
- Requires Remotion test helpers to mock `useCurrentFrame()` and `useVideoConfig()`

**Snapshot Tests (low-effort value):**
- Scene components — snapshot tests to detect unintended visual regressions in JSX structure

## Test Types

**Unit Tests:**
- Not implemented
- Best candidates: `video/src/lib/animations.ts` (4 pure functions)

**Integration Tests:**
- Not applicable — no API, database, or backend logic

**E2E Tests:**
- Not applicable in traditional sense
- Remotion provides `npx remotion render` which validates that the composition renders without errors — this serves as a basic smoke test

## Mocking

**Framework:** Not applicable

**What Would Need Mocking:**
- Remotion hooks: `useCurrentFrame()`, `useVideoConfig()`, `spring()`
- Static file loading: `staticFile()` used in `TeamMember.tsx`

## Coverage

**Requirements:** None enforced
**Current coverage:** 0%

---

*Testing analysis: 2026-03-07*

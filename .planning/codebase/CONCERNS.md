# Codebase Concerns

**Analysis Date:** 2026-03-07

## Tech Debt

**HTML Entities Used Instead of Unicode Characters:**
- Issue: `video/src/scenes/S10_AskAndClose.tsx` (lines 148, 159) uses HTML entities (`&amp;` and `&middot;`) inside JSX text content. React renders these as literal text strings, not as `&` and `·`. The rendered video will display `&amp;` and `&middot;` as raw text.
- Files: `video/src/scenes/S10_AskAndClose.tsx`
- Impact: The closing slide displays garbled text for founder names and institution line.
- Fix approach: Replace `&amp;` with `&` and `&middot;` with `\u00B7` or the literal `·` character.

**No `.gitignore` File:**
- Issue: The project has no `.gitignore` at either root or `video/` level. `node_modules/` and build output (`video/out/`) are untracked but could be accidentally staged. `.DS_Store` files are already showing up in the working tree.
- Files: `/` (root), `video/`
- Impact: Risk of committing `node_modules/` (huge), build artifacts, and OS files. Increases repo size and pollutes diffs.
- Fix approach: Add a `.gitignore` with standard Node.js exclusions: `node_modules/`, `dist/`, `out/`, `.DS_Store`, `*.env`.

**Duplicated Duration Constants Between `Video.tsx` and Scene Files:**
- Issue: Each scene defines its own `const DURATION` (e.g., 600, 750, 450) and `Video.tsx` independently hard-codes `durationInFrames` values in each `<Series.Sequence>`. These must be kept in sync manually. Currently they match, but any future edit to one without the other will cause animation timing to break silently.
- Files: `video/src/Video.tsx`, all files in `video/src/scenes/`
- Impact: If durations drift, scene transitions will either clip content or show blank frames. The `SceneTransition` component uses `durationInFrames` for exit fades, so a mismatch causes broken fade-outs.
- Fix approach: Export `DURATION` from each scene file and import it in `Video.tsx`, or define all durations in a shared config (`video/src/lib/timing.ts`).

**Repeated Boilerplate Across All 10 Scenes:**
- Issue: Every scene file imports and renders the same background layer stack: `<GradientBackground />`, `<FloatingOrbs />`, `<NoiseOverlay />`, and wraps content in `<SceneTransition>`. This is copy-pasted 10 times.
- Files: All `video/src/scenes/S01_ColdOpen.tsx` through `video/src/scenes/S10_AskAndClose.tsx`
- Impact: Any change to the background layer (e.g., adding a vignette, changing orb count) requires editing all 10 scene files. Increases maintenance burden and risk of inconsistency.
- Fix approach: Create a `<SceneLayout>` wrapper component that composes `GradientBackground`, `FloatingOrbs`, `NoiseOverlay`, and `SceneTransition`. Each scene would then only provide its unique content.

**Repeated Section Label Pattern:**
- Issue: The "section label" pattern (mono font, uppercase, letter-spacing 4, accent color, spring-animated translateY) is duplicated across S04, S05, S06, S07, S08, and S09. Each reimplements the same spring animation and styling inline.
- Files: `video/src/scenes/S04_Solution.tsx`, `video/src/scenes/S05_HowItWorks.tsx`, `video/src/scenes/S06_CustomerAndPricing.tsx`, `video/src/scenes/S07_Competition.tsx`, `video/src/scenes/S08_Team.tsx`, `video/src/scenes/S09_RoadmapAndFunds.tsx`
- Impact: Inconsistency risk. Any style update must be replicated in 6+ files.
- Fix approach: Extract a `<SectionLabel text="..." />` component into `video/src/components/`.

**`spacing` Constants Defined but Never Used:**
- Issue: `video/src/lib/theme.ts` exports a `spacing` object with `page`, `gap.sm`, `gap.md`, `gap.lg` values. No scene or component imports or uses these constants. All scenes hardcode padding as `"64px 100px"` and gaps as literal numbers (24, 32, etc.).
- Files: `video/src/lib/theme.ts`, all scene files
- Impact: Dead code. The spacing values exist to enforce consistency but are bypassed everywhere.
- Fix approach: Either use `spacing.page.x`, `spacing.page.y`, `spacing.gap.*` throughout scene files, or remove the unused exports.

**Unused `SPRING_CONFIG` Import in `S08_Team.tsx`:**
- Issue: `S08_Team.tsx` imports `SPRING_CONFIG` from `../lib/animations` and also imports `spring` directly from `remotion` on a separate line (line 12), duplicating the `spring` import already present on line 2.
- Files: `video/src/scenes/S08_Team.tsx`
- Impact: Minor. Redundant import line, no functional bug.
- Fix approach: Remove the duplicate `import { spring } from "remotion"` on line 12; `spring` is already imported on line 2.

## Known Bugs

**HTML Entities Rendered as Literal Text in Closing Slide:**
- Symptoms: The closing slide (S10) shows `Shashwati Bhosale &amp; Vedant Gaikwad` and `University of Liverpool &middot; Design Your Future 2026` with raw entity text instead of `&` and `·`.
- Files: `video/src/scenes/S10_AskAndClose.tsx` (lines 148, 159)
- Trigger: Render the video to the final scene.
- Workaround: None currently. Must fix the source.

**`S01_ColdOpen` contentOpacity Interpolation Has a Dead Zone:**
- Symptoms: The `contentOpacity` interpolation at line 22 maps frames `[0, 14, 15, 30]` to `[0, 0, 0, 1]`. This means frames 0-15 show opacity 0 (content invisible), then it ramps from 0 to 1 between frames 15-30. The segment from frame 0-14 mapping to `[0, 0]` is redundant but harmless. However, this creates a hard 0.5-second black screen at the start of the video with no visual feedback.
- Files: `video/src/scenes/S01_ColdOpen.tsx` (line 22)
- Trigger: Play the video from the beginning.
- Workaround: Intentional design choice or oversight. The background (`colors.bg.dark`) shows during this gap.

## Security Considerations

**No Secrets or Sensitive Data Detected:**
- Risk: Minimal. This is a Remotion video project with no backend, no API keys, no authentication, and no network requests.
- Files: N/A
- Current mitigation: N/A
- Recommendations: Add a `.gitignore` to prevent accidental inclusion of `.env` files if the project grows to include API integrations.

## Performance Bottlenecks

**FloatingOrbs Re-renders Every Frame with Modulo Arithmetic:**
- Problem: `FloatingOrbs` component uses `frame % orb.speed` for 5 orbs, calling `interpolate()` twice per orb (10 calls total) on every frame. The modulo creates non-monotonic input ranges, which Remotion's `interpolate` handles but which could produce unexpected jumps at cycle boundaries.
- Files: `video/src/components/FloatingOrbs.tsx`
- Cause: The interpolation resets at cycle boundaries when `frame % speed` wraps from `speed` back to `0`. The visual effect is a subtle position jump.
- Improvement path: Use `Math.sin(frame / speed * Math.PI * 2)` for smooth continuous loops instead of modulo-based interpolation with resets.

**All 10 Scenes Rendered in DOM Simultaneously:**
- Problem: The `<Series>` component from Remotion renders all sequences. While Remotion optimizes off-screen sequences, each scene renders `FloatingOrbs` (5 divs with blur filters) and `NoiseOverlay` independently. During rendering, this means 50+ blurred elements across all scenes exist in the tree.
- Files: `video/src/Video.tsx`, all scene files
- Cause: Each scene independently renders its own background stack.
- Improvement path: Move the background layer (`GradientBackground`, `FloatingOrbs`, `NoiseOverlay`) to a single instance in `Video.tsx` that wraps the `<Series>`, so only one set of background elements exists.

## Fragile Areas

**Scene Timing Synchronization:**
- Files: `video/src/Video.tsx`, `video/src/Root.tsx`, all scene files
- Why fragile: Three independent locations define timing: `Root.tsx` sets total duration (215s * 30fps = 6450 frames), `Video.tsx` sets per-scene durations (must sum to 6450), and each scene's `DURATION` constant controls internal animation timing. All three must agree.
- Safe modification: When changing any scene duration, update all three locations. Verify the sum of `Video.tsx` durations equals `FPS * DURATION_SECONDS` in `Root.tsx`.
- Test coverage: None. No tests exist.

**Hardcoded Frame Numbers for Phase Transitions:**
- Files: `video/src/scenes/S03_MarketAndLaw.tsx`, `video/src/scenes/S09_RoadmapAndFunds.tsx`, `video/src/scenes/S10_AskAndClose.tsx`
- Why fragile: Several scenes use multi-phase layouts where content fades in/out at hardcoded frame numbers (e.g., `interpolate(frame, [330, 350], [1, 0])`). These frame values are not derived from the scene's `DURATION` constant, so resizing a scene breaks the phase transitions.
- Safe modification: Express phase transition frames as fractions of `DURATION` (e.g., `DURATION * 0.44` instead of `330`).
- Test coverage: None.

## Scaling Limits

**Single Composition, Linear Scene Sequence:**
- Current capacity: 10 scenes, 215 seconds total.
- Limit: Adding more scenes increases the total frame count, render time, and memory usage linearly. No mechanism for selective rendering of individual scenes during development.
- Scaling path: Use Remotion's `<Composition>` per scene for isolated development and preview, then assemble in a master composition for final render.

## Dependencies at Risk

**React 19 with Remotion:**
- Risk: `package.json` specifies `react: ^19.0.0` and `react-dom: ^19.0.0`. Remotion 4.0.434 may have edge-case compatibility issues with React 19 concurrent features. Remotion's official docs recommend React 18 for production.
- Impact: Potential rendering artifacts or hydration warnings during studio preview.
- Migration plan: Pin to `react@18.3.1` and `react-dom@18.3.1` if issues arise. Monitor Remotion changelog for React 19 official support.

## Missing Critical Features

**No Audio Integration:**
- Problem: The `video/src/assets/audio/` directories exist (`sfx/`, `vedant/`, `shashwati/`) but are completely empty. No scene imports or uses any audio. The pitch video renders as a silent animation.
- Blocks: Final video delivery requires voiceover and sound effects. Audio timing will need to be synchronized with scene transitions and animation delays.

**No Tests:**
- Problem: Zero test files exist in the project. No test framework is configured. No test script in `package.json`.
- Blocks: Cannot verify scene rendering, animation timing, or component behavior automatically. All validation is manual visual inspection via Remotion studio.

**No Linting or Formatting Configuration:**
- Problem: No `.eslintrc`, `eslint.config.*`, `.prettierrc`, or `biome.json` exists. Code style is enforced only by convention.
- Blocks: Multi-developer contributions may introduce inconsistent formatting.

## Test Coverage Gaps

**No Tests Exist:**
- What's not tested: Everything. Scene rendering, component props, animation math, theme values, font loading, timing calculations.
- Files: All files in `video/src/`
- Risk: Animation regressions, broken interpolations, and timing mismatches go undetected. The HTML entity bug in S10 would have been caught by a snapshot test.
- Priority: Medium. For a pitch video project, visual inspection via Remotion studio is the primary QA method. However, snapshot tests for static content and unit tests for animation utilities (`video/src/lib/animations.ts`) would catch the most impactful regressions.

---

*Concerns audit: 2026-03-07*

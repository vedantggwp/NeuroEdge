# Shashwati Audio Integration Log

## Status: COMPLETE (2026-03-08)

## Step Plan
1. Rename files + ffprobe durations → calculate fit
2. Decide pacing strategy per scene (speed up / slow down / trim silence)
3. Update AudioLayer.tsx (uncomment, add rates, durations)
4. Update BGM ducking ranges
5. Fix SFX conflicts (whooshes now overlap with VO)
6. Adjust subtitle timings for playback rate changes
7. Preview & verify

## File Mapping (confirmed from SHASHWATI-RECORDING-GUIDE.md)
| Her filename | Target filename | Scene | Scene frames | Scene duration |
|---|---|---|---|---|
| Sarah_s Story.mp3 | s01_cold_open.mp3 | S01 | 750f | 25.0s |
| The Problem.mp3 | s02_problem.mp3 | S02 | 600f | 20.0s |
| The money and the law.mp3 | s03_market.mp3 | S03 | 600f | 20.0s |
| Customers and pricing.mp3 | s06_customer.mp3 | S06 | 600f | 20.0s |
| Your Intro.mp3 | s08_team_shashwati.mp3 | S08 | 450f (first 180f) | 6.0s |
| The plan and the ask.mp3 | s09_roadmap.mp3 | S09 | 600f | 20.0s |
| The flowers arrive.mp3 | s10_close.mp3 | S10 | 600f | 20.0s |

Note: S08 Shashwati plays frames 0-180 of scene (6s), then Vedant at frame 180.

---

## Step 1: Rename + Duration Probe
Status: DONE

All 7 files renamed successfully.

### Duration Analysis

| File | Audio dur | Scene avail (minus 5f offset) | Audio frames | Avail frames | Overflow | Rate needed |
|---|---|---|---|---|---|---|
| s01_cold_open.mp3 | 25.81s | 24.83s (745f) | 774f | 745f | +29f (1.0s) | 1.04x |
| s02_problem.mp3 | 20.17s | 19.83s (595f) | 605f | 595f | +10f (0.3s) | 1.02x |
| s03_market.mp3 | 21.85s | 19.83s (595f) | 656f | 595f | +61f (2.0s) | 1.10x |
| s06_customer.mp3 | 24.98s | 19.83s (595f) | 749f | 595f | +154f (5.1s) | 1.26x |
| s08_team_shashwati.mp3 | 8.61s | 5.83s (175f) | 258f | 175f | +83f (2.8s) | 1.47x |
| s09_roadmap.mp3 | 26.63s | 19.83s (595f) | 799f | 595f | +204f (6.8s) | 1.34x |
| s10_close.mp3 | 23.34s | 19.83s (595f) | 700f | 595f | +105f (3.5s) | 1.18x |

### Pacing Problems (flagged for Step 2 decision)
- **S01**: 1.04x — barely over, fine to speed up
- **S02**: 1.02x — barely over, fine to speed up
- **S03**: 1.10x — noticeable but acceptable speedup
- **S06**: 1.26x — PROBLEMATIC — will sound noticeably fast
- **S08**: 1.47x — PROBLEMATIC — will sound chipmunk-like
- **S09**: 1.34x — PROBLEMATIC — will sound noticeably fast
- **S10**: 1.18x — borderline, may be acceptable

---

## Step 2: Trim Silences + Final Rates
Status: DONE

Trimmed S06, S08, S09. Originals backed up as `*_original.mp3`.

### Final Duration & Rate Table (all 7 Shashwati files)

| File | Duration | Avail (scene - 5f offset) | Audio frames | Avail frames | Rate |
|---|---|---|---|---|---|
| s01_cold_open.mp3 | 25.81s | 24.83s | 774f | 745f | 1.04x |
| s02_problem.mp3 | 20.17s | 19.83s | 605f | 595f | 1.02x |
| s03_market.mp3 | 21.85s | 19.83s | 656f | 595f | 1.10x |
| s06_customer.mp3 | 22.63s (trimmed) | 19.83s | 679f | 595f | 1.14x |
| s08_team_shashwati.mp3 | 6.38s (trimmed) | 5.83s | 192f | 175f | 1.10x |
| s09_roadmap.mp3 | 24.05s (trimmed) | 19.83s | 721f | 595f | 1.21x |
| s10_close.mp3 | 23.34s | 19.83s | 700f | 595f | 1.18x |

Note: S09 came out 1.21x instead of expected 1.18x — mid-gap compression recovered less than estimated. Still acceptable per user approval.

---

## Step 2.5: Whisper Subtitle Sync
Status: DONE

- Ran Whisper `small` model on all 7 files → word-level timestamps
- Mapped words to subtitle lines, converted to frames with rate scaling
- Fixed 1-frame overlaps between adjacent lines
- All entries within scene boundaries
- Raw timestamps saved: `public/audio/voiceover/whisper_timestamps.json`

### Final Playback Rates
| Scene | Rate |
|---|---|
| S01 | 1.04x |
| S02 | 1.02x |
| S03 | 1.10x |
| S06 | 1.14x |
| S08 | 1.10x |
| S09 | 1.21x |
| S10 | 1.18x |

---

## Step 3: Update AudioLayer.tsx + subtitles.ts
Status: DONE

### 3a. subtitles.ts — Replace Shashwati scene entries with these frame-accurate values:

```typescript
// S01: Sarah's Morning (750 frames / 25s) — Audio: 25.81s @ 1.04x
export const SUBTITLES_S01: readonly SubtitleEntry[] = [
  { text: "This is Sarah.", start: 5, end: 41 },
  { text: "She\u2019s 34, she lives in Liverpool, and she\u2019s partially sighted.", start: 58, end: 165 },
  { text: "This morning, she wants to order birthday flowers for her mum.", start: 176, end: 256 },
  { text: "She finds a local florist online \u2014 Bloom and Petal. Beautiful website.", start: 257, end: 394 },
  { text: "But when her screen reader hits the checkout button\u2026 nothing happens.", start: 414, end: 517 },
  { text: "No label. No focus. The page just stops.", start: 526, end: 599 },
  { text: "Sarah tries three more times. Then she closes the tab.", start: 622, end: 709 },
] as const;

// S02: Sarah Isn't Alone (600 frames / 20s) — Audio: 20.17s @ 1.02x
export const SUBTITLES_S02: readonly SubtitleEntry[] = [
  { text: "Sarah isn\u2019t alone.", start: 5, end: 47 },
  { text: "94.8% of the top million websites have accessibility failures.", start: 61, end: 187 },
  { text: "That\u2019s 51 errors per homepage.", start: 207, end: 273 },
  { text: "And in the UK, 24% of the population \u2014 16 million people \u2014 are now disabled.", start: 292, end: 434 },
  { text: "Most businesses have no idea their websites are shutting them out.", start: 435, end: 565 },
] as const;

// S03: The Money & The Law (600 frames / 20s) — Audio: 21.85s @ 1.10x
export const SUBTITLES_S03: readonly SubtitleEntry[] = [
  { text: "Those 16 million people control 274 billion pounds a year in spending.", start: 42, end: 167 },
  { text: "7 in 10 of them click away from sites they can\u2019t use.", start: 180, end: 252 },
  { text: "And here\u2019s what most business owners don\u2019t realise \u2014 this isn\u2019t optional.", start: 253, end: 343 },
  { text: "The Equality Act 2010 makes it a legal obligation.", start: 344, end: 421 },
  { text: "The European Accessibility Act is now in force.", start: 422, end: 514 },
  { text: "This isn\u2019t coming. It\u2019s here.", start: 515, end: 551 },
] as const;

// S06: Who We Serve & What It Costs (600 frames / 20s) — Audio: 22.63s @ 1.14x
export const SUBTITLES_S06: readonly SubtitleEntry[] = [
  { text: "We built this for UK SMEs \u2014 5 to 50 employees, businesses that have never heard of WCAG.", start: 5, end: 159 },
  { text: "A free scan gives them their score and top 3 issues.", start: 170, end: 262 },
  { text: "Full report: 29 to 49 pounds. Video walkthrough: 99 pounds.", start: 263, end: 365 },
  { text: "And our monitoring agent checks weekly for 19 pounds a month \u2014 recurring revenue.", start: 373, end: 519 },
  { text: "100 subscribers gets us to 22,800 pounds ARR.", start: 520, end: 589 },
] as const;

// S08: The Team — Shashwati part (frames 0-175 of scene) — Audio: 6.38s @ 1.10x
// (Vedant subtitles at frame 180+ unchanged)
export const SUBTITLES_S08: readonly SubtitleEntry[] = [
  { text: "I\u2019m Shashwati \u2014 MSc Advanced Marketing.", start: 5, end: 69 },
  { text: "I design the audit methodology, the reports, and the go-to-market.", start: 77, end: 165 },
  // Vedant (from ElevenLabs, unchanged):
  { text: "I\u2019m Vedant \u2014 MSc Computer Science, former agency co-founder.", start: 180, end: 309 },
  { text: "I build the scanning engine, the AI pipeline, and the product.", start: 316, end: 440 },
] as const;

// S09: The Plan & The Ask (600 frames / 20s) — Audio: 24.05s @ 1.21x
export const SUBTITLES_S09: readonly SubtitleEntry[] = [
  { text: "We\u2019re asking for 5,000 pounds.", start: 5, end: 48 },
  { text: "500 for user research with disabled testers. 1,000 for marketing. 400 for AI infrastructure.", start: 57, end: 186 },
  { text: "The rest for design, legal, and workshops.", start: 187, end: 255 },
  { text: "April: build the MVP. May: pilot with 20 Liverpool SMEs.", start: 270, end: 364 },
  { text: "By September \u2014 100 customers, 30 monitoring subscribers, and over 5,000 pounds recovered.", start: 365, end: 487 },
  { text: "At 100 subscribers, that\u2019s 22,800 pounds ARR.", start: 499, end: 590 },
] as const;

// S10: The Flowers Arrive (600 frames / 20s) — Audio: 23.34s @ 1.18x
export const SUBTITLES_S10: readonly SubtitleEntry[] = [
  { text: "Three weeks later, the florist at Bloom and Petal runs a NeuroEdge audit.", start: 40, end: 147 },
  { text: "Scores 34 out of 100. Fixes 23 issues \u2014 including that checkout button.", start: 161, end: 301 },
  { text: "Sarah visits again.", start: 302, end: 334 },
  { text: "This time, the flowers arrive on her mum\u2019s birthday.", start: 335, end: 419 },
  { text: "Every audit we sell is a barrier removed, a customer unlocked, and a legal risk reduced.", start: 420, end: 520 },
  { text: "This is NeuroEdge.", start: 521, end: 560 },
] as const;
```

### 3b. AudioLayer.tsx changes needed:

1. **Add Shashwati playback rate constants:**
   ```
   RATE_S01 = 1.04, RATE_S02 = 1.02, RATE_S03 = 1.10
   RATE_S06 = 1.14, RATE_S08S = 1.10, RATE_S09 = 1.21, RATE_S10 = 1.18
   ```

2. **Add Shashwati VO position constants** (same pattern as Vedant):
   ```
   VO_S01_START = SCENE.S01 + 5 = 5,     DUR = 745
   VO_S02_START = SCENE.S02 + 5 = 755,    DUR = 595
   VO_S03_START = SCENE.S03 + 5 = 1355,   DUR = 595
   VO_S06_START = SCENE.S06 + 5 = 3155,   DUR = 595
   VO_S08S_START = SCENE.S08 + 5 = 4205,  DUR = 175
   VO_S09_START = SCENE.S09 + 5 = 4655,   DUR = 595
   VO_S10_START = SCENE.S10 + 5 = 5255,   DUR = 595
   ```

3. **Uncomment Shashwati `<Sequence>` blocks**, add `durationInFrames` and `playbackRate`

4. **Expand `isVoiceoverPlaying`** to include all Shashwati ranges (for BGM ducking)

5. **Fix SFX conflicts:** Remove transition whooshes on S02, S03, S06, S09, S10 (now overlap with VO). Keep S01 ui_fail SFX (at frame 400, during VO — may need volume reduction or removal)

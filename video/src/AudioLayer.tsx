import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";

/**
 * Audio layer — positioned via absolute frame offsets in the full timeline.
 *
 * Frame Map (30fps):
 *   0-749       S01 Cold Open (Shashwati)       750f
 *   750-1349    S02 Problem Stats (Shashwati)    600f
 *   1350-1949   S03 Market & Law (Shashwati)     600f
 *   1950-2699   S04 Solution (Vedant)            750f
 *   2700-3149   S05 How It Works (Vedant)        450f
 *   3150-3749   S06 Customer & Pricing (Shash)   600f
 *   3750-4199   S07 Competition (Vedant)         450f
 *   4200-4649   S08 Team (Both)                  450f
 *   4650-5249   S09 Roadmap & Funds (Shash)      600f
 *   5250-5849   S10 Ask & Close (Shash)          600f
 */

const TOTAL_FRAMES = 5850;

// Absolute frame where each scene begins
const SCENE = {
  S01: 0,
  S02: 750,
  S03: 1350,
  S04: 1950,
  S05: 2700,
  S06: 3150,
  S07: 3750,
  S08: 4200,
  S09: 4650,
  S10: 5250,
} as const;

// Voiceover start: 5 frames into each scene
const VO_OFFSET = 5;

// ── Vedant playback rates ──
const RATE_S04 = 1.05;
const RATE_S05 = 1.02;

// ── Shashwati playback rates (from trimmed audio / scene fit) ──
const RATE_S01 = 1.04;
const RATE_S02 = 1.02;
const RATE_S03 = 1.10;
const RATE_S06 = 1.14;
const RATE_S08S = 1.10;
const RATE_S09 = 1.21;
const RATE_S10 = 1.18;

// ── Vedant voiceover positions & scene-clamped durations ──
const VO_S04_START = SCENE.S04 + VO_OFFSET;        // 1955
const VO_S04_DUR = 750 - VO_OFFSET;                // 745f
const VO_S05_START = SCENE.S05 + VO_OFFSET;        // 2705
const VO_S05_DUR = 450 - VO_OFFSET;                // 445f
const VO_S07_START = SCENE.S07 + VO_OFFSET;        // 3755
const VO_S07_DUR = 450 - VO_OFFSET;                // 445f
const VO_S08V_START = SCENE.S08 + 180;             // 4380
const VO_S08V_DUR = 450 - 180;                     // 270f

// ── Shashwati voiceover positions & scene-clamped durations ──
const VO_S01_START = SCENE.S01 + VO_OFFSET;        // 5
const VO_S01_DUR = 750 - VO_OFFSET;                // 745f
const VO_S02_START = SCENE.S02 + VO_OFFSET;        // 755
const VO_S02_DUR = 600 - VO_OFFSET;                // 595f
const VO_S03_START = SCENE.S03 + VO_OFFSET;        // 1355
const VO_S03_DUR = 600 - VO_OFFSET;                // 595f
const VO_S06_START = SCENE.S06 + VO_OFFSET;        // 3155
const VO_S06_DUR = 600 - VO_OFFSET;                // 595f
const VO_S08S_START = SCENE.S08 + VO_OFFSET;       // 4205
const VO_S08S_DUR = 175;                           // 175f (Shashwati part only)
const VO_S09_START = SCENE.S09 + VO_OFFSET;        // 4655
const VO_S09_DUR = 600 - VO_OFFSET;                // 595f
const VO_S10_START = SCENE.S10 + VO_OFFSET;        // 5255
const VO_S10_DUR = 600 - VO_OFFSET;                // 595f

export const AudioLayer: React.FC = () => {
  const frame = useCurrentFrame();

  // Duck BGM when any voiceover is playing (all scenes, both speakers)
  const isVoiceoverPlaying =
    // Shashwati
    (frame >= VO_S01_START && frame < VO_S01_START + VO_S01_DUR) ||
    (frame >= VO_S02_START && frame < VO_S02_START + VO_S02_DUR) ||
    (frame >= VO_S03_START && frame < VO_S03_START + VO_S03_DUR) ||
    (frame >= VO_S06_START && frame < VO_S06_START + VO_S06_DUR) ||
    (frame >= VO_S08S_START && frame < VO_S08S_START + VO_S08S_DUR) ||
    (frame >= VO_S09_START && frame < VO_S09_START + VO_S09_DUR) ||
    (frame >= VO_S10_START && frame < VO_S10_START + VO_S10_DUR) ||
    // Vedant
    (frame >= VO_S04_START && frame < VO_S04_START + VO_S04_DUR) ||
    (frame >= VO_S05_START && frame < VO_S05_START + VO_S05_DUR) ||
    (frame >= VO_S07_START && frame < VO_S07_START + VO_S07_DUR) ||
    (frame >= VO_S08V_START && frame < VO_S08V_START + VO_S08V_DUR);

  const bgmVolume = isVoiceoverPlaying ? 0.06 : 0.16;

  // Fade BGM in/out at video boundaries
  const bgmFade = interpolate(
    frame,
    [0, 45, TOTAL_FRAMES - 90, TOTAL_FRAMES],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill>
      {/* ── Background Music (looped, always playing) ── */}
      <Audio
        src={staticFile("audio/bgm.mp3")}
        volume={bgmVolume * bgmFade}
        loop
      />

      {/* ═══ Shashwati Voiceovers ═══ */}

      {/* S01: Cold Open — 1.04x */}
      <Sequence from={VO_S01_START} durationInFrames={VO_S01_DUR} name="VO-S01">
        <Audio src={staticFile("audio/voiceover/s01_cold_open.mp3")} volume={0.92} playbackRate={RATE_S01} />
      </Sequence>

      {/* S02: Problem Stats — 1.02x */}
      <Sequence from={VO_S02_START} durationInFrames={VO_S02_DUR} name="VO-S02">
        <Audio src={staticFile("audio/voiceover/s02_problem.mp3")} volume={0.92} playbackRate={RATE_S02} />
      </Sequence>

      {/* S03: Market & Law — 1.10x */}
      <Sequence from={VO_S03_START} durationInFrames={VO_S03_DUR} name="VO-S03">
        <Audio src={staticFile("audio/voiceover/s03_market.mp3")} volume={0.92} playbackRate={RATE_S03} />
      </Sequence>

      {/* S06: Customer & Pricing — 1.14x */}
      <Sequence from={VO_S06_START} durationInFrames={VO_S06_DUR} name="VO-S06">
        <Audio src={staticFile("audio/voiceover/s06_customer.mp3")} volume={0.92} playbackRate={RATE_S06} />
      </Sequence>

      {/* S08: Team — Shashwati's part (first 175f) — 1.10x */}
      <Sequence from={VO_S08S_START} durationInFrames={VO_S08S_DUR} name="VO-S08-Shashwati">
        <Audio src={staticFile("audio/voiceover/s08_team_shashwati.mp3")} volume={0.92} playbackRate={RATE_S08S} />
      </Sequence>

      {/* S09: Roadmap & Funds — 1.21x */}
      <Sequence from={VO_S09_START} durationInFrames={VO_S09_DUR} name="VO-S09">
        <Audio src={staticFile("audio/voiceover/s09_roadmap.mp3")} volume={0.92} playbackRate={RATE_S09} />
      </Sequence>

      {/* S10: Ask & Close — 1.18x */}
      <Sequence from={VO_S10_START} durationInFrames={VO_S10_DUR} name="VO-S10">
        <Audio src={staticFile("audio/voiceover/s10_close.mp3")} volume={0.92} playbackRate={RATE_S10} />
      </Sequence>

      {/* ═══ Vedant Voiceovers ═══ */}

      {/* S04: Solution — sped up 1.05x to fit 750f scene */}
      <Sequence from={VO_S04_START} durationInFrames={VO_S04_DUR} name="VO-S04">
        <Audio src={staticFile("audio/voiceover/s04_solution.mp3")} volume={0.92} playbackRate={RATE_S04} />
      </Sequence>

      {/* S05: How It Works — sped up 1.02x to fit 450f scene */}
      <Sequence from={VO_S05_START} durationInFrames={VO_S05_DUR} name="VO-S05">
        <Audio src={staticFile("audio/voiceover/s05_how_it_works.mp3")} volume={0.92} playbackRate={RATE_S05} />
      </Sequence>

      {/* S07: Competition — fits naturally */}
      <Sequence from={VO_S07_START} durationInFrames={VO_S07_DUR} name="VO-S07">
        <Audio src={staticFile("audio/voiceover/s07_competition.mp3")} volume={0.92} />
      </Sequence>

      {/* S08: Team — Vedant's part, fits naturally */}
      <Sequence from={VO_S08V_START} durationInFrames={VO_S08V_DUR} name="VO-S08-Vedant">
        <Audio src={staticFile("audio/voiceover/s08_team_vedant.mp3")} volume={0.92} />
      </Sequence>

      {/* ═══ Sound Effects ═══ */}

      {/* S01: UI fail when Sarah's screen reader fails — reduced volume to sit under VO */}
      <Sequence from={SCENE.S01 + 400} name="SFX-fail">
        <Audio src={staticFile("audio/sfx/ui_fail.mp3")} volume={0.25} />
      </Sequence>

      {/* S04: Subtle whoosh at scene open (before VO starts) */}
      <Sequence from={SCENE.S04} name="SFX-whoosh-S04">
        <Audio src={staticFile("audio/sfx/ui_whoosh.mp3")} volume={0.2} />
      </Sequence>

      {/* S06: Chime when pricing cards appear — reduced, plays under VO */}
      <Sequence from={SCENE.S06 + 300} name="SFX-chime-pricing">
        <Audio src={staticFile("audio/sfx/chime.mp3")} volume={0.15} />
      </Sequence>

      {/* S10: Final chime on the closing ask — reduced, plays under VO */}
      <Sequence from={SCENE.S10 + 480} name="SFX-chime-final">
        <Audio src={staticFile("audio/sfx/chime.mp3")} volume={0.18} />
      </Sequence>

      {/* Scene transition whooshes — REMOVED for S02, S03, S06, S09, S10
          (all now have Shashwati VO starting at frame 5, would overlap) */}
    </AbsoluteFill>
  );
};

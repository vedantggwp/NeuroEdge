import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { CinematicText } from "../components/CinematicText";
import { SarahCharacter } from "../components/SarahCharacter";
import { BrowserMockup } from "../components/BrowserMockup";
import { FloristWebsite } from "../components/FloristWebsite";
import { ScreenReaderCursor } from "../components/ScreenReaderCursor";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { Subtitle } from "../components/Subtitle";
import { colors } from "../lib/theme";
import { SUBTITLES_S01 } from "../lib/subtitles";

const DURATION = 750;

const CURSOR_STEPS = [
  { x: 36, y: 58, width: 120, height: 28, delay: 140, duration: 30 },
  { x: 200, y: 58, width: 200, height: 28, delay: 170, duration: 30 },
  { x: 36, y: 120, width: 160, height: 170, delay: 200, duration: 35 },
  { x: 220, y: 120, width: 160, height: 170, delay: 235, duration: 35 },
  { x: 400, y: 120, width: 160, height: 170, delay: 270, duration: 35 },
  { x: 180, y: 340, width: 240, height: 46, delay: 320, duration: 120 },
] as const;

export const S01_ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();

  const introOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const introFadeOut = interpolate(frame, [110, 130], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const websiteOpacity = interpolate(frame, [130, 155], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tabCloseOpacity = interpolate(frame, [460, 520], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const screenDim = interpolate(frame, [520, 580], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION} variant="blur-dissolve" transitionFrames={30}>
        {/* Phase 1: Sarah character + CinematicText intro (frames 0-130) */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: introOpacity * introFadeOut,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
            }}
          >
            <SarahCharacter size={240} delay={5} />
            <CinematicText
              lines={[
                "This is Sarah.",
                "She's 34. She lives in Liverpool.",
                "She's partially sighted.",
              ]}
              startDelay={15}
              delayBetweenLines={30}
              fontSize={44}
            />
          </div>
        </AbsoluteFill>

        {/* Phase 2: FloristWebsite + ScreenReaderCursor (frames 130-460) */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: websiteOpacity * tabCloseOpacity,
          }}
        >
          <div style={{ position: "relative", width: 650, height: 440 }}>
            <BrowserMockup
              url="www.bloomandpetal.co.uk"
              delay={130}
              variant="light"
            >
              <FloristWebsite showCheckout />
            </BrowserMockup>

            <ScreenReaderCursor
              steps={[...CURSOR_STEPS]}
              failAtIndex={5}
            />
          </div>
        </AbsoluteFill>

        {/* Phase 3: Screen dims after tab closes (frames 520-750) */}
        <AbsoluteFill
          style={{
            backgroundColor: colors.bg.dark,
            opacity: screenDim,
          }}
        />
      </SceneTransition>
      <Subtitle entries={SUBTITLES_S01} />
    </AbsoluteFill>
  );
};

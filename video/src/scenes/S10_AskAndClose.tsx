import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { CinematicText } from "../components/CinematicText";
import { SarahCharacter } from "../components/SarahCharacter";
import { BrowserMockup } from "../components/BrowserMockup";
import { FloristWebsite } from "../components/FloristWebsite";
import { ScreenReaderCursor } from "../components/ScreenReaderCursor";
import { ScoreTransition } from "../components/ScoreTransition";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { Subtitle } from "../components/Subtitle";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";
import { SUBTITLES_S10 } from "../lib/subtitles";

const DURATION = 600;

const SUCCESS_CURSOR_STEPS = [
  { x: 36, y: 58, width: 120, height: 28, delay: 10, duration: 20 },
  { x: 200, y: 58, width: 200, height: 28, delay: 30, duration: 20 },
  { x: 36, y: 120, width: 160, height: 170, delay: 50, duration: 20 },
  { x: 220, y: 120, width: 160, height: 170, delay: 70, duration: 20 },
  { x: 180, y: 340, width: 240, height: 46, delay: 90, duration: 20 },
] as const;

export const S10_AskAndClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase1Opacity = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase2Opacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase2FadeOut = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase3Opacity = interpolate(frame, [180, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase3FadeOut = interpolate(frame, [280, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const closeOpacity = interpolate(frame, [300, 330], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleAnim = fadeInUp(frame, fps, 310);
  const taglineAnim = fadeInUp(frame, fps, 330);
  const askAnim = fadeInUp(frame, fps, 350);
  const sustainAnim = fadeInUp(frame, fps, 375);
  const foundersAnim = fadeInUp(frame, fps, 400);
  const institutionAnim = fadeInUp(frame, fps, 420);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION} variant="blur-dissolve" transitionFrames={30}>
        {/* Phase 1: FloristWebsite with success cursor (frames 0-90) */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: phase1Opacity,
          }}
        >
          <div style={{ position: "relative", width: 650, height: 440 }}>
            <BrowserMockup
              url="www.bloomandpetal.co.uk"
              delay={0}
              variant="light"
            >
              <FloristWebsite showCheckout />
            </BrowserMockup>

            <ScreenReaderCursor
              steps={[...SUCCESS_CURSOR_STEPS]}
              successMode
            />
          </div>
        </AbsoluteFill>

        {/* Phase 2: Score transition 34 -> 91 (frames 90-180) */}
        <AbsoluteFill
          style={{
            opacity: phase2Opacity * phase2FadeOut,
          }}
        >
          <ScoreTransition from={34} to={91} delay={95} duration={50} />
        </AbsoluteFill>

        {/* Phase 3: Sarah + "The flowers arrive." (frames 180-300) */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: phase3Opacity * phase3FadeOut,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <SarahCharacter size={180} delay={185} />
            <CinematicText
              lines={["The flowers arrive."]}
              startDelay={195}
              fontSize={52}
              dimPreviousLines={false}
            />
          </div>
        </AbsoluteFill>

        {/* Phase 4: Logo + Ask + Close (frames 300-600) */}
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: closeOpacity,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontFamily: fonts.heading,
                color: colors.text.primary,
                lineHeight: 1.2,
                ...titleAnim,
              }}
            >
              NeuroEdge
            </div>

            <div
              style={{
                fontSize: 26,
                fontFamily: fonts.body,
                color: colors.text.secondary,
                ...taglineAnim,
              }}
            >
              AI-powered accessibility audits for UK SMEs
            </div>

            <div
              style={{
                fontSize: 32,
                fontFamily: fonts.heading,
                color: colors.gold,
                marginTop: 16,
                ...askAnim,
              }}
            >
              £5,000 to build, pilot, and launch NeuroEdge
            </div>

            <div
              style={{
                fontSize: 20,
                fontFamily: fonts.body,
                color: colors.text.secondary,
                maxWidth: 650,
                lineHeight: 1.5,
                marginTop: 4,
                ...sustainAnim,
              }}
            >
              By month 5, we're generating revenue from paid reports and monitoring subscriptions. The business is designed to be self-sustaining from month 6.
            </div>

            <div
              style={{
                fontSize: 20,
                fontFamily: fonts.body,
                color: colors.text.secondary,
                marginTop: 12,
                ...foundersAnim,
              }}
            >
              Shashwati Bhosale (MSc Advanced Marketing) & Vedant Gaikwad (MSc Computer Science)
            </div>

            <div
              style={{
                fontSize: 18,
                fontFamily: fonts.body,
                color: colors.text.muted,
                ...institutionAnim,
              }}
            >
              University of Liverpool · Design Your Future 2026
            </div>
          </div>
        </AbsoluteFill>
      </SceneTransition>
      <Subtitle entries={SUBTITLES_S10} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { Subtitle } from "../components/Subtitle";
import { CinematicText } from "../components/CinematicText";
import { AnimatedText } from "../components/AnimatedText";
import { StatBlock } from "../components/StatBlock";
import { DonutChart } from "../components/DonutChart";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";
import { SUBTITLES_S02 } from "../lib/subtitles";

const DURATION = 600;

export const S02_ProblemStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bridgeOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const bridgeFadeOut = interpolate(frame, [50, 65], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dataOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bottomAnim = fadeInUp(frame, fps, 140);
  const researchAnim = fadeInUp(frame, fps, 170);

  return (
    <AbsoluteFill>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION} variant="wipe-up">
        {/* Bridge: "Sarah isn't alone." */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: bridgeOpacity * bridgeFadeOut,
          }}
        >
          <CinematicText
            lines={["Sarah isn't alone."]}
            startDelay={5}
            fontSize={52}
            dimPreviousLines={false}
          />
        </AbsoluteFill>

        {/* Data layout */}
        <AbsoluteFill
          style={{
            padding: "48px 100px 110px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 28,
            opacity: dataOpacity,
          }}
        >
          {/* Headline */}
          <AnimatedText
            text="95% of websites are broken for 16 million people"
            fontSize={42}
            fontFamily={fonts.heading}
            color={colors.text.primary}
            delay={70}
          />

          {/* Main row: DonutChart + Stats */}
          <div
            style={{
              display: "flex",
              gap: 24,
              alignItems: "flex-start",
              marginTop: 12,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 16,
              }}
            >
              <DonutChart value={94.8} size={140} delay={90} />
            </div>

            <div style={{ display: "flex", gap: 24, flex: 1 }}>
              <StatBlock
                value={94.8}
                suffix="%"
                label="of the top 1 million homepages have detectable WCAG accessibility failures"
                source="WebAIM Million, Feb 2025"
                delay={90}
                decimals={1}
              />
              <StatBlock
                value={51}
                label="average distinct accessibility errors per homepage"
                source="WebAIM Million, Feb 2025"
                delay={102}
              />
              <StatBlock
                value={24}
                suffix="%"
                label="of UK people are now disabled — up from 16% in 2013"
                source="DWP Family Resources Survey 2023-24"
                delay={114}
              />
            </div>
          </div>

          {/* 30/30 Liverpool research */}
          <div
            style={{
              fontSize: 22,
              color: colors.gold,
              fontFamily: fonts.body,
              fontWeight: 600,
              lineHeight: 1.5,
              marginTop: 4,
              ...researchAnim,
            }}
          >
            30/30 Liverpool SMEs we scanned had accessibility failures. Zero passed. Average: 37 errors per site.
            <span
              style={{
                fontSize: 16,
                color: colors.text.muted,
                fontFamily: fonts.mono,
                fontWeight: 400,
                marginLeft: 8,
              }}
            >
              NeuroEdge primary research, March 2026
            </span>
          </div>

          {/* Bottom text — exact PitchDeck text */}
          <div
            style={{
              fontSize: 22,
              color: colors.text.secondary,
              fontFamily: fonts.body,
              lineHeight: 1.5,
              marginTop: 4,
              ...bottomAnim,
            }}
          >
            Most SMEs don't know their websites are inaccessible. They don't know it's a legal obligation. And they don't know what they're losing.
          </div>
        </AbsoluteFill>
      </SceneTransition>
      <Subtitle entries={SUBTITLES_S02} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { AnimatedText } from "../components/AnimatedText";
import { StatBlock } from "../components/StatBlock";
import { DonutChart } from "../components/DonutChart";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

const DURATION = 600;

export const S02_ProblemStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelAnim = fadeInUp(frame, fps, 0);
  const bottomAnim = fadeInUp(frame, fps, 80);

  return (
    <AbsoluteFill>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION}>
        <AbsoluteFill
          style={{
            padding: "64px 100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 36,
          }}
        >
          {/* Section label */}
          <div
            style={{
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: 4,
              color: colors.accent,
              fontFamily: fonts.mono,
              fontWeight: 700,
              ...labelAnim,
            }}
          >
            THE PROBLEM
          </div>

          {/* Headline */}
          <AnimatedText
            text="95% of websites are broken for 16 million people"
            fontSize={42}
            fontFamily={fonts.heading}
            color={colors.text.primary}
            delay={10}
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
            {/* DonutChart column */}
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 16,
              }}
            >
              <DonutChart value={94.8} size={140} delay={30} />
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: 24,
                flex: 1,
              }}
            >
              <StatBlock
                value={94.8}
                suffix="%"
                label="of the top 1 million homepages have detectable WCAG accessibility failures"
                source="WebAIM Million, Feb 2025"
                delay={30}
                decimals={1}
              />
              <StatBlock
                value={51}
                label="average distinct accessibility errors per homepage"
                source="WebAIM Million, Feb 2025"
                delay={42}
              />
              <StatBlock
                value={24}
                suffix="%"
                label="of UK people are now disabled — up from 16% in 2013"
                source="DWP Family Resources Survey 2023-24"
                delay={54}
              />
            </div>
          </div>

          {/* Bottom text */}
          <div
            style={{
              fontSize: 18,
              color: colors.text.secondary,
              fontFamily: fonts.body,
              marginTop: 8,
              ...bottomAnim,
            }}
          >
            Most businesses have no idea their websites are shutting these people
            out.
          </div>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { BarChart } from "../components/BarChart";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp, SPRING_CONFIG } from "../lib/animations";

const DURATION = 450;

const CHART_ITEMS = [
  {
    label: "WAVE / axe (free tools)",
    sublabel: "Developers · Free",
    value: 15,
  },
  {
    label: "Siteimprove / Level Access",
    sublabel: "Enterprise · £5,000+/yr",
    value: 90,
  },
  {
    label: "accessiBe / UserWay",
    sublabel: "Any website · £40-80/mo",
    value: 45,
  },
  {
    label: "NeuroEdge",
    sublabel: "SMEs · £29-99 + £19/mo",
    value: 35,
    highlight: true,
  },
] as const;

export const S07_Competition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelProgress = spring({
    frame,
    fps,
    config: SPRING_CONFIG,
  });

  const closingAnim = fadeInUp(frame, fps, 60);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
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
            gap: 28,
          }}
        >
          {/* Section label */}
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 14,
              color: colors.accent,
              textTransform: "uppercase" as const,
              letterSpacing: 4,
              opacity: labelProgress,
              transform: `translateY(${(1 - labelProgress) * 15}px)`,
            }}
          >
            COMPETITIVE POSITIONING
          </span>

          {/* Headline */}
          <AnimatedText
            text="We're not competing with enterprise tools. We're filling the gap below them."
            fontSize={38}
            fontFamily={fonts.heading}
            delay={10}
          />

          {/* Bar chart */}
          <div style={{ maxWidth: 800, marginTop: 8 }}>
            <BarChart items={[...CHART_ITEMS]} delay={30} />
          </div>

          {/* Closing line */}
          <p
            style={{
              fontSize: 16,
              color: colors.text.secondary,
              fontFamily: fonts.body,
              lineHeight: 1.5,
              marginTop: 8,
              ...closingAnim,
            }}
          >
            Overlay tools don't fix root causes. We take the honest approach:
            audit and explain.
          </p>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};

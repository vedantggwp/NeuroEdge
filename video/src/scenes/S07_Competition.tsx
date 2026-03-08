import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { BarChart } from "../components/BarChart";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { Subtitle } from "../components/Subtitle";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";
import { SUBTITLES_S07 } from "../lib/subtitles";

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

  const closingAnim = fadeInUp(frame, fps, 60);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION}>
        <AbsoluteFill
          style={{
            padding: "48px 100px 110px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
          }}
        >
          {/* Headline */}
          <AnimatedText
            text="We're not competing with enterprise tools. We're filling the gap below them."
            fontSize={38}
            fontFamily={fonts.heading}
            delay={10}
          />

          {/* Bar chart */}
          <div style={{ width: "100%", marginTop: 8 }}>
            <BarChart items={[...CHART_ITEMS]} delay={30} />
          </div>

          {/* Closing line */}
          <p
            style={{
              fontSize: 22,
              color: colors.text.secondary,
              fontFamily: fonts.body,
              lineHeight: 1.5,
              marginTop: 8,
              textAlign: "center",
              maxWidth: 900,
              ...closingAnim,
            }}
          >
            Accessibility overlay tools (accessiBe, UserWay) are widely criticised by the disability community for not actually fixing underlying issues. We take the honest approach: audit and explain, not mask.
          </p>
        </AbsoluteFill>
      </SceneTransition>
      <Subtitle entries={SUBTITLES_S07} />
    </AbsoluteFill>
  );
};

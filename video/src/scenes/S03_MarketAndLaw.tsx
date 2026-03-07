import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { TextHighlight } from "../components/TextHighlight";
import { CountUp } from "../components/CountUp";
import { StatBlock } from "../components/StatBlock";
import { Card } from "../components/Card";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

const DURATION = 750;

export const S03_MarketAndLaw: React.FC = () => {
  const frame = useCurrentFrame();

  const phase1Opacity = interpolate(frame, [330, 350], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase2Opacity = interpolate(frame, [350, 370], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION}>
        {/* Phase 1: Market stats */}
        <AbsoluteFill
          style={{
            opacity: phase1Opacity,
            justifyContent: "center",
            alignItems: "center",
            padding: "64px 100px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              width: "100%",
            }}
          >
            <AnimatedText
              text="WHAT IT'S COSTING THEM"
              delay={0}
              fontSize={16}
              color={colors.accent}
              fontFamily={fonts.mono}
              style={{ letterSpacing: 4, textTransform: "uppercase" }}
            />

            <CountUp
              value={274}
              prefix="£"
              suffix="B"
              fontSize={80}
              color={colors.gold}
              delay={10}
            />

            <div
              style={{
                fontSize: 20,
                color: colors.text.secondary,
                fontFamily: fonts.body,
                textAlign: "center",
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              annual spending power of disabled households in the UK
            </div>

            <div style={{ marginTop: 24, maxWidth: 500, width: "100%" }}>
              <StatBlock
                value={7}
                label="in 10 disabled customers click away from websites they find difficult to use"
                source="Scope / Click-Away Pound"
                delay={40}
              />
            </div>
          </div>
        </AbsoluteFill>

        {/* Phase 2: Legal pressure */}
        <AbsoluteFill
          style={{
            opacity: phase2Opacity,
            justifyContent: "center",
            alignItems: "center",
            padding: "64px 100px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              width: "100%",
            }}
          >
            <AnimatedText
              text="It's not optional — it's"
              delay={360}
              fontSize={42}
              fontFamily={fonts.heading}
            />
            <AnimatedText
              text="the law"
              delay={366}
              fontSize={42}
              fontFamily={fonts.heading}
              color={colors.accent}
              style={{ marginTop: -20 }}
            />

            <div
              style={{
                fontSize: 18,
                color: colors.text.secondary,
                fontFamily: fonts.body,
                textAlign: "center",
                lineHeight: 1.6,
                maxWidth: 700,
              }}
            >
              Every organisation has a{" "}
              <TextHighlight delay={375} color={colors.accent}>
                <span style={{ color: colors.text.primary, fontWeight: 600 }}>
                  legal obligation
                </span>
              </TextHighlight>{" "}
              to ensure digital services are accessible.
            </div>

            <div
              style={{
                display: "flex",
                gap: 24,
                width: "100%",
                marginTop: 8,
              }}
            >
              <Card
                icon={"⚖️"}
                title="Equality Act 2010"
                body="Section 20 imposes duty to make reasonable adjustments. Applies to all service providers."
                delay={380}
                style={{ flex: 1 }}
              />
              <Card
                icon={"🏛️"}
                title="PSBAR 2018"
                body="Public sector websites must meet WCAG 2.2 AA. Enforceable by EHRC."
                delay={395}
                style={{ flex: 1 }}
              />
              <Card
                icon={"🇪🇺"}
                title="European Accessibility Act"
                body="In force since June 2025. UK businesses selling into EU must comply."
                delay={410}
                style={{ flex: 1 }}
              />
            </div>

            <AnimatedText
              text="This isn't coming. It's here."
              delay={440}
              fontSize={20}
              color={colors.accent}
              fontFamily={fonts.body}
              style={{ fontWeight: 700, marginTop: 8 }}
            />
          </div>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};

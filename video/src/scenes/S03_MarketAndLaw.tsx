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
import { Subtitle } from "../components/Subtitle";
import { colors } from "../lib/theme";
import { SUBTITLES_S03 } from "../lib/subtitles";
import { fonts } from "../lib/fonts";

const DURATION = 600;

export const S03_MarketAndLaw: React.FC = () => {
  const frame = useCurrentFrame();

  const phase1Opacity = interpolate(frame, [270, 290], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase2Opacity = interpolate(frame, [290, 310], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION} variant="zoom-pull">
        {/* Phase 1: Market stats */}
        <AbsoluteFill
          style={{
            opacity: phase1Opacity,
            justifyContent: "center",
            alignItems: "center",
            padding: "48px 100px 110px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              width: "100%",
            }}
          >
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
              <span
                style={{
                  display: "block",
                  fontSize: 16,
                  color: colors.text.muted,
                  fontFamily: fonts.mono,
                  marginTop: 4,
                }}
              >
                House of Commons Women & Equalities Committee
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 24,
                width: "100%",
                maxWidth: 800,
                marginTop: 12,
              }}
            >
              <StatBlock
                value={7}
                label="in 10 disabled customers click away from websites they find difficult to use"
                source="Scope / Click-Away Pound"
                delay={40}
              />
              <StatBlock
                value={81}
                suffix="%"
                label="of businesses are unaware of the value of the purple pound"
                source="House of Commons Women & Equalities Committee"
                delay={55}
              />
              <StatBlock
                value={86}
                suffix="%"
                label="of disabled consumers have paid more on an accessible site rather than buying cheaper on an inaccessible one"
                source="Scope / Click-Away Pound"
                delay={70}
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
            padding: "48px 100px 110px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
              width: "100%",
            }}
          >
            <AnimatedText
              text="It's not optional — it's"
              delay={300}
              fontSize={42}
              fontFamily={fonts.heading}
            />
            <AnimatedText
              text="the law"
              delay={306}
              fontSize={42}
              fontFamily={fonts.heading}
              color={colors.accent}
              style={{ marginTop: -16 }}
            />

            <div
              style={{
                fontSize: 22,
                color: colors.text.secondary,
                fontFamily: fonts.body,
                textAlign: "center",
                lineHeight: 1.6,
                maxWidth: 700,
              }}
            >
              Every organisation has a{" "}
              <TextHighlight delay={315} color={colors.accent}>
                <span style={{ color: colors.text.primary, fontWeight: 600 }}>
                  legal obligation
                </span>
              </TextHighlight>{" "}
              to ensure digital services are accessible.
            </div>

            <div
              style={{
                display: "flex",
                gap: 20,
                width: "100%",
                marginTop: 4,
              }}
            >
              <Card
                icon="⚖️"
                title="Equality Act 2010"
                body="Section 20 imposes a duty to make 'reasonable adjustments' including providing information in accessible formats. Failure is discrimination. Applies to all service providers, public and private."
                delay={320}
                style={{ flex: 1 }}
              />
              <Card
                icon="🏛️"
                title="PSBAR 2018"
                body="Public sector websites must meet WCAG 2.2 AA standards. GDS monitors compliance annually. Failure is a breach of the Equality Act, enforceable by the EHRC."
                delay={335}
                style={{ flex: 1 }}
              />
              <Card
                icon="🇪🇺"
                title="European Accessibility Act"
                body="In force since June 2025 across EU. UK businesses selling into the EU must comply. Covers e-commerce, banking, transport ticketing, and more."
                delay={350}
                style={{ flex: 1 }}
              />
            </div>

            <AnimatedText
              text="This isn't coming. It's here."
              delay={380}
              fontSize={24}
              color={colors.accent}
              fontFamily={fonts.body}
              style={{ fontWeight: 700, marginTop: 4 }}
            />
          </div>
        </AbsoluteFill>
      </SceneTransition>
      <Subtitle entries={SUBTITLES_S03} />
    </AbsoluteFill>
  );
};

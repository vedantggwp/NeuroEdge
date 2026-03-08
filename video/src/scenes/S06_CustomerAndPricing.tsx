import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Card } from "../components/Card";
import { CountUp } from "../components/CountUp";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { Subtitle } from "../components/Subtitle";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";
import { SUBTITLES_S06 } from "../lib/subtitles";

const DURATION = 600;

interface SegmentConfig {
  readonly title: string;
  readonly description: string;
  readonly delay: number;
}

const SEGMENTS: readonly SegmentConfig[] = [
  {
    title: "Primary: Local service businesses",
    description: "Restaurants, salons, trades, retail. They have a website but have never considered accessibility.",
    delay: 30,
  },
  {
    title: "Secondary: E-commerce SMEs",
    description: "Small online shops losing disabled customers at checkout. Now legally required to comply with the EAA.",
    delay: 45,
  },
  {
    title: "Tertiary: Web agencies",
    description: "Agencies who build websites for clients but don't currently offer accessibility audits. We white-label.",
    delay: 60,
  },
] as const;

const PROFILE_ITEMS = [
  "Has a website but didn't build it themselves",
  "Doesn't have an in-house developer",
  "Doesn't know what WCAG stands for",
  "Can afford £29–99, not £5,000",
  "Based in the UK, especially Liverpool initially",
] as const;

interface PricingCardConfig {
  readonly badge: string;
  readonly badgeColor?: string;
  readonly title: string;
  readonly body: string;
  readonly delay: number;
  readonly style?: React.CSSProperties;
}

const PRICING_CARDS: readonly PricingCardConfig[] = [
  {
    badge: "FREE",
    title: "Quick Score",
    body: "Enter URL → instant score + top 3 issues. No signup.",
    delay: 280,
  },
  {
    badge: "£29-49",
    badgeColor: colors.accent,
    title: "Full Report",
    body: "Branded PDF — all issues, priority ranking, plain-English fixes.",
    delay: 290,
    style: { border: `1px solid ${colors.accent}` },
  },
  {
    badge: "£99",
    badgeColor: colors.gold,
    title: "Report + Walkthrough",
    body: "Full Report + 30-min video call walking through findings.",
    delay: 300,
  },
  {
    badge: "£19/mo",
    badgeColor: colors.accent,
    title: "Monitoring Agent",
    body: "AI scans weekly. Flags new issues and regressions automatically.",
    delay: 310,
    style: {
      border: `1px solid ${colors.accent}`,
      boxShadow: `0 0 20px ${colors.accent}30`,
    },
  },
] as const;

export const S06_CustomerAndPricing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase1Opacity = interpolate(frame, [240, 260], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase2Opacity = interpolate(frame, [260, 280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const revenueAnim = fadeInUp(frame, fps, 370);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION}>
        {/* Phase 1: Customer Segments (frames 0-260) */}
        <AbsoluteFill
          style={{
            padding: "48px 100px 110px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
            opacity: phase1Opacity,
          }}
        >
          <AnimatedText
            text="UK SMEs with 5–50 employees who've never heard of WCAG"
            fontSize={36}
            fontFamily={fonts.heading}
            delay={10}
          />

          {/* Three segments */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginTop: 4,
            }}
          >
            {SEGMENTS.map((seg) => (
              <Card
                key={seg.title}
                title={seg.title}
                body={seg.description}
                delay={seg.delay}
                borderColor={colors.accent}
              />
            ))}
          </div>

          {/* Customer profile */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontFamily: fonts.body,
                color: colors.accent,
                fontWeight: 600,
                ...fadeInUp(frame, fps, 80),
              }}
            >
              Customer profile:
            </span>
            {PROFILE_ITEMS.map((item, i) => {
              const anim = fadeInUp(frame, fps, 90 + i * 8);
              return (
                <div
                  key={`profile-${String(i)}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    ...anim,
                  }}
                >
                  <span
                    style={{
                      color: colors.accent,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontFamily: fonts.body,
                      color: colors.text.secondary,
                    }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>

        {/* Phase 2: Pricing + Revenue (frames 260-600) */}
        <AbsoluteFill
          style={{
            padding: "48px 100px 110px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
            opacity: phase2Opacity,
          }}
        >
          <AnimatedText
            text="Three tiers, one promise: you'll understand what's wrong"
            fontSize={36}
            fontFamily={fonts.heading}
            delay={270}
          />

          {/* Pricing cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 18,
              marginTop: 4,
            }}
          >
            {PRICING_CARDS.map((card) => (
              <Card
                key={card.title}
                badge={card.badge}
                badgeColor={card.badgeColor}
                title={card.title}
                body={card.body}
                delay={card.delay}
                style={card.style}
              />
            ))}
          </div>

          {/* Revenue + unit economics */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              marginTop: 8,
              ...revenueAnim,
            }}
          >
            <span
              style={{
                fontSize: 20,
                color: colors.text.secondary,
                fontFamily: fonts.body,
              }}
            >
              Under 50p compute per report — 98% margin.
            </span>
            <span
              style={{
                fontSize: 20,
                color: colors.text.secondary,
                fontFamily: fonts.body,
              }}
            >
              100 subscribers × £19/mo × 12 =
            </span>
            <CountUp
              value={22800}
              prefix="£"
              suffix=" ARR"
              color={colors.gold}
              fontSize={32}
              delay={380}
            />
          </div>
        </AbsoluteFill>
      </SceneTransition>
      <Subtitle entries={SUBTITLES_S06} />
    </AbsoluteFill>
  );
};

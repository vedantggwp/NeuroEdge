import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Card } from "../components/Card";
import { CountUp } from "../components/CountUp";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp, SPRING_CONFIG } from "../lib/animations";

const DURATION = 750;

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
    body: "Enter URL → instant accessibility score + top 3 issues in plain English. No signup required.",
    delay: 40,
  },
  {
    badge: "£29-49",
    badgeColor: colors.accent,
    title: "Full Report",
    body: "Branded PDF with all issues, priority ranking, plain-English explanations, and fix recommendations.",
    delay: 55,
    style: { border: `1px solid ${colors.accent}` },
  },
  {
    badge: "£99",
    badgeColor: colors.gold,
    title: "Report + Walkthrough",
    body: "Full Report plus a 30-minute video call walking through findings and priorities.",
    delay: 70,
  },
  {
    badge: "£19/mo",
    badgeColor: colors.accent,
    title: "Monitoring Agent",
    body: "AI agent scans your site weekly. Flags new issues, regressions, and broken fixes automatically.",
    delay: 85,
    style: {
      border: `1px solid ${colors.accent}`,
      boxShadow: `0 0 20px ${colors.accent}30`,
    },
  },
] as const;

export const S06_CustomerAndPricing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelProgress = spring({
    frame,
    fps,
    config: SPRING_CONFIG,
  });

  const revenueAnim = fadeInUp(frame, fps, 130);

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
            gap: 32,
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
            IDEAL CUSTOMER
          </span>

          {/* Headline */}
          <AnimatedText
            text="UK SMEs with 5-50 employees who've never heard of WCAG"
            fontSize={38}
            fontFamily={fonts.heading}
            delay={10}
          />

          {/* Pricing cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
              marginTop: 16,
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

          {/* Revenue callout */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
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
              100 monitoring subscribers ={" "}
            </span>
            <CountUp
              value={22800}
              prefix="£"
              suffix=" ARR"
              color={colors.gold}
              fontSize={36}
              delay={140}
            />
          </div>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};

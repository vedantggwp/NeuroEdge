import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Card } from "../components/Card";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInScale, fadeInUp } from "../lib/animations";

const DURATION = 600;

const IMPACT_CARDS = [
  {
    icon: "♿",
    title: "Disabled consumers",
    body: "Every audit highlights barriers that, when fixed, give disabled people better access to goods and services.",
    delay: 10,
  },
  {
    icon: "🏪",
    title: "Small businesses",
    body: `Legal obligations they didn't know, a £274B market they were ignoring, and reduced litigation risk — under £100.`,
    delay: 25,
  },
  {
    icon: "🎓",
    title: "The university",
    body: "A student-founded venture with a clear commercial model, measurable impact, and deliverables built into the plan.",
    delay: 40,
  },
] as const;

export const S10_AskAndClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Cards fade out between frames 280-310
  const cardsOpacity = interpolate(frame, [280, 310], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: Close section fades in from frame 300
  const closeOpacity = interpolate(frame, [300, 330], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleAnim = fadeInScale(frame, fps, 320);
  const taglineAnim = fadeInUp(frame, fps, 345);
  const foundersAnim = fadeInUp(frame, fps, 370);
  const institutionAnim = fadeInUp(frame, fps, 385);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION}>
        {/* Phase 1: Impact cards */}
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: cardsOpacity,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 24,
              padding: "0 100px",
              maxWidth: 1200,
            }}
          >
            {IMPACT_CARDS.map((card) => (
              <Card
                key={card.title}
                icon={card.icon}
                title={card.title}
                body={card.body}
                delay={card.delay}
              />
            ))}
          </div>
        </AbsoluteFill>

        {/* Phase 2: Close */}
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
                fontSize: 22,
                fontFamily: fonts.body,
                color: colors.text.secondary,
                ...taglineAnim,
              }}
            >
              AI-powered accessibility audits for UK SMEs
            </div>

            <div
              style={{
                fontSize: 16,
                fontFamily: fonts.body,
                color: colors.text.secondary,
                marginTop: 8,
                ...foundersAnim,
              }}
            >
              Shashwati Bhosale & Vedant Gaikwad
            </div>

            <div
              style={{
                fontSize: 14,
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
    </AbsoluteFill>
  );
};

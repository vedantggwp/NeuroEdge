import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { BrowserMockup } from "../components/BrowserMockup";
import { Card } from "../components/Card";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SPRING_CONFIG } from "../lib/animations";

const DURATION = 750;

const ScanContent: React.FC = () => {
  const frame = useCurrentFrame();

  const urlText = "www.example-shop.co.uk";
  const visibleChars = Math.min(
    urlText.length,
    Math.max(0, Math.floor((frame - 45) * (urlText.length / 25)))
  );
  const typedUrl = urlText.slice(0, visibleChars);

  const showInput = frame >= 45;
  const showScanning = frame >= 70 && frame < 100;
  const showResults = frame >= 100;

  const scanDots = ".".repeat(((frame - 70) % 12 < 4 ? 1 : (frame - 70) % 12 < 8 ? 2 : 3));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: fonts.mono,
        fontSize: 14,
        color: colors.text.secondary,
      }}
    >
      {showInput && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 14,
              color: colors.text.primary,
              fontFamily: fonts.mono,
            }}
          >
            {typedUrl}
            {frame < 70 && (
              <span
                style={{
                  opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  color: colors.accent,
                }}
              >
                |
              </span>
            )}
          </div>
          <div
            style={{
              background: colors.accent,
              color: colors.bg.dark,
              padding: "10px 18px",
              borderRadius: 8,
              fontFamily: fonts.body,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Scan
          </div>
        </div>
      )}

      {showScanning && (
        <div style={{ color: colors.text.muted, fontSize: 13 }}>
          Scanning{scanDots} WCAG 2.2 checks running
        </div>
      )}

      {showResults && (
        <div
          style={{
            color: colors.accent,
            fontSize: 18,
            fontWeight: 700,
            fontFamily: fonts.mono,
            marginTop: 8,
          }}
        >
          Score: 34/100 — 23 issues found
        </div>
      )}
    </div>
  );
};

export const S04_Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelProgress = spring({
    frame,
    fps,
    config: SPRING_CONFIG,
  });

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
          }}
        >
          {/* Section label */}
          <div
            style={{
              fontSize: 14,
              fontFamily: fonts.mono,
              color: colors.accent,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: labelProgress,
              transform: `translateY(${interpolate(labelProgress, [0, 1], [15, 0])}px)`,
              marginBottom: 16,
            }}
          >
            OUR SOLUTION
          </div>

          {/* Headline with accent words */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.3em",
              marginBottom: 40,
            }}
          >
            <AnimatedText
              text="NeuroEdge makes accessibility"
              fontSize={42}
              fontFamily={fonts.heading}
              delay={10}
            />
            <AnimatedText
              text="understandable"
              fontSize={42}
              fontFamily={fonts.heading}
              delay={10 + 3 * 3}
              color={colors.accent}
            />
            <AnimatedText
              text="and"
              fontSize={42}
              fontFamily={fonts.heading}
              delay={10 + 4 * 3}
            />
            <AnimatedText
              text="actionable"
              fontSize={42}
              fontFamily={fonts.heading}
              delay={10 + 5 * 3}
              color={colors.accent}
            />
          </div>

          {/* Browser mockup centered */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flex: 1,
              alignItems: "flex-start",
            }}
          >
            <BrowserMockup url="https://neuroedge.co.uk/scan" delay={30}>
              <ScanContent />
            </BrowserMockup>
          </div>

          {/* Two-column card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginTop: 32,
            }}
          >
            <Card
              title="What they see today"
              body='Error: Missing aria-label on input element [WCAG 2.2 SC 1.3.1]'
              delay={140}
              borderColor={colors.warning}
              style={{
                fontFamily: fonts.mono,
                fontSize: 13,
              }}
            />
            <Card
              title="What we show them"
              body="Your contact form is invisible to screen readers. Disabled visitors cannot submit enquiries — estimated impact: 10-15% of potential leads lost."
              delay={140}
              borderColor={colors.accent}
            />
          </div>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};

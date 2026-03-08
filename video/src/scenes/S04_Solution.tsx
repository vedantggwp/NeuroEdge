import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { CinematicText } from "../components/CinematicText";
import { AnimatedText } from "../components/AnimatedText";
import { BrowserMockup } from "../components/BrowserMockup";
import { Card } from "../components/Card";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { Subtitle } from "../components/Subtitle";
import { colors } from "../lib/theme";
import { SUBTITLES_S04 } from "../lib/subtitles";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

const DURATION = 750;

const ScanContent: React.FC = () => {
  const frame = useCurrentFrame();

  const urlText = "www.bloomandpetal.co.uk";
  const scanStart = 200;
  const visibleChars = Math.min(
    urlText.length,
    Math.max(0, Math.floor((frame - scanStart) * (urlText.length / 25)))
  );
  const typedUrl = urlText.slice(0, visibleChars);

  const showInput = frame >= scanStart;
  const showScanning = frame >= scanStart + 25 && frame < scanStart + 55;
  const showResults = frame >= scanStart + 55;

  const scanDots = ".".repeat(((frame - (scanStart + 25)) % 12 < 4 ? 1 : (frame - (scanStart + 25)) % 12 < 8 ? 2 : 3));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: fonts.mono,
        fontSize: 18,
        color: colors.text.secondary,
      }}
    >
      {showInput && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 18,
              color: colors.text.primary,
              fontFamily: fonts.mono,
            }}
          >
            {typedUrl}
            {frame < scanStart + 25 && (
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
              fontSize: 16,
            }}
          >
            Scan
          </div>
        </div>
      )}

      {showScanning && (
        <div style={{ color: colors.text.muted, fontSize: 16 }}>
          Scanning{scanDots} WCAG 2.2 checks running
        </div>
      )}

      {showResults && (
        <div
          style={{
            color: colors.accent,
            fontSize: 22,
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

  const bridgeOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const bridgeFadeOut = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mainOpacity = interpolate(frame, [85, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const gapAnim = fadeInUp(frame, fps, 480);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION} variant="zoom-pull">
        {/* Empathetic bridge (frames 0-90) */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: bridgeOpacity * bridgeFadeOut,
          }}
        >
          <CinematicText
            lines={[
              "They're not bad people.",
              "They just didn't know.",
            ]}
            startDelay={5}
            delayBetweenLines={30}
            fontSize={44}
          />
        </AbsoluteFill>

        {/* Main content (frames 90+) */}
        <AbsoluteFill
          style={{
            padding: "48px 100px 110px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: mainOpacity,
          }}
        >
          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.3em",
              marginBottom: 20,
              width: "100%",
            }}
          >
            <AnimatedText
              text="NeuroEdge makes accessibility"
              fontSize={42}
              fontFamily={fonts.heading}
              delay={100}
            />
            <AnimatedText
              text="understandable"
              fontSize={42}
              fontFamily={fonts.heading}
              delay={109}
              color={colors.accent}
            />
            <AnimatedText
              text="and"
              fontSize={42}
              fontFamily={fonts.heading}
              delay={112}
            />
            <AnimatedText
              text="actionable"
              fontSize={42}
              fontFamily={fonts.heading}
              delay={115}
              color={colors.accent}
            />
          </div>

          {/* Browser mockup */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <BrowserMockup url="https://neuroedge.co.uk/scan" delay={130}>
              <ScanContent />
            </BrowserMockup>
          </div>

          {/* Comparison cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginTop: 20,
            }}
          >
            <Card
              title="What they see today"
              body='Error: Missing aria-label on input element [WCAG 2.2 SC 1.3.1]'
              delay={300}
              borderColor={colors.warning}
              style={{ fontFamily: fonts.mono, fontSize: 16 }}
            />
            <Card
              title="What we show them"
              body="Your contact form is invisible to screen readers. Disabled visitors cannot submit enquiries — estimated impact: 10-15% of potential leads lost."
              delay={300}
              borderColor={colors.accent}
            />
          </div>

          {/* Gap we fill */}
          <div
            style={{
              fontSize: 20,
              color: colors.text.secondary,
              fontFamily: fonts.body,
              lineHeight: 1.6,
              marginTop: 20,
              ...gapAnim,
            }}
          >
            <span style={{ color: colors.accent, fontWeight: 600 }}>The gap we fill: </span>
            Existing tools either spit out developer jargon that SMEs can't understand, or cost £5,000+ for a professional consultancy audit. We sit in the middle — affordable, human-readable, business-framed.
          </div>
        </AbsoluteFill>
      </SceneTransition>
      <Subtitle entries={SUBTITLES_S04} />
    </AbsoluteFill>
  );
};

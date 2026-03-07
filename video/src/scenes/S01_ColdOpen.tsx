import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { TextHighlight } from "../components/TextHighlight";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

const DURATION = 600;

const bodyStyle: React.CSSProperties = {
  justifyContent: "center",
  textAlign: "center",
};

export const S01_ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();

  const contentOpacity = interpolate(frame, [0, 14, 15, 30], [0, 0, 0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const shakeX =
    frame >= 280 && frame <= 310
      ? interpolate(frame, [280, 285, 290, 295, 300, 305, 310], [0, 3, -3, 3, -3, 2, 0])
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <div style={{ opacity: contentOpacity, width: "100%", height: "100%" }}>
        <GradientBackground />
        <FloatingOrbs />
        <NoiseOverlay />

        <SceneTransition durationInFrames={DURATION}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                maxWidth: 800,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 28,
                padding: "0 40px",
              }}
            >
              <AnimatedText
                text="Imagine you run a small business."
                delay={20}
                fontSize={36}
                color={colors.text.secondary}
                fontFamily={fonts.body}
                style={bodyStyle}
              />

              <AnimatedText
                text="You've got a website."
                delay={70}
                fontSize={36}
                color={colors.text.secondary}
                fontFamily={fonts.body}
                style={bodyStyle}
              />

              <AnimatedText
                text="Customers visit every day."
                delay={120}
                fontSize={36}
                color={colors.text.secondary}
                fontFamily={fonts.body}
                style={bodyStyle}
              />

              <AnimatedText
                text="But what you don't know..."
                delay={200}
                fontSize={30}
                color={colors.text.muted}
                fontFamily={fonts.body}
                style={{ ...bodyStyle, marginTop: 16 }}
              />

              <div
                style={{
                  transform: `translateX(${shakeX}px)`,
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <AnimatedText
                  text="is that"
                  delay={270}
                  fontSize={52}
                  color={colors.warning}
                  fontFamily={fonts.heading}
                  style={bodyStyle}
                />
                <span style={{ width: "0.3em" }} />
                <TextHighlight delay={290} color={colors.warning}>
                  <AnimatedText
                    text="one in four"
                    delay={270}
                    fontSize={52}
                    color={colors.warning}
                    fontFamily={fonts.heading}
                    style={bodyStyle}
                  />
                </TextHighlight>
                <span style={{ width: "0.3em" }} />
                <AnimatedText
                  text="of them can't actually use it."
                  delay={270}
                  fontSize={52}
                  color={colors.warning}
                  fontFamily={fonts.heading}
                  style={bodyStyle}
                />
              </div>
            </div>
          </AbsoluteFill>
        </SceneTransition>
      </div>
    </AbsoluteFill>
  );
};

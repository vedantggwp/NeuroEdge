import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { TeamMember } from "../components/TeamMember";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SPRING_CONFIG } from "../lib/animations";
import { spring } from "remotion";

const DURATION = 600;

export const S08_Team: React.FC = () => {
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
            THE TEAM
          </div>

          {/* Headline */}
          <AnimatedText
            text="Conversion expertise + rapid technical execution"
            fontSize={42}
            fontFamily={fonts.heading}
            delay={10}
            style={{ marginBottom: 40 }}
          />

          {/* Team member cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 40,
              width: "100%",
            }}
          >
            <TeamMember
              name="Shashwati Bhosale"
              role="Lead Founder — Strategy & Methodology"
              bio="MSc Advanced Marketing, University of Liverpool. Background in ad optimisation, conversion testing, and disability-inclusive marketing. Designs the scoring methodology, report framework, and plain-English fix recommendations."
              imageSrc="shashwati.jpeg"
              delay={30}
              tags={[
                "Ad Optimisation",
                "Conversion Testing",
                "Disability-Inclusive Marketing",
              ]}
            />

            <TeamMember
              name="Vedant Gaikwad"
              role="Co-founder — Technical"
              bio="MSc Computer Science, University of Liverpool. Former agency co-founder. Scored 92/100 on Accenture's AI consulting programme. Builds the scanning engine, AI pipeline, and product."
              delay={90}
              tags={[
                "Product Engineering",
                "AI Pipeline",
                "Agency Co-founder",
              ]}
            />
          </div>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};

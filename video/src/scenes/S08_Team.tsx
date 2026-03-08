import React from "react";
import { AbsoluteFill } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { TeamMember } from "../components/TeamMember";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { Subtitle } from "../components/Subtitle";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SUBTITLES_S08 } from "../lib/subtitles";

const DURATION = 450;

export const S08_Team: React.FC = () => {
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
          }}
        >
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
              bio="MSc Advanced Marketing, University of Liverpool. Professional background in ad optimisation, conversion testing, and web page UX. Research focus on disability-inclusive marketing and experiential marketing. Designs the scoring methodology, report framework, and plain-English fix recommendations. Leads client relationships and outreach."
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
              bio="MSc Computer Science, University of Liverpool. Former business strategist and digital marketing agency co-founder. Scored 92/100 on Accenture's AI consulting programme. Built a functional product (Discovery Simulator) in 12 hours. Builds the web application, scanning engine integration, AI interpretation pipeline, and PDF report generation."
              imageSrc="vedant.jpeg"
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
      <Subtitle entries={SUBTITLES_S08} />
    </AbsoluteFill>
  );
};

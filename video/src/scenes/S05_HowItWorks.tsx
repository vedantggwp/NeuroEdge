import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { FlowStep } from "../components/FlowStep";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { Subtitle } from "../components/Subtitle";
import { colors } from "../lib/theme";
import { SUBTITLES_S05 } from "../lib/subtitles";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

const DURATION = 450;

interface StepConfig {
  readonly stepNum: string;
  readonly title: string;
  readonly description: string;
  readonly delay: number;
  readonly showArrow: boolean;
  readonly activeStart: number;
  readonly activeEnd: number;
}

const STEPS: readonly StepConfig[] = [
  {
    stepNum: "01",
    title: "Enter URL",
    description: "User enters their website address on our portal",
    delay: 40,
    showArrow: true,
    activeStart: 40,
    activeEnd: 85,
  },
  {
    stepNum: "02",
    title: "Automated Scan",
    description: "axe-core + Pa11y run WCAG 2.2 checks",
    delay: 65,
    showArrow: true,
    activeStart: 65,
    activeEnd: 110,
  },
  {
    stepNum: "03",
    title: "AI Interpretation",
    description: "AI translates violations into plain English with business impact",
    delay: 90,
    showArrow: true,
    activeStart: 90,
    activeEnd: 135,
  },
  {
    stepNum: "04",
    title: "Score + Report",
    description: "Branded PDF with score, priority fixes, revenue at risk",
    delay: 115,
    showArrow: true,
    activeStart: 115,
    activeEnd: 160,
  },
  {
    stepNum: "05",
    title: "Walkthrough",
    description: "Optional: human video walkthrough of findings (premium)",
    delay: 140,
    showArrow: false,
    activeStart: 140,
    activeEnd: 200,
  },
] as const;

export const S05_HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bottomTextAnim = fadeInUp(frame, fps, 180);

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
            gap: 32,
          }}
        >
          {/* Headline */}
          <AnimatedText
            text="URL in. Report out. Five steps."
            fontSize={42}
            fontFamily={fonts.heading}
            delay={10}
          />

          {/* Flow steps - horizontal row */}
          <div
            style={{
              display: "flex",
              gap: 0,
              alignItems: "stretch",
              width: "100%",
              marginTop: 16,
            }}
          >
            {STEPS.map((step) => (
              <FlowStep
                key={step.stepNum}
                stepNum={step.stepNum}
                title={step.title}
                description={step.description}
                delay={step.delay}
                showArrow={step.showArrow}
                isActive={frame >= step.activeStart && frame <= step.activeEnd}
              />
            ))}
          </div>

          {/* Bottom text */}
          <p
            style={{
              fontSize: 22,
              color: colors.text.secondary,
              fontFamily: fonts.body,
              lineHeight: 1.5,
              marginTop: 12,
              ...bottomTextAnim,
            }}
          >
            Free tier shows the score + top 3 issues on screen. Paid tier (from £29) delivers the full PDF report. Monitoring agent (£19/month) repeats this scan weekly and alerts on new issues.
          </p>
        </AbsoluteFill>
      </SceneTransition>
      <Subtitle entries={SUBTITLES_S05} />
    </AbsoluteFill>
  );
};

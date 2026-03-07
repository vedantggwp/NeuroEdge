import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { CountUp } from "../components/CountUp";
import { TimelineItem } from "../components/TimelineItem";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp, SPRING_CONFIG } from "../lib/animations";

const DURATION = 750;

interface BudgetLineItem {
  readonly label: string;
  readonly amount: string;
  readonly delay: number;
}

const BUDGET_ITEMS: readonly BudgetLineItem[] = [
  { label: "User research with disabled testers", amount: "£500", delay: 30 },
  { label: "Marketing & outreach", amount: "£1,000", delay: 38 },
  { label: "AI infrastructure (Claude API)", amount: "£400", delay: 46 },
  { label: "Design, legal, workshops, stipends", amount: "£2,600", delay: 54 },
] as const;

interface RoadmapEntry {
  readonly marker: string;
  readonly title: string;
  readonly description: string;
  readonly delay: number;
  readonly isActive?: boolean;
}

const ROADMAP_ITEMS: readonly RoadmapEntry[] = [
  { marker: "M1", title: "April — Foundation", description: "Build MVP, deploy portal, define scoring methodology", delay: 375 },
  { marker: "M2", title: "May — Pilot", description: "20 free audits for Liverpool SMEs, collect feedback", delay: 390 },
  { marker: "M3", title: "June — Public Launch", description: "Freemium model live, LinkedIn content campaign", delay: 405 },
  { marker: "M4", title: "July — Outreach", description: "Workshops, chamber of commerce, build monitoring agent", delay: 420 },
  { marker: "M5", title: "August — Revenue", description: "Convert pilots to paid, launch £19/mo monitoring", delay: 435 },
  { marker: "M6", title: "September — Target", description: "100 customers, 30 subscribers, £22,800 ARR", delay: 450, isActive: true },
] as const;

const BudgetRow: React.FC<{
  readonly label: string;
  readonly amount: string;
  readonly delay: number;
  readonly isTotal?: boolean;
}> = ({ label, amount, delay, isTotal = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);

  const rowStyle: React.CSSProperties = isTotal
    ? {
        borderTop: `2px solid ${colors.accent}`,
        borderBottom: "none",
        paddingTop: 14,
      }
    : {
        borderBottom: `1px solid rgba(255, 255, 255, 0.06)`,
      };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        ...rowStyle,
        ...anim,
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontFamily: fonts.body,
          color: isTotal ? colors.text.primary : colors.text.secondary,
          fontWeight: isTotal ? 700 : 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 18,
          fontFamily: fonts.mono,
          color: isTotal ? colors.text.primary : colors.accent,
          fontWeight: isTotal ? 700 : 400,
        }}
      >
        {amount}
      </span>
    </div>
  );
};

export const S09_RoadmapAndFunds: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelProgress = spring({
    frame,
    fps,
    config: SPRING_CONFIG,
  });

  // Phase 1 fade-out (frames 330-350)
  const phase1Opacity = interpolate(frame, [330, 350], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2 fade-in (from frame 350)
  const phase2Opacity = interpolate(frame, [350, 370], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const arrAnim = fadeInUp(frame, fps, 480);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION}>
        {/* Phase 1: Budget */}
        <AbsoluteFill
          style={{
            padding: "64px 100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
            opacity: phase1Opacity,
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
            USE OF FUNDS
          </span>

          {/* Headline */}
          <AnimatedText
            text={"£5,000 — every pound accounted for"}
            fontSize={42}
            fontFamily={fonts.heading}
            delay={10}
          />

          {/* Budget list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 700,
              marginTop: 16,
            }}
          >
            {BUDGET_ITEMS.map((item) => (
              <BudgetRow
                key={item.label}
                label={item.label}
                amount={item.amount}
                delay={item.delay}
              />
            ))}
            <BudgetRow
              label="Total"
              amount={"£5,000"}
              delay={65}
              isTotal
            />
          </div>
        </AbsoluteFill>

        {/* Phase 2: Roadmap */}
        <AbsoluteFill
          style={{
            padding: "64px 100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
            opacity: phase2Opacity,
          }}
        >
          {/* Headline */}
          <AnimatedText
            text="From MVP to revenue in 6 months"
            fontSize={36}
            fontFamily={fonts.heading}
            delay={360}
          />

          {/* Timeline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginTop: 8,
            }}
          >
            {ROADMAP_ITEMS.map((item) => (
              <TimelineItem
                key={item.marker}
                marker={item.marker}
                title={item.title}
                description={item.description}
                delay={item.delay}
                isActive={item.isActive}
              />
            ))}
          </div>

          {/* ARR CountUp */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 16,
              ...arrAnim,
            }}
          >
            <CountUp
              value={22800}
              prefix={"£"}
              suffix=" ARR"
              color={colors.gold}
              fontSize={36}
              delay={480}
            />
          </div>
        </AbsoluteFill>
      </SceneTransition>
    </AbsoluteFill>
  );
};

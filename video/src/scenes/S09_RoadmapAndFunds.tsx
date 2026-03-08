import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { CountUp } from "../components/CountUp";
import { TimelineItem } from "../components/TimelineItem";
import { GradientBackground } from "../components/GradientBackground";
import { FloatingOrbs } from "../components/FloatingOrbs";
import { NoiseOverlay } from "../components/NoiseOverlay";
import { SceneTransition } from "../components/SceneTransition";
import { Subtitle } from "../components/Subtitle";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";
import { SUBTITLES_S09 } from "../lib/subtitles";

const DURATION = 600;

interface BudgetLineItem {
  readonly label: string;
  readonly amount: string;
  readonly delay: number;
}

const BUDGET_ITEMS: readonly BudgetLineItem[] = [
  { label: "Founder milestone payments", amount: "£1,500", delay: 30 },
  { label: "Marketing & outreach", amount: "£1,000", delay: 35 },
  { label: "User research with disabled testers", amount: "£500", delay: 40 },
  { label: "Contingency", amount: "£500", delay: 45 },
  { label: "AI infrastructure (Claude API)", amount: "£400", delay: 50 },
  { label: "Workshops & pilot programme", amount: "£350", delay: 55 },
  { label: "Design & branding", amount: "£250", delay: 60 },
  { label: "Hosting, platform, legal & agent dev", amount: "£500", delay: 65 },
] as const;

interface RoadmapEntry {
  readonly marker: string;
  readonly title: string;
  readonly description: string;
  readonly delay: number;
  readonly isActive?: boolean;
}

const ROADMAP_ITEMS: readonly RoadmapEntry[] = [
  { marker: "M1", title: "April — Foundation", description: "Finalise branding. Build MVP (scanner + AI + PDF). Deploy portal. Define scoring.", delay: 320 },
  { marker: "M2", title: "May — Pilot", description: "20 free audits for Liverpool SMEs. Refine AI prompts. Document 3+ case studies.", delay: 335 },
  { marker: "M3", title: "June — Public Launch", description: "Launch freemium model. LinkedIn content campaign. University enterprise events.", delay: 350 },
  { marker: "M4", title: "July — Outreach", description: "Workshops for local business groups. Chamber of commerce outreach. Build monitoring agent.", delay: 365 },
  { marker: "M5", title: "August — Revenue", description: "Convert pilots to paid. Launch £19/mo monitoring. Agency partnerships. Submit blog + video to university.", delay: 380 },
  { marker: "M6", title: "September — Target", description: "100 paying customers, 30 monitoring subscribers (£6,840 monitoring ARR), 3 agency referral partnerships.", delay: 395, isActive: true },
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
          fontSize: 20,
          fontFamily: fonts.body,
          color: isTotal ? colors.text.primary : colors.text.secondary,
          fontWeight: isTotal ? 700 : 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 20,
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

  const phase1Opacity = interpolate(frame, [280, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phase2Opacity = interpolate(frame, [300, 320], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const arrAnim = fadeInUp(frame, fps, 430);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg.dark }}>
      <GradientBackground />
      <FloatingOrbs />
      <NoiseOverlay />

      <SceneTransition durationInFrames={DURATION} variant="blur-dissolve">
        {/* Phase 1: Budget */}
        <AbsoluteFill
          style={{
            padding: "48px 100px 110px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            opacity: phase1Opacity,
          }}
        >
          {/* Headline */}
          <AnimatedText
            text="£5,000 — every pound accounted for"
            fontSize={44}
            fontFamily={fonts.heading}
            delay={10}
          />

          {/* Budget list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: 900,
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
              amount="£5,000"
              delay={72}
              isTotal
            />
          </div>
        </AbsoluteFill>

        {/* Phase 2: Roadmap */}
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
          {/* Headline */}
          <AnimatedText
            text="From MVP to revenue in 6 months"
            fontSize={40}
            fontFamily={fonts.heading}
            delay={310}
          />

          {/* Two-column layout: Timeline left, Revenue right */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 40,
              marginTop: 8,
            }}
          >
            {/* Left: Timeline in 2-column grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
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

            {/* Right: Revenue projections */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 32,
                borderLeft: `1px solid rgba(255, 255, 255, 0.08)`,
                paddingLeft: 40,
                ...arrAnim,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CountUp
                  value={5000}
                  prefix="£"
                  suffix="+"
                  color={colors.gold}
                  fontSize={40}
                  delay={430}
                />
                <span
                  style={{
                    fontSize: 18,
                    fontFamily: fonts.body,
                    color: colors.text.muted,
                  }}
                >
                  6-month revenue
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CountUp
                  value={22800}
                  prefix="£"
                  suffix=" ARR"
                  color={colors.gold}
                  fontSize={40}
                  delay={445}
                />
                <span
                  style={{
                    fontSize: 18,
                    fontFamily: fonts.body,
                    color: colors.text.muted,
                  }}
                >
                  at 100 subscribers
                </span>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </SceneTransition>
      <Subtitle entries={SUBTITLES_S09} />
    </AbsoluteFill>
  );
};

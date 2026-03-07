import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { CountUp } from "./CountUp";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

interface StatBlockProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source?: string;
  delay?: number;
  decimals?: number;
  color?: string;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  value, prefix, suffix, label, source, delay = 0, decimals, color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);

  return (
    <div style={{
      background: colors.bg.card,
      borderRadius: 14,
      padding: "32px 28px",
      borderLeft: `3px solid ${colors.accent}`,
      flex: 1,
      minWidth: 280,
      ...anim,
    }}>
      <CountUp value={value} prefix={prefix} suffix={suffix} delay={delay + 6} decimals={decimals} color={color} />
      <div style={{ fontSize: 15, color: colors.text.secondary, lineHeight: 1.5, marginTop: 8, fontFamily: fonts.body }}>
        {label}
      </div>
      {source && (
        <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 8, fontFamily: fonts.mono }}>
          {source}
        </div>
      )}
    </div>
  );
};

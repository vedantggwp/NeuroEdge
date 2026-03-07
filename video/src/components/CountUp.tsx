import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { fonts } from "../lib/fonts";
import { colors } from "../lib/theme";
import { SPRING_CONFIG } from "../lib/animations";

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  color?: string;
  delay?: number;
  decimals?: number;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  prefix = "",
  suffix = "",
  fontSize = 44,
  color = colors.accent,
  delay = 0,
  decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { ...SPRING_CONFIG, stiffness: 60 },
  });

  const displayValue = (value * Math.min(progress, 1)).toFixed(decimals);

  return (
    <span style={{ fontFamily: fonts.heading, fontSize, color, display: "inline-block" }}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

interface ScoreTransitionProps {
  from: number;
  to: number;
  delay?: number;
  duration?: number;
}

const SCORE_SPRING = {
  stiffness: 100,
  damping: 12,
  mass: 0.8,
};

function interpolateColor(
  value: number,
  inputRange: readonly [number, number],
  fromHex: string,
  toHex: string
): string {
  const t = Math.max(0, Math.min(1, (value - inputRange[0]) / (inputRange[1] - inputRange[0])));
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  const r = Math.round(from.r + (to.r - from.r) * t);
  const g = Math.round(from.g + (to.g - from.g) * t);
  const b = Math.round(from.b + (to.b - from.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export const ScoreTransition: React.FC<ScoreTransitionProps> = ({
  from,
  to,
  delay = 0,
  duration = 45,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: SCORE_SPRING,
    durationInFrames: duration,
  });

  const currentValue = interpolate(progress, [0, 1], [from, to]);
  const displayValue = Math.round(currentValue);

  const scoreColor = interpolateColor(
    currentValue,
    [from, to] as const,
    colors.warning,
    colors.accent
  );

  const bgAlpha = interpolate(progress, [0, 1], [0.1, 0.15]);

  const badgeScale = interpolate(progress, [0, 0.5, 1], [0.9, 1.05, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${scoreColor}${Math.round(bgAlpha * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          transform: `scale(${badgeScale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: 700,
              fontSize: 72,
              color: scoreColor,
              lineHeight: 1,
            }}
          >
            {displayValue}
          </span>
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: 400,
              fontSize: 36,
              color: colors.text.secondary,
              lineHeight: 1,
            }}
          >
            / 100
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

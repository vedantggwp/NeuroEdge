import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

interface CinematicTextProps {
  readonly lines: readonly string[];
  readonly delayBetweenLines?: number;
  readonly startDelay?: number;
  readonly fontSize?: number;
  readonly color?: string;
  readonly dimPreviousLines?: boolean;
}

export const CinematicText: React.FC<CinematicTextProps> = ({
  lines,
  delayBetweenLines = 60,
  startDelay = 0,
  fontSize = 48,
  color = colors.text.primary,
  dimPreviousLines = true,
}) => {
  const frame = useCurrentFrame();
  const BLUR_DURATION = 20;

  const lastVisibleIndex = lines.reduce((acc, _, i) => {
    const lineStart = startDelay + i * delayBetweenLines;
    return frame >= lineStart ? i : acc;
  }, -1);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      {lines.map((line, i) => {
        const lineStart = startDelay + i * delayBetweenLines;
        const localFrame = frame - lineStart;

        if (localFrame < 0) {
          return null;
        }

        const revealProgress = interpolate(
          localFrame,
          [0, BLUR_DURATION],
          [0, 1],
          { extrapolateRight: "clamp" },
        );

        const blurAmount = interpolate(revealProgress, [0, 1], [4, 0]);

        const isLatestLine = i === lastVisibleIndex;
        const baseOpacity = revealProgress;
        const opacity =
          dimPreviousLines && !isLatestLine
            ? Math.min(baseOpacity, 0.5)
            : baseOpacity;

        return (
          <div
            key={`line-${String(i)}`}
            style={{
              fontFamily: fonts.heading,
              fontSize,
              color,
              opacity,
              filter: `blur(${blurAmount}px)`,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

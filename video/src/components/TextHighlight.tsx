import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../lib/theme";
import { SPRING_GENTLE } from "../lib/animations";

interface TextHighlightProps {
  children: React.ReactNode;
  delay?: number;
  color?: string;
  highlightHeight?: number;
}

export const TextHighlight: React.FC<TextHighlightProps> = ({
  children,
  delay = 0,
  color = colors.accent,
  highlightHeight = 6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_GENTLE,
  });

  const width = interpolate(progress, [0, 1], [0, 100]);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span
        style={{
          position: "absolute",
          bottom: -2,
          left: 0,
          width: `${width}%`,
          height: highlightHeight,
          background: color,
          opacity: 0.4,
          borderRadius: 3,
        }}
      />
    </span>
  );
};

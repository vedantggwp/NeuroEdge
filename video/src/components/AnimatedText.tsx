import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { fonts } from "../lib/fonts";
import { colors } from "../lib/theme";
import { SPRING_CONFIG } from "../lib/animations";

interface AnimatedTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  delay?: number;
  staggerFrames?: number;
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  fontSize = 56,
  color = colors.text.primary,
  fontFamily = fonts.heading,
  delay = 0,
  staggerFrames = 3,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em", ...style }}>
      {words.map((word, i) => {
        const wordDelay = delay + i * staggerFrames;
        const progress = spring({
          frame: frame - wordDelay,
          fps,
          config: SPRING_CONFIG,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize,
              fontFamily,
              color,
              opacity: progress,
              transform: `translateY(${(1 - progress) * 15}px)`,
              lineHeight: 1.2,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

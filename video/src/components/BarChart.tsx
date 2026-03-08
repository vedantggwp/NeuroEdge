import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SPRING_CONFIG, staggerDelay } from "../lib/animations";

interface BarItem {
  label: string;
  sublabel?: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  items: BarItem[];
  delay?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ items, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        maxWidth: 900,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {items.map((item, i) => {
        const barDelay = delay + staggerDelay(i, 8);
        const progress = spring({ frame: frame - barDelay, fps, config: SPRING_CONFIG });
        const barColor = item.highlight ? colors.accent : colors.text.muted;
        const textColor = item.highlight ? colors.text.primary : colors.text.secondary;

        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr 200px",
              alignItems: "center",
              gap: 16,
              opacity: progress,
            }}
          >
            {/* Label */}
            <span
              style={{
                fontFamily: fonts.body,
                fontSize: 18,
                color: textColor,
                fontWeight: item.highlight ? 700 : 400,
              }}
            >
              {item.label}
            </span>

            {/* Bar */}
            <div
              style={{
                height: 10,
                borderRadius: 5,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${item.value * progress}%`,
                  background: barColor,
                  borderRadius: 5,
                }}
              />
            </div>

            {/* Sublabel */}
            {item.sublabel && (
              <span
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 15,
                  color: item.highlight ? colors.accent : colors.text.muted,
                  textAlign: "right",
                }}
              >
                {item.sublabel}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

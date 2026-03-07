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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item, i) => {
        const barDelay = delay + staggerDelay(i, 8);
        const progress = spring({ frame: frame - barDelay, fps, config: SPRING_CONFIG });
        const barColor = item.highlight ? colors.accent : colors.text.muted;
        const textColor = item.highlight ? colors.text.primary : colors.text.secondary;

        return (
          <div key={i} style={{ opacity: progress }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
              fontFamily: fonts.body,
              fontSize: 14,
              color: textColor,
              fontWeight: item.highlight ? 700 : 400,
            }}>
              <span>{item.label}</span>
              {item.sublabel && <span style={{ color: colors.text.muted, fontSize: 13 }}>{item.sublabel}</span>}
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${item.value * progress}%`, background: barColor, borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

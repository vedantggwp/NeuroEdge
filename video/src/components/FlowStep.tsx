import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SPRING_CONFIG } from "../lib/animations";

interface FlowStepProps {
  stepNum: string;
  title: string;
  description: string;
  delay?: number;
  showArrow?: boolean;
  isActive?: boolean;
}

export const FlowStep: React.FC<FlowStepProps> = ({
  stepNum, title, description, delay = 0, showArrow = true, isActive = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: SPRING_CONFIG });

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
      <div style={{
        flex: 1,
        background: colors.bg.card,
        borderRadius: 12,
        padding: "24px 20px",
        textAlign: "center" as const,
        border: "1px solid rgba(255,255,255,0.05)",
        opacity: progress,
        transform: `translateY(${(1 - progress) * 20}px)`,
        boxShadow: isActive ? `0 0 30px ${colors.accent}40` : "none",
      }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, color: colors.accent, marginBottom: 10, display: "block" }}>{stepNum}</span>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: colors.text.primary, marginBottom: 8, fontFamily: fonts.body }}>{title}</h4>
        <p style={{ fontSize: 13, lineHeight: 1.45, color: colors.text.secondary, fontFamily: fonts.body }}>{description}</p>
      </div>
      {showArrow && (
        <div style={{ display: "flex", alignItems: "center", color: colors.accent, fontSize: 20, opacity: progress }}>→</div>
      )}
    </div>
  );
};

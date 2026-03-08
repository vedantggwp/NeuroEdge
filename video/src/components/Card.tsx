import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

interface CardProps {
  icon?: string;
  title: string;
  body: string;
  delay?: number;
  borderColor?: string;
  source?: string;
  badge?: string;
  badgeColor?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  icon, title, body, delay = 0, borderColor, source, badge, badgeColor = colors.accent, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);

  return (
    <div style={{
      background: colors.bg.card,
      borderRadius: 14,
      padding: 28,
      border: "1px solid rgba(255,255,255,0.06)",
      borderLeft: borderColor ? `3px solid ${borderColor}` : undefined,
      ...anim,
      ...style,
    }}>
      {icon && <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>{icon}</span>}
      <h4 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: colors.text.primary, fontFamily: fonts.body }}>
        {title}
        {badge && (
          <span style={{
            display: "inline-block",
            background: `${badgeColor}20`,
            color: badgeColor,
            padding: "4px 14px",
            borderRadius: 20,
            fontSize: 16,
            fontWeight: 500,
            marginLeft: 8,
          }}>{badge}</span>
        )}
      </h4>
      <p style={{ fontSize: 18, lineHeight: 1.6, color: colors.text.secondary, fontFamily: fonts.body }}>{body}</p>
      {source && <div style={{ fontSize: 16, color: colors.text.muted, marginTop: 10, fontFamily: fonts.mono }}>{source}</div>}
    </div>
  );
};

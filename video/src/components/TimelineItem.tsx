import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { fadeInUp } from "../lib/animations";

interface TimelineItemProps {
  marker: string;
  title: string;
  description: string;
  delay?: number;
  isActive?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  marker, title, description, delay = 0, isActive = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = fadeInUp(frame, fps, delay);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", ...anim }}>
      <div style={{
        minWidth: 48,
        height: 32,
        background: isActive ? colors.accent : colors.accentDim,
        color: "white",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        fontFamily: fonts.mono,
      }}>{marker}</div>
      <div>
        <h4 style={{ fontSize: 17, fontWeight: 700, color: colors.text.primary, marginBottom: 4, fontFamily: fonts.body }}>{title}</h4>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: colors.text.secondary, fontFamily: fonts.body }}>{description}</p>
      </div>
    </div>
  );
};

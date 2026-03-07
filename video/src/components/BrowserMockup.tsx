import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SPRING_CONFIG } from "../lib/animations";

interface BrowserMockupProps {
  url?: string;
  delay?: number;
  children?: React.ReactNode;
}

export const BrowserMockup: React.FC<BrowserMockupProps> = ({
  url = "https://neuroedge.co.uk/scan",
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: SPRING_CONFIG });

  const loadProgress = interpolate(frame - delay - 15, [0, 45], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{
      background: "#1a1f2e",
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
      opacity: progress,
      transform: `scale(${interpolate(progress, [0, 1], [0.95, 1])})`,
      width: "100%",
      maxWidth: 700,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 16px",
        background: "rgba(0,0,0,0.3)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
        </div>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 6,
          padding: "6px 12px",
          fontSize: 12,
          color: colors.text.muted,
          fontFamily: fonts.mono,
        }}>{url}</div>
      </div>
      {loadProgress < 100 && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
          <div style={{ height: "100%", width: `${loadProgress}%`, background: colors.accent }} />
        </div>
      )}
      <div style={{ padding: 24, minHeight: 200 }}>{children}</div>
    </div>
  );
};

import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";
import { SPRING_CONFIG } from "../lib/animations";

type BrowserVariant = "dark" | "light";

interface BrowserMockupProps {
  url?: string;
  delay?: number;
  children?: React.ReactNode;
  variant?: BrowserVariant;
}

const darkTheme = {
  bg: "#1a1f2e",
  border: "rgba(255,255,255,0.08)",
  toolbarBg: "rgba(0,0,0,0.3)",
  toolbarBorder: "rgba(255,255,255,0.06)",
  urlBg: "rgba(255,255,255,0.06)",
  urlColor: colors.text.muted,
  loadBg: "rgba(255,255,255,0.06)",
  contentPadding: 24,
} as const;

const lightTheme = {
  bg: "#FFFFFF",
  border: "rgba(0,0,0,0.12)",
  toolbarBg: "#F5F5F5",
  toolbarBorder: "rgba(0,0,0,0.08)",
  urlBg: "rgba(0,0,0,0.05)",
  urlColor: "#888888",
  loadBg: "rgba(0,0,0,0.06)",
  contentPadding: 0,
} as const;

export const BrowserMockup: React.FC<BrowserMockupProps> = ({
  url = "https://neuroedge.co.uk/scan",
  delay = 0,
  children,
  variant = "dark",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: SPRING_CONFIG });

  const loadProgress = interpolate(frame - delay - 15, [0, 45], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const theme = variant === "light" ? lightTheme : darkTheme;

  return (
    <div style={{
      background: theme.bg,
      borderRadius: 12,
      overflow: "hidden",
      border: `1px solid ${theme.border}`,
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
        background: theme.toolbarBg,
        borderBottom: `1px solid ${theme.toolbarBorder}`,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
        </div>
        <div style={{
          flex: 1,
          background: theme.urlBg,
          borderRadius: 6,
          padding: "6px 12px",
          fontSize: 12,
          color: theme.urlColor,
          fontFamily: fonts.mono,
        }}>{url}</div>
      </div>
      {loadProgress < 100 && (
        <div style={{ height: 2, background: theme.loadBg }}>
          <div style={{ height: "100%", width: `${loadProgress}%`, background: colors.accent }} />
        </div>
      )}
      <div style={{ padding: theme.contentPadding, minHeight: 200 }}>{children}</div>
    </div>
  );
};

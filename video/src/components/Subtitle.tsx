import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { fonts } from "../lib/fonts";

export interface SubtitleEntry {
  readonly text: string;
  readonly start: number;
  readonly end: number;
}

interface SubtitleProps {
  readonly entries: readonly SubtitleEntry[];
}

const FADE_FRAMES = 8;

export const Subtitle: React.FC<SubtitleProps> = ({ entries }) => {
  const frame = useCurrentFrame();

  const active = entries.find((e) => frame >= e.start && frame <= e.end);

  if (!active) return null;

  const fadeIn = interpolate(
    frame,
    [active.start, active.start + FADE_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const fadeOut = interpolate(
    frame,
    [active.end - FADE_FRAMES, active.end],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacity = fadeIn * fadeOut;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 64,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 100,
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(11, 18, 34, 0.82)",
          backdropFilter: "blur(8px)",
          borderRadius: 10,
          padding: "14px 32px",
          maxWidth: 1200,
        }}
      >
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: 26,
            color: "#E8ECF4",
            lineHeight: 1.4,
            textAlign: "center",
            display: "block",
            fontWeight: 400,
            letterSpacing: "0.01em",
          }}
        >
          {active.text}
        </span>
      </div>
    </div>
  );
};

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "../lib/theme";

interface Orb {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  blur: number;
}

const ORBS: Orb[] = [
  { x: 15, y: 25, size: 200, speed: 600, color: colors.accent, blur: 80 },
  { x: 75, y: 15, size: 160, speed: 800, color: colors.accentDim, blur: 60 },
  {
    x: 50,
    y: 70,
    size: 240,
    speed: 1000,
    color: "rgba(6,90,130,0.6)",
    blur: 100,
  },
  { x: 85, y: 60, size: 120, speed: 700, color: colors.accent, blur: 50 },
  { x: 30, y: 80, size: 180, speed: 900, color: colors.accentDim, blur: 70 },
];

export const FloatingOrbs: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {ORBS.map((orb, i) => {
        const xOffset = interpolate(
          frame % orb.speed,
          [0, orb.speed / 2, orb.speed],
          [0, 30, 0]
        );
        const yOffset = interpolate(
          frame % (orb.speed * 1.3),
          [0, (orb.speed * 1.3) / 2, orb.speed * 1.3],
          [0, -20, 0]
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${orb.x + xOffset * 0.1}%`,
              top: `${orb.y + yOffset * 0.1}%`,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: orb.color,
              opacity: 0.15,
              filter: `blur(${orb.blur}px)`,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

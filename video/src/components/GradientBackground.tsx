import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "../lib/theme";

export const GradientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const x1 = interpolate(frame % 750, [0, 375, 750], [20, 22, 20]);
  const y1 = interpolate(frame % 900, [0, 450, 900], [50, 47, 50]);
  const x2 = interpolate(frame % 600, [0, 300, 600], [80, 78, 80]);
  const y2 = interpolate(frame % 1050, [0, 525, 1050], [20, 23, 20]);

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at ${x1}% ${y1}%, rgba(0,201,167,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at ${x2}% ${y2}%, rgba(10,123,102,0.1) 0%, transparent 45%),
          radial-gradient(ellipse at 60% 80%, rgba(6,90,130,0.09) 0%, transparent 50%),
          ${colors.bg.dark}
        `,
      }}
    />
  );
};

import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../lib/theme";

interface SarahCharacterProps {
  readonly size?: number;
  readonly delay?: number;
  readonly showGlasses?: boolean;
}

const skin = "#E8B88A";
const skinShadow = "#C6956B";
const hair = "#1A0E08";
const hairHighlight = "#2C1810";
const glasses = colors.accent;
const glassesDim = colors.accentDim;
const top = "#1E3A5F";
const topHighlight = "#264A73";

export const SarahCharacter: React.FC<SarahCharacterProps> = ({
  size = 280,
  delay = 0,
  showGlasses = true,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame - delay, [0, 20], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const breathe = Math.sin((frame - delay) * 0.06) * 1.5;

  return (
    <div
      style={{
        width: size,
        height: size,
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ overflow: "visible" }}
      >
        {/* Subtle glow behind character */}
        <defs>
          <radialGradient id="sarahGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.accent} stopOpacity="0.08" />
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hairHighlight} />
            <stop offset="100%" stopColor={hair} />
          </linearGradient>
          <linearGradient id="topGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={topHighlight} />
            <stop offset="100%" stopColor={top} />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="95" fill="url(#sarahGlow)" />

        {/* Neck */}
        <rect
          x="85"
          y={130 + breathe * 0.3}
          width="30"
          height="24"
          rx="8"
          fill={skinShadow}
        />

        {/* Shoulders / top */}
        <ellipse
          cx="100"
          cy={168 + breathe * 0.5}
          rx="56"
          ry="32"
          fill="url(#topGrad)"
        />

        {/* Collar detail */}
        <path
          d={`M 82 ${152 + breathe * 0.4} Q 100 ${165 + breathe * 0.4} 118 ${152 + breathe * 0.4}`}
          fill="none"
          stroke={top}
          strokeWidth="2.5"
        />

        {/* Hair back */}
        <ellipse
          cx="100"
          cy={78 + breathe * 0.2}
          rx="52"
          ry="54"
          fill={hair}
        />

        {/* Face */}
        <ellipse
          cx="100"
          cy={90 + breathe * 0.2}
          rx="40"
          ry="44"
          fill={skin}
        />

        {/* Face shadow (jawline) */}
        <ellipse
          cx="100"
          cy={100 + breathe * 0.2}
          rx="36"
          ry="32"
          fill={skinShadow}
          opacity="0.25"
        />

        {/* Hair front - fringe/bangs */}
        <path
          d={`M 58 ${76 + breathe * 0.2} Q 70 ${55 + breathe * 0.2} 100 ${52 + breathe * 0.2} Q 130 ${55 + breathe * 0.2} 142 ${76 + breathe * 0.2} Q 138 ${62 + breathe * 0.2} 120 ${58 + breathe * 0.2} Q 100 ${65 + breathe * 0.2} 80 ${58 + breathe * 0.2} Q 62 ${62 + breathe * 0.2} 58 ${76 + breathe * 0.2}`}
          fill="url(#hairGrad)"
        />

        {/* Hair sides */}
        <ellipse
          cx="60"
          cy={88 + breathe * 0.2}
          rx="12"
          ry="30"
          fill={hair}
        />
        <ellipse
          cx="140"
          cy={88 + breathe * 0.2}
          rx="12"
          ry="30"
          fill={hair}
        />

        {/* Eyes - slightly closed/narrow to suggest partial sight */}
        <ellipse
          cx="84"
          cy={86 + breathe * 0.2}
          rx="6"
          ry="4"
          fill="#0D0D0D"
        />
        <ellipse
          cx="116"
          cy={86 + breathe * 0.2}
          rx="6"
          ry="4"
          fill="#0D0D0D"
        />

        {/* Eye highlights */}
        <circle
          cx="86"
          cy={85 + breathe * 0.2}
          r="2"
          fill="white"
          opacity="0.85"
        />
        <circle
          cx="118"
          cy={85 + breathe * 0.2}
          r="2"
          fill="white"
          opacity="0.85"
        />

        {/* Eyebrows */}
        <path
          d={`M 75 ${79 + breathe * 0.2} Q 84 ${75 + breathe * 0.2} 93 ${79 + breathe * 0.2}`}
          fill="none"
          stroke={hair}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d={`M 107 ${79 + breathe * 0.2} Q 116 ${75 + breathe * 0.2} 125 ${79 + breathe * 0.2}`}
          fill="none"
          stroke={hair}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Nose */}
        <path
          d={`M 100 ${88 + breathe * 0.2} Q 95 ${98 + breathe * 0.2} 100 ${100 + breathe * 0.2}`}
          fill="none"
          stroke="#9E7B5A"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* Gentle smile */}
        <path
          d={`M 90 ${107 + breathe * 0.2} Q 100 ${114 + breathe * 0.2} 110 ${107 + breathe * 0.2}`}
          fill="none"
          stroke="#8B6B4A"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Glasses (tinted - suggesting visual aid) */}
        {showGlasses && (
          <g opacity="0.9">
            {/* Left lens */}
            <rect
              x="70"
              y={79 + breathe * 0.2}
              width="24"
              height="18"
              rx="5"
              fill={glassesDim}
              opacity="0.15"
              stroke={glasses}
              strokeWidth="2"
            />
            {/* Right lens */}
            <rect
              x="106"
              y={79 + breathe * 0.2}
              width="24"
              height="18"
              rx="5"
              fill={glassesDim}
              opacity="0.15"
              stroke={glasses}
              strokeWidth="2"
            />
            {/* Bridge */}
            <path
              d={`M 94 ${88 + breathe * 0.2} Q 100 ${85 + breathe * 0.2} 106 ${88 + breathe * 0.2}`}
              fill="none"
              stroke={glasses}
              strokeWidth="2"
            />
            {/* Left arm */}
            <line
              x1="70"
              y1={86 + breathe * 0.2}
              x2="60"
              y2={84 + breathe * 0.2}
              stroke={glasses}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Right arm */}
            <line
              x1="130"
              y1={86 + breathe * 0.2}
              x2="140"
              y2={84 + breathe * 0.2}
              stroke={glasses}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

"use client";

import { motion, useReducedMotion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function scoreColor(score: number): string {
  if (score <= 30) return "var(--severity-critical)";
  if (score <= 60) return "var(--severity-serious)";
  if (score <= 80) return "var(--accent)";
  return "var(--revenue)";
}

export function ScoreRing({
  score,
  size = 200,
  strokeWidth = 12,
  label = "Accessibility Score",
}: ScoreRingProps) {
  const prefersReducedMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  return (
    <div className="flex flex-col items-center gap-3" aria-label={`${label}: ${clamped} out of 100`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-subtle)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 1.5, ease: "easeOut" }
          }
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        />
        {/* Score number */}
        <motion.text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-sans font-bold"
          fill="var(--text-primary)"
          fontSize={size * 0.22}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { delay: 0.5, duration: 0.8 }
          }
        >
          {clamped}
        </motion.text>
      </svg>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
    </div>
  );
}

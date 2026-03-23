"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

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

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScoreRing({
  score,
  size = 200,
  strokeWidth = 12,
  label = "Accessibility Score",
}: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const tspanRef = useRef<SVGTSpanElement>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    if (reduced) {
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(offset);
      }
      if (textRef.current) {
        textRef.current.style.opacity = "1";
      }
      if (tspanRef.current) {
        tspanRef.current.textContent = String(clamped);
      }
      return;
    }

    const ctx = gsap.context(() => {
      // Animate the arc
      if (circleRef.current) {
        gsap.fromTo(
          circleRef.current,
          { attr: { "stroke-dashoffset": circumference } },
          { attr: { "stroke-dashoffset": offset }, duration: 1.5, ease: "power2.out" },
        );
      }

      // Fade in the text
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0 },
          { opacity: 1, delay: 0.3, duration: 0.5 },
        );
      }

      // Count-up the number
      if (tspanRef.current) {
        const counter = { val: 0 };
        gsap.to(counter, {
          val: clamped,
          duration: 1.5,
          ease: "power2.out",
          onUpdate() {
            if (tspanRef.current) {
              tspanRef.current.textContent = String(Math.round(counter.val));
            }
          },
        });
      }
    });

    return () => ctx.revert();
  }, [clamped, circumference, offset]);

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
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        />
        {/* Score number */}
        <text
          ref={textRef}
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-sans font-bold"
          fill="var(--text-primary)"
          fontSize={size * 0.22}
          style={{ opacity: 0 }}
        >
          <tspan ref={tspanRef}>0</tspan>
        </text>
      </svg>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
    </div>
  );
}

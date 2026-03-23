"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/Progress";

const PHASES = [
  { label: "Connecting to your website...", durationMs: 3000 },
  { label: "Checking accessibility...", durationMs: 8000 },
  { label: "Analysing results...", durationMs: 4000 },
] as const;

const TOTAL_MS = PHASES.reduce((sum, p) => sum + p.durationMs, 0);

export function ScanProgress() {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMs((prev) => Math.min(prev + 200, TOTAL_MS));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.round((elapsedMs / TOTAL_MS) * 95);

  let accumulated = 0;
  let currentPhase: string = PHASES[0].label;
  for (const phase of PHASES) {
    accumulated += phase.durationMs;
    if (elapsedMs <= accumulated) {
      currentPhase = phase.label;
      break;
    }
    currentPhase = phase.label;
  }

  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center gap-6"
      role="status"
      aria-live="polite"
      aria-label="Scanning in progress"
    >
      {/* Spinner */}
      <div className="animate-spin-continuous h-12 w-12 rounded-full border-4 border-accent/30 border-t-accent" />

      {/* Phase label */}
      <p
        key={currentPhase}
        className="animate-fade-up text-lg font-medium text-text-primary"
      >
        {currentPhase}
      </p>

      {/* Progress bar */}
      <Progress value={progress} className="w-full" />
    </div>
  );
}

import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../lib/theme";

interface CursorStep {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly delay: number;
  readonly duration: number;
}

interface ScreenReaderCursorProps {
  readonly steps: readonly CursorStep[];
  readonly failAtIndex?: number;
  readonly successMode?: boolean;
}

const NORMAL_COLOR = "#4A90D9";
const FAIL_COLOR = colors.warning;
const SUCCESS_COLOR = colors.accent;
const BORDER_WIDTH = 3;
const BORDER_RADIUS = 4;
const STUTTER_AMPLITUDE = 5;

function getStepTimings(steps: readonly CursorStep[]) {
  return steps.map((step) => ({
    start: step.delay,
    end: step.delay + step.duration,
  }));
}

function getCursorColor(
  successMode: boolean,
  isFailing: boolean
): string {
  if (successMode) return SUCCESS_COLOR;
  if (isFailing) return FAIL_COLOR;
  return NORMAL_COLOR;
}

function interpolateProperty(
  frame: number,
  fromValue: number,
  toValue: number,
  transitionStart: number,
  transitionEnd: number
): number {
  return interpolate(frame, [transitionStart, transitionEnd], [fromValue, toValue], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export const ScreenReaderCursor: React.FC<ScreenReaderCursorProps> = ({
  steps,
  failAtIndex,
  successMode = false,
}) => {
  const frame = useCurrentFrame();

  if (steps.length === 0) {
    return null;
  }

  const timings = getStepTimings(steps);

  // Determine which step we're on or transitioning between
  const firstStart = timings[0].start;
  if (frame < firstStart) {
    return null;
  }

  // Find current active step index
  let activeIndex = 0;
  for (let i = 0; i < steps.length; i++) {
    if (frame >= timings[i].start) {
      activeIndex = i;
    }
  }

  const isFailing =
    failAtIndex !== undefined && !successMode && activeIndex >= failAtIndex;

  // Calculate animated position
  let x: number;
  let y: number;
  let width: number;
  let height: number;

  if (activeIndex === 0 || frame < timings[activeIndex].start) {
    // At first step or before transition starts
    const step = steps[Math.min(activeIndex, steps.length - 1)];
    x = step.x;
    y = step.y;
    width = step.width;
    height = step.height;
  } else {
    // Transitioning from previous step to current step
    const prev = steps[activeIndex - 1];
    const curr = steps[activeIndex];
    const transitionStart = timings[activeIndex].start;
    const transitionDuration = Math.min(15, curr.duration);
    const transitionEnd = transitionStart + transitionDuration;

    x = interpolateProperty(frame, prev.x, curr.x, transitionStart, transitionEnd);
    y = interpolateProperty(frame, prev.y, curr.y, transitionStart, transitionEnd);
    width = interpolateProperty(frame, prev.width, curr.width, transitionStart, transitionEnd);
    height = interpolateProperty(frame, prev.height, curr.height, transitionStart, transitionEnd);
  }

  // Fail mode: stutter, flash, and fade
  let opacity = 1;
  let stutterOffsetX = 0;
  let stutterOffsetY = 0;

  if (isFailing && failAtIndex !== undefined) {
    const failStart = timings[failAtIndex].start;
    const failDuration = steps[failAtIndex].duration;
    const failProgress = interpolate(
      frame,
      [failStart, failStart + failDuration],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // Stutter: oscillate position back and forth
    const stutterPhase = failProgress * Math.PI * 8;
    stutterOffsetX = Math.sin(stutterPhase) * STUTTER_AMPLITUDE * (1 - failProgress);
    stutterOffsetY = Math.cos(stutterPhase * 0.7) * STUTTER_AMPLITUDE * 0.5 * (1 - failProgress);

    // Flash opacity twice then fade
    const flashCount = 2;
    const flashPhase = failProgress * flashCount * Math.PI * 2;
    const flashEffect = failProgress < 0.6
      ? Math.abs(Math.sin(flashPhase)) * 0.4 + 0.6
      : 1;

    // Fade out in the last 40%
    const fadeOut = failProgress > 0.6
      ? interpolate(failProgress, [0.6, 1], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

    opacity = flashEffect * fadeOut;
  }

  // After the last step ends, hide
  const lastEnd = timings[timings.length - 1].end;
  if (!isFailing && frame > lastEnd) {
    return null;
  }
  if (isFailing && failAtIndex !== undefined) {
    const failEnd = timings[failAtIndex].start + steps[failAtIndex].duration;
    if (frame > failEnd) {
      return null;
    }
  }

  const cursorColor = getCursorColor(successMode, isFailing);

  const glowSpread = isFailing ? 8 : 6;
  const glowOpacity = isFailing ? 0.5 : 0.4;
  const boxShadow = `0 0 ${glowSpread}px rgba(${hexToRgb(cursorColor)}, ${glowOpacity})`;

  return (
    <div
      style={{
        position: "absolute",
        top: y + stutterOffsetY - BORDER_WIDTH,
        left: x + stutterOffsetX - BORDER_WIDTH,
        width: width + BORDER_WIDTH * 2,
        height: height + BORDER_WIDTH * 2,
        border: `${BORDER_WIDTH}px solid ${cursorColor}`,
        borderRadius: BORDER_RADIUS,
        boxShadow,
        opacity,
        pointerEvents: "none",
        boxSizing: "border-box",
      }}
    />
  );
};

function hexToRgb(hex: string): string {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

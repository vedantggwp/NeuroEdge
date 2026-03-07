import { interpolate, spring } from "remotion";

export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 120,
  mass: 0.5,
};

export const SPRING_GENTLE = {
  damping: 30,
  stiffness: 80,
  mass: 0.8,
};

export function fadeInUp(
  frame: number,
  fps: number,
  delay: number = 0
): { opacity: number; transform: string } {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG,
  });
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
  };
}

export function fadeInScale(
  frame: number,
  fps: number,
  delay: number = 0
): { opacity: number; transform: string } {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_CONFIG,
  });
  return {
    opacity: progress,
    transform: `scale(${interpolate(progress, [0, 1], [0.95, 1])})`,
  };
}

export function sceneFade(
  frame: number,
  durationInFrames: number,
  transitionFrames: number = 15
): number {
  const enterOpacity = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  return Math.min(enterOpacity, exitOpacity);
}

export function staggerDelay(index: number, baseDelay: number = 6): number {
  return index * baseDelay;
}

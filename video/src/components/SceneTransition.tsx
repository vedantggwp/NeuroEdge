import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

type TransitionVariant = "fade" | "blur-dissolve" | "wipe-up" | "zoom-pull";

interface SceneTransitionProps {
  children: React.ReactNode;
  durationInFrames: number;
  transitionFrames?: number;
  variant?: TransitionVariant;
}

function useFadeTransition(
  frame: number,
  durationInFrames: number,
  transitionFrames: number
): React.CSSProperties {
  const enterOpacity = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(enterOpacity, exitOpacity);

  const enterScale = interpolate(frame, [0, transitionFrames], [1.03, 1], {
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0.97],
    { extrapolateLeft: "clamp" }
  );
  const scale = frame < durationInFrames / 2 ? enterScale : exitScale;

  return { opacity, transform: `scale(${scale})` };
}

function useBlurDissolveTransition(
  frame: number,
  durationInFrames: number,
  transitionFrames: number
): React.CSSProperties {
  const enterOpacity = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(enterOpacity, exitOpacity);

  const enterBlur = interpolate(frame, [0, transitionFrames], [4, 0], {
    extrapolateRight: "clamp",
  });
  const exitBlur = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [0, 4],
    { extrapolateLeft: "clamp" }
  );
  const blur = frame < durationInFrames / 2 ? enterBlur : exitBlur;

  return { opacity, filter: `blur(${blur}px)` };
}

function useWipeUpTransition(
  frame: number,
  durationInFrames: number,
  transitionFrames: number
): React.CSSProperties {
  const enterReveal = interpolate(frame, [0, transitionFrames], [100, 0], {
    extrapolateRight: "clamp",
  });
  const exitHide = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [0, 100],
    { extrapolateLeft: "clamp" }
  );
  const topClip = frame < durationInFrames / 2 ? enterReveal : exitHide;

  return {
    clipPath: `inset(${topClip}% 0% 0% 0%)`,
  };
}

function useZoomPullTransition(
  frame: number,
  durationInFrames: number,
  transitionFrames: number
): React.CSSProperties {
  const enterOpacity = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(enterOpacity, exitOpacity);

  const enterScale = interpolate(frame, [0, transitionFrames], [1.1, 1.0], {
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1.0, 0.9],
    { extrapolateLeft: "clamp" }
  );
  const scale = frame < durationInFrames / 2 ? enterScale : exitScale;

  return { opacity, transform: `scale(${scale})` };
}

const VARIANT_HOOKS: Record<
  TransitionVariant,
  (
    frame: number,
    durationInFrames: number,
    transitionFrames: number
  ) => React.CSSProperties
> = {
  fade: useFadeTransition,
  "blur-dissolve": useBlurDissolveTransition,
  "wipe-up": useWipeUpTransition,
  "zoom-pull": useZoomPullTransition,
};

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  durationInFrames,
  transitionFrames = 15,
  variant = "fade",
}) => {
  const frame = useCurrentFrame();
  const style = VARIANT_HOOKS[variant](frame, durationInFrames, transitionFrames);

  return (
    <AbsoluteFill style={style}>
      {children}
    </AbsoluteFill>
  );
};

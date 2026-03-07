import { Composition } from "remotion";
import { Video } from "./Video";

const FPS = 30;
const DURATION_SECONDS = 215;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NeuroEdgePitch"
      component={Video}
      durationInFrames={FPS * DURATION_SECONDS}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};

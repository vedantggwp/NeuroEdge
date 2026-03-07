import React from "react";
import { Series } from "remotion";
import { S01_ColdOpen } from "./scenes/S01_ColdOpen";
import { S02_ProblemStats } from "./scenes/S02_ProblemStats";
import { S03_MarketAndLaw } from "./scenes/S03_MarketAndLaw";
import { S04_Solution } from "./scenes/S04_Solution";
import { S05_HowItWorks } from "./scenes/S05_HowItWorks";
import { S06_CustomerAndPricing } from "./scenes/S06_CustomerAndPricing";
import { S07_Competition } from "./scenes/S07_Competition";
import { S08_Team } from "./scenes/S08_Team";
import { S09_RoadmapAndFunds } from "./scenes/S09_RoadmapAndFunds";
import { S10_AskAndClose } from "./scenes/S10_AskAndClose";

export const Video: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={600}>
        <S01_ColdOpen />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <S02_ProblemStats />
      </Series.Sequence>
      <Series.Sequence durationInFrames={750}>
        <S03_MarketAndLaw />
      </Series.Sequence>
      <Series.Sequence durationInFrames={750}>
        <S04_Solution />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <S05_HowItWorks />
      </Series.Sequence>
      <Series.Sequence durationInFrames={750}>
        <S06_CustomerAndPricing />
      </Series.Sequence>
      <Series.Sequence durationInFrames={450}>
        <S07_Competition />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <S08_Team />
      </Series.Sequence>
      <Series.Sequence durationInFrames={750}>
        <S09_RoadmapAndFunds />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <S10_AskAndClose />
      </Series.Sequence>
    </Series>
  );
};

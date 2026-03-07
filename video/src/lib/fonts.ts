import {
  loadFont as loadDMSerif,
  fontFamily as dmSerifFamily,
} from "@remotion/google-fonts/DMSerifDisplay";
import {
  loadFont as loadDMSans,
  fontFamily as dmSansFamily,
} from "@remotion/google-fonts/DMSans";
import {
  loadFont as loadJetBrains,
  fontFamily as jetBrainsFamily,
} from "@remotion/google-fonts/JetBrainsMono";

loadDMSerif();
loadDMSans();
loadJetBrains();

export const fonts = {
  heading: dmSerifFamily,
  body: dmSansFamily,
  mono: jetBrainsFamily,
} as const;

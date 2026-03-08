export const colors = {
  bg: {
    dark: "#0B1222",
    card: "#131D33",
    light: "#F4F6FA",
  },
  accent: "#00C9A7",
  accentDim: "#0A7B66",
  warning: "#FF6B6B",
  gold: "#FFD93D",
  text: {
    primary: "#E8ECF4",
    secondary: "#A8B2C4",
    muted: "#7B8AA0",
    dark: "#1A1F2E",
  },
} as const;

export const fontSize = {
  hero: 72,
  h1: 48,
  h2: 36,
  h3: 24,
  body: 22,
  bodySmall: 20,
  caption: 18,
  tag: 16,
} as const;

export const spacing = {
  page: { x: 100, y: 64 },
  gap: {
    sm: 12,
    md: 24,
    lg: 48,
  },
} as const;

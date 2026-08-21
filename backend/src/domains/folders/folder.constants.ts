export const GRADIENT_PRESET_KEYS = [
  "PEACH",
  "LAVENDER",
  "SKY",
  "MINT",
  "SUNSET",
  "MONO",
] as const;

export type GradientPresetKey = (typeof GRADIENT_PRESET_KEYS)[number];

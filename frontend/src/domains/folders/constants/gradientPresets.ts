export const GRADIENT_PRESETS = [
  { key: "PEACH", label: "Peach", from: "#ffd9c2", to: "#ff9d8a" },
  { key: "LAVENDER", label: "Lavender", from: "#e3d6ff", to: "#b79bff" },
  { key: "SKY", label: "Sky", from: "#cdeeff", to: "#8fc7ff" },
  { key: "MINT", label: "Mint", from: "#d3f8e6", to: "#8fe0bb" },
  { key: "SUNSET", label: "Sunset", from: "#ffd9a0", to: "#ff8fa3" },
  { key: "MONO", label: "Mono", from: "#eceaea", to: "#b9b6bd" },
] as const;

export type GradientPresetKey = (typeof GRADIENT_PRESETS)[number]["key"];

export function gradientCss(from: string, to: string) {
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

export function getGradientByKey(key: string) {
  const preset = GRADIENT_PRESETS.find((item) => item.key === key) ?? GRADIENT_PRESETS[0];
  return { ...preset, gradient: gradientCss(preset.from, preset.to) };
}

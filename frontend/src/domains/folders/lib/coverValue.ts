import { GRADIENT_PRESETS, gradientCss } from "../constants/gradientPresets";
import { CUSTOM_GRADIENT_PATTERN, DEFAULT_GLASS_COLOR, DEFAULT_SOLID_COLOR, HEX_COLOR_PATTERN } from "../constants/coverColors";
import type { CoverType } from "../types";

export function isHexColor(value: string) {
  return HEX_COLOR_PATTERN.test(value);
}

export function isCustomGradient(value: string) {
  return CUSTOM_GRADIENT_PATTERN.test(value);
}

export function isPresetGradient(value: string) {
  return GRADIENT_PRESETS.some((preset) => preset.key === value);
}

export function parseGradientStops(value: string): { from: string; to: string } {
  if (isCustomGradient(value)) {
    const [from, to] = value.split("|");
    return { from, to };
  }
  const preset = GRADIENT_PRESETS.find((item) => item.key === value) ?? GRADIENT_PRESETS[1];
  return { from: preset.from, to: preset.to };
}

export function formatGradientStops(from: string, to: string) {
  return `${from}|${to}`;
}

export function gradientBackground(value: string) {
  const { from, to } = parseGradientStops(value);
  return gradientCss(from, to);
}

export function isValidCoverValue(coverType: CoverType, coverValue: string) {
  if (coverType === "IMAGE") return coverValue.startsWith("/uploads/");
  if (coverType === "SOLID" || coverType === "GLASS") return isHexColor(coverValue);
  return isPresetGradient(coverValue) || isCustomGradient(coverValue);
}

export function valueForCoverType(nextType: CoverType, currentValue: string): string {
  if (nextType === "IMAGE") {
    return currentValue.startsWith("/uploads/") ? currentValue : "";
  }
  if (nextType === "GRADIENT") {
    if (isPresetGradient(currentValue) || isCustomGradient(currentValue)) return currentValue;
    if (isHexColor(currentValue)) return formatGradientStops(currentValue, DEFAULT_GLASS_COLOR);
    return "LAVENDER";
  }
  if (isHexColor(currentValue)) return currentValue;
  if (isPresetGradient(currentValue) || isCustomGradient(currentValue)) {
    return parseGradientStops(currentValue).from;
  }
  return nextType === "GLASS" ? DEFAULT_GLASS_COLOR : DEFAULT_SOLID_COLOR;
}

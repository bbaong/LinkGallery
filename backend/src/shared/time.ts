const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const SEVEN_DAYS_MS = 7 * UNIT_TO_MS.d;

export function parseDurationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return SEVEN_DAYS_MS;
  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit];
}

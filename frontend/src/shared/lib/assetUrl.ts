export function assetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.VITE_ASSET_BASE_URL}${path}`;
}

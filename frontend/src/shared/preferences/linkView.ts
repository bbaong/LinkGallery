export const LINK_VIEW_STORAGE_KEY = "link-gallery-link-view";

export type LinkViewMode = "card" | "preview";

export function isLinkViewMode(value: unknown): value is LinkViewMode {
  return value === "card" || value === "preview";
}

export function readLinkViewMode(): LinkViewMode {
  try {
    const stored = localStorage.getItem(LINK_VIEW_STORAGE_KEY);
    if (isLinkViewMode(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "card";
}

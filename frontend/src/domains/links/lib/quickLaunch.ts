const STORAGE_PREFIX = "link-gallery-quick-launch:";
export const QUICK_LAUNCH_MAX = 8;

export function loadQuickLaunchIds(userId: string): string[] | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== "string")) return null;
    return parsed.slice(0, QUICK_LAUNCH_MAX);
  } catch {
    return null;
  }
}

export function saveQuickLaunchIds(userId: string, ids: string[]) {
  localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(ids.slice(0, QUICK_LAUNCH_MAX)));
}

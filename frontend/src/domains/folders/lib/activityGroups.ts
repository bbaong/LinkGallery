import type { Locale } from "../../../shared/i18n/locale";
import type { FolderActivity } from "../types";

export interface ActivityDayGroup {
  key: string;
  label: string;
  items: FolderActivity[];
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatActivityTime(iso: string, locale: Locale) {
  return new Date(iso).toLocaleTimeString(locale === "ko" ? "ko-KR" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatActivityPath(folderName: string, targetName: string | null) {
  if (!targetName) return null;
  return `/${folderName}/${targetName}`;
}

export function groupActivitiesByDay(
  activities: FolderActivity[],
  locale: Locale,
  labels: { today: string; yesterday: string }
): ActivityDayGroup[] {
  const tagLocale = locale === "ko" ? "ko-KR" : "en-US";
  const now = new Date();
  const today = startOfLocalDay(now);
  const yesterday = today - 24 * 60 * 60 * 1000;
  const groups: ActivityDayGroup[] = [];

  for (const activity of activities) {
    const date = new Date(activity.createdAt);
    const dayStart = startOfLocalDay(date);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const last = groups[groups.length - 1];

    let label: string;
    if (dayStart === today) label = labels.today;
    else if (dayStart === yesterday) label = labels.yesterday;
    else if (date.getFullYear() === now.getFullYear()) {
      label = date.toLocaleDateString(tagLocale, { month: "long", day: "numeric" });
    } else {
      label = date.toLocaleDateString(tagLocale, { year: "numeric", month: "long", day: "numeric" });
    }

    if (last?.key === key) {
      last.items.push(activity);
    } else {
      groups.push({ key, label, items: [activity] });
    }
  }

  return groups;
}

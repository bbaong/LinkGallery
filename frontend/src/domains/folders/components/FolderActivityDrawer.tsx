import { UserAvatar } from "../../../shared/ui/UserAvatar";
import { Drawer } from "../../../shared/ui/Drawer";
import { Button } from "../../../shared/ui/Button";
import { useT } from "../../../shared/i18n/useT";
import { useFolderActivitiesQuery } from "../hooks/useFolderQueries";
import { formatActivityPath, formatActivityTime, groupActivitiesByDay } from "../lib/activityGroups";
import type { FolderActivity } from "../types";

interface FolderActivityDrawerProps {
  open: boolean;
  folderId: string;
  folderName: string;
  onClose: () => void;
}

export function FolderActivityDrawer({ open, folderId, folderName, onClose }: FolderActivityDrawerProps) {
  const { t, locale } = useT();
  const query = useFolderActivitiesQuery(folderId, open);
  const activities = query.data ?? [];
  const groups = groupActivitiesByDay(activities, locale, {
    today: t("activity.today"),
    yesterday: t("activity.yesterday"),
  });

  let body;
  if (!query.isFetched) {
    body = <ActivitySkeleton />;
  } else if (query.isError) {
    body = (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm font-medium text-ink">{t("activity.loadFailed")}</p>
        <p className="text-sm text-ink-soft">{t("activity.retryHint")}</p>
        <Button variant="secondary" size="sm" onClick={() => void query.refetch()}>
          {t("activity.retry")}
        </Button>
      </div>
    );
  } else if (activities.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-ink">{t("activity.emptyTitle")}</p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{t("activity.emptyBody")}</p>
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col pb-2">
        {groups.map((group) => (
          <section key={group.key} className="pt-2 first:pt-0">
            <h3 className="pb-2 pt-3 text-xs font-medium text-ink-soft">{group.label}</h3>
            <ul className="divide-y divide-line">
              {group.items.map((activity) => (
                <li key={activity.id} className="py-3">
                  <ActivityRow activity={activity} folderName={folderName} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  return (
    <Drawer open={open} onClose={onClose} title={t("activity.title")}>
      {body}
    </Drawer>
  );
}

function ActivityRow({ activity, folderName }: { activity: FolderActivity; folderName: string }) {
  const { t, locale } = useT();
  const person = activity.type === "MEMBER_KICKED" ? activity.targetUser ?? activity.actor : activity.actor;
  const headline = headlineOf(activity, t);
  const metaName = activity.type === "LINK_ADDED" ? activity.actor.nickname : null;
  const path = activity.type === "LINK_ADDED" ? formatActivityPath(folderName, activity.targetName) : null;
  const time = formatActivityTime(activity.createdAt, locale);

  return (
    <div className="flex gap-3">
      <UserAvatar
        nickname={person.nickname || "?"}
        avatarUrl={person.avatarUrl}
        avatarType={person.avatarType}
        avatarValue={person.avatarValue}
        size="sm"
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <p className="break-keep text-sm leading-snug text-ink">{headline}</p>
        {metaName || path ? (
          <p className="mt-1 truncate text-xs text-ink-soft">
            {metaName}
            {metaName && path ? " · " : null}
            {path ? <span className="font-mono text-[11px] tracking-tight">{path}</span> : null}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-ink-soft/80">{time}</p>
      </div>
    </div>
  );
}

function headlineOf(activity: FolderActivity, t: ReturnType<typeof useT>["t"]) {
  if (activity.type === "LINK_ADDED") {
    return t("activity.added", { name: activity.targetName ?? "" });
  }
  if (activity.type === "MEMBER_JOINED") {
    return t("activity.joined", { name: activity.actor.nickname });
  }
  if (activity.type === "MEMBER_LEFT") {
    return t("activity.left", { name: activity.actor.nickname });
  }
  return t("activity.kicked", { name: activity.targetUser?.nickname ?? "" });
}

function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-5 py-2" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <div className="mt-0.5 h-5 w-5 animate-pulse rounded-full bg-line" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3.5 w-3/5 animate-pulse rounded bg-line" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-line" />
          </div>
        </div>
      ))}
    </div>
  );
}
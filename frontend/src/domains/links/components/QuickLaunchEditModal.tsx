import { useEffect, useMemo, useState } from "react";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../../../shared/ui/Modal";
import { Button } from "../../../shared/ui/Button";
import type { RecentLink } from "../types";
import { QUICK_LAUNCH_MAX } from "../lib/quickLaunch";
import { useT } from "../../../shared/i18n/useT";

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

interface QuickLaunchEditModalProps {
  open: boolean;
  links: RecentLink[];
  selectedIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}

export function QuickLaunchEditModal({
  open,
  links,
  selectedIds,
  onClose,
  onSave,
}: QuickLaunchEditModalProps) {
  const [draft, setDraft] = useState<string[]>(selectedIds);
  const { t } = useT();

  useEffect(() => {
    if (open) setDraft(selectedIds);
  }, [open, selectedIds]);

  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon: string | null; links: RecentLink[] }>();
    for (const link of links) {
      const current = map.get(link.folder.id);
      if (current) {
        current.links.push(link);
      } else {
        map.set(link.folder.id, {
          id: link.folder.id,
          name: link.folder.name,
          icon: link.folder.icon,
          links: [link],
        });
      }
    }
    return [...map.values()];
  }, [links]);

  function toggle(id: string) {
    setDraft((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= QUICK_LAUNCH_MAX) {
        toast.error(t("quick.max", { max: QUICK_LAUNCH_MAX }));
        return current;
      }
      return [...current, id];
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("quick.title")}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-soft">
          {t("quick.hint", { max: QUICK_LAUNCH_MAX })}
        </p>
        {grouped.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
            {t("quick.empty")}
          </p>
        ) : (
          <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto pr-1">
            {grouped.map((group) => (
              <div key={group.id}>
                <p className="mb-2 text-sm font-medium text-ink">
                  {group.icon ? `${group.icon} ` : ""}
                  {group.name}
                </p>
                <div className="flex flex-col gap-1">
                  {group.links.map((link) => {
                    const checked = draft.includes(link.id);
                    return (
                      <label
                        key={link.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-canvas"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(link.id)}
                          className="h-4 w-4 accent-brand-600"
                        />
                        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-canvas">
                          {link.faviconUrl ? (
                            <img src={link.faviconUrl} alt="" className="h-4 w-4" />
                          ) : (
                            <Globe className="h-3.5 w-3.5 text-ink-soft" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{link.title}</span>
                          <span className="block truncate text-xs text-ink-soft">{getDomain(link.url)}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            {t("common.save")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

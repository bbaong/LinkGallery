import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Modal } from "../../../shared/ui/Modal";
import { UserAvatar } from "../../../shared/ui/UserAvatar";
import { useT } from "../../../shared/i18n/useT";
import type { FolderMember } from "../types";

interface FolderMembersModalProps {
  open: boolean;
  members: FolderMember[];
  currentUserId: string | undefined;
  isOwner: boolean;
  onClose: () => void;
  onRemoveMember: (member: FolderMember) => void;
}

export function FolderMembersModal({
  open,
  members,
  currentUserId,
  isOwner,
  onClose,
  onRemoveMember,
}: FolderMembersModalProps) {
  const { t } = useT();
  const sorted = [...members].sort((left, right) => {
    if (left.role === right.role) return 0;
    return left.role === "OWNER" ? -1 : 1;
  });

  return (
    <Modal open={open} onClose={onClose} title={t("folder.membersTitle")} scrollable={false}>
      <ul className="flex flex-col gap-1">
        {sorted.map((member) => (
          <li key={member.id}>
            <MemberRow
              member={member}
              isMe={member.id === currentUserId}
              canRemove={isOwner && member.role === "EDITOR"}
              onRemove={() => onRemoveMember(member)}
            />
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function MemberRow({
  member,
  isMe,
  canRemove,
  onRemove,
}: {
  member: FolderMember;
  isMe: boolean;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const { t } = useT();

  return (
    <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
      <UserAvatar
        nickname={member.nickname}
        avatarUrl={member.avatarUrl}
        avatarType={member.avatarType}
        avatarValue={member.avatarValue}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{member.nickname}</p>
        <p className="text-xs text-ink-soft">
          {member.role === "OWNER" ? t("folder.roleOwner") : t("folder.roleEditor")}
          {isMe ? ` · ${t("folder.me")}` : ""}
        </p>
      </div>
      {canRemove ? <MemberMenu onRemove={onRemove} /> : null}
    </div>
  );
}

function MemberMenu({ onRemove }: { onRemove: () => void }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("folder.memberMenu")}
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-full z-40 w-44 pt-1.5">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-xl">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onRemove();
              }}
              className="flex w-full items-center px-3 py-2.5 text-left text-sm text-ink hover:bg-canvas"
            >
              {t("folder.removeMember")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

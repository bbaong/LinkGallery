import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../../../shared/ui/Modal";
import { Button } from "../../../shared/ui/Button";
import { Spinner } from "../../../shared/ui/Spinner";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { useT } from "../../../shared/i18n/useT";
import {
  useCreateFolderInviteMutation,
  useFolderInviteQuery,
  useRegenerateFolderInviteMutation,
  useRevokeFolderInviteMutation,
} from "../hooks/useFolderQueries";

interface InviteFolderModalProps {
  open: boolean;
  folderId: string;
  folderName: string;
  onClose: () => void;
}

export function InviteFolderModal({ open, folderId, folderName, onClose }: InviteFolderModalProps) {
  const { t } = useT();
  const inviteQuery = useFolderInviteQuery(folderId, open);
  const createMutation = useCreateFolderInviteMutation();
  const regenerateMutation = useRegenerateFolderInviteMutation();
  const revokeMutation = useRevokeFolderInviteMutation();
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const remaining = useInviteRemaining(inviteQuery.data?.status === "ACTIVE" ? inviteQuery.data.expiresAt : null);

  const invite = inviteQuery.data ?? null;
  const isExpired = invite?.status === "EXPIRED";
  const isActive = invite?.status === "ACTIVE";
  const isBusy = createMutation.isPending || regenerateMutation.isPending || revokeMutation.isPending;

  async function handleCreate() {
    try {
      await createMutation.mutateAsync(folderId);
      toast.success(t("folder.codeCreated"));
    } catch {
      toast.error(t("folder.inviteFailed"));
    }
  }

  async function handleRegenerate() {
    try {
      await regenerateMutation.mutateAsync(folderId);
      setConfirmRegen(false);
      toast.success(t("folder.codeRegenerated"));
    } catch {
      toast.error(t("folder.codeRegenFailed"));
    }
  }

  async function handleRevoke() {
    try {
      await revokeMutation.mutateAsync(folderId);
      setConfirmClose(false);
      toast.success(t("folder.inviteClosedToast"));
    } catch {
      toast.error(t("folder.closeInviteFailed"));
    }
  }

  async function handleCopy() {
    if (!invite?.code) return;
    try {
      await navigator.clipboard.writeText(invite.code);
      toast.success(t("folder.codeCopied"));
    } catch {
      toast.error(t("folder.codeCopyFailed"));
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={t("folder.inviteTitle")}>
        <div className="flex flex-col gap-5">
          {inviteQuery.isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner label={t("folder.inviteLoading")} />
            </div>
          ) : isActive && invite ? (
            <>
              <p className="break-keep text-sm leading-relaxed text-ink-soft">{t("folder.inviteHint")}</p>
              <div className="rounded-3xl border border-line bg-canvas px-4 py-6 text-center">
                <p className="font-mono text-3xl font-bold tracking-[0.35em] text-ink">{invite.code}</p>
                <p className="mt-3 text-sm text-ink-soft">{remaining}</p>
              </div>
              <p className="break-keep text-sm leading-relaxed text-ink-soft">{t("folder.inviteCanEdit")}</p>
              <div className="flex flex-col items-center gap-3">
                <Button className="w-full" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  {t("folder.copyCode")}
                </Button>
                <div className="flex items-center gap-3 text-sm">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setConfirmRegen(true)}
                    className="cursor-pointer text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:underline disabled:opacity-50"
                  >
                    {t("folder.newCode")}
                  </button>
                  <span className="text-line" aria-hidden="true">
                    ·
                  </span>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setConfirmClose(true)}
                    className="cursor-pointer text-ink-soft transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:underline disabled:opacity-50"
                  >
                    {t("folder.closeInvite")}
                  </button>
                </div>
              </div>
            </>
          ) : isExpired ? (
            <>
              <p className="break-keep text-lg font-semibold text-ink">{t("folder.inviteExpiredTitle")}</p>
              <p className="break-keep text-sm leading-relaxed text-ink-soft">{t("folder.inviteExpiredBody")}</p>
              <div className="flex justify-end">
                <Button onClick={handleCreate} isLoading={createMutation.isPending}>
                  {t("folder.inviteCreate")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="break-keep text-sm leading-relaxed text-ink-soft">
                {t("folder.inviteBody", { name: folderName })}
              </p>
              <div className="flex justify-end">
                <Button onClick={handleCreate} isLoading={createMutation.isPending}>
                  {t("folder.inviteCreate")}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmRegen}
        title={t("folder.newCodeTitle")}
        description={t("folder.newCodeBody")}
        confirmLabel={t("folder.newCode")}
        isLoading={regenerateMutation.isPending}
        onConfirm={handleRegenerate}
        onClose={() => setConfirmRegen(false)}
      />

      <ConfirmDialog
        open={confirmClose}
        title={t("folder.closeInviteTitle")}
        description={t("folder.closeInviteBody")}
        confirmLabel={t("folder.closeInvite")}
        isLoading={revokeMutation.isPending}
        onConfirm={handleRevoke}
        onClose={() => setConfirmClose(false)}
      />
    </>
  );
}

function useInviteRemaining(expiresAt: string | null) {
  const { t } = useT();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (!expiresAt) return "";
  const remainingMs = new Date(expiresAt).getTime() - now;
  if (remainingMs <= 0) return t("folder.inviteExpiredTitle");

  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;

  if (remainingMs >= dayMs) {
    const days = Math.max(1, Math.round(remainingMs / dayMs));
    return t("folder.inviteExpiresIn", { days });
  }
  if (remainingMs >= hourMs) {
    const hours = Math.min(23, Math.max(1, Math.round(remainingMs / hourMs)));
    return t("folder.inviteExpiresInHours", { hours });
  }
  const minutes = Math.min(59, Math.max(1, Math.round(remainingMs / minuteMs)));
  return t("folder.inviteExpiresInMinutes", { minutes });
}

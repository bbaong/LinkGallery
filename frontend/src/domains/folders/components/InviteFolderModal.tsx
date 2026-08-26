import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../../../shared/ui/Modal";
import { Button } from "../../../shared/ui/Button";
import { Spinner } from "../../../shared/ui/Spinner";
import { ApiRequestError } from "../../../shared/api/client";
import { folderApi } from "../api/folderApi";
import { useRegenerateFolderInviteMutation } from "../hooks/useFolderQueries";
import { useT } from "../../../shared/i18n/useT";

interface InviteFolderModalProps {
  open: boolean;
  folderId: string;
  folderName: string;
  onClose: () => void;
}

export function InviteFolderModal({ open, folderId, folderName, onClose }: InviteFolderModalProps) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const regenerateMutation = useRegenerateFolderInviteMutation();
  const { t } = useT();

  useEffect(() => {
    if (!open) {
      setCode(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    folderApi
      .getOrCreateInvite(folderId)
      .then((result) => {
        if (!cancelled) setCode(result.code);
      })
      .catch((error) => {
        const message = error instanceof ApiRequestError ? error.message : t("folder.inviteFailed");
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, folderId]);

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("folder.codeCopied"));
    } catch {
      toast.error(t("folder.codeCopyFailed"));
    }
  }

  async function handleRegenerate() {
    try {
      const result = await regenerateMutation.mutateAsync(folderId);
      setCode(result.code);
      toast.success(t("folder.codeRegenerated"));
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("folder.codeRegenFailed");
      toast.error(message);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("folder.inviteTitle")}>
      <div className="flex flex-col gap-5">
        <p className="break-keep text-sm leading-relaxed text-ink-soft">
          {t("folder.inviteBody", { name: folderName })}
        </p>

        {code && !loading ? (
          <div className="rounded-3xl border border-line bg-canvas px-4 py-6 text-center">
            <p className="font-mono text-3xl font-bold tracking-[0.35em] text-ink">{code}</p>
          </div>
        ) : (
          <div className="flex justify-center py-6">
            <Spinner label={t("folder.inviteLoading")} />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-ink-soft">{t("folder.permission")}</p>
          <div className="inline-flex w-fit rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-600">
            {t("folder.editTogether")}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={handleCopy} disabled={!code}>
            <Copy className="h-4 w-4" />
            {t("folder.copyCode")}
          </Button>
          <Button
            variant="ghost"
            onClick={handleRegenerate}
            disabled={!code}
            isLoading={regenerateMutation.isPending}
          >
            {t("folder.newCode")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

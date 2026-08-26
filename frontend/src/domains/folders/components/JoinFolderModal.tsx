import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Modal } from "../../../shared/ui/Modal";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { ApiRequestError } from "../../../shared/api/client";
import { useJoinFolderMutation } from "../hooks/useFolderQueries";
import { useT } from "../../../shared/i18n/useT";

interface JoinFolderModalProps {
  open: boolean;
  onClose: () => void;
}

export function JoinFolderModal({ open, onClose }: JoinFolderModalProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const joinMutation = useJoinFolderMutation();
  const { t } = useT();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (normalized.length !== 6) {
      toast.error(t("folder.joinCodeInvalid"));
      return;
    }

    try {
      const result = await joinMutation.mutateAsync(normalized);
      toast.success(result.message || t("folder.joinSuccess", { name: result.folder.name }));
      setCode("");
      onClose();
      navigate(`/folders/${result.folder.id}`);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("folder.joinFailed");
      toast.error(message);
    }
  }

  function handleClose() {
    setCode("");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={t("folder.joinTitle")}>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <p className="break-keep text-sm text-ink-soft">{t("folder.joinHint")}</p>
        <Input
          value={code}
          onChange={(event) =>
            setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
          }
          placeholder="A7K3P9"
          className="text-center font-mono text-lg tracking-[0.35em]"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-label={t("folder.inviteCodeAria")}
        />
        <div className="flex justify-end">
          <Button type="submit" isLoading={joinMutation.isPending} disabled={code.length !== 6}>
            {t("folder.joinAction")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

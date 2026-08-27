import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useT } from "../i18n/useT";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isLoading,
  children,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { t } = useT();
  const resolvedConfirm = confirmLabel ?? t("common.delete");
  const resolvedCancel = cancelLabel ?? t("common.cancel");
  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-sm">
      <div className="flex flex-col gap-5">
        {description ? <p className="whitespace-pre-line break-keep text-sm text-ink-soft">{description}</p> : null}
        {children}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {resolvedCancel}
          </Button>
          <Button type="button" variant="danger" isLoading={isLoading} onClick={onConfirm}>
            {resolvedConfirm}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { folderFormSchema } from "../schema/folderSchema";
import type { FolderFormValues } from "../schema/folderSchema";
import { DEFAULT_SOLID_COLOR } from "../constants/coverColors";
import { useUploadFolderCoverMutation } from "../hooks/useFolderQueries";
import { FolderCover } from "./FolderCover";
import { CoverStylePicker, normalizeCoverType } from "./CoverStylePicker";
import { EmojiPickerField } from "./EmojiPickerField";
import type { Folder } from "../types";
import { ApiRequestError } from "../../../shared/api/client";
import { useT } from "../../../shared/i18n/useT";

function getDefaultValues(initialFolder?: Folder): FolderFormValues {
  if (initialFolder) {
    return {
      name: initialFolder.name,
      icon: initialFolder.icon ?? "",
      coverType: normalizeCoverType(initialFolder.coverType),
      coverValue: initialFolder.coverValue,
    };
  }

  return {
    name: "",
    icon: "🎨",
    coverType: "SOLID",
    coverValue: DEFAULT_SOLID_COLOR,
  };
}

interface FolderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FolderFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialFolder?: Folder;
}

export function FolderFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  initialFolder,
}: FolderFormModalProps) {
  const uploadMutation = useUploadFolderCoverMutation();
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useT();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FolderFormValues>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: getDefaultValues(initialFolder),
  });

  useEffect(() => {
    if (!open) return;
    reset(getDefaultValues(initialFolder));
  }, [open, initialFolder, reset]);

  const coverType = watch("coverType");
  const coverValue = watch("coverValue");
  const icon = watch("icon") ?? "";
  const name = watch("name") ?? "";

  function handleClose() {
    reset(getDefaultValues(initialFolder));
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={initialFolder ? t("folder.editTitle") : t("folder.createTitle")}
      className="max-w-md"
    >
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          reset(getDefaultValues(initialFolder));
        })}
      >
        <div className="flex items-start gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-sm">
            <FolderCover coverType={coverType} coverValue={coverValue} />
            {icon ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl drop-shadow">
                {icon}
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="folder-name" className="mb-1.5 block text-sm font-medium text-ink">
              {t("folder.name")}
            </label>
            <Input
              id="folder-name"
              placeholder={t("folder.namePlaceholder")}
              hasError={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            ) : null}
          </div>
        </div>

        <EmojiPickerField value={icon} folderName={name} onChange={(emoji) => setValue("icon", emoji)} />

        <div>
          <p className="mb-2 text-sm font-medium text-ink">{t("folder.cover")}</p>
          <CoverStylePicker
            coverType={normalizeCoverType(coverType)}
            coverValue={coverValue}
            isUploading={isUploading}
            onChange={({ coverType: nextType, coverValue: nextValue }) => {
              setValue("coverType", nextType);
              setValue("coverValue", nextValue, { shouldValidate: true });
            }}
            onUpload={async (file) => {
              setIsUploading(true);
              try {
                const uploaded = await uploadMutation.mutateAsync(file);
                setValue("coverType", "IMAGE");
                setValue("coverValue", uploaded.url, { shouldValidate: true });
              } catch (error) {
                const message =
                  error instanceof ApiRequestError ? error.message : t("common.uploadFailed");
                toast.error(message);
              } finally {
                setIsUploading(false);
              }
            }}
          />
          {errors.coverValue ? (
            <p className="mt-2 text-sm text-red-500">{errors.coverValue.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialFolder ? t("folder.editAction") : t("folder.createAction")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

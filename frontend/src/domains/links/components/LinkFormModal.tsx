import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../shared/ui/Modal";
import { Field } from "../../../shared/ui/Field";
import { Input } from "../../../shared/ui/Input";
import { Textarea } from "../../../shared/ui/Textarea";
import { Button } from "../../../shared/ui/Button";
import { linkFormSchema } from "../schema/linkSchema";
import type { LinkFormValues } from "../schema/linkSchema";
import type { Link } from "../types";
import { LinkCategoryField } from "./LinkCategoryField";
import { useT } from "../../../shared/i18n/useT";

function getDefaultValues(initialLink?: Link): LinkFormValues {
  if (initialLink) {
    return {
      url: initialLink.url,
      title: initialLink.title,
      description: initialLink.description ?? "",
      category: initialLink.category ?? "",
    };
  }

  return { url: "", title: "", description: "", category: "" };
}

interface LinkFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: LinkFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialLink?: Link;
  existingCategories?: string[];
}

export function LinkFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  initialLink,
  existingCategories = [],
}: LinkFormModalProps) {
  const { t } = useT();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: getDefaultValues(initialLink),
  });

  const category = watch("category") ?? "";

  useEffect(() => {
    if (!open) return;
    reset(getDefaultValues(initialLink));
  }, [open, initialLink, reset]);

  function handleClose() {
    reset(getDefaultValues(initialLink));
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={initialLink ? t("link.editTitle") : t("link.createTitle")}>
      <form
        className="flex flex-col gap-5"
        noValidate
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          reset(getDefaultValues(initialLink));
        })}
      >
        <Field
          label={t("link.url")}
          htmlFor="link-url"
          error={errors.url?.message}
          hint={t("link.urlHint")}
        >
          <Input
            id="link-url"
            placeholder="https://example.com"
            hasError={Boolean(errors.url)}
            {...register("url")}
          />
        </Field>

        <Field label={t("link.title")} htmlFor="link-title" optional error={errors.title?.message}>
          <Input
            id="link-title"
            placeholder={t("link.titlePlaceholder")}
            hasError={Boolean(errors.title)}
            {...register("title")}
          />
        </Field>

        <Field label={t("link.description")} htmlFor="link-description" optional error={errors.description?.message}>
          <Textarea id="link-description" placeholder={t("link.descPlaceholder")} {...register("description")} />
        </Field>

        <LinkCategoryField
          value={category}
          options={existingCategories}
          error={errors.category?.message}
          onChange={(next) => setValue("category", next, { shouldDirty: true, shouldValidate: true })}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialLink ? t("folder.editAction") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

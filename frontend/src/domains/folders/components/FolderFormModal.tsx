import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../../../shared/ui/Modal";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { ColorPicker } from "../../../shared/ui/ColorPicker";
import { cn } from "../../../shared/lib/cn";
import { folderFormSchema } from "../schema/folderSchema";
import type { FolderFormValues } from "../schema/folderSchema";
import { GRADIENT_PRESETS, gradientCss } from "../constants/gradientPresets";
import { COVER_COLOR_SWATCHES, DEFAULT_SOLID_COLOR } from "../constants/coverColors";
import {
  formatGradientStops,
  isHexColor,
  parseGradientStops,
  valueForCoverType,
} from "../lib/coverValue";
import { useUploadFolderCoverMutation } from "../hooks/useFolderQueries";
import { FolderCover } from "./FolderCover";
import { EmojiPickerField } from "./EmojiPickerField";
import type { CoverType, Folder } from "../types";
import { ApiRequestError } from "../../../shared/api/client";

const CUSTOM_COLORS_KEY = "link-gallery-custom-cover-colors";
const CUSTOM_GRADIENTS_KEY = "link-gallery-custom-cover-gradients";
const SWATCH_SLOTS = 6;
const RECOMMENDED_SOLIDS = COVER_COLOR_SWATCHES.slice(0, SWATCH_SLOTS).map((color) => color.toUpperCase());
const COVER_STYLES: { id: Exclude<CoverType, "GLASS">; label: string }[] = [
  { id: "SOLID", label: "단색" },
  { id: "GRADIENT", label: "그라데이션" },
  { id: "IMAGE", label: "이미지" },
];

function loadCustomColors() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_COLORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string" && isHexColor(item))
      .map((item) => item.toUpperCase())
      .slice(0, SWATCH_SLOTS);
  } catch {
    return [];
  }
}

function saveCustomColors(colors: string[]) {
  localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors.slice(0, SWATCH_SLOTS)));
}

function loadCustomGradients() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_GRADIENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is { from: string; to: string } => {
        return Boolean(
          item &&
            typeof item === "object" &&
            isHexColor((item as { from?: string }).from ?? "") &&
            isHexColor((item as { to?: string }).to ?? "")
        );
      })
      .slice(0, SWATCH_SLOTS);
  } catch {
    return [];
  }
}

function saveCustomGradients(gradients: { from: string; to: string }[]) {
  localStorage.setItem(CUSTOM_GRADIENTS_KEY, JSON.stringify(gradients.slice(0, SWATCH_SLOTS)));
}

function gradientValue(from: string, to: string) {
  return formatGradientStops(from, to).toUpperCase();
}

function isRecommendedSolid(hex: string) {
  return RECOMMENDED_SOLIDS.includes(hex.toUpperCase());
}

function isRecommendedGradient(from: string, to: string) {
  const key = gradientValue(from, to);
  return GRADIENT_PRESETS.some((preset) => gradientValue(preset.from, preset.to) === key);
}

function buildSolidSwatches(customColors: string[]) {
  const customs = [...new Set(customColors.map((color) => color.toUpperCase()).filter((color) => !isRecommendedSolid(color)))];
  return [...customs, ...RECOMMENDED_SOLIDS.filter((color) => !customs.includes(color))].slice(0, SWATCH_SLOTS);
}

function buildGradientSwatches(customGradients: { from: string; to: string }[]) {
  const recommended = GRADIENT_PRESETS.map((preset) => ({ from: preset.from, to: preset.to }));
  const customs = customGradients.filter((item) => !isRecommendedGradient(item.from, item.to));
  const customKeys = new Set(customs.map((item) => gradientValue(item.from, item.to)));
  return [
    ...customs,
    ...recommended.filter((item) => !customKeys.has(gradientValue(item.from, item.to))),
  ].slice(0, SWATCH_SLOTS);
}

function CoverSwatch({
  label,
  selected,
  style,
  onClick,
}: {
  label: string;
  selected: boolean;
  style: CSSProperties;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative h-11 w-full rounded-xl",
        selected ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-surface" : "hover:ring-1 hover:ring-line"
      )}
      style={style}
    >
      {selected ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        </span>
      ) : null}
    </button>
  );
}

function normalizeCoverType(coverType: CoverType): Exclude<CoverType, "GLASS"> {
  return coverType === "GLASS" ? "SOLID" : coverType;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const uploadMutation = useUploadFolderCoverMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>(loadCustomColors);
  const [customGradients, setCustomGradients] = useState<{ from: string; to: string }[]>(loadCustomGradients);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [gradientStop, setGradientStop] = useState<"from" | "to">("from");
  const [colorDraft, setColorDraft] = useState(DEFAULT_SOLID_COLOR);
  const [gradientDraft, setGradientDraft] = useState<{ from: string; to: string }>({
    from: GRADIENT_PRESETS[1].from,
    to: GRADIENT_PRESETS[1].to,
  });

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
    setPickerOpen(false);
  }, [open, initialFolder, reset]);

  const coverType = watch("coverType");
  const coverValue = watch("coverValue");
  const icon = watch("icon") ?? "";
  const name = watch("name") ?? "";

  function handleClose() {
    reset(getDefaultValues(initialFolder));
    setPickerOpen(false);
    onClose();
  }

  function rememberColor(hex: string) {
    const normalized = hex.toUpperCase();
    setCustomColors((current) => {
      const next = [normalized, ...current.filter((item) => item.toUpperCase() !== normalized)].slice(0, SWATCH_SLOTS);
      saveCustomColors(next);
      return next;
    });
  }

  function rememberGradient(from: string, to: string) {
    const nextItem = { from: from.toUpperCase(), to: to.toUpperCase() };
    const key = formatGradientStops(nextItem.from, nextItem.to);
    setCustomGradients((current) => {
      const next = [
        nextItem,
        ...current.filter((item) => formatGradientStops(item.from, item.to).toUpperCase() !== key),
      ].slice(0, SWATCH_SLOTS);
      saveCustomGradients(next);
      return next;
    });
  }

  function closePicker() {
    setPickerOpen(false);
  }

  function openPicker() {
    if (coverType === "GRADIENT") {
      setGradientDraft(parseGradientStops(coverValue));
      setGradientStop("from");
    } else {
      setColorDraft(isHexColor(coverValue) ? coverValue.toUpperCase() : DEFAULT_SOLID_COLOR);
    }
    setPickerOpen(true);
  }

  function applyPicker() {
    if (coverType === "GRADIENT") {
      selectGradient(gradientDraft.from, gradientDraft.to);
      if (!isRecommendedGradient(gradientDraft.from, gradientDraft.to)) {
        rememberGradient(gradientDraft.from, gradientDraft.to);
      }
    } else {
      setValue("coverValue", colorDraft, { shouldValidate: true });
      if (!isRecommendedSolid(colorDraft)) {
        rememberColor(colorDraft);
      }
    }
    closePicker();
  }

  function selectCoverType(nextType: Exclude<CoverType, "GLASS">) {
    const nextValue = valueForCoverType(nextType, coverValue);
    setValue("coverType", nextType);
    setValue("coverValue", nextValue, { shouldValidate: true });
    setPickerOpen(false);
  }

  function selectSolidColor(hex: string) {
    setValue("coverValue", hex, { shouldValidate: true });
  }

  function selectGradient(from: string, to: string) {
    setValue("coverValue", formatGradientStops(from, to), { shouldValidate: true });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadMutation.mutateAsync(file);
      setValue("coverType", "IMAGE");
      setValue("coverValue", uploaded.url, { shouldValidate: true });
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : "이미지 업로드에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  const swatches = buildSolidSwatches(customColors);
  const gradientSwatches = buildGradientSwatches(customGradients);

  const previewCoverValue = pickerOpen
    ? coverType === "GRADIENT"
      ? formatGradientStops(gradientDraft.from, gradientDraft.to)
      : colorDraft
    : coverValue;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={initialFolder ? "폴더 수정" : "새 폴더 만들기"}
      className="max-w-md"
      scrollable={false}
      aside={
        pickerOpen && coverType !== "IMAGE" ? (
          <div
            ref={pickerRef}
            className="relative z-10 w-[20rem] shrink-0 rounded-3xl bg-surface p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">색상 선택</h3>
              <button
                type="button"
                onClick={closePicker}
                aria-label="색상 선택 닫기"
                className="rounded-full p-1.5 text-ink-soft hover:bg-canvas"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ColorPicker
              className="border-0 p-0 shadow-none"
              value={
                coverType === "GRADIENT"
                  ? gradientStop === "from"
                    ? gradientDraft.from
                    : gradientDraft.to
                  : colorDraft
              }
              onChange={(hex) => {
                if (coverType === "GRADIENT") {
                  setGradientDraft((current) =>
                    gradientStop === "from" ? { ...current, from: hex } : { ...current, to: hex }
                  );
                  return;
                }
                setColorDraft(hex);
              }}
              header={
                coverType === "GRADIENT" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGradientStop("from")}
                      className={cn(
                        "flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                        gradientStop === "from" ? "border-brand-500" : "border-line"
                      )}
                    >
                      <span className="h-5 w-5 rounded-md" style={{ background: gradientDraft.from }} />
                      시작
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradientStop("to")}
                      className={cn(
                        "flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                        gradientStop === "to" ? "border-brand-500" : "border-line"
                      )}
                    >
                      <span className="h-5 w-5 rounded-md" style={{ background: gradientDraft.to }} />
                      끝
                    </button>
                  </div>
                ) : null
              }
              footer={
                <Button type="button" className="w-full" size="sm" onClick={applyPicker}>
                  적용
                </Button>
              }
            />
          </div>
        ) : null
      }
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
            <FolderCover coverType={coverType} coverValue={previewCoverValue} />
            {icon ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl drop-shadow">
                {icon}
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="folder-name" className="mb-1.5 block text-sm font-medium text-ink">
              폴더 이름
            </label>
            <Input
              id="folder-name"
              placeholder="예) 자주 보는 디자인 레퍼런스"
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
          <p className="mb-2 text-sm font-medium text-ink">커버</p>
          <div className="flex rounded-full bg-canvas p-1 text-sm">
            {COVER_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => selectCoverType(style.id)}
                className={cn(
                  "flex-1 rounded-full py-1.5 font-medium transition-colors",
                  coverType === style.id ? "bg-surface text-ink shadow-sm" : "text-ink-soft"
                )}
              >
                {style.label}
              </button>
            ))}
          </div>

          {coverType === "GRADIENT" ? (
            <div className="mt-3 grid grid-cols-7 gap-2">
              {gradientSwatches.map((swatch) => {
                const value = formatGradientStops(swatch.from, swatch.to);
                const selected =
                  coverValue.toUpperCase() === value.toUpperCase() ||
                  coverValue ===
                    GRADIENT_PRESETS.find((preset) => preset.from === swatch.from && preset.to === swatch.to)?.key;
                return (
                  <CoverSwatch
                    key={value}
                    label={value}
                    selected={selected}
                    onClick={() => {
                      setValue("coverValue", value, { shouldValidate: true });
                      closePicker();
                    }}
                    style={{ backgroundImage: gradientCss(swatch.from, swatch.to) }}
                  />
                );
              })}
              <button
                type="button"
                aria-label="커스텀 그라데이션"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => (pickerOpen ? closePicker() : openPicker())}
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-line text-ink-soft hover:border-brand-400 hover:text-brand-600",
                  pickerOpen && "border-brand-500 text-brand-600"
                )}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          {coverType === "SOLID" ? (
            <div className="mt-3 grid grid-cols-7 gap-2">
              {swatches.map((color) => (
                <CoverSwatch
                  key={color}
                  label={color}
                  selected={coverValue.toUpperCase() === color.toUpperCase()}
                  onClick={() => {
                    selectSolidColor(color);
                    closePicker();
                  }}
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                type="button"
                aria-label="커스텀 색상"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => (pickerOpen ? closePicker() : openPicker())}
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-line text-ink-soft hover:border-brand-400 hover:text-brand-600",
                  pickerOpen && "border-brand-500 text-brand-600"
                )}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          {coverType === "IMAGE" ? (
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-canvas text-sm text-ink-soft transition-colors hover:border-brand-300 disabled:opacity-60"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                <span>{isUploading ? "업로드 중..." : "이미지 선택"}</span>
              </button>
            </div>
          ) : null}

          {errors.coverValue ? (
            <p className="mt-2 text-sm text-red-500">{errors.coverValue.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialFolder ? "수정 완료" : "폴더 만들기"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

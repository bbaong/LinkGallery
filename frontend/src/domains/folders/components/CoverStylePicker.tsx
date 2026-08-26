import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Check } from "lucide-react";
import { ColorPicker } from "../../../shared/ui/ColorPicker";
import { Button } from "../../../shared/ui/Button";
import { cn } from "../../../shared/lib/cn";
import { GRADIENT_PRESETS, gradientCss } from "../constants/gradientPresets";
import { COVER_COLOR_SWATCHES, DEFAULT_SOLID_COLOR } from "../constants/coverColors";
import {
  formatGradientStops,
  isHexColor,
  parseGradientStops,
  valueForCoverType,
} from "../lib/coverValue";
import type { CoverType } from "../types";
import { useT } from "../../../shared/i18n/useT";

const CUSTOM_COLORS_KEY = "link-gallery-custom-cover-colors";
const CUSTOM_GRADIENTS_KEY = "link-gallery-custom-cover-gradients";
const SWATCH_SLOTS = 6;
const RECOMMENDED_SOLIDS = COVER_COLOR_SWATCHES.slice(0, SWATCH_SLOTS).map((color) => color.toUpperCase());

const COVER_STYLES: { id: Exclude<CoverType, "GLASS"> }[] = [
  { id: "GRADIENT" },
  { id: "SOLID" },
  { id: "IMAGE" },
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

export function normalizeCoverType(coverType: CoverType | null | undefined): Exclude<CoverType, "GLASS"> {
  if (!coverType || coverType === "GLASS") return "SOLID";
  return coverType;
}

interface CoverStylePickerProps {
  coverType: Exclude<CoverType, "GLASS">;
  coverValue: string;
  onChange: (next: { coverType: Exclude<CoverType, "GLASS">; coverValue: string }) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export function CoverStylePicker({
  coverType,
  coverValue,
  onChange,
  onUpload,
  isUploading = false,
}: CoverStylePickerProps) {
  const { t } = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customColors, setCustomColors] = useState<string[]>(loadCustomColors);
  const [customGradients, setCustomGradients] = useState<{ from: string; to: string }[]>(loadCustomGradients);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [gradientStop, setGradientStop] = useState<"from" | "to">("from");
  const [colorDraft, setColorDraft] = useState(DEFAULT_SOLID_COLOR);
  const [gradientDraft, setGradientDraft] = useState<{ from: string; to: string }>({
    from: GRADIENT_PRESETS[1].from,
    to: GRADIENT_PRESETS[1].to,
  });

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
      const value = formatGradientStops(gradientDraft.from, gradientDraft.to);
      onChange({ coverType: "GRADIENT", coverValue: value });
      if (!isRecommendedGradient(gradientDraft.from, gradientDraft.to)) {
        rememberGradient(gradientDraft.from, gradientDraft.to);
      }
    } else {
      onChange({ coverType: "SOLID", coverValue: colorDraft });
      if (!isRecommendedSolid(colorDraft)) rememberColor(colorDraft);
    }
    setPickerOpen(false);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await onUpload(file);
  }

  const swatches = buildSolidSwatches(customColors);
  const gradientSwatches = buildGradientSwatches(customGradients);

  return (
    <div>
      <div className="flex rounded-full bg-canvas p-1 text-sm">
        {COVER_STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => {
              const nextValue = valueForCoverType(style.id, coverValue);
              onChange({ coverType: style.id, coverValue: nextValue });
              setPickerOpen(false);
            }}
            className={cn(
              "flex-1 rounded-full py-1.5 font-medium transition-colors",
              coverType === style.id ? "bg-surface text-ink shadow-sm" : "text-ink-soft"
            )}
          >
            {t(
              style.id === "GRADIENT"
                ? "folder.styleGradient"
                : style.id === "SOLID"
                  ? "folder.styleSolid"
                  : "folder.styleImage"
            )}
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
                  onChange({ coverType: "GRADIENT", coverValue: value });
                  setPickerOpen(false);
                }}
                style={{ backgroundImage: gradientCss(swatch.from, swatch.to) }}
              />
            );
          })}
          <button
            type="button"
            aria-label={t("folder.customGradient")}
            onClick={() => (pickerOpen ? setPickerOpen(false) : openPicker())}
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
                onChange({ coverType: "SOLID", coverValue: color });
                setPickerOpen(false);
              }}
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            type="button"
            aria-label={t("folder.customColor")}
            onClick={() => (pickerOpen ? setPickerOpen(false) : openPicker())}
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
            <span>{isUploading ? t("folder.uploading") : t("folder.selectImage")}</span>
          </button>
        </div>
      ) : null}

      {pickerOpen && coverType !== "IMAGE" ? (
        <div className="mt-3 rounded-2xl border border-line p-3">
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
                    {t("common.start")}
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
                    {t("common.end")}
                  </button>
                </div>
              ) : null
            }
            footer={
              <Button type="button" className="w-full" size="sm" onClick={applyPicker}>
                {t("common.apply")}
              </Button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}

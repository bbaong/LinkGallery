import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "../../../shared/lib/cn";
import { Input } from "../../../shared/ui/Input";
import { Field } from "../../../shared/ui/Field";

const CATEGORY_MAX_LENGTH = 20;

function normalizeCategory(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

interface LinkCategoryFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
}

export function LinkCategoryField({ value, onChange, options, error }: LinkCategoryFieldProps) {
  const [draft, setDraft] = useState("");

  const chips = [...new Set([value, ...options].filter(Boolean))];

  function addDraft() {
    const next = normalizeCategory(draft);
    if (!next) return;
    const existing = options.find((name) => name.toLowerCase() === next.toLowerCase());
    onChange(existing ?? next);
    setDraft("");
  }

  return (
    <Field
      label="카테고리"
      htmlFor="link-category"
      optional
      error={error}
      hint="맛집, 놀거리처럼 붙여두면 폴더에서 골라볼 수 있어요."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange("")}
            className={cn(
              "h-9 rounded-full px-3 text-sm font-medium transition-colors",
              value === ""
                ? "bg-brand-600 text-white"
                : "border border-line bg-surface text-ink-soft hover:bg-canvas"
            )}
          >
            없음
          </button>
          {chips.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange(value === name ? "" : name)}
              className={cn(
                "h-9 rounded-full px-3 text-sm font-medium transition-colors",
                value === name
                  ? "bg-brand-600 text-white"
                  : "border border-line bg-surface text-ink hover:bg-canvas"
              )}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="link-category"
            value={draft}
            maxLength={CATEGORY_MAX_LENGTH}
            placeholder="새 카테고리 이름"
            hasError={Boolean(error)}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              addDraft();
            }}
          />
          <button
            type="button"
            onClick={addDraft}
            disabled={!normalizeCategory(draft)}
            className="inline-flex h-11 shrink-0 items-center gap-1 rounded-2xl border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            추가
          </button>
        </div>
      </div>
    </Field>
  );
}

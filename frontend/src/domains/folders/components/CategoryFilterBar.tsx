import { cn } from "../../../shared/lib/cn";
import { useT } from "../../../shared/i18n/useT";

export type CategoryFilter = "all" | "none" | string;

interface CategoryFilterBarProps {
  categories: string[];
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  uncategorizedCount: number;
}

export function CategoryFilterBar({
  categories,
  value,
  onChange,
  uncategorizedCount,
}: CategoryFilterBarProps) {
  const { t } = useT();
  if (categories.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium text-ink">{t("folder.categoryView")}</p>
      <div className="flex flex-wrap gap-2">
        <FilterChip selected={value === "all"} onClick={() => onChange("all")}>
          {t("folder.categoryAll")}
        </FilterChip>
        {uncategorizedCount > 0 ? (
          <FilterChip selected={value === "none"} onClick={() => onChange("none")}>
            {t("folder.uncategorized")}
          </FilterChip>
        ) : null}
        {categories.map((name) => (
          <FilterChip key={name} selected={value === name} onClick={() => onChange(name)}>
            {name}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-full px-3 text-sm font-medium transition-colors",
        selected
          ? "bg-brand-600 text-white"
          : "border border-line bg-surface text-ink hover:bg-canvas"
      )}
    >
      {children}
    </button>
  );
}

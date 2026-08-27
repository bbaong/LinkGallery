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
    <div className="flex flex-wrap items-center gap-1" aria-label={t("folder.categoryView")}>
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
        "h-8 rounded-full px-2.5 text-sm font-medium transition-colors",
        selected ? "text-brand-600" : "text-ink-soft hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
